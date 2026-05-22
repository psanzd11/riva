interface TimelineRow {
  name: string
  sub?: string
  startPct: number
  widthPct: number
  variant?: 'cove' | 'sage' | 'oak' | 'warn'
  date: string
}

interface TimelineProps {
  rows: TimelineRow[]
  /** Top axis labels (date headers) */
  axisLabels: string[]
}

const VARIANT_BG: Record<NonNullable<TimelineRow['variant']>, string> = {
  cove: 'var(--cove)',
  sage: 'var(--sage)',
  oak: 'var(--oak-mid)',
  warn: 'var(--warning)',
}

export function Timeline({ rows, axisLabels }: TimelineProps) {
  return (
    <div>
      <div
        className="grid items-center gap-3.5 border-b border-n-100 px-6 pb-2.5 pt-3.5 text-[9.5px] uppercase tracking-[0.1em] text-n-500"
        style={{ gridTemplateColumns: '180px 1fr 80px' }}
      >
        <span className="font-semibold">Proyecto</span>
        <div className="flex justify-between gap-2 font-normal">
          {axisLabels.map((l) => (
            <span key={l} className="whitespace-nowrap">{l}</span>
          ))}
        </div>
        <span className="text-right font-semibold">Estado</span>
      </div>
      <div className="px-6 py-2">
        {rows.map((r) => (
          <div
            key={r.name + r.date}
            className="grid items-center gap-3.5 border-b border-n-100 py-2.5 last:border-b-0"
            style={{ gridTemplateColumns: '180px 1fr 80px' }}
          >
            <div className="text-[12px] font-medium text-n-900">
              {r.name}
              {r.sub && <div className="mt-0.5 text-[10.5px] font-normal tracking-[0.04em] text-n-500">{r.sub}</div>}
            </div>
            <div className="relative h-[22px] bg-n-100">
              <div
                className="absolute top-0 h-full"
                style={{
                  left: `${r.startPct}%`,
                  width: `${r.widthPct}%`,
                  background: VARIANT_BG[r.variant ?? 'cove'],
                }}
              />
            </div>
            <div className="text-right text-[10.5px] uppercase tracking-[0.06em] text-n-500">{r.date}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
