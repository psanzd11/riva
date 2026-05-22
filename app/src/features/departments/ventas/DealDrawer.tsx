import { useStore } from '../../../data/store'
import { dealsRepo, activitiesRepo } from '../../../data/repo'
import { useRole } from '../../../auth/RoleContext'
import { Drawer } from '../../../components/ui/Drawer'
import { Field, Input, Select, Textarea } from '../../../components/ui/Field'
import { Button } from '../../../components/ui/Button'
import { Pill } from '../../../components/ui/Pill'
import { money, dateRelative } from '../../../lib/format'
import { useEffect, useMemo, useState } from 'react'
import type { Deal } from '../../../data/schema'

interface DealDrawerProps {
  dealId: string | null
  onClose: () => void
}

const STAGES: Deal['stage'][] = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
const BRANDS: Deal['brand'][] = ['riva_spain', 'tierra', 'flagship']

export function DealDrawer({ dealId, onClose }: DealDrawerProps) {
  const { currentUserId } = useRole()
  const deals = useStore((s) => s.deals)
  const partners = useStore((s) => s.partners)
  const activities = useStore((s) => s.activities)
  const users = useStore((s) => s.users)

  const deal = useMemo(() => deals.find((d) => d.id === dealId), [deals, dealId])
  const [form, setForm] = useState<Deal | null>(null)
  const [actType, setActType] = useState<'call' | 'email' | 'visit' | 'note'>('note')
  const [actContent, setActContent] = useState('')

  useEffect(() => {
    if (deal) setForm(deal)
  }, [deal])

  if (!deal || !form) return null

  const partner = partners.find((p) => p.id === deal.partnerId)
  const owner = users.find((u) => u.id === deal.ownerId)
  const dealActs = activities.filter((a) => a.dealId === deal.id).sort((a, b) => b.at.localeCompare(a.at))

  const save = () => {
    dealsRepo.update(deal.id, form, currentUserId)
    onClose()
  }

  const addActivity = () => {
    if (!actContent.trim()) return
    activitiesRepo.create(
      {
        dealId: deal.id,
        partnerId: deal.partnerId,
        type: actType,
        userId: currentUserId,
        at: new Date().toISOString(),
        content: actContent.trim(),
      },
      currentUserId,
    )
    setActContent('')
  }

  return (
    <Drawer open={!!dealId} onClose={onClose} title={deal.clientName} subtitle={`Deal · ${partner?.name ?? '—'}`}>
      <div className="px-6 py-5">
        <div className="mb-5 flex items-center gap-3">
          <Pill variant={deal.stage === 'won' ? 'ok' : deal.stage === 'lost' ? 'err' : 'warn'}>{deal.stage}</Pill>
          <span className="font-display text-[22px] font-light text-n-900">{money(deal.amount, deal.currency)}</span>
        </div>

        <Field label="Etapa">
          <Select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as Deal['stage'] })}>
            {STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </Field>

        <Field label="Importe">
          <Input
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
          />
        </Field>

        <Field label="Probabilidad (%)">
          <Input
            type="number"
            min={0}
            max={100}
            value={form.probability}
            onChange={(e) => setForm({ ...form, probability: Number(e.target.value) })}
          />
        </Field>

        <Field label="Fecha esperada de cierre">
          <Input
            type="date"
            value={form.expectedCloseDate.slice(0, 10)}
            onChange={(e) => setForm({ ...form, expectedCloseDate: new Date(e.target.value).toISOString() })}
          />
        </Field>

        <Field label="Brand">
          <Select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value as Deal['brand'] })}>
            {BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </Select>
        </Field>

        <Field label="Owner">
          <div className="text-[14px] text-n-900">{owner?.name ?? '—'}</div>
        </Field>

        <Field label="Notas">
          <Textarea
            rows={3}
            value={form.notes ?? ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </Field>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>Guardar</Button>
        </div>
      </div>

      <div className="border-t border-n-300 px-6 py-5">
        <h4 className="mb-4 font-display text-[14px] uppercase tracking-[0.08em]">Actividad</h4>
        <div className="mb-4 grid items-end gap-2" style={{ gridTemplateColumns: '120px 1fr auto' }}>
          <Select value={actType} onChange={(e) => setActType(e.target.value as typeof actType)}>
            <option value="note">Nota</option>
            <option value="call">Llamada</option>
            <option value="email">Email</option>
            <option value="visit">Visita</option>
          </Select>
          <Input
            value={actContent}
            onChange={(e) => setActContent(e.target.value)}
            placeholder="Descripción…"
          />
          <Button onClick={addActivity}>Añadir</Button>
        </div>
        <div className="space-y-3">
          {dealActs.length === 0 && (
            <div className="text-[12px] text-n-500">Sin actividad registrada todavía.</div>
          )}
          {dealActs.map((a) => (
            <div key={a.id} className="border-b border-n-100 pb-3 last:border-b-0">
              <div className="text-[12px] font-medium text-n-900">
                <span className="uppercase tracking-[0.1em] text-cove">{a.type}</span> · {a.content}
              </div>
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
