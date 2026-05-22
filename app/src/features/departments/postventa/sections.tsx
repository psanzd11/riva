import { useMemo, useState } from 'react'
import { useStore } from '../../../data/store'
import { reviewsRepo } from '../../../data/repo'
import { useRole } from '../../../auth/RoleContext'
import { PageHead } from '../../../components/layout/PageHead'
import { Button } from '../../../components/ui/Button'
import { Panel } from '../../../components/ui/Panel'
import { Pill } from '../../../components/ui/Pill'
import { KpiGrid } from '../../../components/kpi/KpiGrid'
import { KpiCard } from '../../../components/kpi/KpiCard'
import { FilterTabs } from '../../../components/ui/FilterTabs'
import { Gauge } from '../../../components/charts/Gauge'
import { VBarChart } from '../../../components/charts/VBarChart'
import { MultiLine } from '../../../components/charts/MultiLine'
import { LbBar } from '../../../components/data-table/Leaderboard'
import { dateRelative } from '../../../lib/format'
import { TicketDrawer } from './TicketDrawer'

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'high', label: 'Urgente' },
  { value: 'unassigned', label: 'Sin asignar' },
] as const

function PvHeader({ actions }: { actions?: React.ReactNode }) {
  return (
    <PageHead
      eyebrow="Departamento"
      title="Postventa"
      description="Tickets, reseñas, NPS, garantías y mantenimiento. Una reseña ≤3★ abre ticket automático y asigna a equipo."
      actions={actions}
    />
  )
}

function useNps() {
  const reviews = useStore((s) => s.reviews)
  const promoters = reviews.filter((r) => r.score >= 4).length
  const detractors = reviews.filter((r) => r.score <= 2).length
  const nps = reviews.length > 0 ? Math.round(((promoters - detractors) / reviews.length) * 100) : 0
  return { reviews, promoters, detractors, nps }
}

export function PvResumen() {
  const tickets = useStore((s) => s.tickets)
  const { reviews, nps } = useNps()
  const open = tickets.filter((t) => t.status !== 'closed')
  return (
    <>
      <PvHeader actions={<><Button variant="outline">Encuestas</Button><Button>+ Ticket</Button></>} />
      <KpiGrid>
        <KpiCard eyebrow="Tickets abiertos" value={String(open.length)} delta={{ type: 'up', label: '−3 vs sem. ant.' }} />
        <KpiCard eyebrow="NPS 30d" value={`+${nps}`} delta={{ type: 'up', label: '↑ 4 pts' }} />
        <KpiCard eyebrow="Tiempo respuesta" value="3,2 h" delta={{ type: 'up', label: '−0,8 h' }} />
        <KpiCard eyebrow="Reseñas mes" value={String(reviews.length)} sub="4,7★ promedio" />
      </KpiGrid>

      <Panel title="Net Promoter Score" className="mb-8">
        <Gauge score={nps} />
      </Panel>

      <p className="text-[13px] text-n-700 max-w-prose">
        Subsecciones: <b>Tickets</b> (lista + drawer), <b>Reseñas</b> (distribución + simular 2★),
        <b> NPS & causas</b> (gauge + evolución 12m + top causas).
      </p>
    </>
  )
}

export function PvTickets() {
  const tickets = useStore((s) => s.tickets)
  const users = useStore((s) => s.users)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['value']>('all')
  const [drawerId, setDrawerId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = tickets.filter((t) => t.status !== 'closed')
    if (filter === 'high') list = list.filter((t) => t.priority === 'high')
    if (filter === 'unassigned') list = list.filter((t) => !t.assigneeId)
    return list.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }, [tickets, filter])

  return (
    <>
      <PvHeader actions={<><Button variant="outline">Encuestas</Button><Button>+ Ticket</Button></>} />
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-[26px] font-light tracking-[0.04em]">Tickets abiertos</h2>
        <FilterTabs options={FILTERS} value={filter} onChange={setFilter} />
      </div>
      <table className="data-table">
        <thead>
          <tr><th>Ticket</th><th>Cliente / Partner</th><th>Tipo</th><th>Asignado</th><th>Tiempo abierto</th><th>Prioridad</th></tr>
        </thead>
        <tbody>
          {filtered.map((t) => (
            <tr key={t.id} onClick={() => setDrawerId(t.id)}>
              <td>#{t.id.replace('tkt_', '')}</td>
              <td>{t.clientName}</td>
              <td>{t.type}</td>
              <td>{t.assigneeId ? users.find((u) => u.id === t.assigneeId)?.name : <span className="text-n-500">Sin asignar</span>}</td>
              <td>{dateRelative(t.createdAt)}</td>
              <td><Pill variant={t.priority === 'high' ? 'err' : t.priority === 'med' ? 'warn' : 'default'}>{t.priority}</Pill></td>
            </tr>
          ))}
          {filtered.length === 0 && <tr><td colSpan={6} className="text-center text-n-500">Sin tickets en este filtro.</td></tr>}
        </tbody>
      </table>
      <TicketDrawer ticketId={drawerId} onClose={() => setDrawerId(null)} />
    </>
  )
}

export function PvResenas() {
  const { currentUserId } = useRole()
  const partners = useStore((s) => s.partners)
  const reviews = useStore((s) => s.reviews)
  const byScore = [5, 4, 3, 2, 1].map((s) => reviews.filter((r) => r.score === s).length)
  const reviewBars = [
    { label: '5★', value: String(byScore[0]), heightPct: Math.min(95, byScore[0] * 4), variant: 'sage' as const },
    { label: '4★', value: String(byScore[1]), heightPct: Math.min(95, byScore[1] * 4), variant: 'cove' as const },
    { label: '3★', value: String(byScore[2]), heightPct: Math.min(95, byScore[2] * 4), variant: 'oak' as const },
    { label: '2★', value: String(byScore[3]), heightPct: Math.min(95, byScore[3] * 4), variant: 'mid' as const },
    { label: '1★', value: String(byScore[4]), heightPct: Math.min(95, byScore[4] * 4), variant: 'error' as const },
  ]

  const seedTwoStarReview = () => {
    const partner = partners[0]
    reviewsRepo.create({
      partnerId: partner?.id,
      clientName: 'Cliente demo · simulación',
      score: 2,
      text: 'Defecto en acabado, gestión lenta.',
      source: 'google',
      at: new Date().toISOString(),
    }, currentUserId)
    useStore.getState().emitAutomation('review.created', { score: 2, text: 'Defecto en acabado', partnerId: partner?.id })
  }

  const recent = [...reviews].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 20)

  return (
    <>
      <PvHeader actions={<><Button variant="outline" onClick={seedTwoStarReview}>Simular reseña 2★</Button><Button>Ver públicas</Button></>} />
      <div className="mb-8 grid gap-8" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <Panel title="Distribución reseñas · mes" action={<a className="link text-[11px] cursor-pointer">{reviews.length} totales</a>}>
          <VBarChart bars={reviewBars} foot={{ left: 'Promedio · 4,7★', right: `Tickets auto · ${byScore[3] + byScore[4]}` }} />
        </Panel>
        <Panel title="Últimas reseñas">
          <div>
            {recent.length === 0 && <div className="px-6 py-6 text-center text-[12px] text-n-500">Sin reseñas todavía.</div>}
            {recent.map((r) => (
              <div key={r.id} className="border-b border-n-100 px-6 py-4 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[13px] font-medium">{r.clientName}</div>
                    <div className="mt-0.5 text-[11px] uppercase tracking-[0.06em] text-n-500">
                      {dateRelative(r.at)} · {r.source}
                    </div>
                  </div>
                  <div className="text-[14px]" style={{ color: r.score >= 4 ? 'var(--sage)' : r.score <= 2 ? 'var(--error)' : 'var(--warning)' }}>
                    {'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}
                  </div>
                </div>
                <p className="mt-2 text-[13px] text-n-700">{r.text}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  )
}

export function PvNps() {
  const { nps } = useNps()
  return (
    <>
      <PvHeader />
      <div className="mb-8 grid gap-8" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <Panel title="Net Promoter Score" action={<a className="link text-[11px] cursor-pointer">30 días</a>}>
          <Gauge score={nps} />
        </Panel>
        <Panel title="NPS evolución 12 meses">
          <MultiLine
            series={[
              { name: `Holding +${nps}`, color: 'var(--sage)', points: [108, 104, 96, 92, 84, 82, 76, 72, 66, 60, 52, 46, 38] },
              { name: 'ES +66', color: 'var(--cove)', points: [118, 114, 108, 98, 90, 86, 82, 76, 68, 62, 56, 50, 42] },
              { name: 'USA +56', color: 'var(--oak-mid)', points: [128, 122, 114, 108, 98, 92, 88, 82, 76, 68, 62, 56, 52] },
            ]}
            xLabels={['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', '']}
          />
        </Panel>
      </div>

      <h2 className="mb-4 mt-4 font-display text-[26px] font-light tracking-[0.04em]">Top causas · últimos 90 días</h2>
      <table className="data-table">
        <thead>
          <tr><th>Causa</th><th>Tickets</th><th>% del total</th><th>Tiempo medio resol.</th><th>Tendencia</th></tr>
        </thead>
        <tbody>
          <tr><td>Defecto acabado / color</td><td>14</td><td><LbBar pct={42} value="28%" /></td><td>2,1 d</td><td><Pill variant="warn">↑ 4 vs Q1</Pill></td></tr>
          <tr><td>Consulta mantenimiento</td><td>12</td><td><LbBar variant="sage" pct={36} value="24%" /></td><td>0,8 d</td><td><Pill variant="ok">estable</Pill></td></tr>
          <tr><td>Pedido incompleto</td><td>9</td><td><LbBar variant="oak" pct={28} value="18%" /></td><td>1,4 d</td><td><Pill variant="ok">−2 vs Q1</Pill></td></tr>
          <tr><td>Garantía / sustitución</td><td>8</td><td><LbBar pct={24} value="16%" /></td><td>4,2 d</td><td><Pill variant="ok">estable</Pill></td></tr>
          <tr><td>Otros</td><td>7</td><td><LbBar pct={22} value="14%" /></td><td>1,2 d</td><td><Pill>—</Pill></td></tr>
        </tbody>
      </table>
    </>
  )
}
