import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface KpiGridProps {
  children: ReactNode
  cols?: 4 | 8
  className?: string
}

export function KpiGrid({ children, cols = 4, className }: KpiGridProps) {
  return (
    <div
      className={cn(
        'grid gap-px border border-n-300 bg-n-300 mb-12',
        cols === 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-4 xl:grid-cols-8',
        className,
      )}
    >
      {children}
    </div>
  )
}
