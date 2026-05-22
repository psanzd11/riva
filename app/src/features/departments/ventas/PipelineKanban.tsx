import { DndContext, useDraggable, useDroppable, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useMemo } from 'react'
import { useStore } from '../../../data/store'
import { dealsRepo } from '../../../data/repo'
import { useRole } from '../../../auth/RoleContext'
import { money } from '../../../lib/format'
import type { Deal } from '../../../data/schema'

const STAGES: { id: Exclude<Deal['stage'], 'lead'>; label: string; dot: string }[] = [
  { id: 'qualified', label: 'Cualificado', dot: 'var(--cove)' },
  { id: 'proposal', label: 'Propuesta', dot: '#7a5230' },
  { id: 'negotiation', label: 'Negociación', dot: 'var(--oak-mid)' },
  { id: 'won', label: 'Cierre / Won', dot: 'var(--sage)' },
  { id: 'lost', label: 'Perdidos', dot: 'var(--error)' },
]

interface PipelineKanbanProps {
  onCardClick: (id: string) => void
}

export function PipelineKanban({ onCardClick }: PipelineKanbanProps) {
  const { currentUserId } = useRole()
  const deals = useStore((s) => s.deals)
  const partners = useStore((s) => s.partners)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const grouped = useMemo(() => {
    const out: Record<string, Deal[]> = {}
    STAGES.forEach((s) => (out[s.id] = []))
    // Only show open + recent decided deals (not 142 historic won)
    const sorted = [...deals].sort((a, b) => b.amount - a.amount)
    for (const d of sorted) {
      if (out[d.stage]) out[d.stage].push(d)
    }
    // limit per column
    Object.keys(out).forEach((k) => {
      out[k] = out[k].slice(0, 12)
    })
    return out
  }, [deals])

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over) return
    const dealId = String(active.id)
    const targetStage = String(over.id) as Deal['stage']
    const current = deals.find((d) => d.id === dealId)
    if (!current || current.stage === targetStage) return
    dealsRepo.update(dealId, { stage: targetStage }, currentUserId)
    if (targetStage === 'won') {
      useStore.getState().emitAutomation('deal.stageChanged', {
        id: dealId,
        dealId,
        stage: 'won',
        amount: current.amount,
        currency: current.currency,
        partnerId: current.partnerId,
        clientName: current.clientName,
      })
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div
        className="mb-12 grid gap-px border border-n-300 bg-n-300"
        style={{ gridTemplateColumns: `repeat(${STAGES.length}, 1fr)` }}
      >
        {STAGES.map((stage) => (
          <DroppableColumn
            key={stage.id}
            id={stage.id}
            label={stage.label}
            dot={stage.dot}
            count={grouped[stage.id].length}
            total={grouped[stage.id].reduce((acc, d) => acc + d.amount, 0)}
          >
            {grouped[stage.id].map((d) => (
              <DraggableCard
                key={d.id}
                deal={d}
                partnerName={partners.find((p) => p.id === d.partnerId)?.name ?? '—'}
                onCardClick={onCardClick}
              />
            ))}
          </DroppableColumn>
        ))}
      </div>
    </DndContext>
  )
}

interface DroppableColumnProps {
  id: string
  label: string
  dot: string
  count: number
  total: number
  children: React.ReactNode
}

function DroppableColumn({ id, label, dot, count, total, children }: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className="flex min-h-[320px] flex-col bg-riva-white"
      style={{ background: isOver ? 'var(--n-100)' : 'var(--riva-white)' }}
    >
      <div className="flex items-baseline justify-between border-b border-n-100 px-4 py-3.5">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-n-900">
          <span className="inline-block h-[7px] w-[7px]" style={{ background: dot }} />
          {label}
        </div>
        <div className="text-[10px] tracking-[0.08em] text-n-500">
          {count} · {money(total, 'EUR')}
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

interface DraggableCardProps {
  deal: Deal
  partnerName: string
  onCardClick: (id: string) => void
}

function DraggableCard({ deal, partnerName, onCardClick }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: deal.id })
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.5 : 1 }
    : undefined
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <button
        onPointerUp={(e) => {
          if (!isDragging) {
            e.stopPropagation()
            onCardClick(deal.id)
          }
        }}
        className="block w-full cursor-grab border-b border-n-100 px-4 py-3 text-left last:border-b-0 hover:bg-n-100 active:cursor-grabbing"
      >
        <div className="text-[12px] font-medium text-n-900">{deal.clientName}</div>
        <div className="mt-0.5 text-[10.5px] tracking-[0.04em] text-n-500">{partnerName}</div>
        <div className="mt-1.5 font-display text-[14px] font-normal text-cove">{money(deal.amount, deal.currency)}</div>
      </button>
    </div>
  )
}
