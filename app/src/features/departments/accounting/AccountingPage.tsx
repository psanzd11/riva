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

const AGING_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'overdue', label: 'Vencidas' },
  { value: 'risk', label: 'Riesgo' },
] as const

const SEDE_TIME = [
  { value: 'total', label: 'Total' },
  { value: 'es', label: 'ES' },
  { value: 'us', label: 'USA' },
] as const

export function AccountingPage() {
  const { currentUserId } = useRole()
  const invoices = useStore((s) => s.invoices)
  const partners = useStore((s) => s.partners)
  const deals = useStore((s) => s.deals)

  const [filter, setFilter] = useState<(typeof AGING_FILTERS)[number]['value']>('overdue')
  const [sedeFilter, setSedeFilter] = useState<(typeof SEDE_TIME)[number]['value']>('total')
  void sedeFilter

  // Counts & buckets
  const pendingInvoices = invoices.filter((i) => i.status !== 'paid' && i.status !== 'draft')
  const buckets = useMemo(() => {
    const b: Record<Invoice['agingBucket'], number> = { current: 0, '0_30': 0, '31_60': 0, '61_90': 0, '90_plus': 0 }
    for (const inv of pendingInvoices) b[inv.agingBucket] += inv.amount
    return b
  }, [pendingInvoices])
  const totalPending = Object.values(buckets).reduce((a, b) => a + b, 0)
  const paidThisYear = invoices.filter((i) => i.status === 'paid').reduce((a, b) => a + b.amount, 0)
  const dso = 34 // mock, demo value

  // Visible rows
  const overdueRows = useMemo(() => {
    let list = pendingInvoices
    if (filter === 'overdue') list = list.filter((i) => i.status === 'overdue')
    if (filter === 'risk') list = list.filter((i) => i.agingBucket === '61_90' || i.agingBucket === '90_plus')
    return [...list].sort((a, b) => a.dueAt.localeCompare(b.dueAt)).slice(0, 12)
  }, [pendingInvoices, filter])

  // Find a won deal without an invoice (button to generate)
  const wonDealsWithoutInvoice = useMemo(() => {
    const dealIdsWithInvoice = new Set(invoices.map((i) => i.dealId).filter(Boolean) as string[])
    return deals.filter((d) => d.stage === 'won' && !dealIdsWithInvoice.has(d.id)).slice(0, 1)
  }, [deals, invoices])

  const generateInvoiceFromDeal = () => {
    const deal = wonDealsWithoutInvoice[0]
    if (!deal) return
    invoicesRepo.create(
      {
        number: `2026-${String(500 + Math.floor(Math.random() * 99)).padStart(4, '0')}`,
        partnerId: deal.partnerId,
        dealId: deal.id,
        amount: deal.amount,
        currency: deal.currency,
        issuedAt: new Date().toISOString(),
        dueAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        status: 'draft',
        agingBucket: 'current',
      },
      currentUserId,
    )
  }

  const togglePaymentLink = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId)
    if (!inv) return
    invoicesRepo.update(
      invoiceId,
      {
        status: 'sent',
        paymentLink: inv.paymentLink ?? `https://pay.stripe.mock/${inv.number}`,
      },
      currentUserId,
    )
  }

  const markPaid = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId)
    if (!inv) return
    invoicesRepo.update(invoiceId, { status: 'paid' }, currentUserId)
    paymentsRepo.create(
      {
        invoiceId,
        amount: inv.amount,
        at: new Date().toISOString(),
        method: 'stripe',
        externalId: `mock_${Math.floor(Math.random() * 999999)}`,
      },
      currentUserId,
    )
  }

  const simulateWebhook = () => {
    const target = overdueRows[0]
    if (target) markPaid(target.id)
  }

  return (
    <>
      <PageHead
        eyebrow="Departamento"
        title="Accounting"
        description="Facturación QuickBooks, cobros automáticos vía link de pago, conciliación, P&L por sede y por flagship. Núcleo del Hub."
        actions={
          <>
            <Button variant="outline" onClick={simulateWebhook}>Simular webhook</Button>
            <Button onClick={generateInvoiceFromDeal} disabled={wonDealsWithoutInvoice.length === 0}>
              + Factura
            </Button>
          </>
        }
      />

      <KpiGrid>
        <KpiCard eyebrow="Facturas mes" value={String(invoices.length)} delta={{ type: 'up', label: '↑ 12% vs abril' }} />
        <KpiCard eyebrow="Cobrado YTD" value={money(paidThisYear, 'EUR')} delta={{ type: 'up', label: '↑ 9%' }} />
        <KpiCard eyebrow="Pendiente" value={money(totalPending, 'EUR')} delta={{ type: 'neutral', label: '3,2% del facturado' }} />
        <KpiCard eyebrow="DSO" value={`${dso} d`} delta={{ type: 'up', label: '↓4 d vs Q1' }} />
      </KpiGrid>

      <Panel
        title={`Aging de cobros · ${money(totalPending, 'EUR')} pendiente`}
        action={<FilterTabs options={SEDE_TIME} value={sedeFilter} onChange={setSedeFilter} variant="time" />}
        className="mb-8"
      >
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

      <div className="mb-12 grid gap-8" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
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

        <Panel title="Cobros 12 meses" action={<a className="link text-[11px] cursor-pointer">Emitido vs cobrado</a>}>
          <MultiLine
            series={[
              { name: 'Emitido', color: 'var(--cove)', points: [40, 46, 54, 60, 68, 76, 84, 92, 102, 112, 124, 134] },
              { name: 'Cobrado', color: 'var(--oak-mid)', points: [32, 38, 46, 52, 60, 68, 76, 84, 94, 102, 112, 122] },
            ]}
            xLabels={['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May']}
          />
        </Panel>
      </div>

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-[26px] font-light tracking-[0.04em]">Cobros pendientes · con automática</h2>
        <FilterTabs options={AGING_FILTERS} value={filter} onChange={setFilter} />
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Factura</th>
            <th>Partner</th>
            <th>Importe</th>
            <th>Vence</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {overdueRows.map((inv) => {
            const partner = partners.find((p) => p.id === inv.partnerId)
            const variant = inv.agingBucket === '90_plus' || inv.agingBucket === '61_90' ? 'err' : 'warn'
            return (
              <tr key={inv.id}>
                <td>#{inv.number}</td>
                <td>{partner?.name ?? '—'}</td>
                <td>{money(inv.amount, inv.currency)}</td>
                <td>{dateShort(inv.dueAt)}</td>
                <td><Pill variant={variant}>{inv.status}</Pill></td>
                <td className="text-right">
                  <div className="flex justify-end gap-2">
                    {!inv.paymentLink && (
                      <button
                        className="text-[10px] uppercase tracking-[0.12em] text-cove hover:underline"
                        onClick={() => togglePaymentLink(inv.id)}
                      >
                        Link pago
                      </button>
                    )}
                    {inv.status !== 'paid' && (
                      <button
                        className="text-[10px] uppercase tracking-[0.12em] text-success hover:underline"
                        onClick={() => markPaid(inv.id)}
                      >
                        Marcar pagada
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
          {overdueRows.length === 0 && (
            <tr><td colSpan={6} className="text-center text-n-500">Sin facturas en este estado.</td></tr>
          )}
        </tbody>
      </table>
    </>
  )
}
