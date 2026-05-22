import type { ReactNode } from 'react'

type DeltaType = 'up' | 'down' | 'neutral'

interface KpiCardProps {
  eyebrow: string
  value: ReactNode
  delta?: { type: DeltaType; label: string }
  sub?: string
}

const DELTA_CLASS: Record<DeltaType, string> = {
  up: 'text-success',
  down: 'text-error',
  neutral: 'text-n-500',
}

export function KpiCard({ eyebrow, value, delta, sub }: KpiCardProps) {
  return (
    <div className="bg-riva-white px-[26px] py-6">
      <div className="eyebrow mb-3.5 !text-[10px]">{eyebrow}</div>
      <div className="font-display text-[34px] font-light leading-none tracking-[0.02em] text-n-900">{value}</div>
      {delta && (
        <div className={`mt-2.5 text-[11px] uppercase tracking-[0.08em] ${DELTA_CLASS[delta.type]}`}>
          {delta.label}
        </div>
      )}
      {sub && <div className="mt-1.5 text-[11px] text-n-500">{sub}</div>}
    </div>
  )
}
