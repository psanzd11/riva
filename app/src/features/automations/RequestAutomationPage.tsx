import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ticketsRepo } from '../../data/repo'
import { useStore } from '../../data/store'
import { useRole } from '../../auth/RoleContext'
import { PageHead } from '../../components/layout/PageHead'
import { Panel } from '../../components/ui/Panel'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import { Pill } from '../../components/ui/Pill'
import { dateRelative } from '../../lib/format'
import type { Ticket } from '../../data/schema'

const DEPT_OPTIONS = [
  { value: 'ventas', label: 'Ventas' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'operations', label: 'Operations' },
  { value: 'supply-chain', label: 'Supply Chain' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'postventa', label: 'Postventa' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'cross', label: 'Cross-departamental' },
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja · cuando se pueda' },
  { value: 'med', label: 'Media · 2-4 semanas' },
  { value: 'high', label: 'Alta · esta semana' },
]

const TAG_PREFIX = '[AUTO] '

export function RequestAutomationPage() {
  const navigate = useNavigate()
  const { currentUserId, currentUserName } = useRole()
  const tickets = useStore((s) => s.tickets)
  const users = useStore((s) => s.users)

  const [name, setName] = useState('')
  const [trigger, setTrigger] = useState('')
  const [action, setAction] = useState('')
  const [dept, setDept] = useState('cross')
  const [priority, setPriority] = useState<'low' | 'med' | 'high'>('med')
  const [submitted, setSubmitted] = useState(false)

  const myRecent = tickets
    .filter((t) => t.category === 'internal' && t.type.startsWith(TAG_PREFIX) && t.requesterId === currentUserId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10)

  const submit = () => {
    if (!name.trim() || !action.trim()) return
    const t: Omit<Ticket, 'id'> = {
      type: `${TAG_PREFIX}${name.trim()}`,
      clientName: currentUserName,
      priority,
      status: 'open',
      description: [
        trigger ? `Cuándo: ${trigger.trim()}` : '',
        action ? `Acción: ${action.trim()}` : '',
        dept !== 'cross' ? `Departamento beneficiado: ${dept}` : 'Cross-departamental',
      ].filter(Boolean).join(' · '),
      slaHours: priority === 'high' ? 24 : priority === 'med' ? 72 : 168,
      createdAt: new Date().toISOString(),
      category: 'internal',
      requesterId: currentUserId,
    }
    ticketsRepo.create(t, currentUserId)
    setName('')
    setTrigger('')
    setAction('')
    setDept('cross')
    setPriority('med')
    setSubmitted(true)
    // Reset the success notice after 4s
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <>
      <PageHead
        eyebrow="Núcleo del Hub"
        title="Solicitar automatización"
        description="Describe el flujo que te gustaría tener automatizado. Tecnología recibe la solicitud como ticket interno y la prioriza junto con el roadmap."
        actions={
          <Button variant="outline" onClick={() => navigate('/automations')}>
            ← Volver al catálogo
          </Button>
        }
      />

      {submitted && (
        <div className="mb-6 border-l-2 border-l-success bg-success/5 px-5 py-3 text-[13px] text-n-900">
          Solicitud enviada. Verás el seguimiento en la lista de «Mis solicitudes recientes» más abajo y en Tecnología · Tickets internos.
        </div>
      )}

      <div className="grid gap-8" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        <Panel title="Nueva solicitud">
          <div className="p-6">
            <Field label="Nombre del flujo">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Enviar SMS al cliente 2 días antes de instalación"
              />
            </Field>

            <Field label="¿Cuándo se dispara? (trigger)" hint="Descríbelo como un evento. Ej: 'Cuando una instalación queda a 48h'.">
              <Textarea
                rows={2}
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                placeholder="Cuando..."
              />
            </Field>

            <Field label="¿Qué quieres que pase? (acción)" hint="La acción concreta que debería ejecutarse automáticamente.">
              <Textarea
                rows={3}
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="Entonces... (envía email, crea ticket, notifica a X, etc.)"
              />
            </Field>

            <div className="grid grid-cols-2 gap-5">
              <Field label="Departamento beneficiado">
                <Select value={dept} onChange={(e) => setDept(e.target.value)}>
                  {DEPT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Prioridad">
                <Select value={priority} onChange={(e) => setPriority(e.target.value as 'low' | 'med' | 'high')}>
                  {PRIORITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => navigate('/automations')}>Cancelar</Button>
              <Button onClick={submit} disabled={!name.trim() || !action.trim()}>
                Enviar solicitud
              </Button>
            </div>
          </div>
        </Panel>

        <Panel title="Mis solicitudes recientes">
          <div className="p-2">
            {myRecent.length === 0 && (
              <div className="px-4 py-8 text-center text-[13px] text-n-500">
                Aún no has enviado ninguna solicitud.
              </div>
            )}
            {myRecent.map((t) => {
              const assignee = users.find((u) => u.id === t.assigneeId)
              return (
                <div key={t.id} className="border-b border-n-100 p-4 last:border-b-0">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="text-[13px] font-medium text-n-900">
                      {t.type.replace(TAG_PREFIX, '')}
                    </div>
                    <Pill variant={t.status === 'closed' ? 'ok' : t.status === 'in_progress' ? 'warn' : 'default'}>
                      {t.status}
                    </Pill>
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.08em] text-n-500">
                    {dateRelative(t.createdAt)}
                    {assignee ? ` · asignado a ${assignee.name}` : ' · sin asignar'}
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>
      </div>
    </>
  )
}
