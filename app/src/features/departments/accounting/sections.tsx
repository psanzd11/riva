import { useMemo, useState } from 'react'
import { useStore } from '../../../data/store'
import { invoicesRepo, paymentsRepo } from '../../../data/repo'
import { useRole } from '../../../auth/RoleContext'
import { PageHead } from '../../../components/layout/PageHead'
import { Button } from '../../../components/ui/Button'
import { Panel } from '../../../components/ui/Panel'
import { Pill } from '../../../components/ui/Pill'
import { KpiGrid } from '../../../components/kpi/KpiGrid'
import { KpiCard } from '../../../components/kpi/KpiCard'
import { FilterTabs } from '../../../components/ui/FilterTabs'
import { StackedBar } from '../../../components/charts/StackedBar'
import { Donut } from '../../../components/charts/Donut'
import { Waterfall } from '../../../components/charts/Waterfall'
import { MultiLine } from '../../../components/charts/MultiLine'
import { money, dateShort } from '../../../lib/format'
import type { Invoice } from '../../../data/schema'

function AccHeader({ actions }: { actions?: React.ReactNode }) {
  return (
    <PageHead
      eyebrow="Departamento"
      title="Accounting"
      description="Facturación QuickBooks, cobros automáticos vía link de pago, conciliación, P&L por sede y por flagship."
      actions={actions}
    />
  )
}

function useAccountingTotals() {
  const invoices = useStore((s) => s.invoices)
  const pendingInvoices = invoices.filter((i) => i.status !== 'paid' && i.status !== 'draft')
  const buckets = useMemo(() => {
    const b: Record<Invoice['agingBucket'], number> = { current: 0, '0_30': 0, '31_60': 0, '61_90': 0, '90_plus': 0 }
    for (const inv of pendingInvoices) b[inv.agingBucket] += inv.amount
    return b
  }, [pendingInvoices])
  const totalPending = Object.values(buckets).reduce((a, b) => a + b, 0)
  const paidYtd = invoices.filter((i) => i.status === 'paid').reduce((a, b) => a + b.amount, 0)
  return { invoices, pendingInvoices, buckets, totalPending, paidYtd }
}

export function AccountingResumen() {
  const { invoices, totalPending, paidYtd } = useAccountingTotals()
  return (
    <>
      <AccHeader actions={<><Button variant="outline">Cierre mes</Button><Button>+ Factura</Button></>} />
      <KpiGrid>
        <KpiCard eyebrow="Facturas mes" value={String(invoices.length)} delta={{ type: 'up', label: '↑ 12% vs abril' }} />
        <KpiCard eyebrow="Cobrado YTD" value={money(paidYtd, 'EUR')} delta={{ type: 'up', label: '↑ 9%' }} />
        <KpiCard eyebrow="Pendiente" value={money(totalPending, 'EUR')} delta={{ type: 'neutral', label: '3,2% del facturado' }} />
        <KpiCard eyebrow="DSO" value="34 d" delta={{ type: 'up', label: '↓4 d vs Q1' }} />
      </KpiGrid>
      <p className="text-[13px] text-n-700 max-w-prose">
        Subsecciones: <b>Facturas</b> (lista y acciones), <b>Aging & cobros</b> (buckets clicables), <b>P&L</b>
        (cascada mensual + donut por origen), <b>Cierre mes</b> (workflow).
      </p>
    </>
  )
}

const ROW_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'overdue', label: 'Vencidas' },
  { value: 'paid', label: 'Pagadas' },
] as const

export function AccountingFacturas() {
  const { currentUserId } = useRole()
  const invoices = useStore((s) => s.invoices)
  const partners = useStore((s) => s.partners)
  const deals = useStore((s) => s.deals)
  const [filter, setFilter] = useState<(typeof ROW_FILTERS)[number]['value']>('all')

  const visible = useMemo(() => {
    let list = [...invoices]
    if (filter === 'overdue') list = list.filter((i) => i.status === 'overdue')
    if (filter === 'paid') list = list.filter((i) => i.status === 'paid')
    return list.sort((a, b) => a.dueAt.localeCompare(b.dueAt)).slice(0, 40)
  }, [invoices, filter])

  const wonDealsWithoutInvoice = useMemo(() => {
    const dealIdsWithInvoice = new Set(invoices.map((i) => i.dealId).filter(Boolean) as string[])
    return deals.filter((d) => d.stage === 'won' && !dealIdsWithInvoice.has(d.id)).slice(0, 1)
  }, [deals, invoices])

  const generateInvoiceFromDeal = () => {
    const deal = wonDealsWithoutInvoice[0]
    if (!deal) return
    invoicesRepo.create({
      number: `2026-${String(500 + Math.floor(Math.random() * 99)).padStart(4, '0')}`,
      partnerId: deal.partnerId,
      dealId: deal.id,
      amount: deal.amount,
      currency: deal.currency,
      issuedAt: new Date().toISOString(),
      dueAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      status: 'draft',
      agingBucket: 'current',
    }, currentUserId)
  }

  const sendLink = (id: string) => {
    const inv = invoices.find((i) => i.id === id)
    if (!inv) return
    invoicesRepo.update(id, { status: 'sent', paymentLink: inv.paymentLink ?? `https://pay.stripe.mock/${inv.number}` }, currentUserId)
  }

  const markPaid = (id: string) => {
    const inv = invoices.find((i) => i.id === id)
    if (!inv) return
    invoicesRepo.update(id, { status: 'paid' }, currentUserId)
    paymentsRepo.create({
      invoiceId: id,
      amount: inv.amount,
      at: new Date().toISOString(),
      method: 'stripe',
      externalId: `mock_${Math.floor(Math.random() * 999999)}`,
    }, currentUserId)
  }

  return (
    <>
      <AccHeader actions={<>
        <Button variant="outline" onClick={generateInvoiceFromDeal} disabled={wonDealsWithoutInvoice.length === 0}>
          + Desde deal won
        </Button>
        <Button>Exportar</Button>
      </>} />

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-[26px] font-light tracking-[0.04em]">Facturas</h2>
        <FilterTabs options={ROW_FILTERS} value={filter} onChange={setFilter} />
      </div>

      <table className="data-table">
        <thead>
          <tr><th>Factura</th><th>Partner</th><th>Importe</th><th>Emitida</th><th>Vence</th><th>Estado</th><th></th></tr>
        </thead>
        <tbody>
          {visible.map((inv) => {
            const partner = partners.find((p) => p.id === inv.partnerId)
            const variant = inv.status === 'paid' ? 'ok' : inv.status === 'overdue' ? 'err' : 'warn'
            return (
              <tr key={inv.id}>
                <td>#{inv.number}</td>
                <td>{partner?.name ?? '—'}</td>
                <td>{money(inv.amount, inv.currency)}</td>
                <td>{dateShort(inv.issuedAt)}</td>
                <td>{dateShort(inv.dueAt)}</td>
                <td><Pill variant={variant}>{inv.status}</Pill></td>
                <td className="text-right">
                  <div className="flex justify-end gap-2">
                    {inv.status !== 'paid' && !inv.paymentLink && (
                      <button className="text-[10px] uppercase tracking-[0.12em] text-cove hover:underline" onClick={() => sendLink(inv.id)}>
                        Link pago
                      </button>
                    )}
                    {inv.status !== 'paid' && (
                      <button className="text-[10px] uppercase tracking-[0.12em] text-success hover:underline" onClick={() => markPaid(inv.id)}>
                        Marcar pagada
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

export function AccountingAging() {
  const { currentUserId } = useRole()
  const { invoices, pendingInvoices, buckets, totalPending } = useAccountingTotals()
  const partners = useStore((s) => s.partners)
  const [bucketFilter, setBucketFilter] = useState<Invoice['agingBucket'] | 'all'>('all')

  const rows = useMemo(() => {
    let list = pendingInvoices
    if (bucketFilter !== 'all') list = list.filter((i) => i.agingBucket === bucketFilter)
    return list.sort((a, b) => a.dueAt.localeCompare(b.dueAt)).slice(0, 30)
  }, [pendingInvoices, bucketFilter])

  const markPaid = (id: string) => {
    const inv = invoices.find((i) => i.id === id)
    if (!inv) return
    invoicesRepo.update(id, { status: 'paid' }, currentUserId)
    paymentsRepo.create({
      invoiceId: id,
      amount: inv.amount,
      at: new Date().toISOString(),
      method: 'stripe',
    }, currentUserId)
  }

  const BUCKETS: { id: Invoice['agingBucket'] | 'all'; label: string; amount: number }[] = [
    { id: 'all', label: 'Todas', amount: totalPending },
    { id: '0_30', label: '0-30 d', amount: buckets['0_30'] },
    { id: '31_60', label: '31-60 d', amount: buckets['31_60'] },
    { id: '61_90', label: '61-90 d', amount: buckets['61_90'] },
    { id: '90_plus', label: '90+ d', amount: buckets['90_plus'] },
  ]

  return (
    <>
      <AccHeader />
      <Panel title={`Aging · ${money(totalPending, 'EUR')} pendiente`} className="mb-8">
        <StackedBar
          segments={[
            { label: `${money(buckets['0_30'], 'EUR')} · 0-30 d`, value: buckets['0_30'], variant: 's0' },
            { label: `${money(buckets['31_60'], 'EUR')} · 31-60 d`, value: buckets['31_60'], variant: 's1' },
            { label: `${money(buckets['61_90'], 'EUR')} · 61-90 d`, value: buckets['61_90'], variant: 's2' },
            { label: `${money(buckets['90_plus'], 'EUR')}`, value: buckets['90_plus'], variant: 's3' },
          ]}
          legend={[
            { label: '0-30 d · al día', variant: 's0' },
            { label: '31-60 d · recordatorio', variant: 's1' },
            { label: '61-90 d · 2º aviso', variant: 's2' },
            { label: '90+ d · postventa', variant: 's3' },
          ]}
        />
      </Panel>

      <div className="mb-4 flex flex-wrap gap-2">
        {BUCKETS.map((b) => (
          <button
            key={b.id}
            onClick={() => setBucketFilter(b.id)}
            className={`flex flex-col items-start border px-4 py-2.5 transition ${
              bucketFilter === b.id ? 'border-riva-black bg-riva-black text-riva-ivory' : 'border-n-300 bg-riva-white text-n-700'
            }`}
          >
            <span className="text-[10px] uppercase tracking-[0.15em]">{b.label}</span>
            <span className="mt-1 font-display text-[16px] font-normal">{money(b.amount, 'EUR')}</span>
          </button>
        ))}
      </div>

      <table className="data-table">
        <thead>
          <tr><th>Factura</th><th>Partner</th><th>Importe</th><th>Vence</th><th>Bucket</th><th></th></tr>
        </thead>
        <tbody>
          {rows.map((inv) => {
            const partner = partners.find((p) => p.id === inv.partnerId)
            const variant = inv.agingBucket === '90_plus' || inv.agingBucket === '61_90' ? 'err' : 'warn'
            return (
              <tr key={inv.id}>
                <td>#{inv.number}</td>
                <td>{partner?.name ?? '—'}</td>
                <td>{money(inv.amount, inv.currency)}</td>
                <td>{dateShort(inv.dueAt)}</td>
                <td><Pill variant={variant}>{inv.agingBucket}</Pill></td>
                <td className="text-right">
                  <button className="text-[10px] uppercase tracking-[0.12em] text-success hover:underline" onClick={() => markPaid(inv.id)}>
                    Marcar pagada
                  </button>
                </td>
              </tr>
            )
          })}
          {rows.length === 0 && <tr><td colSpan={6} className="text-center text-n-500">Sin facturas en este bucket.</td></tr>}
        </tbody>
      </table>
    </>
  )
}

export function AccountingPL() {
  return (
    <>
      <AccHeader />
      <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Panel title="Ingresos por origen" action={<a className="link text-[11px] cursor-pointer">YTD</a>}>
          <Donut
            slices={[
              { label: 'USA partners', value: 1180, color: 'var(--cove)', valueLabel: '€ 1,18M' },
              { label: 'ES partners', value: 1080, color: 'var(--oak-mid)', valueLabel: '€ 1,08M' },
              { label: 'Flagship Miami', value: 580, color: 'var(--sage)', valueLabel: '€ 580k' },
            ]}
          />
        </Panel>
        <Panel title="P&L mensual · mayo" action={<a className="link text-[11px] cursor-pointer">Cascada</a>}>
          <Waterfall
            cols={[
              { label: 'Ingresos', sub: 'Total', value: '€ 642k', heightPct: 88, variant: 'start' },
              { label: '−COGS', sub: 'Coste<br>producto', value: '−€ 286k', heightPct: 38, variant: 'neg' },
              { label: 'Margen', sub: 'Bruto<br>55,4%', value: '€ 356k', heightPct: 50, variant: 'pos' },
              { label: '−OpEx', sub: 'Nóminas<br>marketing', value: '−€ 142k', heightPct: 20, variant: 'neg' },
              { label: '−Tax', sub: 'Impuestos', value: '−€ 38k', heightPct: 6, variant: 'neg' },
              { label: 'Net', sub: 'Neto<br>27,4%', value: '€ 176k', heightPct: 25, variant: 'tot' },
            ]}
          />
        </Panel>
      </div>
      <Panel title="Cobros 12 meses · emitido vs cobrado" className="mt-8">
        <MultiLine
          series={[
            { name: 'Emitido', color: 'var(--cove)', points: [40, 46, 54, 60, 68, 76, 84, 92, 102, 112, 124, 134] },
            { name: 'Cobrado', color: 'var(--oak-mid)', points: [32, 38, 46, 52, 60, 68, 76, 84, 94, 102, 112, 122] },
          ]}
          xLabels={['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May']}
        />
      </Panel>
    </>
  )
}

const CIERRE_STEPS = [
  'Conciliar cuentas bancarias ES',
  'Conciliar cuentas bancarias US',
  'Verificar facturas emitidas vs ERP',
  'Provisionar comisiones de comerciales',
  'Calcular COGS por partner',
  'Generar P&L del mes',
  'Comparar P&L vs forecast',
  'Firmar cierre por dirección',
]

export function AccountingCierre() {
  const [checked, setChecked] = useState<Set<number>>(() => {
    try {
      const raw = localStorage.getItem('riva-cierre-may-2026')
      if (raw) return new Set(JSON.parse(raw) as number[])
    } catch {
      /* noop */
    }
    return new Set()
  })

  const toggle = (i: number) => {
    const next = new Set(checked)
    if (next.has(i)) next.delete(i)
    else next.add(i)
    setChecked(next)
    localStorage.setItem('riva-cierre-may-2026', JSON.stringify([...next]))
  }

  return (
    <>
      <AccHeader />
      <h2 className="mb-4 font-display text-[26px] font-light tracking-[0.04em]">Cierre · Mayo 2026</h2>
      <Panel headless>
        <div className="p-6">
          <p className="mb-6 text-[13px] text-n-700">
            Workflow de cierre mensual. Cada paso se persiste localmente.
            Progreso: <b className="text-n-900">{checked.size} / {CIERRE_STEPS.length}</b>.
          </p>
          <ol className="space-y-2">
            {CIERRE_STEPS.map((step, i) => (
              <li key={i}>
                <button
                  onClick={() => toggle(i)}
                  className="flex w-full items-center gap-4 border border-n-300 bg-riva-white px-4 py-3 text-left hover:bg-n-100"
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center border ${
                      checked.has(i) ? 'border-riva-black bg-riva-black text-riva-ivory' : 'border-n-300'
                    }`}
                  >
                    {checked.has(i) ? '✓' : i + 1}
                  </span>
                  <span className={`text-[13px] ${checked.has(i) ? 'text-n-500 line-through' : 'text-n-900'}`}>
                    {step}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </Panel>
    </>
  )
}
