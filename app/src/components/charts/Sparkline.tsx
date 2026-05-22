interface SparklineProps {
  points: number[]
  color?: string
}

export function Sparkline({ points, color = 'var(--oak-mid)' }: SparklineProps) {
  if (points.length === 0) return null
  const W = 80
  const H = 22
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = Math.max(1, max - min)
  const step = points.length === 1 ? W : W / (points.length - 1)
  const pts = points.map((v, i) => `${(i * step).toFixed(1)},${(H - ((v - min) / range) * (H - 4) - 2).toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-full w-full">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}
