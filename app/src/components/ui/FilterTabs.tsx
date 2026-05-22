import { cn } from '../../lib/cn'

interface FilterTabsProps<T extends string> {
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  variant?: 'filter' | 'time'
  className?: string
}

export function FilterTabs<T extends string>({ options, value, onChange, variant = 'filter', className }: FilterTabsProps<T>) {
  if (variant === 'time') {
    return (
      <div className={cn('time-tabs', className)}>
        {options.map((o) => (
          <button key={o.value} className={o.value === value ? 'active' : ''} onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    )
  }
  return (
    <div className={cn('flex gap-2', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          className={cn('filter-btn', o.value === value && 'active')}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
