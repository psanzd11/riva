import { useMemo, useState } from 'react'
import { useStore } from '../../../data/store'
import { useRole } from '../../../auth/RoleContext'
import { activitiesRepo } from '../../../data/repo'
import { PageHead } from '../../../components/layout/PageHead'
import { Button } from '../../../components/ui/Button'
import { Panel } from '../../../components/ui/Panel'
import { Pill } from '../../../components/ui/Pill'
import { Modal } from '../../../components/ui/Modal'
import { Field, Input, Select, Textarea } from '../../../components/ui/Field'
import { KpiGrid } from '../../../components/kpi/KpiGrid'
import { KpiCard } from '../../../components/kpi/KpiCard'
import { Check } from 'lucide-react'

const NOW = '2026-05-28'
const dayKey = (iso: string) => iso.slice(0, 10)
const fmtDay = (key: string) => {
  const d = new Date(key)
  if (Number.isNaN(d.getTime())) return key
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long' })
}

const TYPE_OPTS = [
  { value: 'visit', label: 'Visita' },
  { value: 'call', label: 'Llamada' },
  { value: 'task', label: 'Tarea' },
] as const

/**
 * Agenda del comercial — su día a día: visitas a showrooms, follow-ups y tareas
 * con fecha (activities con dueAt). Filtra siempre por el comercial logueado.
 */
export function VentasAgenda() {
  const { currentUserId, currentUserName } = useRole()
  const activities = useStore((s) => s.activities)
  const partners = useStore((s) => s.partners)

  const [open, setOpen] = useState(false)
  const [type, setType] = useState<(typeof TYPE_OPTS)[number]['value']>('visit')
  const [partnerId, setPartnerId] = useState('')
  const [dueAt, setDueAt] = useState(NOW)
  const [content, setContent] = useState('')

  // Mis tareas/visitas programadas (con dueAt).
  const scheduled = useMemo(
    () =>
      activities
        .filter((a) => a.userId === currentUserId && a.dueAt)
        .sort((a, b) => (a.dueAt ?? '').localeCompare(b.dueAt ?? '')),
    [activities, currentUserId],
  )

  const pending = scheduled.filter((a) => !a.done)
  const todayCount = pending.filter((a) => dayKey(a.dueAt!) === NOW).length
  const overdue = pending.filter((a) => dayKey(a.dueAt!) < NOW).length
  const upcoming = pending.filter((a) => dayKey(a.dueAt!) > NOW).length
  const done7 = scheduled.filter((a) => a.done).length

  // Agrupado por día (solo pendientes).
  const grouped = useMemo(() => {
    const map = new Map<string, typeof pending>()
    pending.forEach((a) => {
      const k = dayKey(a.dueAt!)
      map.set(k, [...(map.get(k) ?? []), a])
    })
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [pending])

  const partnerName = (id?: string) => partners.find((p) => p.id === id)?.name

  const submit = () => {
    activitiesRepo.create(
      {
        type,
        userId: currentUserId,
        partnerId: partnerId || undefined,
        at: new Date().toISOString(),
        dueAt: new Date(dueAt).toISOString(),
        content: content || (type === 'visit' ? 'Visita a showroom' : type === 'call' ? 'Llamada de seguimiento' : 'Tarea'),
        done: false,
      },
      currentUserId,
    )
    setContent('')
    setPartnerId('')
    setOpen(false)
  }

  const toggleDone = (id: string, done: boolean) => activitiesRepo.update(id, { done }, currentUserId)

  return (
    <>
      <PageHead
        eyebrow={`Ventas · ${currentUserName}`}
        title="Agenda"
        description="Tus visitas a showrooms, llamadas y tareas del día. Programa follow-ups y márcalos a medida que los completas."
        actions={
          <div className="flex items-center gap-3">
            <Pill variant="ok">Google Calendar</Pill>
            <Button onClick={() => setOpen(true)}>+ Tarea / Visita</Button>
          </div>
        }
      />

      <KpiGrid cols={4}>
        <KpiCard eyebrow="Hoy" value={String(todayCount)} sub="visitas y tareas" />
        <KpiCard eyebrow="Vencidas" value={String(overdue)} delta={overdue > 0 ? { type: 'down', label: 'requieren acción' } : undefined} />
        <KpiCard eyebrow="Próximas" value={String(upcoming)} sub="programadas" />
        <KpiCard eyebrow="Completadas" value={String(done7)} delta={{ type: 'up', label: 'histórico' }} />
      </KpiGrid>

      <h2 className="mb-4 font-display text-[26px] font-light tracking-[0.04em]">Mi día</h2>

      {grouped.length === 0 ? (
        <Panel headless>
          <div className="py-10 text-center text-[13px] text-n-500">
            No tienes nada programado. Crea una visita o tarea con <b>+ Tarea / Visita</b>.
          </div>
        </Panel>
      ) : (
        grouped.map(([key, items]) => (
          <div key={key} className="mb-6">
            <div className="mb-2 flex items-center gap-3">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-n-700 first-letter:uppercase">{fmtDay(key)}</span>
              {key === NOW && <Pill variant="ok">Hoy</Pill>}
              {key < NOW && <Pill variant="err">Vencido</Pill>}
            </div>
            <table className="data-table">
              <tbody>
                {items.map((a) => (
                  <tr key={a.id}>
                    <td style={{ width: 44 }}>
                      <button
                        onClick={() => toggleDone(a.id, true)}
                        title="Marcar completada"
                        className="flex h-6 w-6 items-center justify-center border border-n-300 text-n-500 transition hover:border-riva-black hover:text-riva-black"
                      >
                        <Check size={14} strokeWidth={2} />
                      </button>
                    </td>
                    <td style={{ width: 110 }}>
                      <span className="text-[10px] uppercase tracking-[0.12em] text-cove">{a.type}</span>
                    </td>
                    <td className="text-n-900">{a.content}</td>
                    <td className="text-n-500">{partnerName(a.partnerId) ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nueva tarea / visita">
        <Field label="Tipo">
          <Select value={type} onChange={(e) => setType(e.target.value as typeof type)}>
            {TYPE_OPTS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
        </Field>
        <Field label="Partner / showroom (opcional)">
          <Select value={partnerId} onChange={(e) => setPartnerId(e.target.value)}>
            <option value="">Sin partner</option>
            {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </Field>
        <Field label="Fecha">
          <Input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
        </Field>
        <Field label="Detalle">
          <Textarea rows={3} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Ej. Presentar colección Cove en showroom Madrid" />
        </Field>
        <button onClick={submit} className="w-full bg-riva-black py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-riva-ivory transition hover:bg-n-900">
          Programar
        </button>
      </Modal>
    </>
  )
}
