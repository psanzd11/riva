interface StackSeg {
  label: string
  value: number
  variant: 's0' | 's1' | 's2' | 's3'
}

interface StackedBarProps {
  segments: StackSeg[]
  legend?: { label: string; variant: StackSeg['variant'] }[]
}

const VARIANT_BG: Record<StackSeg['variant'], string> = {
  s0: 'var(--success)',
  s1: 'var(--cove)',
  s2: 'var(--warning)',
  s3: 'var(--error)',
}

export function StackedBar({ segments, legend }: StackedBarProps) {
  const total = segments.reduce((acc, s) => acc + s.value, 0)
  return (
    <div>
      <div className="mx-6 mb-4 flex h-[34px] border border-n-300">
        {segments.map((s, i) => {
          const last = i === segments.length - 1
          const pct = total > 0 ? (s.value / total) * 100 : 0
          return (
            <div
              key={s.label}
              className="flex items-center justify-center px-2 text-[11px] tracking-[0.06em] text-riva-ivory"
              style={{
                flex: `0 0 ${pct}%`,
                background: VARIANT_BG[s.variant],
                borderRight: last ? 'none' : '1px solid rgba(255,255,255,0.15)',
              }}
            >
              {s.label}
            </div>
          )
        })}
      </div>
      {legend && (
        <div className="flex flex-wrap gap-4 px-6 pb-5 text-[11px] tracking-[0.04em]">
          {legend.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-n-700">
              <i className="inline-block h-2.5 w-2.5" style={{ background: VARIANT_BG[l.variant] }} />
              {l.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
