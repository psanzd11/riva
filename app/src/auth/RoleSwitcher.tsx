import { useState, useRef, useEffect } from 'react'
import { useRole } from './RoleContext'
import { ROLES } from './roles'
import { ChevronDown } from 'lucide-react'

export function RoleSwitcher() {
  const { role, setRole } = useRole()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const active = ROLES.find((r) => r.id === role) ?? ROLES[0]

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 border border-n-300 bg-riva-white px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-n-700 hover:border-riva-black"
      >
        <span className="font-medium text-n-900">{active.label}</span>
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 w-72 border border-n-300 bg-riva-white">
          <div className="border-b border-n-100 px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-n-500">
            Cambiar rol (demo)
          </div>
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setRole(r.id)
                setOpen(false)
              }}
              className={`flex w-full flex-col items-start gap-0.5 border-b border-n-100 px-3 py-2 text-left last:border-b-0 hover:bg-n-100 ${
                r.id === role ? 'bg-n-100' : ''
              }`}
            >
              <span className="text-[12px] font-medium text-n-900">{r.label}</span>
              <span className="text-[10px] uppercase tracking-[0.08em] text-n-500">{r.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
