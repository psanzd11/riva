interface LineSeries {
  name: string
  color: string
  points: number[]
}

interface MultiLineProps {
  series: LineSeries[]
  /** X-axis labels */
  xLabels: string[]
  height?: number
  showLegend?: boolean
  totals?: { left: string; right: string }
}

export function MultiLine({ series, xLabels, height = 200, showLegend = true, totals }: MultiLineProps) {
  const W = 600
  const H = height
  const maxVal = Math.max(...series.flatMap((s) => s.points))
  const minVal = Math.min(...series.flatMap((s) => s.points))
  const range = Math.max(1, maxVal - minVal)

  const pathFor = (pts: number[]) => {
    if (pts.length === 0) return ''
    const step = pts.length === 1 ? W : W / (pts.length - 1)
    return pts
      .map((v, i) => {
        const x = i * step
        const y = H - ((v - minVal) / range) * (H - 20) - 10
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
      })
      .join(' ')
  }

  return (
    <div className="px-6 pb-4 pt-5">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-[200px] w-full" style={{ height: `${H}px` }}>
        <g>
          {[0.2, 0.4, 0.6, 0.8].map((y) => (
            <line key={y} x1={0} y1={H * y} x2={W} y2={H * y} stroke="var(--n-100)" strokeWidth="1" />
          ))}
        </g>
        {series.map((s) => (
          <path
            key={s.name}
            d={pathFor(s.points)}
            fill="none"
            stroke={s.color}
            strokeWidth="1.6"
            opacity="0.85"
          />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[9.5px] uppercase tracking-[0.1em] text-n-500">
        {xLabels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
      {totals && (
        <div className="mt-3.5 flex justify-between border-t border-n-100 pt-3.5 text-[12px] text-n-700">
          <span>{totals.left}</span>
          <span>{totals.right}</span>
        </div>
      )}
      {showLegend && (
        <div className="mt-3.5 flex flex-wrap gap-4 text-[11px] tracking-[0.04em] text-n-700">
          {series.map((s) => (
            <span key={s.name} className="flex items-center gap-1.5">
              <i className="inline-block h-[2px] w-3" style={{ background: s.color }} />
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
