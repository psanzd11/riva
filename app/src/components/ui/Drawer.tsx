import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  width?: number
}

export function Drawer({ open, onClose, title, subtitle, children, width = 540 }: DrawerProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/40" />
      <div
        className="flex flex-col bg-riva-white border-l border-n-300 shadow-none"
        style={{ width: `${width}px` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-n-300 px-6 py-5">
          <div>
            <div className="font-display text-[22px] font-light tracking-[0.04em]">{title}</div>
            {subtitle && <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-n-500">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="p-1 text-n-700 hover:text-n-900">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
