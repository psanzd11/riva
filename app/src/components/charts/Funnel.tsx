interface FunnelRow {
  stage: string
  count: number
  amountLabel: string
  pct: number
  /** 0..100 width of the bar */
  widthPct: number
}

interface FunnelProps {
  rows: FunnelRow[]
}

const COLORS = ['#2a1a0e', '#3f2616', '#5C3A20', '#7a5230', '#9AA08A']

export function Funnel({ rows }: FunnelProps) {
  return (
    <div className="px-6 py-5">
      {rows.map((r, i) => {
        const color = COLORS[i] ?? COLORS[COLORS.length - 1]
        const isSage = i === COLORS.length - 1
        return (
          <div
            key={r.stage}
            className="mb-[11px] grid items-center gap-3.5"
            style={{ gridTemplateColumns: '72px 1fr 44px' }}
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-n-700">{r.stage}</div>
            <div
              className="flex h-[30px] items-center overflow-hidden whitespace-nowrap px-3 text-[11px] font-medium tracking-[0.04em]"
              style={{
                width: `${r.widthPct}%`,
                background: color,
                color: isSage ? 'var(--riva-black)' : 'var(--riva-ivory)',
              }}
            >
              {r.count} · {r.amountLabel}
            </div>
            <div className="text-right text-[11px] font-semibold tracking-[0.06em] text-n-500">{r.pct}%</div>
          </div>
        )
      })}
    </div>
  )
}
