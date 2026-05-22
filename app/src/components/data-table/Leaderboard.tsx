interface LbBarProps {
  pct: number
  variant?: 'cove' | 'sage' | 'oak'
  value: string
  /** Color override for the fill */
  fillColor?: string
}

const VARIANT_BG: Record<NonNullable<LbBarProps['variant']>, string> = {
  cove: 'var(--cove)',
  sage: 'var(--sage)',
  oak: 'var(--oak-mid)',
}

export function LbBar({ pct, variant = 'cove', value, fillColor }: LbBarProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-[5px] max-w-[120px] min-w-[60px] flex-1 bg-n-100">
        <div
          className="absolute left-0 top-0 h-full"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: fillColor ?? VARIANT_BG[variant] }}
        />
      </div>
      <div className="min-w-[64px] text-right font-display text-[12px] font-normal tracking-[0.02em] text-n-900">
        {value}
      </div>
    </div>
  )
}

interface LbAvatarProps {
  initials: string
  bg?: string
  color?: string
}

export function LbAvatar({ initials, bg = 'var(--cove)', color = 'var(--riva-ivory)' }: LbAvatarProps) {
  return (
    <div
      className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center text-[11px] font-semibold tracking-[0.08em]"
      style={{ background: bg, color }}
    >
      {initials}
    </div>
  )
}

export function LbRank({ n }: { n: number }) {
  return <span className="font-display text-[14px] font-light text-n-500">{n}</span>
}
