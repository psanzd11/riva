import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface KpiGridProps {
  children: ReactNode
  cols?: 4 | 5 | 8
  className?: string
}

const COLS_CLASS: Record<NonNullable<KpiGridProps['cols']>, string> = {
  4: 'grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-2 lg:grid-cols-5',
  8: 'grid-cols-2 lg:grid-cols-4 xl:grid-cols-8',
}

export function KpiGrid({ children, cols = 4, className }: KpiGridProps) {
  return (
    <div
      className={cn('grid gap-px border border-n-300 bg-n-300 mb-12', COLS_CLASS[cols], className)}
    >
      {children}
    </div>
  )
}
