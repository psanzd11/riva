interface DonutSlice {
  label: string
  value: number
  color: string
  /** Optional formatted value displayed in legend */
  valueLabel?: string
}

interface DonutProps {
  slices: DonutSlice[]
  total?: { label: string; value: string }
}

export function Donut({ slices, total }: DonutProps) {
  const sum = slices.reduce((acc, s) => acc + s.value, 0)
  let offset = 25 // matches demo

  return (
    <div className="flex items-center gap-6 px-6 py-5">
      <svg viewBox="0 0 42 42" className="h-[140px] w-[140px] flex-shrink-0">
        {slices.map((s) => {
          const pct = sum > 0 ? (s.value / sum) * 100 : 0
          const dash = `${pct} ${100 - pct}`
          const circle = (
            <circle
              key={s.label}
              cx="21"
              cy="21"
              r="15.915"
              fill="none"
              stroke={s.color}
              strokeWidth="9"
              strokeDasharray={dash}
              strokeDashoffset={offset}
            />
          )
          offset -= pct
          return circle
        })}
      </svg>
      <div className="flex flex-1 flex-col gap-2.5 text-[12px]">
        {slices.map((s) => {
          const pct = sum > 0 ? Math.round((s.value / sum) * 100) : 0
          return (
            <div
              key={s.label}
              className="grid items-center gap-2.5 border-b border-n-100 py-1.5 last:border-b-0"
              style={{ gridTemplateColumns: '14px 1fr auto' }}
            >
              <span className="block h-2.5 w-2.5" style={{ background: s.color }} />
              <span className="text-[12px] text-n-900">{s.label}</span>
              <span className="font-display text-[12px] tracking-[0.02em] text-n-700">
                {s.valueLabel ?? `${pct}%`}
              </span>
            </div>
          )
        })}
        {total && (
          <div
            className="grid items-center gap-2.5 border-t border-n-300 pt-2.5 text-[12px]"
            style={{ gridTemplateColumns: '14px 1fr auto' }}
          >
            <span />
            <span className="font-medium text-n-900">{total.label}</span>
            <span className="font-medium font-display tracking-[0.02em] text-n-900">{total.value}</span>
          </div>
        )}
      </div>
    </div>
  )
}
