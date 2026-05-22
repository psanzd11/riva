import { useMemo, useState } from 'react'
import { useStore } from '../../../data/store'
import { installationsRepo, ticketsRepo } from '../../../data/repo'
import { useRole } from '../../../auth/RoleContext'
import { PageHead } from '../../../components/layout/PageHead'
import { Button } from '../../../components/ui/Button'
import { Panel } from '../../../components/ui/Panel'
import { Pill } from '../../../components/ui/Pill'
import { KpiGrid } from '../../../components/kpi/KpiGrid'
import { KpiCard } from '../../../components/kpi/KpiCard'
import { FilterTabs } from '../../../components/ui/FilterTabs'
import { Donut } from '../../../components/charts/Donut'
import { Heatmap } from '../../../components/charts/Heatmap'
import { RatioGrid } from '../../../components/charts/RatioGrid'
import { Timeline } from '../../../components/charts/Timeline'
import { LbBar, LbAvatar, LbRank } from '../../../components/data-table/Leaderboard'
import { dateShort } from '../../../lib/format'

const WINDOWS = [
  { value: '14d', label: '14 días' },
  { value: '30d', label: '30 días' },
  { value: '90d', label: '90 días' },
] as const

const HEAT_CELLS: (0 | 1 | 2 | 3 | 4 | -1)[] = [1, 2, 1, 3, 4, 2, 0, 1, 3, 2, 3, 3, 4, 0, 2, 2, 3, 4, 3, 2, 1, 1, 2, 4, 3, 2, 1, 0, 0, 1, 2, 2, -1, 1, 0]

function OpsHeader({ actions }: { actions?: React.ReactNode }) {
  return (
    <PageHead
      eyebrow="Departamento"
      title="Operations"
      description="Pedidos, logística, instalaciones, coordinación cross-sede. Gestiona el flujo de la fábrica al cliente final y mide cumplimiento de SLA."
      actions={actions}
    />
  )
}

export function OperationsResumen() {
  const installations = useStore((s) => s.installations)
  return (
    <>
      <OpsHeader actions={<><Button variant="outline">Procesos</Button><Button>+ Tarea</Button></>} />
      <KpiGrid>
        <KpiCard eyebrow="Pedidos abiertos" value="34" delta={{ type: 'up', label: '↑ 6 vs sem. ant.' }} />
        <KpiCard eyebrow="Instalaciones semana" value={String(installations.length)} sub="8 ES · 4 USA" />
        <KpiCard eyebrow="SLA cumplido" value="98%" delta={{ type: 'up', label: '↑ 1,2 pp' }} />
        <KpiCard eyebrow="Tiempo medio entrega" value="11 d" delta={{ type: 'up', label: '−2 d vs Q1' }} />
      </KpiGrid>

      <Panel title="Heatmap instalaciones · 5 semanas" className="mb-8">
        <Heatmap cells={HEAT_CELLS} cols={7} legendLeft="L · M · X · J · V · S · D" />
      </Panel>

      <p className="text-[13px] text-n-700 max-w-prose">
        Subsecciones: <b>Instalaciones</b> (timeline + asignación crew), <b>Equipos</b> (leaderboard),
        <b> SLA & capacidad</b> (mix proyectos + ratios).
      </p>
    </>
  )
}

export function OperationsInstalaciones() {
  const { currentUserId } = useRole()
  const installations = useStore((s) => s.installations)
  const crews = useStore((s) => s.crews)
  const [windowFilter, setWindowFilter] = useState<(typeof WINDOWS)[number]['value']>('14d')

  const today = useMemo(() => new Date('2026-05-22T00:00:00'), [])
  const filtered = useMemo(() => {
    const days = windowFilter === '14d' ? 14 : windowFilter === '30d' ? 30 : 90
    const max = new Date(today)
    max.setDate(max.getDate() + days)
    return installations.filter((i) => new Date(i.startAt) <= max).slice(0, 10)
  }, [installations, windowFilter, today])

  const damageReport = () => {
    if (installations.length === 0) return
    const target = installations[0]
    installationsRepo.update(target.id, { status: 'incident' }, currentUserId)
    ticketsRepo.create({
      type: 'Damage report',
      clientName: target.project,
      priority: 'high',
      status: 'open',
      description: `Damage en instalación ${target.project}`,
      slaHours: 24,
      createdAt: new Date().toISOString(),
      dealId: target.dealId,
    }, currentUserId)
    useStore.getState().emitAutomation('damageReport.submitted', { installationId: target.id })
  }

  const timelineRows = filtered.map((ins) => {
    const start = new Date(ins.startAt)
    const daysFromToday = Math.max(0, Math.floor((start.getTime() - today.getTime()) / 86400000))
    const windowDays = windowFilter === '14d' ? 14 : windowFilter === '30d' ? 30 : 90
    const startPct = Math.min(95, (daysFromToday / windowDays) * 100)
    const widthPct = Math.min(20, Math.max(4, ins.m2 / 30))
    const variant: 'sage' | 'cove' | 'oak' | 'warn' = ins.status === 'incident' ? 'warn' : daysFromToday < 5 ? 'sage' : daysFromToday < 10 ? 'cove' : 'oak'
    return { name: ins.project, sub: `${ins.sede.toUpperCase()} · ${ins.m2} m²`, startPct, widthPct, variant, date: dateShort(ins.startAt) }
  })

  return (
    <>
      <OpsHeader actions={<><Button variant="outline" onClick={damageReport}>Damage report</Button><Button>+ Instalación</Button></>} />
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-[26px] font-light tracking-[0.04em]">Próximas instalaciones</h2>
        <FilterTabs options={WINDOWS} value={windowFilter} onChange={setWindowFilter} />
      </div>
      <Panel className="mb-12" headless>
        <Timeline rows={timelineRows} axisLabels={['L 19', 'M 20', 'X 21', 'J 22', 'V 23', 'L 26', 'X 28', 'V 30', 'L 02']} />
      </Panel>

      <h2 className="mb-4 font-display text-[26px] font-light tracking-[0.04em]">Asignación rápida</h2>
      <Panel headless>
        <div className="p-6">
          <p className="mb-4 text-[13px] text-n-700">Cambiar crew de una instalación actualiza la asignación en tiempo real.</p>
          <table className="data-table">
            <thead>
              <tr><th>Instalación</th><th>m²</th><th>Crew</th><th>Fecha</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {filtered.map((ins) => (
                <tr key={ins.id}>
                  <td>{ins.project}</td>
                  <td>{ins.m2}</td>
                  <td>
                    <select
                      value={ins.crewId}
                      onChange={(e) => installationsRepo.update(ins.id, { crewId: e.target.value }, currentUserId)}
                      className="border-b border-n-300 bg-transparent py-1 text-[13px] focus:border-riva-black"
                    >
                      {crews.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </td>
                  <td>{dateShort(ins.startAt)}</td>
                  <td>
                    <Pill variant={ins.status === 'incident' ? 'err' : ins.status === 'done' ? 'ok' : 'warn'}>{ins.status}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  )
}

export function OperationsEquipos() {
  const installations = useStore((s) => s.installations)
  const crews = useStore((s) => s.crews)
  const leaderboard = useMemo(() => {
    return crews.map((c) => ({
      crew: c,
      projects: installations.filter((i) => i.crewId === c.id).length,
    })).sort((a, b) => b.projects - a.projects)
  }, [crews, installations])

  return (
    <>
      <OpsHeader />
      <h2 className="mb-4 font-display text-[26px] font-light tracking-[0.04em]">Equipos de instalación</h2>
      <table className="data-table">
        <thead>
          <tr><th></th><th>Equipo</th><th>Sede</th><th>Proyectos mes</th><th>SLA</th><th>Damage rate</th><th>NPS</th></tr>
        </thead>
        <tbody>
          {leaderboard.map((row, idx) => (
            <tr key={row.crew.id}>
              <td><LbRank n={idx + 1} /></td>
              <td>
                <div className="flex items-center gap-3">
                  <LbAvatar initials={row.crew.name.slice(0, 2).toUpperCase()} bg="var(--cove)" color="var(--riva-ivory)" />
                  <div>
                    <div className="font-medium">{row.crew.name}</div>
                    <div className="text-[11px] text-n-500">{row.crew.members} instaladores · {row.crew.specialty}</div>
                  </div>
                </div>
              </td>
              <td>{row.crew.sede.toUpperCase()}</td>
              <td>{row.projects}</td>
              <td><LbBar pct={92 + idx * 2} value={`${94 + idx}%`} /></td>
              <td>{(0.4 + idx * 0.15).toFixed(1)}%</td>
              <td><LbBar variant="sage" pct={80 - idx * 6} value={`+${74 - idx * 3}`} /></td>
            </tr>
          ))}
          {leaderboard.length === 0 && <tr><td colSpan={7} className="text-center text-n-500">Sin equipos.</td></tr>}
        </tbody>
      </table>
    </>
  )
}

export function OperationsSla() {
  return (
    <>
      <OpsHeader />
      <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Panel title="Mix de proyectos" action={<a className="link text-[11px] cursor-pointer">YTD</a>}>
          <Donut
            slices={[
              { label: 'Residencial alto', value: 48, color: '#2a1a0e' },
              { label: 'Residencial', value: 32, color: 'var(--cove)' },
              { label: 'Hospitality', value: 14, color: 'var(--oak-mid)' },
              { label: 'Comercial / oficinas', value: 6, color: 'var(--sage)' },
            ]}
          />
        </Panel>
        <Panel title="SLA por sede" action={<a className="link text-[11px] cursor-pointer">Detalle</a>}>
          <RatioGrid
            items={[
              { label: 'ES · on-time', value: '98,4%', delta: { type: 'up', label: '↑ 0,8 pp' } },
              { label: 'USA · on-time', value: '96,1%', delta: { type: 'up', label: '↑ 2,1 pp' } },
              { label: 'Damage rate', value: '0,4%', delta: { type: 'up', label: '−0,2 pp' } },
              { label: 'Re-install', value: '2', delta: { type: 'neutral', label: 'vs 3 mes ant.' } },
              { label: 'NPS instalación', value: '+74', delta: { type: 'up', label: '↑ 5' } },
              { label: 'Capacity uso', value: '82%', delta: { type: 'neutral', label: 'objetivo 85%' } },
            ]}
          />
        </Panel>
      </div>
    </>
  )
}
