import { useMemo, useState } from 'react'
import { useStore } from '../../../data/store'
import { useRole } from '../../../auth/RoleContext'
import { PageHead } from '../../../components/layout/PageHead'
import { Button } from '../../../components/ui/Button'
import { Panel } from '../../../components/ui/Panel'
import { Pill } from '../../../components/ui/Pill'
import { KpiGrid } from '../../../components/kpi/KpiGrid'
import { KpiCard } from '../../../components/kpi/KpiCard'
import { FilterTabs } from '../../../components/ui/FilterTabs'
import { ConversionBar } from '../../../components/charts/ConversionBar'
import { MultiLine } from '../../../components/charts/MultiLine'
import { LineArea } from '../../../components/charts/LineArea'
import { RatioGrid } from '../../../components/charts/RatioGrid'
import { Sparkline } from '../../../components/charts/Sparkline'
import { Funnel } from '../../../components/charts/Funnel'
import { Donut } from '../../../components/charts/Donut'
import { LbBar, LbAvatar, LbRank } from '../../../components/data-table/Leaderboard'
import { money, moneyCompact, initials, dateRelative } from '../../../lib/format'
import { PipelineKanban } from './PipelineKanban'
import { DealDrawer } from './DealDrawer'
import { NewDealModal } from './NewDealModal'
import { DeptEquipo } from '../shared/DeptEquipo'
import { ChevronUp, ChevronDown } from 'lucide-react'
import type { Deal } from '../../../data/schema'

const TIME_FILTERS = [
  { value: 'month', label: 'Mes' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'year', label: 'Año' },
] as const
type TimeFilterValue = (typeof TIME_FILTERS)[number]['value']

const STAGE_PROBS: Record<Deal['stage'], number> = {
  lead: 10,
  qualified: 25,
  proposal: 50,
  negotiation: 75,
  won: 100,
  lost: 0,
}

function timeWindowDays(t: TimeFilterValue): number {
  return t === 'month' ? 30 : t === 'quarter' ? 90 : 365
}

function isInWindow(iso: string, days: number, now: Date): boolean {
  return new Date(iso).getTime() >= now.getTime() - days * 86400000
}

function useVentasData() {
  const { role, currentUserId } = useRole()
  const deals = useStore((s) => s.deals)
  const visibleDeals = useMemo(
    () => (role === 'comercial' ? deals.filter((d) => d.ownerId === currentUserId) : deals),
    [deals, role, currentUserId],
  )
  const open = visibleDeals.filter((d) => d.stage !== 'won' && d.stage !== 'lost')
  const won = visibleDeals.filter((d) => d.stage === 'won')
  const lost = visibleDeals.filter((d) => d.stage === 'lost')
  const forecast = open.reduce((acc, d) => acc + d.amount * (STAGE_PROBS[d.stage] / 100), 0)
  const wonYtd = won.reduce((acc, d) => acc + d.amount, 0)
  const pipelineAmount = open.reduce((acc, d) => acc + d.amount, 0)
  const closingRate = won.length + open.length + lost.length > 0
    ? Math.round((won.length / (won.length + open.length + lost.length)) * 100)
    : 0
  return { visibleDeals, open, won, lost, forecast, wonYtd, pipelineAmount, closingRate }
}

function VentasHeader({ actions }: { actions?: React.ReactNode }) {
  return (
    <PageHead
      eyebrow="Departamento"
      title="Ventas"
      description="Pipeline cross-sede, equipo comercial por sede + partners. CRM interno construido a medida."
      actions={actions}
    />
  )
}

// ====================================================================
// RESUMEN — rico
// ====================================================================
export function VentasResumen() {
  const data = useVentasData()
  const partners = useStore((s) => s.partners)
  const users = useStore((s) => s.users)
  const leads = useStore((s) => s.leads)
  const activities = useStore((s) => s.activities)
  const [newOpen, setNewOpen] = useState(false)

  const wonByMonth = useMemo(() => {
    const buckets = new Array(12).fill(0)
    const now = new Date('2026-05-22')
    data.won.forEach((d) => {
      const date = new Date(d.createdAt)
      const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth())
      if (diffMonths >= 0 && diffMonths < 12) buckets[11 - diffMonths] += 1
    })
    return buckets
  }, [data.won])

  const top3 = useMemo(() => {
    return users
      .filter((u) => u.role === 'comercial')
      .map((u) => ({
        user: u,
        won: data.visibleDeals.filter((d) => d.ownerId === u.id && d.stage === 'won').length,
        wonAmount: data.visibleDeals.filter((d) => d.ownerId === u.id && d.stage === 'won').reduce((a, d) => a + d.amount, 0),
      }))
      .sort((a, b) => b.wonAmount - a.wonAmount)
      .slice(0, 3)
  }, [users, data.visibleDeals])

  const partnerTop5 = useMemo(() => {
    return [...partners].sort((a, b) => b.salesYtd - a.salesYtd).slice(0, 5)
  }, [partners])

  const newLeads7d = leads.filter((l) => isInWindow(l.createdAt, 7, new Date('2026-05-22'))).length
  const activities7d = activities.filter((a) => isInWindow(a.at, 7, new Date('2026-05-22'))).length

  return (
    <>
      <VentasHeader
        actions={
          <>
            <Button variant="outline">Forecast</Button>
            <Button onClick={() => setNewOpen(true)}>+ Lead</Button>
          </>
        }
      />

      <KpiGrid cols={8}>
        <KpiCard eyebrow="Forecast ponderado" value={moneyCompact(data.forecast, 'EUR')} delta={{ type: 'up', label: '↑ 9% vs Q1' }} />
        <KpiCard eyebrow="Pipeline abierto" value={moneyCompact(data.pipelineAmount, 'EUR')} sub={`${data.open.length} deals`} />
        <KpiCard eyebrow="Closed Won YTD" value={moneyCompact(data.wonYtd, 'EUR')} sub={`${data.won.length} deals`} />
        <KpiCard eyebrow="Tasa cierre" value={`${data.closingRate}%`} delta={{ type: 'up', label: '↑ 2,1 pp' }} />
        <KpiCard eyebrow="Ciclo medio" value="42 d" delta={{ type: 'neutral', label: '— estable' }} />
        <KpiCard eyebrow="Velocidad" value="9,2 / mes" delta={{ type: 'up', label: '↑ 14%' }} />
        <KpiCard eyebrow="Leads 7d" value={String(newLeads7d)} sub={`${leads.length} totales`} />
        <KpiCard eyebrow="Actividad 7d" value={String(activities7d)} sub={`${activities.length} totales`} />
      </KpiGrid>

      <Panel title="Conversión por etapa" className="mb-8">
        <ConversionBar
          segments={[
            { label: 'Lead', pct: 100 },
            { label: 'Cualificado', pct: 62 },
            { label: 'Propuesta', pct: 38 },
            { label: 'Negociación', pct: 22 },
            { label: 'Cierre', pct: 14 },
          ]}
        />
      </Panel>

      <div className="mb-8 grid gap-8" style={{ gridTemplateColumns: '1.4fr 1fr 1fr' }}>
        <Panel title="Won — últimos 12 meses">
          <LineArea
            points={wonByMonth.map((v) => Math.max(2, v))}
            xLabels={['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May']}
            totals={{ left: `Total · <b>${data.won.length} won</b>`, right: `<b>${moneyCompact(data.wonYtd, 'EUR')}</b>` }}
          />
        </Panel>

        <Panel title="Embudo">
          <Funnel
            rows={[
              { stage: 'Lead', count: 312, amountLabel: '€ 4,2M', pct: 100, widthPct: 100 },
              { stage: 'Cualif.', count: 192, amountLabel: '€ 3,1M', pct: 62, widthPct: 78 },
              { stage: 'Propuesta', count: 118, amountLabel: '€ 2,1M', pct: 38, widthPct: 54 },
              { stage: 'Negoc.', count: 68, amountLabel: '€ 1,4M', pct: 22, widthPct: 32 },
              { stage: 'Cierre', count: 42, amountLabel: '€ 840k', pct: 14, widthPct: 18 },
            ]}
          />
        </Panel>

        <Panel title="Ratios & velocidad">
          <RatioGrid
            items={[
              { label: 'Leads-to-close', value: '14,3%', spark: <Sparkline points={[18, 16, 17, 14, 12, 10, 8, 6, 4]} /> },
              { label: 'Closing rate', value: `${data.closingRate}%`, spark: <Sparkline points={[14, 15, 12, 11, 10, 9, 8, 7, 6]} /> },
              { label: 'Win-loss', value: `${data.won.length}/${data.lost.length}`, delta: { type: 'up', label: '↑ vs Q1' } },
              { label: 'Abiertos', value: String(data.open.length), delta: { type: 'up', label: '↑ 22 vs mes ant.' } },
            ]}
          />
        </Panel>
      </div>

      <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Panel title="Top comerciales · Won YTD">
          <table className="data-table border-0">
            <thead>
              <tr><th></th><th>Comercial</th><th>Won</th><th>Importe</th></tr>
            </thead>
            <tbody>
              {top3.map((row, idx) => (
                <tr key={row.user.id}>
                  <td><LbRank n={idx + 1} /></td>
                  <td>
                    <div className="flex items-center gap-3">
                      <LbAvatar initials={initials(row.user.name)} bg={`var(--${row.user.avatarColor})`} color="var(--riva-ivory)" />
                      <div>
                        <div className="font-medium">{row.user.name}</div>
                        <div className="text-[11px] text-n-500">{row.user.deptRole}</div>
                      </div>
                    </div>
                  </td>
                  <td>{row.won}</td>
                  <td>{money(row.wonAmount, 'EUR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Top partners · Sales YTD">
          <table className="data-table border-0">
            <thead><tr><th>Partner</th><th>Sede</th><th>Sales</th></tr></thead>
            <tbody>
              {partnerTop5.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-[11px] text-n-500">{p.address}</div>
                  </td>
                  <td>{p.sede.toUpperCase()}</td>
                  <td>{money(p.salesYtd, p.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <NewDealModal open={newOpen} onClose={() => setNewOpen(false)} />
    </>
  )
}

// ====================================================================
// PIPELINE — mini-dashboards + filtros drill-down
// ====================================================================
const SEDE_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'es', label: 'España' },
  { value: 'us', label: 'USA' },
] as const

export function VentasPipeline() {
  const data = useVentasData()
  const users = useStore((s) => s.users)
  const partners = useStore((s) => s.partners)
  const [drawerId, setDrawerId] = useState<string | null>(null)
  const [newOpen, setNewOpen] = useState(false)
  const [sede, setSede] = useState<(typeof SEDE_FILTERS)[number]['value']>('all')
  const [comercialId, setComercialId] = useState<string>('all')

  // Reset comercial selection when sede changes
  const onSedeChange = (s: typeof sede) => {
    setSede(s)
    setComercialId('all')
  }

  const eligibleComerciales = useMemo(() => {
    return users.filter((u) => u.role === 'comercial' && (sede === 'all' || u.sede === sede))
  }, [users, sede])

  // Apply filters
  const filteredDeals = useMemo(() => {
    let list = data.visibleDeals
    if (sede !== 'all') {
      const partnerIdsInSede = new Set(partners.filter((p) => p.sede === sede).map((p) => p.id))
      list = list.filter((d) => partnerIdsInSede.has(d.partnerId))
    }
    if (comercialId !== 'all') list = list.filter((d) => d.ownerId === comercialId)
    return list
  }, [data.visibleDeals, partners, sede, comercialId])

  const open = filteredDeals.filter((d) => d.stage !== 'won' && d.stage !== 'lost')
  const won = filteredDeals.filter((d) => d.stage === 'won')
  const forecast = open.reduce((acc, d) => acc + d.amount * (STAGE_PROBS[d.stage] / 100), 0)
  const pipelineAmount = open.reduce((acc, d) => acc + d.amount, 0)
  const avgCycle = won.length > 0
    ? Math.round(won.reduce((a, d) => a + (new Date(d.expectedCloseDate).getTime() - new Date(d.createdAt).getTime()) / 86400000, 0) / won.length)
    : 0

  return (
    <>
      <VentasHeader
        actions={
          <>
            <Button variant="outline">Filtros</Button>
            <Button onClick={() => setNewOpen(true)}>+ Lead</Button>
          </>
        }
      />

      {/* Mini-dashboards arriba */}
      <KpiGrid cols={4}>
        <KpiCard eyebrow="Forecast ponderado" value={moneyCompact(forecast, 'EUR')} sub={`${open.length} deals abiertos`} />
        <KpiCard eyebrow="Pipeline (no ponderado)" value={moneyCompact(pipelineAmount, 'EUR')} sub="Suma de todos los deals open" />
        <KpiCard eyebrow="Deals / semana" value={String(Math.max(1, Math.round(open.length / 4)))} delta={{ type: 'up', label: '↑ ritmo Q2' }} />
        <KpiCard eyebrow="Ciclo medio" value={`${Math.max(20, avgCycle) || 42} d`} delta={{ type: 'neutral', label: '— estable' }} />
      </KpiGrid>

      {/* Filtros: Sede → Comercial (drill-down) */}
      <Panel headless className="mb-8">
        <div className="flex flex-wrap items-center gap-4 p-5">
          <div className="flex items-center gap-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-n-500">Equipo</div>
            <FilterTabs options={SEDE_FILTERS} value={sede} onChange={onSedeChange} />
          </div>
          {sede !== 'all' && (
            <div className="flex items-center gap-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-n-500">Comercial</div>
              <select
                value={comercialId}
                onChange={(e) => setComercialId(e.target.value)}
                className="border border-n-300 bg-riva-white px-3 py-1.5 text-[12px] uppercase tracking-[0.08em] text-n-700 focus:border-riva-black focus:outline-none"
              >
                <option value="all">Todos los comerciales</option>
                {eligibleComerciales.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          )}
          {(sede !== 'all' || comercialId !== 'all') && (
            <button
              onClick={() => { setSede('all'); setComercialId('all') }}
              className="ml-auto text-[10px] uppercase tracking-[0.15em] text-cove hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </Panel>

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-[26px] font-light tracking-[0.04em]">Pipeline kanban</h2>
        <div className="text-[11px] uppercase tracking-[0.1em] text-n-500">Arrastra una tarjeta entre columnas para cambiar la etapa</div>
      </div>

      <PipelineKanban onCardClick={setDrawerId} />

      <DealDrawer dealId={drawerId} onClose={() => setDrawerId(null)} />
      <NewDealModal open={newOpen} onClose={() => setNewOpen(false)} />
    </>
  )
}

// ====================================================================
// EQUIPO — sortable, toggles funcionando, mini-cards + gráfica
// ====================================================================
type LbCol = 'partners' | 'deals' | 'won' | 'closing' | 'pipe' | 'wonAmount'

export function VentasEquipo() {
  const users = useStore((s) => s.users)
  const deals = useStore((s) => s.deals)
  const partners = useStore((s) => s.partners)
  const activities = useStore((s) => s.activities)
  const [timeFilter, setTimeFilter] = useState<TimeFilterValue>('year')
  const [sortBy, setSortBy] = useState<LbCol>('wonAmount')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')

  const now = useMemo(() => new Date('2026-05-22'), [])
  const windowDays = timeWindowDays(timeFilter)

  const leaderboard = useMemo(() => {
    return users
      .filter((u) => u.role === 'comercial')
      .map((u) => {
        const allUserDeals = deals.filter((d) => d.ownerId === u.id)
        const userDeals = allUserDeals.filter((d) => isInWindow(d.createdAt, windowDays, now))
        const userWon = userDeals.filter((d) => d.stage === 'won')
        const userPipe = userDeals.filter((d) => d.stage !== 'won' && d.stage !== 'lost')
        const closingRate = userDeals.length > 0 ? Math.round((userWon.length / userDeals.length) * 100) : 0
        const pipeAmount = userPipe.reduce((acc, d) => acc + d.amount, 0)
        const wonAmount = userWon.reduce((acc, d) => acc + d.amount, 0)
        const partnersCount = partners.filter((p) => p.assignedTo === u.id).length
        return { user: u, deals: userDeals.length, won: userWon.length, closingRate, pipeAmount, wonAmount, partnersCount }
      })
  }, [users, deals, partners, windowDays, now])

  const sorted = useMemo(() => {
    const map: Record<LbCol, (r: typeof leaderboard[number]) => number> = {
      partners: (r) => r.partnersCount,
      deals: (r) => r.deals,
      won: (r) => r.won,
      closing: (r) => r.closingRate,
      pipe: (r) => r.pipeAmount,
      wonAmount: (r) => r.wonAmount,
    }
    const fn = map[sortBy]
    const arr = [...leaderboard].sort((a, b) => fn(b) - fn(a))
    return sortDir === 'asc' ? arr.reverse() : arr
  }, [leaderboard, sortBy, sortDir])

  const maxPipe = Math.max(...leaderboard.map((l) => l.pipeAmount), 1)
  const maxWon = Math.max(...leaderboard.map((l) => l.wonAmount), 1)

  const onSort = (col: LbCol) => {
    if (sortBy === col) setSortDir(sortDir === 'desc' ? 'asc' : 'desc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const sortIcon = (col: LbCol) => {
    if (sortBy !== col) return <span className="opacity-30 ml-1">↕</span>
    return sortDir === 'desc' ? <ChevronDown size={12} className="inline ml-1" /> : <ChevronUp size={12} className="inline ml-1" />
  }

  // Mini-cards arriba del ranking
  const top = sorted[0]
  const biggestPipe = [...leaderboard].sort((a, b) => b.pipeAmount - a.pipeAmount)[0]
  const fastestCloser = [...leaderboard].sort((a, b) => b.closingRate - a.closingRate)[0]
  const totalWonInWindow = leaderboard.reduce((a, r) => a + r.wonAmount, 0)

  // Activity heatmap-style scatter for the "gráfica guapa": activities × user
  const actsByUser = useMemo(() => {
    const map: Record<string, number> = {}
    activities
      .filter((a) => isInWindow(a.at, windowDays, now))
      .forEach((a) => {
        map[a.userId] = (map[a.userId] ?? 0) + 1
      })
    return map
  }, [activities, windowDays, now])

  return (
    <>
      <VentasHeader />

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-[26px] font-light tracking-[0.04em]">Equipo comercial</h2>
        <FilterTabs options={TIME_FILTERS} value={timeFilter} onChange={setTimeFilter} variant="time" />
      </div>

      {/* Mini-dashboards encima del ranking */}
      <KpiGrid cols={4} className="!mb-8">
        <KpiCard
          eyebrow={`Top performer · ${timeFilter === 'month' ? 'mes' : timeFilter === 'quarter' ? 'trim.' : 'año'}`}
          value={top?.user.name.split(' ')[0] ?? '—'}
          sub={top ? money(top.wonAmount, 'EUR') : '—'}
        />
        <KpiCard
          eyebrow="Mayor pipeline"
          value={biggestPipe?.user.name.split(' ')[0] ?? '—'}
          sub={biggestPipe ? money(biggestPipe.pipeAmount, 'EUR') : '—'}
        />
        <KpiCard
          eyebrow="Closing rate top"
          value={`${fastestCloser?.closingRate ?? 0}%`}
          sub={fastestCloser?.user.name ?? '—'}
        />
        <KpiCard
          eyebrow="Won total ventana"
          value={moneyCompact(totalWonInWindow, 'EUR')}
          sub={`${leaderboard.reduce((a, r) => a + r.won, 0)} deals`}
        />
      </KpiGrid>

      <p className="mb-3.5 text-[12px] uppercase tracking-[0.06em] text-n-500">Ranking · click en columna para ordenar</p>
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Comercial</th>
            <th onClick={() => onSort('partners')} className="cursor-pointer hover:text-cove">Partners {sortIcon('partners')}</th>
            <th onClick={() => onSort('deals')} className="cursor-pointer hover:text-cove">Deals {sortIcon('deals')}</th>
            <th onClick={() => onSort('won')} className="cursor-pointer hover:text-cove">Won {sortIcon('won')}</th>
            <th onClick={() => onSort('closing')} className="cursor-pointer hover:text-cove">Closing rate {sortIcon('closing')}</th>
            <th onClick={() => onSort('pipe')} className="cursor-pointer hover:text-cove">Pipeline {sortIcon('pipe')}</th>
            <th onClick={() => onSort('wonAmount')} className="cursor-pointer hover:text-cove">Won ({timeFilter === 'month' ? 'mes' : timeFilter === 'quarter' ? 'Q' : 'YTD'}) {sortIcon('wonAmount')}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, idx) => (
            <tr key={row.user.id}>
              <td><LbRank n={idx + 1} /></td>
              <td>
                <div className="flex items-center gap-3">
                  <LbAvatar initials={initials(row.user.name)} bg={`var(--${row.user.avatarColor})`} color="var(--riva-ivory)" />
                  <div>
                    <div className="font-medium">{row.user.name}</div>
                    <div className="text-[11px] text-n-500">{row.user.deptRole}</div>
                  </div>
                </div>
              </td>
              <td>{row.partnersCount}</td>
              <td>{row.deals}</td>
              <td>{row.won} / {row.deals}</td>
              <td><LbBar pct={row.closingRate} value={`${row.closingRate}%`} /></td>
              <td><LbBar variant="oak" pct={(row.pipeAmount / maxPipe) * 100} value={money(row.pipeAmount, 'EUR')} /></td>
              <td><LbBar variant="sage" pct={(row.wonAmount / maxWon) * 100} value={money(row.wonAmount, 'EUR')} /></td>
            </tr>
          ))}
          {sorted.length === 0 && <tr><td colSpan={8} className="text-center text-n-500">Sin comerciales activos en este periodo.</td></tr>}
        </tbody>
      </table>

      <div className="mt-8 grid gap-8" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <Panel title="Won credit · evolución por comercial">
          <MultiLine
            series={[
              { name: 'Carla M.', color: 'var(--cove)', points: [140, 128, 108, 86, 68, 48, 32] },
              { name: 'Jake R.', color: 'var(--oak-mid)', points: [150, 142, 124, 108, 92, 72, 58] },
              { name: 'Diego A.', color: 'var(--sage)', points: [158, 148, 134, 118, 104, 90, 76] },
              { name: 'Ashley T.', color: '#7a5230', points: [164, 158, 148, 140, 128, 118, 106] },
              { name: 'Laura P.', color: '#3f2616', points: [172, 168, 162, 156, 148, 140, 134] },
            ]}
            xLabels={['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May']}
          />
        </Panel>

        <Panel title={`Actividad ${timeFilter === 'month' ? 'mes' : timeFilter === 'quarter' ? 'trimestre' : 'año'}`}>
          <div className="p-6">
            {leaderboard
              .filter((r) => actsByUser[r.user.id])
              .sort((a, b) => (actsByUser[b.user.id] ?? 0) - (actsByUser[a.user.id] ?? 0))
              .slice(0, 6)
              .map((r) => {
                const count = actsByUser[r.user.id] ?? 0
                const max = Math.max(...Object.values(actsByUser), 1)
                return (
                  <div key={r.user.id} className="mb-4 last:mb-0">
                    <div className="mb-1 flex items-center justify-between text-[12px]">
                      <span className="text-n-900">{r.user.name}</span>
                      <span className="font-display text-[14px] text-n-700">{count}</span>
                    </div>
                    <div className="h-[5px] bg-n-100">
                      <div className="h-full bg-cove" style={{ width: `${(count / max) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            {Object.keys(actsByUser).length === 0 && (
              <div className="text-center text-[12px] text-n-500">Sin actividad en este periodo.</div>
            )}
          </div>
        </Panel>
      </div>
    </>
  )
}

// ====================================================================
// LEADS — movido de Marketing
// ====================================================================
export function VentasLeads() {
  const leads = useStore((s) => s.leads)
  const users = useStore((s) => s.users)
  type LeadCol = 'name' | 'channel' | 'score' | 'stage' | 'date'
  const [sortBy, setSortBy] = useState<LeadCol>('score')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')
  const [stageFilter, setStageFilter] = useState<'all' | 'new' | 'mql' | 'sql' | 'opportunity'>('all')

  const filtered = useMemo(() => {
    let list = leads
    if (stageFilter !== 'all') list = list.filter((l) => l.stage === stageFilter)
    const map: Record<LeadCol, (l: typeof leads[number]) => string | number> = {
      name: (l) => l.name,
      channel: (l) => l.channel,
      score: (l) => l.score,
      stage: (l) => l.stage,
      date: (l) => l.createdAt,
    }
    const fn = map[sortBy]
    list = [...list].sort((a, b) => {
      const va = fn(a)
      const vb = fn(b)
      if (typeof va === 'number' && typeof vb === 'number') return vb - va
      return String(vb).localeCompare(String(va))
    })
    return sortDir === 'asc' ? list.reverse() : list
  }, [leads, sortBy, sortDir, stageFilter])

  const onSort = (col: LeadCol) => {
    if (sortBy === col) setSortDir(sortDir === 'desc' ? 'asc' : 'desc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const sortIcon = (col: LeadCol) => {
    if (sortBy !== col) return <span className="opacity-30 ml-1">↕</span>
    return sortDir === 'desc' ? <ChevronDown size={12} className="inline ml-1" /> : <ChevronUp size={12} className="inline ml-1" />
  }

  return (
    <>
      <VentasHeader actions={<><Button variant="outline">Importar CSV</Button><Button>+ Lead</Button></>} />

      <KpiGrid cols={4}>
        <KpiCard eyebrow="Leads totales" value={String(leads.length)} delta={{ type: 'up', label: '↑ 24% vs mes ant.' }} />
        <KpiCard eyebrow="Score promedio" value={String(Math.round(leads.reduce((a, l) => a + l.score, 0) / Math.max(1, leads.length)))} sub="0-100" />
        <KpiCard eyebrow="SQL (score ≥75)" value={String(leads.filter((l) => l.score >= 75).length)} delta={{ type: 'up', label: 'ready to engage' }} />
        <KpiCard eyebrow="Sin owner" value={String(leads.filter((l) => !l.ownerId).length)} sub="esperando asignación" />
      </KpiGrid>

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-[26px] font-light tracking-[0.04em]">Leads</h2>
        <FilterTabs
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'new', label: 'New' },
            { value: 'mql', label: 'MQL' },
            { value: 'sql', label: 'SQL' },
            { value: 'opportunity', label: 'Oport.' },
          ]}
          value={stageFilter}
          onChange={setStageFilter}
        />
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th onClick={() => onSort('name')} className="cursor-pointer hover:text-cove">Lead {sortIcon('name')}</th>
            <th>Email</th>
            <th onClick={() => onSort('channel')} className="cursor-pointer hover:text-cove">Canal {sortIcon('channel')}</th>
            <th>Sede</th>
            <th>Owner</th>
            <th onClick={() => onSort('score')} className="cursor-pointer hover:text-cove">Score {sortIcon('score')}</th>
            <th onClick={() => onSort('stage')} className="cursor-pointer hover:text-cove">Stage {sortIcon('stage')}</th>
            <th onClick={() => onSort('date')} className="cursor-pointer hover:text-cove">Creado {sortIcon('date')}</th>
          </tr>
        </thead>
        <tbody>
          {filtered.slice(0, 30).map((l) => (
            <tr key={l.id}>
              <td>{l.name}</td>
              <td className="text-n-500">{l.email}</td>
              <td>{l.channel}</td>
              <td>{l.sede.toUpperCase()}</td>
              <td>{l.ownerId ? users.find((u) => u.id === l.ownerId)?.name : <span className="text-n-500">Sin asignar</span>}</td>
              <td><LbBar pct={l.score} value={String(l.score)} /></td>
              <td><Pill variant={l.score >= 75 ? 'ok' : l.score >= 50 ? 'warn' : 'default'}>{l.stage}</Pill></td>
              <td>{dateRelative(l.createdAt)}</td>
            </tr>
          ))}
          {filtered.length === 0 && <tr><td colSpan={8} className="text-center text-n-500">Sin leads en este filtro.</td></tr>}
        </tbody>
      </table>
    </>
  )
}

// ====================================================================
// FORECAST
// ====================================================================
export function VentasForecast() {
  const data = useVentasData()
  return (
    <>
      <VentasHeader />
      <KpiGrid cols={4}>
        <KpiCard eyebrow="Forecast ponderado" value={moneyCompact(data.forecast, 'EUR')} delta={{ type: 'up', label: '↑ 9% vs Q1' }} />
        <KpiCard eyebrow="Forecast Q2" value="€ 2,4M" delta={{ type: 'up', label: 'Won + ponderado' }} />
        <KpiCard eyebrow="Ciclo medio" value="42 d" delta={{ type: 'neutral', label: '— estable' }} />
        <KpiCard eyebrow="Velocidad" value="9,2/mes" delta={{ type: 'up', label: '↑ 14%' }} />
      </KpiGrid>

      <Panel title="Conversión por etapa" className="mb-8">
        <ConversionBar
          segments={[
            { label: 'Lead', pct: 100 },
            { label: 'Cualificado', pct: 62 },
            { label: 'Propuesta', pct: 38 },
            { label: 'Negociación', pct: 22 },
            { label: 'Cierre', pct: 14 },
          ]}
        />
      </Panel>

      <div className="mb-8 grid gap-8" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <Panel title="Ratios & velocidad">
          <RatioGrid
            cols={3}
            items={[
              { label: 'Leads-to-Close', value: '14,3%', spark: <Sparkline points={[18, 16, 17, 14, 12, 10, 8, 6, 4]} /> },
              { label: 'Closing Ratio', value: `${data.closingRate}%`, spark: <Sparkline points={[14, 15, 12, 11, 10, 9, 8, 7, 6]} /> },
              { label: 'Ciclo medio', value: '42 d', delta: { type: 'neutral', label: '— estable' } },
              { label: 'Velocidad', value: '9,2/mes', delta: { type: 'up', label: '↑ 14%' } },
              { label: 'Abiertos', value: String(data.open.length), delta: { type: 'up', label: '↑ 22 vs mes ant.' } },
              { label: 'Won YTD', value: String(data.won.length), delta: { type: 'up', label: '↑ 18% vs 2025' } },
            ]}
          />
        </Panel>

        <Panel title="Distribución por brand">
          <Donut
            slices={[
              { label: 'RIVA Spain', value: data.won.filter((d) => d.brand === 'riva_spain').length, color: 'var(--cove)', valueLabel: `${data.won.filter((d) => d.brand === 'riva_spain').length} deals` },
              { label: 'TIERRA', value: data.won.filter((d) => d.brand === 'tierra').length, color: 'var(--oak-mid)', valueLabel: `${data.won.filter((d) => d.brand === 'tierra').length} deals` },
              { label: 'Flagship', value: data.won.filter((d) => d.brand === 'flagship').length, color: 'var(--sage)', valueLabel: `${data.won.filter((d) => d.brand === 'flagship').length} deals` },
            ]}
          />
        </Panel>
      </div>
    </>
  )
}

// ====================================================================
// ACTIVIDAD
// ====================================================================
export function VentasActividad() {
  const activities = useStore((s) => s.activities)
  const users = useStore((s) => s.users)
  const partners = useStore((s) => s.partners)
  const deals = useStore((s) => s.deals)
  const recent = [...activities].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 50)

  return (
    <>
      <VentasHeader />
      <h2 className="mb-4 font-display text-[26px] font-light tracking-[0.04em]">Actividad reciente</h2>
      <table className="data-table">
        <thead>
          <tr><th>Cuándo</th><th>Tipo</th><th>Comercial</th><th>Deal</th><th>Partner</th><th>Contenido</th></tr>
        </thead>
        <tbody>
          {recent.length === 0 && (
            <tr><td colSpan={6} className="text-center text-n-500">Sin actividad registrada.</td></tr>
          )}
          {recent.map((a) => (
            <tr key={a.id}>
              <td>{dateRelative(a.at)}</td>
              <td><span className="text-[10px] uppercase tracking-[0.12em] text-cove">{a.type}</span></td>
              <td>{users.find((u) => u.id === a.userId)?.name ?? a.userId}</td>
              <td>{deals.find((d) => d.id === a.dealId)?.clientName ?? '—'}</td>
              <td>{partners.find((p) => p.id === a.partnerId)?.name ?? '—'}</td>
              <td className="text-n-700">{a.content}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

// ====================================================================
// EQUIPO COMPLETO (gente del dept)
// ====================================================================
export function VentasTeam() {
  return (
    <>
      <VentasHeader />
      <DeptEquipo
        dept="ventas"
        title="Equipo de Ventas"
        description="Comerciales por sede + dirección comercial. Cada comercial tiene una cartera de partners y un pipeline propio."
      />
    </>
  )
}
