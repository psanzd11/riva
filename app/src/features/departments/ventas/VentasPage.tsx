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
import { LbBar, LbAvatar, LbRank } from '../../../components/data-table/Leaderboard'
import { money, moneyCompact, initials } from '../../../lib/format'
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

export function VentasPage() {
  const { role, currentUserId } = useRole()
  const deals = useStore((s) => s.deals)
  const partners = useStore((s) => s.partners)
  const users = useStore((s) => s.users)
  const [drawerId, setDrawerId] = useState<string | null>(null)
  const [newOpen, setNewOpen] = useState(false)
  const [timeFilter, setTimeFilter] = useState<(typeof TIME_FILTERS)[number]['value']>('year')
  void timeFilter

  const visibleDeals = useMemo(() => {
    if (role === 'comercial') return deals.filter((d) => d.ownerId === currentUserId)
    return deals
  }, [deals, role, currentUserId])

  const open = visibleDeals.filter((d) => d.stage !== 'won' && d.stage !== 'lost')
  const won = visibleDeals.filter((d) => d.stage === 'won')
  const forecast = open.reduce((acc, d) => acc + d.amount * (STAGE_PROBS[d.stage] / 100), 0)
  const wonYtd = won.reduce((acc, d) => acc + d.amount, 0)
  const closingRate = open.length + won.length > 0 ? Math.round((won.length / (won.length + open.length + visibleDeals.filter((d) => d.stage === 'lost').length)) * 100) : 0

  // Leaderboard
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
      <PageHead
        eyebrow="Departamento"
        title="Ventas"
        description="Pipeline cross-sede, equipo comercial por sede + partners. Sustituye el uso comercial de HubSpot."
        actions={
          <>
            <Button variant="outline">Forecast</Button>
            <Button onClick={() => setNewOpen(true)}>+ Lead</Button>
          </>
        }
      />

      <KpiGrid>
        <KpiCard
          eyebrow="Forecast ponderado"
          value={moneyCompact(forecast, 'EUR')}
          delta={{ type: 'up', label: '↑ 9% vs Q1' }}
        />
        <KpiCard
          eyebrow="Closed Won YTD"
          value={moneyCompact(wonYtd, 'EUR')}
          sub={`${won.length} deals · 5 meses`}
        />
        <KpiCard eyebrow="Forecast Q2" value="€ 2,4M" delta={{ type: 'up', label: 'Won + ponderado' }} />
        <KpiCard
          eyebrow="Tasa cierre"
          value={`${closingRate}%`}
          delta={{ type: 'up', label: '↑ 2,1 pp' }}
        />
      </KpiGrid>

      <Panel
        title="Conversión por etapa"
        action={<FilterTabs options={TIME_FILTERS} value={timeFilter} onChange={setTimeFilter} variant="time" />}
        className="mb-8"
      >
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

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-[26px] font-light tracking-[0.04em]">Pipeline kanban</h2>
        <div className="text-[11px] uppercase tracking-[0.1em] text-n-500">Arrastra una tarjeta entre columnas para cambiar la etapa</div>
      </div>

      <PipelineKanban onCardClick={setDrawerId} />

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-[26px] font-light tracking-[0.04em]">Equipo comercial</h2>
        <FilterTabs options={TIME_FILTERS} value={timeFilter} onChange={setTimeFilter} variant="time" />
      </div>
      <p className="mb-3.5 text-[12px] uppercase tracking-[0.06em] text-n-500">Ranking · click en columna para ordenar</p>

      <table className="data-table">
        <thead>
          <tr>
            <th></th>
            <th>Comercial</th>
            <th>Partners</th>
            <th>Deals</th>
            <th>Won</th>
            <th>Closing rate</th>
            <th>Pipeline (€)</th>
            <th>Won YTD (€)</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((row, idx) => (
            <tr key={row.user.id}>
              <td><LbRank n={idx + 1} /></td>
              <td>
                <div className="flex items-center gap-3">
                  <LbAvatar initials={initials(row.user.name)} bg={`var(--${row.user.avatarColor === 'oak-mid' ? 'oak-mid' : row.user.avatarColor})`} color="var(--riva-ivory)" />
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

      <Panel
        title="Won credit · evolución por comercial"
        action={<div className="flex gap-2"><button className="filter-btn active">Won credit</button><button className="filter-btn">Pipeline</button><button className="filter-btn">Actividad</button></div>}
        className="mt-8"
      >
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

      <DealDrawer dealId={drawerId} onClose={() => setDrawerId(null)} />
      <NewDealModal open={newOpen} onClose={() => setNewOpen(false)} />
    </>
  )
}
