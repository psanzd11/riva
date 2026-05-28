import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useStore } from '../../../data/store'
import { useRole } from '../../../auth/RoleContext'
import { dealsRepo, invoicesRepo, paymentsRepo } from '../../../data/repo'
import { PageHead } from '../../../components/layout/PageHead'
import { Panel } from '../../../components/ui/Panel'
import { Pill } from '../../../components/ui/Pill'
import { Modal } from '../../../components/ui/Modal'
import { FilterTabs } from '../../../components/ui/FilterTabs'
import { Field, Input, Select } from '../../../components/ui/Field'
import { money } from '../../../lib/format'
import { SkuTable } from '../shared/SkuTable'
import type { Sku, Deal, Invoice } from '../../../data/schema'
import { Trash2 } from 'lucide-react'

const MODES = [
  { value: 'b2b', label: 'Pedido B2B · partner' },
  { value: 'showroom', label: 'Showroom · cobro directo' },
] as const
type Mode = (typeof MODES)[number]['value']

interface Line {
  skuId: string
  m2: number
}

interface OrderResult {
  deal?: Deal
  deposit: Invoice
  total: number
  depositAmt: number
  currency: 'EUR' | 'USD'
  mode: Mode
  paid: boolean
}

/**
 * TPV / Constructor de pedido — contextual.
 * · B2B: arma un pedido desde el catálogo, lo asocia a un partner, genera el deal
 *   (won) + factura de depósito 60% con payment link, y deja la final 40% en draft.
 * · Showroom: cobro directo de una venta (flagship) → factura full + pago inmediato.
 */
export function VentasTpv() {
  const { currentUserId } = useRole()
  const location = useLocation()
  const skus = useStore((s) => s.skus)
  const partners = useStore((s) => s.partners)
  const integrations = useStore((s) => s.integrations)

  const [mode, setMode] = useState<Mode>('b2b')
  const [lines, setLines] = useState<Line[]>([])
  const [partnerId, setPartnerId] = useState<string>('')
  const [clientName, setClientName] = useState('')
  const [result, setResult] = useState<OrderResult | null>(null)

  const skuById = useMemo(() => new Map(skus.map((s) => [s.id, s])), [skus])
  const flagshipPartner = useMemo(() => partners.find((p) => p.type === 'flagship'), [partners])

  const addLine = (sku: Sku) => {
    setLines((prev) =>
      prev.some((l) => l.skuId === sku.id)
        ? prev.map((l) => (l.skuId === sku.id ? { ...l, m2: l.m2 + 10 } : l))
        : [...prev, { skuId: sku.id, m2: 20 }],
    )
  }

  // Preload SKU coming from Catálogo → "Cotizar".
  useEffect(() => {
    const sid = (location.state as { skuId?: string } | null)?.skuId
    if (!sid) return
    const sku = skus.find((s) => s.id === sid)
    if (sku) addLine(sku)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  const setM2 = (skuId: string, m2: number) =>
    setLines((prev) => prev.map((l) => (l.skuId === skuId ? { ...l, m2: Math.max(0, m2) } : l)))
  const removeLine = (skuId: string) => setLines((prev) => prev.filter((l) => l.skuId !== skuId))

  const subtotal = lines.reduce((acc, l) => acc + l.m2 * (skuById.get(l.skuId)?.pricePerM2 ?? 0), 0)
  const depositAmt = Math.round(subtotal * 0.6)
  const finalAmt = subtotal - depositAmt

  const partner = partners.find((p) => p.id === partnerId)
  const currency: 'EUR' | 'USD' =
    mode === 'showroom' ? flagshipPartner?.currency ?? 'USD' : partner?.currency ?? 'EUR'

  const canGenerate = lines.length > 0 && subtotal > 0 && (mode === 'showroom' || Boolean(partnerId))

  const invNumber = () => `INV-${5000 + Math.floor(Math.random() * 9999)}`
  const nowIso = () => new Date().toISOString()
  const summary = () =>
    lines
      .map((l) => {
        const s = skuById.get(l.skuId)
        return `${s?.name ?? l.skuId} · ${l.m2} m² × € ${s?.pricePerM2 ?? 0}`
      })
      .join('\n')

  const generateB2b = () => {
    const now = nowIso()
    const brand: Deal['brand'] = partner?.sede === 'us' ? 'tierra' : 'riva_spain'
    const deal = dealsRepo.create(
      {
        clientName: clientName || partner?.name || 'Pedido directo',
        partnerId,
        ownerId: currentUserId,
        stage: 'won',
        amount: subtotal,
        currency,
        createdAt: now,
        expectedCloseDate: now,
        probability: 100,
        brand,
        notes: `Pedido TPV (B2B):\n${summary()}`,
      },
      currentUserId,
    )
    const deposit = invoicesRepo.create(
      {
        number: invNumber(),
        partnerId,
        dealId: deal.id,
        amount: depositAmt,
        currency,
        issuedAt: now,
        dueAt: now,
        status: 'sent',
        agingBucket: 'current',
        paymentLink: `https://pay.stripe.mock/${deal.id}`,
        kind: 'deposit',
        orderTotal: subtotal,
      },
      currentUserId,
    )
    invoicesRepo.create(
      {
        number: invNumber(),
        partnerId,
        dealId: deal.id,
        amount: finalAmt,
        currency,
        issuedAt: now,
        dueAt: now,
        status: 'draft',
        agingBucket: 'current',
        kind: 'final',
        parentInvoiceId: deposit.id,
        orderTotal: subtotal,
      },
      currentUserId,
    )
    setResult({ deal, deposit, total: subtotal, depositAmt, currency, mode: 'b2b', paid: false })
  }

  const generateShowroom = () => {
    const now = nowIso()
    const pid = flagshipPartner?.id ?? partners[0]?.id ?? ''
    const invoice = invoicesRepo.create(
      {
        number: invNumber(),
        partnerId: pid,
        amount: subtotal,
        currency,
        issuedAt: now,
        dueAt: now,
        status: 'paid',
        agingBucket: 'current',
        kind: 'full',
        orderTotal: subtotal,
      },
      currentUserId,
    )
    paymentsRepo.create(
      { invoiceId: invoice.id, amount: subtotal, at: now, method: 'square' },
      currentUserId,
    )
    setResult({ deposit: invoice, total: subtotal, depositAmt: subtotal, currency, mode: 'showroom', paid: true })
  }

  const generate = () => (mode === 'showroom' ? generateShowroom() : generateB2b())

  const markPaid = () => {
    if (!result) return
    invoicesRepo.update(result.deposit.id, { status: 'partial' }, currentUserId)
    paymentsRepo.create(
      { invoiceId: result.deposit.id, amount: result.depositAmt, at: nowIso(), method: 'stripe' },
      currentUserId,
    )
    setResult({ ...result, paid: true })
  }

  const reset = () => {
    setLines([])
    setClientName('')
    setResult(null)
  }

  const stripe = integrations.find((i) => i.id === 'itg_stripe')
  const square = integrations.find((i) => i.id === 'itg_square')

  return (
    <>
      <PageHead
        eyebrow="Ventas · Punto de venta"
        title="TPV · Constructor de pedido"
        description="Arma un pedido desde el catálogo y cóbralo. B2B genera depósito 60% + final 40% (flujo RIVA); Showroom cobra la venta completa."
        actions={
          <div className="flex items-center gap-2">
            <Pill variant={stripe?.status === 'connected' ? 'ok' : 'warn'}>Stripe</Pill>
            <Pill variant={square?.status === 'connected' ? 'ok' : 'warn'}>Square</Pill>
          </div>
        }
      />

      <div className="mb-6">
        <FilterTabs options={MODES} value={mode} onChange={(m) => { setMode(m); }} />
      </div>

      {/* Resumen del pedido (carrito) */}
      <Panel title="Pedido en curso" className="mb-8">
        <div className="p-5">
          {mode === 'b2b' && (
            <div className="mb-5 grid gap-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <Field label="Partner">
                <Select value={partnerId} onChange={(e) => setPartnerId(e.target.value)}>
                  <option value="">Selecciona partner…</option>
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} · {p.sede.toUpperCase()}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Cliente / referencia (opcional)">
                <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Proyecto, cliente final…" />
              </Field>
            </div>
          )}

          {lines.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-n-500">
              Añade referencias desde el catálogo de abajo con <b>+ Añadir</b>.
            </div>
          ) : (
            <table className="data-table border-0">
              <thead>
                <tr><th>Referencia</th><th>Precio/m²</th><th>m²</th><th>Importe</th><th></th></tr>
              </thead>
              <tbody>
                {lines.map((l) => {
                  const s = skuById.get(l.skuId)
                  const lineTotal = l.m2 * (s?.pricePerM2 ?? 0)
                  return (
                    <tr key={l.skuId}>
                      <td>
                        <div className="font-medium">{s?.name}</div>
                        <div className="text-[11px] text-n-500">{s?.collection} · {s?.warehouse === 'es' ? 'Madrid' : 'Newark'}</div>
                      </td>
                      <td>€ {s?.pricePerM2}</td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          value={l.m2}
                          onChange={(e) => setM2(l.skuId, Number(e.target.value))}
                          className="w-20 border-b border-n-300 bg-transparent py-1 text-[14px] outline-none focus:border-riva-black"
                        />
                      </td>
                      <td className="font-medium">{money(lineTotal, currency)}</td>
                      <td>
                        <button onClick={() => removeLine(l.skuId)} className="text-n-500 hover:text-error">
                          <Trash2 size={15} strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {lines.length > 0 && (
            <div className="mt-5 flex flex-wrap items-end justify-between gap-5 border-t border-n-300 pt-5">
              <div className="flex gap-8">
                <div>
                  <div className="eyebrow !mb-1">Subtotal</div>
                  <div className="font-display text-[24px] font-light">{money(subtotal, currency)}</div>
                </div>
                {mode === 'b2b' && (
                  <>
                    <div>
                      <div className="eyebrow !mb-1">Depósito 60%</div>
                      <div className="font-display text-[24px] font-light text-cove">{money(depositAmt, currency)}</div>
                    </div>
                    <div>
                      <div className="eyebrow !mb-1">Final 40% · pre-envío</div>
                      <div className="font-display text-[24px] font-light text-n-500">{money(finalAmt, currency)}</div>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={generate}
                disabled={!canGenerate}
                className="bg-riva-black px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-riva-ivory transition hover:bg-n-900 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {mode === 'showroom' ? `Cobrar ${money(subtotal, currency)}` : 'Generar pedido + depósito'}
              </button>
            </div>
          )}
        </div>
      </Panel>

      <h2 className="mb-4 font-display text-[26px] font-light tracking-[0.04em]">Catálogo</h2>
      <SkuTable readOnly onQuote={addLine} quoteLabel="+ Añadir" />

      {/* Confirmación / payment link */}
      <Modal
        open={Boolean(result)}
        onClose={reset}
        title={result?.mode === 'showroom' ? 'Venta cobrada' : result?.paid ? 'Depósito cobrado' : 'Pedido generado'}
      >
        {result && (
          <div>
            {result.mode === 'b2b' && result.deal && (
              <p className="mb-4 text-[13px] text-n-700">
                Deal <b>{result.deal.clientName}</b> creado en <b>won</b> por {money(result.total, result.currency)}.
                Factura de depósito y final (draft) emitidas en Accounting.
              </p>
            )}

            <div className="mb-5 border border-n-300">
              <div className="flex items-center justify-between border-b border-n-300 px-4 py-3">
                <span className="text-[12px] uppercase tracking-[0.1em] text-n-500">
                  {result.mode === 'showroom' ? 'Cobro Square' : 'Depósito 60%'}
                </span>
                <span className="font-display text-[18px]">{money(result.depositAmt, result.currency)}</span>
              </div>
              {result.mode === 'b2b' && (
                <div className="px-4 py-3">
                  <div className="eyebrow !mb-1">Payment link · Stripe</div>
                  <div className="break-all text-[12px] text-cove">{result.deposit.paymentLink}</div>
                </div>
              )}
            </div>

            {result.paid ? (
              <div className="flex items-center gap-2 text-[13px] text-success">
                <span>●</span> Pago registrado correctamente.
              </div>
            ) : (
              <button
                onClick={markPaid}
                className="w-full bg-riva-black py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-riva-ivory transition hover:bg-n-900"
              >
                Marcar depósito como cobrado
              </button>
            )}

            <button onClick={reset} className="mt-3 w-full border border-n-300 py-2.5 text-[12px] uppercase tracking-[0.12em] text-n-700 hover:border-riva-black">
              Nuevo pedido
            </button>
          </div>
        )}
      </Modal>
    </>
  )
}
