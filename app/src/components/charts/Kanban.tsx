import type { ReactNode } from 'react'

export interface KanbanCard {
  id: string
  title: string
  subtitle: string
  amount: string
  amountColor?: string
}

export interface KanbanColumn {
  id: string
  label: string
  meta: string
  dotColor: string
  cards: KanbanCard[]
  foot?: { left: string; right: string }
  onCardClick?: (id: string) => void
}

interface KanbanProps {
  columns: KanbanColumn[]
  children?: ReactNode
}

export function Kanban({ columns }: KanbanProps) {
  return (
    <div
      className="mb-12 grid gap-px border border-n-300 bg-n-300"
      style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
    >
      {columns.map((col) => (
        <div key={col.id} className="flex min-h-[320px] flex-col bg-riva-white">
          <div className="flex items-baseline justify-between border-b border-n-100 px-4 py-3.5">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-n-900">
              <span className="inline-block h-[7px] w-[7px]" style={{ background: col.dotColor }} />
              {col.label}
            </div>
            <div className="text-[10px] tracking-[0.08em] text-n-500">{col.meta}</div>
          </div>
          <div className="flex-1">
            {col.cards.map((card) => (
              <button
                key={card.id}
                onClick={() => col.onCardClick?.(card.id)}
                className="block w-full cursor-pointer border-b border-n-100 px-4 py-3 text-left last:border-b-0 hover:bg-n-100"
              >
                <div className="text-[12px] font-medium text-n-900">{card.title}</div>
                <div className="mt-0.5 text-[10.5px] tracking-[0.04em] text-n-500">{card.subtitle}</div>
                <div className="mt-1.5 font-display text-[14px] font-normal" style={{ color: card.amountColor ?? 'var(--cove)' }}>
                  {card.amount}
                </div>
              </button>
            ))}
          </div>
          {col.foot && (
            <div className="mt-auto flex justify-between border-t border-n-100 px-4 py-2.5 text-[10px] uppercase tracking-[0.1em] text-n-500">
              <span>{col.foot.left}</span>
              <span>{col.foot.right}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
