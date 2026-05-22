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
import { MultiLine } from '../../../components/charts/MultiLine'
import { LineArea } from '../../../components/charts/LineArea'
import { RatioGrid } from '../../../components/charts/RatioGrid'
import { LbBar } from '../../../components/data-table/Leaderboard'
import { Sparkline } from '../../../components/charts/Sparkline'
import { money, moneyCompact, dateShort } from '../../../lib/format'
import { DeptEquipo } from '../shared/DeptEquipo'
import { IncomeStatement, BalanceSheet, CashFlowStatement } from './reports'
import { FileText, Printer } from 'lucide-react'
import type { Invoice } from '../../../data/schema'

function AccHeader({ actions }: { actions?: React.ReactNode }) {
  return (
    <PageHead
      eyebrow="Departamento"
      title="Accounting"
      description="Facturación QuickBooks · pago en dos fases (depósito 60% + final 40% pre-envío) · conciliación · P&L por sede y por flagship."
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
  const deposits = invoices.filter((i) => i.kind === 'deposit')
  const finals = invoices.filter((i) => i.kind === 'final')
  return { invoices, pendingInvoices, buckets, totalPending, paidYtd, deposits, finals }
}

// ====================================================================
// RESUMEN — rico
// ====================================================================
export function AccountingResumen() {
  const { invoices, totalPending, paidYtd, deposits, finals } = useAccountingTotals()

  // Order-level status: count distinct deals by status of deposit+final pair
  const orderStatus = useMemo(() => {
    const dealIds = new Set(invoices.map((i) => i.dealId).filter(Boolean) as string[])
    let fullyPaid = 0
    let depositOnly = 0
    let depositOverdue = 0
    let draft = 0
    for (const dealId of dealIds) {
      const dep = invoices.find((i) => i.dealId === dealId && i.kind === 'deposit')
      const fin = invoices.find((i) => i.dealId === dealId && i.kind === 'final')
      if (!dep) continue
      if (dep.status === 'paid' && fin?.status === 'paid') fullyPaid += 1
      else if (dep.status === 'paid' && fin?.status !== 'paid') depositOnly += 1
      else if (dep.status === 'overdue') depositOverdue += 1
      else if (dep.status === 'draft') draft += 1
    }
    return { fullyPaid, depositOnly, depositOverdue, draft, totalOrders: dealIds.size }
  }, [invoices])

  const depositsPaid = deposits.filter((i) => i.status === 'paid').reduce((a, i) => a + i.amount, 0)
  const finalsPending = finals.filter((i) => i.status !== 'paid').reduce((a, i) => a + i.amount, 0)
  const collectionRate = invoices.length > 0
    ? Math.round((invoices.filter((i) => i.status === 'paid').length / invoices.length) * 100)
    : 0

  // Build P&L mini sparkline (synthetic, 12m)
  const cashflowPoints = [120, 142, 158, 168, 180, 196, 204, 218, 232, 248, 268, 284]

  return (
    <>
      <AccHeader
        actions={
          <>
            <Button variant="outline">Cierre mes</Button>
            <Button>+ Factura</Button>
          </>
        }
      />

      <KpiGrid cols={8}>
        <KpiCard eyebrow="Facturas totales" value={String(invoices.length)} sub={`${deposits.length} depósito · ${finals.length} final`} />
        <KpiCard eyebrow="Cobrado YTD" value={moneyCompact(paidYtd, 'EUR')} delta={{ type: 'up', label: '↑ 9%' }} />
        <KpiCard eyebrow="Pendiente" value={moneyCompact(totalPending, 'EUR')} delta={{ type: 'neutral', label: 'Aging · ver detalle' }} />
        <KpiCard eyebrow="DSO" value="34 d" delta={{ type: 'up', label: '↓ 4 d vs Q1' }} />
        <KpiCard eyebrow="Pedidos cobrados" value={`${orderStatus.fullyPaid}/${orderStatus.totalOrders}`} delta={{ type: 'up', label: `${Math.round((orderStatus.fullyPaid / Math.max(1, orderStatus.totalOrders)) * 100)}%` }} />
        <KpiCard eyebrow="Depósitos cobrados" value={moneyCompact(depositsPaid, 'EUR')} sub={`${orderStatus.depositOnly} esperando final`} />
        <KpiCard eyebrow="Finales pendientes" value={moneyCompact(finalsPending, 'EUR')} sub="pre-envío warehouse" />
        <KpiCard eyebrow="Collection rate" value={`${collectionRate}%`} delta={{ type: 'up', label: '↑ 2 pp' }} />
      </KpiGrid>

      {/* Flujo RIVA explicado */}
      <Panel title="Flujo de pago RIVA · cómo cobramos">
        <div className="grid grid-cols-1 gap-px bg-n-300 md:grid-cols-3">
          <div className="bg-riva-white p-6">
            <div className="eyebrow !mb-2">Paso 1 · al cerrar deal</div>
            <h4 className="font-display text-[20px] font-light">Depósito 60%</h4>
            <p className="mt-2 text-[13px] text-n-700">
              Al pasar deal a <b>Won</b>, QuickBooks emite la factura de depósito (60% del total).
              Stripe genera link de pago. El partner abona antes de empezar el pedido.
            </p>
            <div className="mt-4 text-[11px] uppercase tracking-[0.1em] text-success">
              {deposits.filter((i) => i.status === 'paid').length} cobrados · {deposits.filter((i) => i.status !== 'paid').length} pendientes
            </div>
          </div>
          <div className="bg-riva-white p-6">
            <div className="eyebrow !mb-2">Paso 2 · producto listo</div>
            <h4 className="font-display text-[20px] font-light">Final 40%</h4>
            <p className="mt-2 text-[13px] text-n-700">
              Cuando el lote está en warehouse listo para envío, se emite la factura final.
              El pago final es <b>requisito para que salga del almacén</b>.
            </p>
            <div className="mt-4 text-[11px] uppercase tracking-[0.1em] text-warning">
              {finals.filter((i) => i.status === 'paid').length} cobrados · {finals.filter((i) => i.status !== 'paid').length} pendientes
            </div>
          </div>
          <div className="bg-riva-white p-6">
            <div className="eyebrow !mb-2">Paso 3 · automático</div>
            <h4 className="font-display text-[20px] font-light">Conciliación</h4>
            <p className="mt-2 text-[13px] text-n-700">
              Webhook Stripe → QuickBooks marca como pagada en el ledger.
              Recordatorios automáticos D+7 / D+14 / D+21 si se atrasa.
            </p>
            <div className="mt-4 text-[11px] uppercase tracking-[0.1em] text-cove">
              automation engine · 312 ejec/mes
            </div>
          </div>
        </div>
      </Panel>

      <div className="mt-8 mb-8 grid gap-8" style={{ gridTemplateColumns: '1.4fr 1fr 1fr' }}>
        <Panel title="Cobrado 12 meses · evolución">
          <LineArea
            points={cashflowPoints}
            xLabels={['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May']}
            totals={{ left: 'Acumulado 12m · <b>€ 2,84M</b>', right: '<b>↑ 9% YoY</b>' }}
          />
        </Panel>
        <Panel title="Ingresos por origen · YTD">
          <Donut
            slices={[
              { label: 'USA partners', value: 1180, color: 'var(--cove)', valueLabel: '€ 1,18M' },
              { label: 'ES partners', value: 1080, color: 'var(--oak-mid)', valueLabel: '€ 1,08M' },
              { label: 'Flagship Miami', value: 580, color: 'var(--sage)', valueLabel: '€ 580k' },
            ]}
          />
        </Panel>
        <Panel title="Ratios clave">
          <RatioGrid
            items={[
              { label: 'DSO', value: '34 d', spark: <Sparkline points={[42, 40, 38, 37, 36, 35, 34]} /> },
              { label: 'Collection rate', value: `${collectionRate}%`, spark: <Sparkline points={[78, 80, 82, 84, 86, 88, collectionRate]} /> },
              { label: 'Margen bruto', value: '55,4%', delta: { type: 'up', label: '↑ 2 pp' } },
              { label: 'Margen neto', value: '27,4%', delta: { type: 'up', label: '↑ 1,2 pp' } },
            ]}
          />
        </Panel>
      </div>

      {/* P&L resumen simplificado — vista compacta del Income Statement */}
      <Panel title="P&L · mayo 2026 · vista resumida" action={<a className="link text-[11px] cursor-pointer">Ver completo</a>} className="mb-8">
        <div className="p-6">
          <table className="w-full text-[13px]">
            <tbody>
              <tr>
                <td className="py-2 text-n-700">Ingresos</td>
                <td className="py-2 text-right font-display text-[15px] text-success">€ 642k</td>
              </tr>
              <tr>
                <td className="py-2 text-n-700">− Coste de ventas</td>
                <td className="py-2 text-right font-display text-[15px] text-error">€ 380k</td>
              </tr>
              <tr className="border-t border-n-300">
                <td className="py-2 font-medium text-n-900">Margen bruto</td>
                <td className="py-2 text-right font-display text-[15px] font-medium text-success">€ 262k <span className="text-[11px] text-n-500">· 40,8%</span></td>
              </tr>
              <tr>
                <td className="py-2 text-n-700">− Gastos operativos</td>
                <td className="py-2 text-right font-display text-[15px] text-error">€ 74k</td>
              </tr>
              <tr>
                <td className="py-2 text-n-700">− Impuestos</td>
                <td className="py-2 text-right font-display text-[15px] text-error">€ 47k</td>
              </tr>
              <tr className="border-t-2 border-double border-n-700">
                <td className="py-2.5 font-medium text-n-900">Net income</td>
                <td className="py-2.5 text-right font-display text-[20px] font-medium text-success">€ 141k <span className="text-[11px] text-n-500">· 4,9%</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title={`Aging de cobros · ${money(totalPending, 'EUR')} pendiente`}>
        <StackedBar
          segments={[
            { label: `${money(useAccountingTotals().buckets['0_30'], 'EUR')} · 0-30 d`, value: useAccountingTotals().buckets['0_30'], variant: 's0' },
            { label: `${money(useAccountingTotals().buckets['31_60'], 'EUR')} · 31-60 d`, value: useAccountingTotals().buckets['31_60'], variant: 's1' },
            { label: `${money(useAccountingTotals().buckets['61_90'], 'EUR')} · 61-90 d`, value: useAccountingTotals().buckets['61_90'], variant: 's2' },
            { label: `${money(useAccountingTotals().buckets['90_plus'], 'EUR')}`, value: useAccountingTotals().buckets['90_plus'], variant: 's3' },
          ]}
          legend={[
            { label: '0-30 d · al día', variant: 's0' },
            { label: '31-60 d · recordatorio', variant: 's1' },
            { label: '61-90 d · 2º aviso', variant: 's2' },
            { label: '90+ d · postventa', variant: 's3' },
          ]}
        />
      </Panel>
    </>
  )
}

// ====================================================================
// FACTURAS — flujo deposit/final con vista por pedido
// ====================================================================
const ROW_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'deposit', label: 'Solo depósito' },
  { value: 'final', label: 'Solo final' },
  { value: 'pending', label: 'Pendientes' },
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
    if (filter === 'deposit') list = list.filter((i) => i.kind === 'deposit')
    if (filter === 'final') list = list.filter((i) => i.kind === 'final')
    if (filter === 'pending') list = list.filter((i) => i.status !== 'paid')
    if (filter === 'paid') list = list.filter((i) => i.status === 'paid')
    return list.sort((a, b) => a.dueAt.localeCompare(b.dueAt)).slice(0, 50)
  }, [invoices, filter])

  const wonDealsWithoutInvoice = useMemo(() => {
    const dealIdsWithInvoice = new Set(invoices.map((i) => i.dealId).filter(Boolean) as string[])
    return deals.filter((d) => d.stage === 'won' && !dealIdsWithInvoice.has(d.id)).slice(0, 1)
  }, [deals, invoices])

  const generateDepositFromDeal = () => {
    const deal = wonDealsWithoutInvoice[0]
    if (!deal) return
    invoicesRepo.create({
      number: `2026-${String(500 + Math.floor(Math.random() * 99)).padStart(4, '0')}`,
      partnerId: deal.partnerId,
      dealId: deal.id,
      amount: Math.round(deal.amount * 0.6),
      currency: deal.currency,
      issuedAt: new Date().toISOString(),
      dueAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      status: 'draft',
      agingBucket: 'current',
      kind: 'deposit',
      orderTotal: deal.amount,
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
    // If deposit just got paid, auto-generate final 40% invoice draft
    if (inv.kind === 'deposit') {
      const existingFinal = invoices.find((i) => i.dealId === inv.dealId && i.kind === 'final')
      if (!existingFinal) {
        invoicesRepo.create({
          number: `2026-${String(600 + Math.floor(Math.random() * 99)).padStart(4, '0')}`,
          partnerId: inv.partnerId,
          dealId: inv.dealId,
          amount: Math.round(inv.orderTotal * 0.4),
          currency: inv.currency,
          issuedAt: new Date().toISOString(),
          dueAt: new Date(Date.now() + 60 * 86400000).toISOString(),
          status: 'draft',
          agingBucket: 'current',
          kind: 'final',
          parentInvoiceId: inv.id,
          orderTotal: inv.orderTotal,
        }, currentUserId)
      }
    }
  }

  return (
    <>
      <AccHeader
        actions={
          <>
            <Button variant="outline" onClick={generateDepositFromDeal} disabled={wonDealsWithoutInvoice.length === 0}>
              + Depósito desde won
            </Button>
            <Button>Exportar</Button>
          </>
        }
      />

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-[26px] font-light tracking-[0.04em]">Facturas</h2>
        <FilterTabs options={ROW_FILTERS} value={filter} onChange={setFilter} />
      </div>

      <p className="mb-4 text-[12px] text-n-500">
        Cada pedido genera <b>dos facturas linkadas</b>: depósito 60% + final 40%. La factura final solo es exigible
        cuando el lote está listo para envío desde el almacén local.
      </p>

      <table className="data-table">
        <thead>
          <tr>
            <th>Factura</th>
            <th>Partner</th>
            <th>Tipo</th>
            <th>Importe</th>
            <th>Pedido (€/$)</th>
            <th>Emitida</th>
            <th>Vence</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {visible.map((inv) => {
            const partner = partners.find((p) => p.id === inv.partnerId)
            const variant = inv.status === 'paid' ? 'ok' : inv.status === 'overdue' ? 'err' : 'warn'
            const kindLabel = inv.kind === 'deposit' ? '60% Depósito' : inv.kind === 'final' ? '40% Final' : 'Full'
            const kindColor = inv.kind === 'deposit' ? 'var(--cove)' : inv.kind === 'final' ? 'var(--oak-mid)' : 'var(--sage)'
            return (
              <tr key={inv.id}>
                <td>#{inv.number}</td>
                <td>{partner?.name ?? '—'}</td>
                <td>
                  <span className="text-[11px] uppercase tracking-[0.1em]" style={{ color: kindColor }}>{kindLabel}</span>
                </td>
                <td>{money(inv.amount, inv.currency)}</td>
                <td className="text-n-500">{money(inv.orderTotal, inv.currency)}</td>
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

// ====================================================================
// AGING — dividido en Depósitos (60%) y Restantes (40%)
// ====================================================================
const AGING_TABS = [
  { value: 'deposit', label: 'Depósitos · 60%' },
  { value: 'final', label: 'Restantes · 40%' },
] as const

export function AccountingAging() {
  const { currentUserId } = useRole()
  const { invoices, pendingInvoices } = useAccountingTotals()
  const partners = useStore((s) => s.partners)
  const [tab, setTab] = useState<(typeof AGING_TABS)[number]['value']>('deposit')
  const [bucketFilter, setBucketFilter] = useState<Invoice['agingBucket'] | 'all'>('all')

  // Buckets calculados por kind
  const kindBuckets = useMemo(() => {
    const calc = (kind: Invoice['kind']) => {
      const b: Record<Invoice['agingBucket'], number> = { current: 0, '0_30': 0, '31_60': 0, '61_90': 0, '90_plus': 0 }
      for (const inv of pendingInvoices.filter((i) => i.kind === kind)) b[inv.agingBucket] += inv.amount
      return b
    }
    return { deposit: calc('deposit'), final: calc('final') }
  }, [pendingInvoices])

  const activeBuckets = kindBuckets[tab]
  const totalForTab = Object.values(activeBuckets).reduce((a, b) => a + b, 0)

  const rows = useMemo(() => {
    let list = pendingInvoices.filter((i) => i.kind === tab)
    if (bucketFilter !== 'all') list = list.filter((i) => i.agingBucket === bucketFilter)
    return list.sort((a, b) => a.dueAt.localeCompare(b.dueAt)).slice(0, 30)
  }, [pendingInvoices, tab, bucketFilter])

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
    { id: 'all', label: 'Todas', amount: totalForTab },
    { id: '0_30', label: '0-30 d', amount: activeBuckets['0_30'] },
    { id: '31_60', label: '31-60 d', amount: activeBuckets['31_60'] },
    { id: '61_90', label: '61-90 d', amount: activeBuckets['61_90'] },
    { id: '90_plus', label: '90+ d', amount: activeBuckets['90_plus'] },
  ]

  const depositTotal = Object.values(kindBuckets.deposit).reduce((a, b) => a + b, 0)
  const finalTotal = Object.values(kindBuckets.final).reduce((a, b) => a + b, 0)

  return (
    <>
      <AccHeader />

      {/* Comparativa Depósitos vs Restantes */}
      <p className="mb-4 text-[12px] text-n-500">
        RIVA cobra en dos fases: <b>depósito 60%</b> al cerrar el deal, <b>restante 40%</b> antes de que el lote salga del almacén local.
        El aging se gestiona de forma separada porque son riesgos distintos: un depósito atrasado bloquea el inicio del pedido; un
        restante atrasado bloquea el envío.
      </p>

      <div className="mb-6 grid grid-cols-2 gap-px border border-n-300 bg-n-300">
        <button
          onClick={() => { setTab('deposit'); setBucketFilter('all') }}
          className={`p-5 text-left transition ${tab === 'deposit' ? 'bg-riva-black text-riva-ivory' : 'bg-riva-white text-n-700'}`}
        >
          <div className={`text-[10px] uppercase tracking-[0.15em] ${tab === 'deposit' ? 'text-n-300' : 'text-n-500'}`}>
            Aging depósitos · 60%
          </div>
          <div className="mt-1 font-display text-[26px] font-light">{money(depositTotal, 'EUR')}</div>
          <div className={`mt-1 text-[11px] uppercase tracking-[0.08em] ${tab === 'deposit' ? 'text-oak-light' : 'text-n-500'}`}>
            {pendingInvoices.filter((i) => i.kind === 'deposit').length} pendientes
          </div>
        </button>
        <button
          onClick={() => { setTab('final'); setBucketFilter('all') }}
          className={`p-5 text-left transition ${tab === 'final' ? 'bg-riva-black text-riva-ivory' : 'bg-riva-white text-n-700'}`}
        >
          <div className={`text-[10px] uppercase tracking-[0.15em] ${tab === 'final' ? 'text-n-300' : 'text-n-500'}`}>
            Aging restantes · 40%
          </div>
          <div className="mt-1 font-display text-[26px] font-light">{money(finalTotal, 'EUR')}</div>
          <div className={`mt-1 text-[11px] uppercase tracking-[0.08em] ${tab === 'final' ? 'text-oak-light' : 'text-n-500'}`}>
            {pendingInvoices.filter((i) => i.kind === 'final').length} pendientes
          </div>
        </button>
      </div>

      <Panel
        title={`Aging ${tab === 'deposit' ? 'depósitos' : 'restantes'} · ${money(totalForTab, 'EUR')} pendiente`}
        className="mb-8"
      >
        {totalForTab > 0 ? (
          <StackedBar
            segments={[
              { label: `${money(activeBuckets['0_30'], 'EUR')} · 0-30 d`, value: activeBuckets['0_30'], variant: 's0' },
              { label: `${money(activeBuckets['31_60'], 'EUR')} · 31-60 d`, value: activeBuckets['31_60'], variant: 's1' },
              { label: `${money(activeBuckets['61_90'], 'EUR')} · 61-90 d`, value: activeBuckets['61_90'], variant: 's2' },
              { label: `${money(activeBuckets['90_plus'], 'EUR')}`, value: activeBuckets['90_plus'], variant: 's3' },
            ]}
            legend={[
              { label: '0-30 d · al día', variant: 's0' },
              { label: '31-60 d · recordatorio', variant: 's1' },
              { label: '61-90 d · 2º aviso', variant: 's2' },
              { label: '90+ d · postventa', variant: 's3' },
            ]}
          />
        ) : (
          <div className="px-6 py-12 text-center text-[13px] text-n-500">
            Nada pendiente en {tab === 'deposit' ? 'depósitos' : 'restantes'} ahora mismo.
          </div>
        )}
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
          <tr><th>Factura</th><th>Partner</th><th>Pedido</th><th>Importe</th><th>Vence</th><th>Bucket</th><th></th></tr>
        </thead>
        <tbody>
          {rows.map((inv) => {
            const partner = partners.find((p) => p.id === inv.partnerId)
            const variant = inv.agingBucket === '90_plus' || inv.agingBucket === '61_90' ? 'err' : 'warn'
            return (
              <tr key={inv.id}>
                <td>#{inv.number}</td>
                <td>{partner?.name ?? '—'}</td>
                <td className="text-n-500">{money(inv.orderTotal, inv.currency)}</td>
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
          {rows.length === 0 && <tr><td colSpan={7} className="text-center text-n-500">Sin facturas en este bucket.</td></tr>}
        </tbody>
      </table>
    </>
  )
}

// ====================================================================
// P&L — reports clásicos (Income Statement, Balance Sheet, Cash Flow)
// ====================================================================
const PL_TABS = [
  { value: 'income', label: 'Income statement' },
  { value: 'balance', label: 'Balance sheet' },
  { value: 'cashflow', label: 'Cash flow' },
] as const

const PL_PERIODS = [
  { value: 'month', label: 'Mayo 2026' },
  { value: 'ytd', label: 'YTD 2026' },
  { value: 'q1', label: 'Q1 2026' },
] as const

export function AccountingPL() {
  const [tab, setTab] = useState<(typeof PL_TABS)[number]['value']>('income')
  const [period, setPeriod] = useState<(typeof PL_PERIODS)[number]['value']>('month')

  const periodLabel = PL_PERIODS.find((p) => p.value === period)?.label ?? 'Mayo 2026'
  const comparisonLabel = period === 'month' ? 'abril 2026' : period === 'ytd' ? 'YTD 2025' : 'Q4 2025'

  return (
    <>
      <AccHeader
        actions={
          <>
            <button
              onClick={() => window.print()}
              className="btn btn-outline"
              data-print-hide
            >
              <Printer size={14} strokeWidth={1.5} /> Exportar PDF
            </button>
            <Button>+ Línea contable</Button>
          </>
        }
      />

      <KpiGrid cols={4}>
        <KpiCard eyebrow="Revenue mes" value="€ 642k" delta={{ type: 'up', label: '↑ 12,4%' }} />
        <KpiCard eyebrow="Gross margin" value="40,8%" delta={{ type: 'up', label: '↑ 2 pp' }} />
        <KpiCard eyebrow="OpEx" value="€ 972k YTD" delta={{ type: 'neutral', label: '34% del revenue' }} />
        <KpiCard eyebrow="Net margin" value="4,9%" delta={{ type: 'up', label: '↑ 1,2 pp' }} />
      </KpiGrid>

      {/* Tabs entre los tres reports */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4" data-print-hide>
        <div className="flex border border-n-300 bg-riva-white">
          {PL_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex items-center gap-2 px-5 py-2.5 text-[11px] uppercase tracking-[0.15em] transition ${
                tab === t.value
                  ? 'bg-riva-black text-riva-ivory'
                  : 'text-n-700 hover:text-riva-black'
              }`}
            >
              <FileText size={13} strokeWidth={1.5} />
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-n-500">Período</div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="border border-n-300 bg-riva-white px-3 py-2 text-[12px] uppercase tracking-[0.08em] text-n-700 focus:border-riva-black focus:outline-none"
          >
            {PL_PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Report area — printable */}
      <div className="mb-8 border border-n-300" data-print="report">
        {tab === 'income' && <IncomeStatement period={periodLabel} comparison={comparisonLabel} />}
        {tab === 'balance' && <BalanceSheet period={periodLabel} />}
        {tab === 'cashflow' && <CashFlowStatement period={periodLabel} />}
      </div>

      {/* Ingresos vs Gastos — comparación explícita verde / burdeos */}
      <Panel title="Ingresos vs Gastos · mayo 2026" className="mb-8">
        <div className="p-6">
          <div className="mb-5">
            <div className="mb-2 flex items-baseline justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 bg-success" />
                <span className="text-[12px] uppercase tracking-[0.1em] text-n-700">Ingresos</span>
              </div>
              <div className="font-display text-[18px] font-light text-n-900">€ 642k</div>
            </div>
            <div className="h-6 bg-success-soft">
              <div className="h-full bg-success" style={{ width: '100%' }} />
            </div>
          </div>
          <div className="mb-5">
            <div className="mb-2 flex items-baseline justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 bg-error" />
                <span className="text-[12px] uppercase tracking-[0.1em] text-n-700">Gastos · COGS + OpEx + Tax</span>
              </div>
              <div className="font-display text-[18px] font-light text-n-900">€ 501k</div>
            </div>
            <div className="h-6 bg-error-soft">
              <div className="h-full bg-error" style={{ width: `${(501 / 642) * 100}%` }} />
            </div>
          </div>
          <div className="border-t border-n-100 pt-4">
            <div className="flex items-baseline justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 bg-riva-black" />
                <span className="text-[12px] uppercase tracking-[0.1em] text-n-700">Margen neto</span>
              </div>
              <div className="font-display text-[26px] font-light text-success">€ 141k <span className="text-[14px] text-n-700">· 4,9%</span></div>
            </div>
          </div>
        </div>
      </Panel>

      <div className="mb-8 grid gap-8" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Panel title="Revenue por brand · YTD">
          <Donut
            slices={[
              { label: 'RIVA Spain', value: 1380, color: 'var(--cove)', valueLabel: '€ 1,38M' },
              { label: 'TIERRA', value: 980, color: 'var(--oak-mid)', valueLabel: '€ 980k' },
              { label: 'Flagship', value: 480, color: 'var(--sage)', valueLabel: '€ 480k' },
            ]}
          />
        </Panel>
        <Panel title="Margen por sede">
          <RatioGrid
            items={[
              { label: 'ES · GM', value: '56,2%', delta: { type: 'up', label: '↑ 1,8 pp' } },
              { label: 'USA · GM', value: '54,1%', delta: { type: 'up', label: '↑ 2,1 pp' } },
              { label: 'Flagship · GM', value: '38,2%', delta: { type: 'up', label: '↑ 0,4 pp' } },
              { label: 'ES · NM', value: '29,4%', delta: { type: 'up', label: '↑ 1,4 pp' } },
              { label: 'USA · NM', value: '25,1%', delta: { type: 'up', label: '↑ 0,9 pp' } },
              { label: 'Flagship · NM', value: '18,8%', delta: { type: 'neutral', label: 'estable' } },
            ]}
          />
        </Panel>
      </div>

      <Panel title="Cobros 12 meses · emitido vs cobrado">
        <MultiLine
          series={[
            { name: 'Emitido', color: 'var(--cove)', points: [40, 46, 54, 60, 68, 76, 84, 92, 102, 112, 124, 134] },
            { name: 'Cobrado', color: 'var(--success)', points: [32, 38, 46, 52, 60, 68, 76, 84, 94, 102, 112, 122] },
          ]}
          xLabels={['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May']}
        />
      </Panel>

      <h2 className="mt-12 mb-4 font-display text-[26px] font-light tracking-[0.04em]">Top partners · Revenue YTD</h2>
      <table className="data-table">
        <thead>
          <tr><th>Partner</th><th>Sede</th><th>Revenue</th><th>Pedidos</th><th>Margen %</th></tr>
        </thead>
        <tbody>
          <tr><td>Flagship Miami</td><td>USA</td><td><LbBar variant="oak" pct={100} value="€ 384k" /></td><td>14</td><td>38,2%</td></tr>
          <tr><td>Ebony & Oak NY</td><td>USA</td><td><LbBar variant="oak" pct={50} value="€ 198k" /></td><td>9</td><td>54,1%</td></tr>
          <tr><td>FloorHaus Miami</td><td>USA</td><td><LbBar variant="oak" pct={42} value="€ 162k" /></td><td>7</td><td>52,8%</td></tr>
          <tr><td>Studio Rota</td><td>ES</td><td><LbBar variant="oak" pct={37} value="€ 143k" /></td><td>11</td><td>56,2%</td></tr>
          <tr><td>Grain LA</td><td>USA</td><td><LbBar variant="oak" pct={36} value="€ 138k" /></td><td>6</td><td>53,0%</td></tr>
        </tbody>
      </table>
    </>
  )
}

// ====================================================================
// CIERRE MES — workflow checklist
// ====================================================================
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

// ====================================================================
// EQUIPO
// ====================================================================
export function AccountingEquipo() {
  return (
    <>
      <AccHeader />
      <DeptEquipo
        dept="accounting"
        title="Equipo de Accounting"
        description="Equipo financiero distribuido entre Madrid y NY. Gestionan facturación dual (depósito + final), conciliación con QuickBooks y reporting P&L."
      />
    </>
  )
}
