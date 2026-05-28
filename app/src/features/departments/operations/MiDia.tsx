import { useMemo } from 'react'
import { useStore } from '../../../data/store'
import { PageHead } from '../../../components/layout/PageHead'
import { Panel } from '../../../components/ui/Panel'
import { Pill } from '../../../components/ui/Pill'
import { KpiGrid } from '../../../components/kpi/KpiGrid'
import { KpiCard } from '../../../components/kpi/KpiCard'
import { dateShort } from '../../../lib/format'
import type { Installation } from '../../../data/schema'

const NOW = new Date('2026-05-28')
const inWeek = (iso: string) => {
  const diff = (new Date(iso).getTime() - NOW.getTime()) / 86400000
  return diff >= -7 && diff <= 7
}

const STATUS: Record<Installation['status'], { label: string; variant: 'ok' | 'warn' | 'err' | 'default' }> = {
  scheduled: { label: 'Programada', variant: 'default' },
  in_progress: { label: 'En curso', variant: 'ok' },
  done: { label: 'Completada', variant: 'ok' },
  incident: { label: 'Incidencia', variant: 'err' },
}

/**
 * Mi día — Operations. Vista operativa diaria: instalaciones en curso y de la
 * semana, incidencias y carga de crews. Pensada como landing del Operations Manager.
 */
export function OperationsDia() {
  const installations = useStore((s) => s.installations)
  const crews = useStore((s) => s.crews)

  const crewName = (id: string) => crews.find((c) => c.id === id)?.name ?? '—'

  const active = installations.filter((i) => i.status === 'in_progress')
  const incidents = installations.filter((i) => i.status === 'incident')
  const weekInstalls = installations.filter((i) => inWeek(i.startAt) && i.status !== 'done')
  const weekM2 = weekInstalls.reduce((a, i) => a + i.m2, 0)

  const agenda = useMemo(
    () =>
      installations
        .filter((i) => i.status !== 'done')
        .sort((a, b) => a.startAt.localeCompare(b.startAt))
        .slice(0, 25),
    [installations],
  )

  const activeCrews = useMemo(() => {
    const load = new Map<string, number>()
    active.forEach((i) => load.set(i.crewId, (load.get(i.crewId) ?? 0) + 1))
    return crews.map((c) => ({ crew: c, jobs: load.get(c.id) ?? 0 }))
  }, [crews, active])

  return (
    <>
      <PageHead
        eyebrow="Operations"
        title="Mi día"
        description="Instalaciones en curso y de la semana, incidencias abiertas y carga de cada crew. Tu pulso operativo del día."
      />

      <KpiGrid cols={4}>
        <KpiCard eyebrow="En curso" value={String(active.length)} sub="instalaciones activas" />
        <KpiCard eyebrow="Esta semana" value={String(weekInstalls.length)} sub={`${weekM2} m²`} />
        <KpiCard eyebrow="Incidencias" value={String(incidents.length)} delta={incidents.length > 0 ? { type: 'down', label: 'requieren acción' } : undefined} />
        <KpiCard eyebrow="Crews activos" value={String(activeCrews.filter((c) => c.jobs > 0).length)} sub={`de ${crews.length}`} />
      </KpiGrid>

      <div className="grid gap-8" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        <div>
          <h2 className="mb-4 font-display text-[26px] font-light tracking-[0.04em]">Próximas instalaciones</h2>
          <table className="data-table">
            <thead>
              <tr><th>Proyecto</th><th>Inicio</th><th>Crew</th><th>Sede</th><th>m²</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {agenda.length === 0 && <tr><td colSpan={6} className="text-center text-n-500">Sin instalaciones pendientes.</td></tr>}
              {agenda.map((i) => (
                <tr key={i.id}>
                  <td className="font-medium">{i.project}</td>
                  <td>{dateShort(i.startAt)}</td>
                  <td>{crewName(i.crewId)}</td>
                  <td>{i.sede.toUpperCase()}</td>
                  <td>{i.m2} m²</td>
                  <td><Pill variant={STATUS[i.status].variant}>{STATUS[i.status].label}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="mb-4 font-display text-[26px] font-light tracking-[0.04em]">Carga de crews</h2>
          <Panel headless>
            <div className="p-5">
              {activeCrews.map(({ crew, jobs }) => (
                <div key={crew.id} className="mb-4 last:mb-0">
                  <div className="mb-1 flex items-center justify-between text-[12px]">
                    <span className="text-n-900">{crew.name}</span>
                    <span className="text-n-500">{crew.specialty} · {crew.sede.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-[6px] flex-1 bg-n-100">
                      <div className="h-full bg-cove" style={{ width: `${Math.min(100, (jobs / Math.max(1, crew.capacity)) * 100)}%` }} />
                    </div>
                    <span className="w-16 text-right text-[11px] text-n-700">{jobs}/{crew.capacity}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}
