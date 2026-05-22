interface Segment {
  label: string
  pct: number
}

interface ConversionBarProps {
  segments: Segment[]
}

const COLORS = ['#2a1a0e', '#3f2616', '#5C3A20', '#7a5230', '#9AA08A']

export function ConversionBar({ segments }: ConversionBarProps) {
  return (
    <div className="flex h-[46px]">
      {segments.map((s, i) => {
        const last = i === segments.length - 1
        const color = COLORS[i] ?? COLORS[COLORS.length - 1]
        const textColor = i === COLORS.length - 1 ? 'var(--riva-black)' : 'var(--riva-ivory)'
        return (
          <div
            key={s.label}
            className="flex flex-1 flex-col items-center justify-center"
            style={{
              background: color,
              color: textColor,
              borderRight: last ? 'none' : '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <span className="font-display text-[14px] font-normal tracking-[0.04em]">{s.pct}%</span>
            <span className="mt-[3px] text-[9.5px] uppercase tracking-[0.15em] opacity-85">{s.label}</span>
          </div>
        )
      })}
    </div>
  )
}
