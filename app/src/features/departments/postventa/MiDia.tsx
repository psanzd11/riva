import { useMemo } from 'react'
import { useStore } from '../../../data/store'
import { PageHead } from '../../../components/layout/PageHead'
import { Panel } from '../../../components/ui/Panel'
import { Pill } from '../../../components/ui/Pill'
import { KpiGrid } from '../../../components/kpi/KpiGrid'
import { KpiCard } from '../../../components/kpi/KpiCard'
import { dateRelative } from '../../../lib/format'
import type { Ticket } from '../../../data/schema'

const PRIORITY_ORDER: Record<Ticket['priority'], number> = { high: 0, med: 1, low: 2 }
const PRIORITY: Record<Ticket['priority'], { label: string; variant: 'err' | 'warn' | 'default' }> = {
  high: { label: 'Urgente', variant: 'err' },
  med: { label: 'Media', variant: 'warn' },
  low: { label: 'Baja', variant: 'default' },
}

/**
 * Mi día — Customer Success. Cola de tickets de cliente abiertos (urgentes primero),
 * con reseñas negativas que requieren respuesta. Landing del rol customer_success.
 */
export function PvDia() {
  const tickets = useStore((s) => s.tickets)
  const reviews = useStore((s) => s.reviews)

  const open = useMemo(
    () =>
      tickets
        .filter((t) => t.category === 'customer' && t.status !== 'closed')
        .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.createdAt.localeCompare(b.createdAt)),
    [tickets],
  )
  const urgent = open.filter((t) => t.priority === 'high')
  const inProgress = open.filter((t) => t.status === 'in_progress')

  const toRespond = useMemo(
    () => reviews.filter((r) => r.score <= 3).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6),
    [reviews],
  )

  return (
    <>
      <PageHead
        eyebrow="Postventa"
        title="Mi día"
        description="Tu cola de atención: tickets de cliente abiertos (urgentes primero) y reseñas negativas que requieren respuesta hoy."
      />

      <KpiGrid cols={4}>
        <KpiCard eyebrow="Abiertos" value={String(open.length)} sub="tickets de cliente" />
        <KpiCard eyebrow="Urgentes" value={String(urgent.length)} delta={urgent.length > 0 ? { type: 'down', label: 'prioridad alta' } : undefined} />
        <KpiCard eyebrow="En curso" value={String(inProgress.length)} sub="ya en gestión" />
        <KpiCard eyebrow="Reseñas a responder" value={String(toRespond.length)} sub="score ≤ 3★" />
      </KpiGrid>

      <h2 className="mb-4 font-display text-[26px] font-light tracking-[0.04em]">Cola de tickets</h2>
      <table className="data-table">
        <thead>
          <tr><th>Prioridad</th><th>Cliente</th><th>Asunto</th><th>SLA</th><th>Estado</th><th>Abierto</th></tr>
        </thead>
        <tbody>
          {open.length === 0 && <tr><td colSpan={6} className="text-center text-n-500">Sin tickets abiertos. 🎉</td></tr>}
          {open.map((t) => (
            <tr key={t.id}>
              <td><Pill variant={PRIORITY[t.priority].variant}>{PRIORITY[t.priority].label}</Pill></td>
              <td className="font-medium">{t.clientName}</td>
              <td className="text-n-700">{t.type}</td>
              <td>{t.slaHours} h</td>
              <td><Pill variant={t.status === 'in_progress' ? 'warn' : 'default'}>{t.status === 'in_progress' ? 'En curso' : 'Abierto'}</Pill></td>
              <td className="text-n-500">{dateRelative(t.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mb-4 mt-8 font-display text-[26px] font-light tracking-[0.04em]">Reseñas a responder</h2>
      <Panel headless>
        <div className="p-5">
          {toRespond.length === 0 && <div className="py-4 text-center text-[13px] text-n-500">Sin reseñas negativas pendientes.</div>}
          {toRespond.map((r) => (
            <div key={r.id} className="mb-4 border-b border-n-100 pb-4 last:mb-0 last:border-0 last:pb-0">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium">{r.clientName}</span>
                <span className="text-[12px] text-error">{'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}</span>
              </div>
              <div className="text-[13px] text-n-700">{r.text}</div>
              <div className="mt-1 text-[11px] text-n-500">{r.source} · {dateRelative(r.at)}</div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  )
}
