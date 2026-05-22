import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../../../data/store'
import { ticketsRepo, activitiesRepo } from '../../../data/repo'
import { useRole } from '../../../auth/RoleContext'
import { Drawer } from '../../../components/ui/Drawer'
import { Field, Input, Select } from '../../../components/ui/Field'
import { Button } from '../../../components/ui/Button'
import { Pill } from '../../../components/ui/Pill'
import { dateRelative } from '../../../lib/format'
import type { Ticket } from '../../../data/schema'

interface TicketDrawerProps {
  ticketId: string | null
  onClose: () => void
}

export function TicketDrawer({ ticketId, onClose }: TicketDrawerProps) {
  const { currentUserId } = useRole()
  const tickets = useStore((s) => s.tickets)
  const users = useStore((s) => s.users)
  const activities = useStore((s) => s.activities)
  const t = useMemo(() => tickets.find((x) => x.id === ticketId), [tickets, ticketId])

  const [form, setForm] = useState<Ticket | null>(null)
  const [comment, setComment] = useState('')

  useEffect(() => { if (t) setForm(t) }, [t])
  if (!t || !form) return null

  const save = () => {
    ticketsRepo.update(t.id, form, currentUserId)
    onClose()
  }

  const close = () => {
    ticketsRepo.update(t.id, { status: 'closed', closedAt: new Date().toISOString() }, currentUserId)
    onClose()
  }

  const addComment = () => {
    if (!comment.trim()) return
    activitiesRepo.create({
      type: 'note',
      userId: currentUserId,
      at: new Date().toISOString(),
      content: `[Ticket #${t.id}] ${comment.trim()}`,
    }, currentUserId)
    setComment('')
  }

  const ticketActs = activities.filter((a) => a.content.startsWith(`[Ticket #${t.id}]`))

  return (
    <Drawer open={!!ticketId} onClose={onClose} title={`#${t.id.replace('tkt_', '')} · ${t.clientName}`} subtitle={t.type}>
      <div className="px-6 py-5">
        <div className="mb-4 flex items-center gap-3">
          <Pill variant={t.priority === 'high' ? 'err' : t.priority === 'med' ? 'warn' : 'default'}>{t.priority}</Pill>
          <Pill variant={t.status === 'closed' ? 'ok' : t.status === 'in_progress' ? 'warn' : 'default'}>{t.status}</Pill>
          <span className="text-[12px] text-n-500">SLA {t.slaHours}h</span>
        </div>

        <Field label="Estado">
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Ticket['status'] })}>
            <option value="open">open</option>
            <option value="in_progress">in_progress</option>
            <option value="closed">closed</option>
          </Select>
        </Field>

        <Field label="Prioridad">
          <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Ticket['priority'] })}>
            <option value="low">low</option>
            <option value="med">med</option>
            <option value="high">high</option>
          </Select>
        </Field>

        <Field label="Asignado a">
          <Select value={form.assigneeId ?? ''} onChange={(e) => setForm({ ...form, assigneeId: e.target.value || undefined })}>
            <option value="">Sin asignar</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </Select>
        </Field>

        <Field label="Descripción">
          <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="outline" onClick={close}>Cerrar ticket</Button>
          <Button onClick={save}>Guardar</Button>
        </div>
      </div>

      <div className="border-t border-n-300 px-6 py-5">
        <h4 className="mb-4 font-display text-[14px] uppercase tracking-[0.08em]">Comentarios</h4>
        <div className="mb-4 flex items-end gap-2">
          <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Añadir comentario…" />
          <Button onClick={addComment}>Enviar</Button>
        </div>
        <div className="space-y-3">
          {ticketActs.length === 0 && <div className="text-[12px] text-n-500">Sin comentarios todavía.</div>}
          {ticketActs.map((a) => (
            <div key={a.id} className="border-b border-n-100 pb-2 last:border-b-0">
              <div className="text-[12px] text-n-900">{a.content.replace(`[Ticket #${t.id}] `, '')}</div>
              <div className="mt-0.5 text-[11px] uppercase tracking-[0.06em] text-n-500">
                {dateRelative(a.at)} · {users.find((u) => u.id === a.userId)?.name ?? 'user'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  )
}
