import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'default' | 'ok' | 'warn' | 'err'

interface PillProps {
  children: ReactNode
  variant?: Variant
  className?: string
}

const VARIANT_CLASS: Record<Variant, string> = {
  default: '',
  ok: 'pill-ok',
  warn: 'pill-warn',
  err: 'pill-err',
}

export function Pill({ children, variant = 'default', className }: PillProps) {
  return <span className={cn('pill', VARIANT_CLASS[variant], className)}>{children}</span>
}
