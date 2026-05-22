interface WaterfallCol {
  label: string
  sub?: string
  value: string
  /** 0..100, height pct of column */
  heightPct: number
  variant: 'start' | 'neg' | 'pos' | 'tot'
}

interface WaterfallProps {
  cols: WaterfallCol[]
}

const VARIANT_BG: Record<WaterfallCol['variant'], string> = {
  start: 'var(--cove)',
  neg: 'var(--error)',
  pos: 'var(--success)',
  tot: 'var(--riva-black)',
}

export function Waterfall({ cols }: WaterfallProps) {
  return (
    <div className="flex h-[240px] items-end gap-1.5 border-b border-n-100 px-6 pb-6 pt-6">
      {cols.map((c) => {
        const textColor = 'var(--riva-ivory)'
        return (
          <div key={c.label} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="font-display text-[12px] font-normal text-n-900">{c.value}</div>
            <div
              className="flex w-full items-center justify-center text-[10.5px] font-medium tracking-[0.04em]"
              style={{
                height: `${c.heightPct}%`,
                background: VARIANT_BG[c.variant],
                color: textColor,
              }}
            >
              {c.label}
            </div>
            <div
              className="text-center text-[10px] uppercase leading-[1.3] tracking-[0.08em] text-n-700"
              dangerouslySetInnerHTML={{ __html: c.sub ?? '' }}
            />
          </div>
        )
      })}
    </div>
  )
}
