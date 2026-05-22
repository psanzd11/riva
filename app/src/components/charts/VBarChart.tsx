interface VBar {
  label: string
  value: string
  heightPct: number
  variant?: 'cove' | 'oak' | 'sage' | 'dark' | 'mid' | 'error'
}

interface VBarChartProps {
  bars: VBar[]
  foot?: { left: string; right: string }
}

const VARIANT_BG: Record<NonNullable<VBar['variant']>, string> = {
  cove: 'var(--cove)',
  oak: 'var(--oak-mid)',
  sage: 'var(--sage)',
  dark: '#2a1a0e',
  mid: '#7a5230',
  error: 'var(--error)',
}

export function VBarChart({ bars, foot }: VBarChartProps) {
  return (
    <>
      <div className="flex h-[220px] items-end gap-4 border-b border-n-100 px-6 pt-6">
        {bars.map((b) => (
          <div key={b.label} className="flex h-full flex-1 flex-col items-center gap-2">
            <div className="font-display text-[13px] font-normal text-n-900">{b.value}</div>
            <div
              className="w-full transition-opacity hover:opacity-85"
              style={{
                background: VARIANT_BG[b.variant ?? 'cove'],
                height: `${b.heightPct}%`,
                minHeight: '4px',
              }}
            />
            <div className="text-center text-[10.5px] uppercase tracking-[0.08em] text-n-700">{b.label}</div>
          </div>
        ))}
      </div>
      {foot && (
        <div className="flex justify-between px-6 py-3.5 text-[11px] uppercase tracking-[0.06em] text-n-500">
          <span dangerouslySetInnerHTML={{ __html: foot.left }} />
          <span dangerouslySetInnerHTML={{ __html: foot.right }} />
        </div>
      )}
    </>
  )
}
