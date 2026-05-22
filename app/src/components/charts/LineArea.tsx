interface LineAreaProps {
  points: number[]
  xLabels: string[]
  totals?: { left: string; right: string }
}

const W = 600
const H = 180

export function LineArea({ points, xLabels, totals }: LineAreaProps) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = Math.max(1, max - min)
  const step = points.length === 1 ? W : W / (points.length - 1)

  const lineCoords = points.map((v, i) => ({
    x: i * step,
    y: H - ((v - min) / range) * (H - 30) - 15,
  }))

  const linePath = lineCoords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`

  return (
    <div className="px-6 pb-4 pt-5">
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-[180px] w-full">
          <g>
            {[0.2, 0.4, 0.6, 0.8].map((y) => (
              <line key={y} x1={0} y1={H * y} x2={W} y2={H * y} stroke="var(--n-100)" strokeWidth="1" />
            ))}
          </g>
          <path d={areaPath} fill="var(--cove)" opacity={0.08} />
          <path d={linePath} fill="none" stroke="var(--cove)" strokeWidth="1.8" />
          {lineCoords.map((c, i) => (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={i === lineCoords.length - 1 ? 3.5 : 2.5}
              fill={i === lineCoords.length - 1 ? 'var(--oak-mid)' : 'var(--cove)'}
            />
          ))}
        </svg>
      </div>
      <div className="mt-2 flex justify-between text-[9.5px] uppercase tracking-[0.1em] text-n-500">
        {xLabels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
      {totals && (
        <div className="mt-3.5 flex justify-between border-t border-n-100 pt-3.5 text-[12px] text-n-700">
          <span dangerouslySetInnerHTML={{ __html: totals.left }} />
          <span dangerouslySetInnerHTML={{ __html: totals.right }} />
        </div>
      )}
    </div>
  )
}
