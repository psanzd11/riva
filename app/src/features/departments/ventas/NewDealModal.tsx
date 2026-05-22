import { useState } from 'react'
import { useStore } from '../../../data/store'
import { dealsRepo, leadsRepo } from '../../../data/repo'
import { useRole } from '../../../auth/RoleContext'
import { Modal } from '../../../components/ui/Modal'
import { Field, Input, Select } from '../../../components/ui/Field'
import { Button } from '../../../components/ui/Button'
import type { Deal, Lead } from '../../../data/schema'

interface NewDealModalProps {
  open: boolean
  onClose: () => void
}

export function NewDealModal({ open, onClose }: NewDealModalProps) {
  const partners = useStore((s) => s.partners)
  const { currentUserId } = useRole()

  const [mode, setMode] = useState<'lead' | 'deal'>('lead')
  const [clientName, setClientName] = useState('')
  const [partnerId, setPartnerId] = useState(partners[0]?.id ?? '')
  const [amount, setAmount] = useState(20000)
  const [currency, setCurrency] = useState<Deal['currency']>('EUR')
  const [stage, setStage] = useState<Deal['stage']>('qualified')

  const submit = () => {
    if (!clientName.trim()) return
    if (mode === 'lead') {
      const lead: Omit<Lead, 'id'> = {
        name: clientName.trim(),
        email: `${clientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        sede: partners.find((p) => p.id === partnerId)?.sede === 'us' ? 'us' : 'es',
        channel: 'Manual',
        score: 50,
        stage: 'new',
        ownerId: currentUserId,
        createdAt: new Date().toISOString(),
      }
      leadsRepo.create(lead, currentUserId)
    } else {
      const partner = partners.find((p) => p.id === partnerId)
      if (!partner) return
      const deal: Omit<Deal, 'id'> = {
        clientName: clientName.trim(),
        partnerId,
        ownerId: partner.assignedTo,
        stage,
        amount,
        currency,
        createdAt: new Date().toISOString(),
        expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        probability: 25,
        brand: 'riva_spain',
        notes: '',
      }
      dealsRepo.create(deal, currentUserId)
    }
    setClientName('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={mode === 'lead' ? 'Nuevo lead' : 'Nuevo deal'}>
      <div className="mb-5 flex border border-n-300">
        <button
          className={`flex-1 py-2 text-[11px] uppercase tracking-[0.15em] ${mode === 'lead' ? 'bg-riva-black text-riva-ivory' : 'text-n-700'}`}
          onClick={() => setMode('lead')}
        >
          Lead
        </button>
        <button
          className={`flex-1 py-2 text-[11px] uppercase tracking-[0.15em] ${mode === 'deal' ? 'bg-riva-black text-riva-ivory' : 'text-n-700'}`}
          onClick={() => setMode('deal')}
        >
          Deal
        </button>
      </div>

      <Field label="Cliente">
        <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Casa Velázquez" />
      </Field>

      <Field label="Partner">
        <Select value={partnerId} onChange={(e) => setPartnerId(e.target.value)}>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
      </Field>

      {mode === 'deal' && (
        <>
          <Field label="Importe">
            <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </Field>
          <Field label="Moneda">
            <Select value={currency} onChange={(e) => setCurrency(e.target.value as Deal['currency'])}>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </Select>
          </Field>
          <Field label="Etapa">
            <Select value={stage} onChange={(e) => setStage(e.target.value as Deal['stage'])}>
              {(['lead', 'qualified', 'proposal', 'negotiation', 'won'] as const).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>
        </>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={submit}>Crear {mode === 'lead' ? 'lead' : 'deal'}</Button>
      </div>
    </Modal>
  )
}
