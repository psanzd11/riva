type Level = 0 | 1 | 2 | 3 | 4 | -1

interface HeatmapProps {
  cells: Level[]
  cols?: number
  /** Lines below the grid */
  legendLeft: string
  /** Right legend label inline */
  legendRight?: string
}

const LEVEL_BG: Record<Level, string> = {
  [-1]: 'var(--error)',
  0: 'var(--n-100)',
  1: 'var(--sage-soft)',
  2: 'var(--sage-light)',
  3: 'var(--sage)',
  4: 'var(--sage-dark)',
}

export function Heatmap({ cells, cols = 15, legendLeft, legendRight = '100%' }: HeatmapProps) {
  return (
    <div className="px-6 py-5">
      <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {cells.map((c, i) => (
          <div
            key={i}
            className="aspect-square min-h-[18px]"
            style={{ background: LEVEL_BG[c] ?? LEVEL_BG[0] }}
          />
        ))}
      </div>
      <div className="mt-3.5 flex items-center justify-between text-[10px] uppercase tracking-[0.08em] text-n-500">
        <span>{legendLeft}</span>
        <div className="flex items-center gap-1">
          <span>down</span>
          <i className="inline-block h-3 w-3" style={{ background: 'var(--error)' }} />
          <i className="inline-block h-3 w-3" style={{ background: 'var(--sage-soft)' }} />
          <i className="inline-block h-3 w-3" style={{ background: 'var(--sage-light)' }} />
          <i className="inline-block h-3 w-3" style={{ background: 'var(--sage)' }} />
          <i className="inline-block h-3 w-3" style={{ background: 'var(--sage-dark)' }} />
          <span>{legendRight}</span>
        </div>
      </div>
    </div>
  )
}
