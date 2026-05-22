import type { ReactNode } from 'react'

export interface RatioItem {
  label: string
  value: ReactNode
  delta?: { type: 'up' | 'down' | 'neutral'; label: string }
  spark?: ReactNode
}

interface RatioGridProps {
  items: RatioItem[]
  /** Columns */
  cols?: 2 | 3
}

const DELTA_CLASS: Record<'up' | 'down' | 'neutral', string> = {
  up: 'text-success',
  down: 'text-error',
  neutral: 'text-n-500',
}

export function RatioGrid({ items, cols = 2 }: RatioGridProps) {
  return (
    <div
      className="grid gap-px bg-n-300"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {items.map((it) => (
        <div key={it.label} className="bg-riva-white p-[18px]">
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.15em] text-n-500">{it.label}</div>
          <div className="mt-1.5 font-display text-[26px] font-light tracking-[0.02em]">{it.value}</div>
          {it.spark && <div className="mt-2.5 h-[22px]">{it.spark}</div>}
          {it.delta && (
            <div className={`mt-2 text-[10px] uppercase tracking-[0.1em] ${DELTA_CLASS[it.delta.type]}`}>
              {it.delta.label}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
