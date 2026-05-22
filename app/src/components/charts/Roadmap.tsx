interface RoadmapItem {
  id: string
  title: string
  meta: string
  variant?: 'cove' | 'oak' | 'sage'
}

interface RoadmapColumn {
  title: string
  items: RoadmapItem[]
}

interface RoadmapProps {
  columns: RoadmapColumn[]
}

const VARIANT_BORDER: Record<NonNullable<RoadmapItem['variant']>, string> = {
  cove: 'var(--cove)',
  oak: 'var(--oak-mid)',
  sage: 'var(--sage)',
}

export function Roadmap({ columns }: RoadmapProps) {
  return (
    <div
      className="grid gap-px border border-n-300 bg-n-300"
      style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
    >
      {columns.map((col) => (
        <div key={col.title} className="min-h-[200px] bg-riva-white p-4">
          <h4 className="mb-3.5 font-display text-[13px] font-normal uppercase tracking-[0.12em] text-n-700">
            {col.title}
          </h4>
          {col.items.map((it) => (
            <div
              key={it.id}
              className="mb-2 border-l-[3px] bg-n-100 p-2.5 text-[12px]"
              style={{ borderLeftColor: VARIANT_BORDER[it.variant ?? 'cove'] }}
            >
              {it.title}
              <div className="mt-1 text-[10px] uppercase tracking-[0.06em] text-n-500">{it.meta}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
