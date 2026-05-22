import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../../data/store'
import { useRole } from '../../auth/RoleContext'
import { RoleSwitcher } from '../../auth/RoleSwitcher'
import { dateRelative } from '../../lib/format'
import { SearchCommand } from '../../features/search/SearchCommand'

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/automations': 'Automatizaciones',
  '/integrations': 'Integraciones',
  '/partners': 'Partners',
  '/flagship': 'Flagship Miami',
  '/dept/ventas': 'Ventas',
  '/dept/accounting': 'Accounting',
  '/dept/operations': 'Operations',
  '/dept/supply-chain': 'Supply Chain',
  '/dept/marketing': 'Marketing',
  '/dept/postventa': 'Postventa',
  '/dept/tecnologia': 'Tecnología',
}

export function Topbar() {
  const { pathname } = useLocation()
  const label = ROUTE_LABELS[pathname] ?? 'Dashboard'
  const { role } = useRole()
  const notifications = useStore((s) => s.notifications)
  const apply = useStore((s) => s.apply)
  const myNotifs = notifications.filter((n) => !n.role || n.role === role)
  const unread = myNotifs.filter((n) => !n.read)
  const [bellOpen, setBellOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // ⌘K listener
  if (typeof window !== 'undefined') {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    // Cheap re-attach guard via window key
    interface W {
      __rivaCmdK?: boolean
    }
    const w = window as unknown as W
    if (!w.__rivaCmdK) {
      window.addEventListener('keydown', handler)
      w.__rivaCmdK = true
    }
  }

  const markAllRead = () => {
    const nextAll = notifications.map((n) =>
      !n.role || n.role === role ? { ...n, read: true } : n,
    )
    apply('notifications', nextAll, {
      action: 'update',
      entity: 'notifications',
      entityId: 'bulk',
      userId: 'system',
    })
  }

  return (
    <div
      className="sticky top-0 z-10 flex items-center justify-between border-b border-n-300 bg-riva-ivory px-10"
      style={{ height: 'var(--topbar-h)' }}
    >
      <div className="text-[12px] uppercase tracking-[0.12em] text-n-700">
        Holding · <b className="font-semibold text-n-900">{label}</b>
      </div>
      <div className="flex items-center gap-5">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex min-w-[280px] items-center gap-2.5 border border-n-300 bg-riva-white px-3.5 py-1.5 text-[12px] text-n-500"
        >
          <span>⌕</span>
          <span>Buscar partner, factura, contacto…</span>
          <span className="ml-auto border border-n-300 px-1.5 py-[1px] text-[10px] text-n-700">⌘K</span>
        </button>

        <div className="relative">
          <button onClick={() => setBellOpen((v) => !v)} className="relative p-1.5">
            <Bell size={18} strokeWidth={1.5} />
            {unread.length > 0 && (
              <span className="absolute right-1 top-1 h-[7px] w-[7px] bg-error" />
            )}
          </button>
          {bellOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-96 border border-n-300 bg-riva-white">
              <div className="flex items-center justify-between border-b border-n-300 px-4 py-3">
                <div className="font-display text-[14px] uppercase tracking-[0.08em]">Notificaciones</div>
                {unread.length > 0 && (
                  <button onClick={markAllRead} className="text-[10px] uppercase tracking-[0.15em] text-n-700">
                    Marcar leídas
                  </button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {myNotifs.length === 0 && (
                  <div className="px-4 py-6 text-center text-[12px] text-n-500">Sin notificaciones</div>
                )}
                {myNotifs.map((n) => (
                  <div key={n.id} className="flex gap-3 border-b border-n-100 px-4 py-3 last:border-b-0">
                    <div className={`mt-[7px] h-[6px] w-[6px] flex-shrink-0 ${n.read ? 'bg-n-300' : 'bg-oak-mid'}`} />
                    <div className="flex-1 text-[13px]">
                      <div>
                        <span className="font-medium">{n.source}</span> · {n.message}
                      </div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.06em] text-n-500">
                        {dateRelative(n.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <RoleSwitcher />

        <div className="border border-n-300 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-n-500">
          Salir Demo · Esc
        </div>
      </div>

      <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
