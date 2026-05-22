import { useMemo, useState } from 'react'
import { useStore } from '../../../data/store'
import { useRole } from '../../../auth/RoleContext'
import { PageHead } from '../../../components/layout/PageHead'
import { Button } from '../../../components/ui/Button'
import { Panel } from '../../../components/ui/Panel'
import { KpiGrid } from '../../../components/kpi/KpiGrid'
import { KpiCard } from '../../../components/kpi/KpiCard'
import { FilterTabs } from '../../../components/ui/FilterTabs'
import { ConversionBar } from '../../../components/charts/ConversionBar'
import { MultiLine } from '../../../components/charts/MultiLine'
import { RatioGrid } from '../../../components/charts/RatioGrid'
import { Sparkline } from '../../../components/charts/Sparkline'
import { LbBar, LbAvatar, LbRank } from '../../../components/data-table/Leaderboard'
import { money, moneyCompact, initials, dateRelative } from '../../../lib/format'
import { PipelineKanban } from './PipelineKanban'
import { DealDrawer } from './DealDrawer'
import { NewDealModal } from './NewDealModal'
import type { Deal } from '../../../data/schema'

const TIME_FILTERS = [
  { value: 'month', label: 'Mes' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'year', label: 'Año' },
] as const

const STAGE_PROBS: Record<Deal['stage'], number> = {
  lead: 10,
  qualified: 25,
  proposal: 50,
  negotiation: 75,
  won: 100,
  lost: 0,
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
  const closingRate = won.length + open.length + lost.length > 0
    ? Math.round((won.length / (won.length + open.length + lost.length)) * 100)
    : 0
  return { visibleDeals, open, won, lost, forecast, wonYtd, closingRate }
}

function VentasHeader({ actions }: { actions?: React.ReactNode }) {
  return (
    <PageHead
      eyebrow="Departamento"
      title="Ventas"
      description="Pipeline cross-sede, equipo comercial por sede + partners. Sustituye el uso comercial de HubSpot."
      actions={actions}
    />
  )
}

export function VentasResumen() {
  const data = useVentasData()
  const [newOpen, setNewOpen] = useState(false)
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
      <KpiGrid>
        <KpiCard eyebrow="Forecast ponderado" value={moneyCompact(data.forecast, 'EUR')} delta={{ type: 'up', label: '↑ 9% vs Q1' }} />
        <KpiCard eyebrow="Closed Won YTD" value={moneyCompact(data.wonYtd, 'EUR')} sub={`${data.won.length} deals`} />
        <KpiCard eyebrow="Pipeline abierto" value={String(data.open.length)} sub={`${data.open.filter((d) => d.stage === 'negotiation').length} en negociación`} />
        <KpiCard eyebrow="Tasa cierre" value={`${data.closingRate}%`} delta={{ type: 'up', label: '↑ 2,1 pp' }} />
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

      <p className="text-[13px] text-n-700 max-w-prose">
        Navega a <b>Pipeline</b> para arrastrar deals entre etapas, a <b>Equipo</b> para el leaderboard de
        comerciales, o a <b>Forecast</b> para ratios detallados.
      </p>

      <NewDealModal open={newOpen} onClose={() => setNewOpen(false)} />
    </>
  )
}

export function VentasPipeline() {
  const [drawerId, setDrawerId] = useState<string | null>(null)
  const [newOpen, setNewOpen] = useState(false)
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

export function VentasEquipo() {
  const users = useStore((s) => s.users)
  const deals = useStore((s) => s.deals)
  const partners = useStore((s) => s.partners)
  const [timeFilter, setTimeFilter] = useState<(typeof TIME_FILTERS)[number]['value']>('year')
  void timeFilter

  const leaderboard = useMemo(() => {
    return users
      .filter((u) => u.role === 'comercial')
      .map((u) => {
        const userDeals = deals.filter((d) => d.ownerId === u.id)
        const userWon = userDeals.filter((d) => d.stage === 'won')
        const userPipe = userDeals.filter((d) => d.stage !== 'won' && d.stage !== 'lost')
        const closingRate = userDeals.length > 0 ? Math.round((userWon.length / userDeals.length) * 100) : 0
        const pipeAmount = userPipe.reduce((acc, d) => acc + d.amount, 0)
        const wonAmount = userWon.reduce((acc, d) => acc + d.amount, 0)
        const partnersCount = partners.filter((p) => p.assignedTo === u.id).length
        return { user: u, deals: userDeals.length, won: userWon.length, closingRate, pipeAmount, wonAmount, partnersCount }
      })
      .sort((a, b) => b.wonAmount - a.wonAmount)
  }, [users, deals, partners])

  const maxPipe = Math.max(...leaderboard.map((l) => l.pipeAmount), 1)
  const maxWon = Math.max(...leaderboard.map((l) => l.wonAmount), 1)

  return (
    <>
      <VentasHeader />
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-[26px] font-light tracking-[0.04em]">Equipo comercial</h2>
        <FilterTabs options={TIME_FILTERS} value={timeFilter} onChange={setTimeFilter} variant="time" />
      </div>
      <p className="mb-3.5 text-[12px] uppercase tracking-[0.06em] text-n-500">Ranking · click en columna para ordenar</p>
      <table className="data-table">
        <thead>
          <tr>
            <th></th><th>Comercial</th><th>Partners</th><th>Deals</th><th>Won</th>
            <th>Closing rate</th><th>Pipeline (€)</th><th>Won YTD (€)</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((row, idx) => (
            <tr key={row.user.id}>
              <td><LbRank n={idx + 1} /></td>
              <td>
                <div className="flex items-center gap-3">
                  <LbAvatar initials={initials(row.user.name)} bg={`var(--${row.user.avatarColor})`} color="var(--riva-ivory)" />
                  <div>
                    <div className="font-medium">{row.user.name}</div>
                    <div className="text-[11px] text-n-500">{row.user.sede.toUpperCase()}</div>
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
        </tbody>
      </table>

      <Panel title="Won credit · evolución por comercial" className="mt-8">
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
    </>
  )
}

export function VentasForecast() {
  const data = useVentasData()
  return (
    <>
      <VentasHeader />
      <KpiGrid>
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
    </>
  )
}

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
