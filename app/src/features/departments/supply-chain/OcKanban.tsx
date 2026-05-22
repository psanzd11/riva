import { DndContext, useDraggable, useDroppable, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useStore } from '../../../data/store'
import { purchaseOrdersRepo } from '../../../data/repo'
import { useRole } from '../../../auth/RoleContext'
import { money } from '../../../lib/format'
import type { PurchaseOrder } from '../../../data/schema'

const STAGES: { id: PurchaseOrder['status']; label: string; dot: string }[] = [
  { id: 'factory', label: 'En fábrica', dot: 'var(--cove)' },
  { id: 'transit', label: 'En tránsito', dot: '#7a5230' },
  { id: 'customs', label: 'Aduana', dot: 'var(--oak-mid)' },
  { id: 'warehouse', label: 'En almacén', dot: 'var(--sage)' },
  { id: 'available', label: 'Disponible', dot: 'var(--sage-dark)' },
]

export function OcKanban() {
  const { currentUserId } = useRole()
  const orders = useStore((s) => s.purchaseOrders)
  const skus = useStore((s) => s.skus)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over) return
    const id = String(active.id)
    const target = String(over.id) as PurchaseOrder['status']
    const current = orders.find((o) => o.id === id)
    if (!current || current.status === target) return
    purchaseOrdersRepo.update(id, { status: target }, currentUserId)
    if (target === 'available') {
      // Add stock to SKU
      const sku = skus.find((s) => s.id === current.skuId)
      if (sku) {
        useStore.getState().apply(
          'skus',
          skus.map((s) => (s.id === sku.id ? { ...s, stockM2: s.stockM2 + current.quantity } : s)),
          { action: 'update', entity: 'skus', entityId: sku.id, userId: currentUserId, diff: { stockM2: '+' + current.quantity } },
        )
      }
      useStore.getState().emitAutomation('purchaseOrder.statusChanged', { id, status: 'available' })
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div
        className="mb-12 grid gap-px border border-n-300 bg-n-300"
        style={{ gridTemplateColumns: `repeat(${STAGES.length}, 1fr)` }}
      >
        {STAGES.map((stage) => {
          const cards = orders.filter((o) => o.status === stage.id)
          const total = cards.reduce((acc, o) => acc + o.totalCost, 0)
          return (
            <DroppableCol key={stage.id} id={stage.id} label={stage.label} dot={stage.dot} count={cards.length} total={total}>
              {cards.map((o) => {
                const sku = skus.find((s) => s.id === o.skuId)
                return <DraggableCard key={o.id} order={o} skuName={sku?.name ?? '—'} />
              })}
            </DroppableCol>
          )
        })}
      </div>
    </DndContext>
  )
}

function DroppableCol({
  id,
  label,
  dot,
  count,
  total,
  children,
}: {
  id: string
  label: string
  dot: string
  count: number
  total: number
  children: React.ReactNode
}) {
  const { isOver, setNodeRef } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className="flex min-h-[280px] flex-col" style={{ background: isOver ? 'var(--n-100)' : 'var(--riva-white)' }}>
      <div className="flex items-baseline justify-between border-b border-n-100 px-4 py-3.5">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-n-900">
          <span className="inline-block h-[7px] w-[7px]" style={{ background: dot }} />
          {label}
        </div>
        <div className="text-[10px] tracking-[0.08em] text-n-500">{count} OC · {money(total, 'EUR')}</div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function DraggableCard({ order, skuName }: { order: PurchaseOrder; skuName: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: order.id })
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.5 : 1 } : undefined
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="border-b border-n-100 px-4 py-3 last:border-b-0 hover:bg-n-100 cursor-grab active:cursor-grabbing">
      <div className="text-[12px] font-medium text-n-900">{order.number} · {skuName}</div>
      <div className="mt-0.5 text-[10.5px] tracking-[0.04em] text-n-500">{order.quantity} m²</div>
      <div className="mt-1.5 font-display text-[14px] text-cove">{money(order.totalCost, order.currency)}</div>
    </div>
  )
}
