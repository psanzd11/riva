import type { ReactNode } from 'react'

interface PageHeadProps {
  eyebrow: string
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHead({ eyebrow, title, description, actions }: PageHeadProps) {
  return (
    <div className="mb-9 flex items-end justify-between gap-8">
      <div>
        <div className="eyebrow mb-2.5">{eyebrow}</div>
        <h1 className="display font-display font-light text-[44px] leading-[1.1] tracking-[0.04em]">{title}</h1>
        {description && (
          <p className="mt-2 max-w-[560px] text-[14px] text-n-700">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-shrink-0 gap-2.5">{actions}</div>}
    </div>
  )
}
