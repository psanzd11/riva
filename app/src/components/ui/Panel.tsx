import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface PanelProps {
  title?: string
  action?: ReactNode
  children?: ReactNode
  className?: string
  bodyClassName?: string
  headless?: boolean
}

export function Panel({ title, action, children, className, bodyClassName, headless = false }: PanelProps) {
  return (
    <div className={cn('panel', className)}>
      {!headless && (title || action) && (
        <div className="panel-head">
          {title && <h3>{title}</h3>}
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={cn(bodyClassName)}>{children}</div>
    </div>
  )
}
