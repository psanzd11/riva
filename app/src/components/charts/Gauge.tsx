interface GaugeProps {
  score: number
  /** Range; defaults to NPS [-100, 100] */
  min?: number
  max?: number
  label?: string
}

const PATH_LENGTH = 220 // approx for r=85 half-arc

export function Gauge({ score, min = -100, max = 100, label = 'Excelente' }: GaugeProps) {
  const norm = Math.min(1, Math.max(0, (score - min) / (max - min)))
  const fgPath = describeArc(15, 100, 85, 0, 180 * norm)

  return (
    <div className="flex flex-col items-center px-6 py-6">
      <svg viewBox="0 0 200 110" className="block h-[120px] w-[200px]">
        <path d="M 15 100 A 85 85 0 0 1 185 100" fill="none" stroke="var(--n-100)" strokeWidth="14" />
        <path d={fgPath} fill="none" stroke="var(--sage)" strokeWidth="14" strokeLinecap="butt" />
      </svg>
      <div className="-mt-[30px] font-display text-[38px] font-light tracking-[0.02em] text-n-900">
        {score > 0 ? `+${score}` : score}
      </div>
      <div className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-n-500">{label}</div>
      <div className="mt-3.5 flex w-[200px] justify-between text-[9.5px] uppercase tracking-[0.08em] text-n-500">
        <span>{min}</span>
        <span>0</span>
        <span>+{max}</span>
      </div>
    </div>
  )
}

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = polar(cx, cy, r, startDeg - 90)
  const end = polar(cx, cy, r, endDeg - 90)
  const largeArcFlag = endDeg - startDeg <= 180 ? 0 : 1
  return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 1, end.x, end.y].join(' ')
}

function polar(cx: number, cy: number, r: number, deg: number): { x: number; y: number } {
  const rad = ((deg - 0) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

// Unused literal kept to silence import linter for PATH_LENGTH if needed elsewhere.
void PATH_LENGTH
