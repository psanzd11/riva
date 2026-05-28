import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useRole } from '../../auth/RoleContext'
import { navForRole, type NavItem } from '../../auth/roles'
import { initials } from '../../lib/format'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type SedeFilter = 'all' | 'es' | 'us'

export function Sidebar() {
  const { role, currentUserName } = useRole()
  const sections = navForRole(role)
  const [sede, setSede] = useState<SedeFilter>('all')
  const { pathname } = useLocation()

  return (
    <aside
      className="sticky top-0 flex h-screen flex-col overflow-y-auto bg-riva-black text-riva-ivory"
      style={{ width: 'var(--sidebar-w)' }}
    >
      <div className="border-b border-white/10 px-6 pb-7 pt-6">
        <div className="font-display text-[11px] font-extralight tracking-[0.35em] text-n-300">THE</div>
        <div className="font-display text-[28px] font-light leading-none tracking-[0.18em]">RIVA</div>
        <div className="mt-1.5 font-display text-[9px] font-extralight tracking-[0.4em] text-n-500">C O M P A N Y</div>
      </div>

      <div className="border-b border-white/10 px-6 py-4">
        <div className="eyebrow !mb-2.5 !text-[10px] !text-n-500">Sede</div>
        <div className="flex border border-white/15">
          {(['all', 'es', 'us'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSede(s)}
              className={`flex-1 py-2 text-[11px] font-medium uppercase tracking-[0.15em] transition ${
                sede === s ? 'bg-riva-ivory text-riva-black' : 'text-n-300 hover:text-riva-ivory'
              }`}
            >
              {s === 'all' ? 'Holding' : s === 'es' ? 'España' : 'USA'}
            </button>
          ))}
        </div>
      </div>

      <nav className="flex-1 py-4">
        {sections.map((section) => (
          <div key={section.id} className="mb-1.5">
            <div className="px-6 pb-1.5 pt-3 font-bold text-[9.5px] uppercase tracking-[0.18em] text-n-500">
              {section.label}
            </div>
            {section.items.map((item) =>
              item.subItems ? (
                <ExpandableItem key={item.id} item={item} pathname={pathname} />
              ) : (
                <NavLink
                  key={item.id}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center justify-between border-l-2 px-6 py-2 text-[13px] tracking-[0.04em] transition ${
                      isActive
                        ? 'border-l-oak-mid bg-white/5 text-riva-ivory'
                        : 'border-l-transparent text-n-300 hover:bg-white/[0.03] hover:text-riva-ivory'
                    }`
                  }
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`px-[7px] py-[1px] text-[10px] tracking-[0.08em] ${
                        item.flagship
                          ? 'bg-oak-mid font-semibold text-riva-black'
                          : 'bg-white/[0.08] text-n-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ),
            )}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-6 py-5 text-[11px] text-n-500">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[30px] w-[30px] items-center justify-center bg-oak-mid text-[11px] font-semibold tracking-[0.1em] text-riva-black">
            {initials(currentUserName)}
          </div>
          <div>
            <div className="text-[12px] text-riva-ivory">{currentUserName}</div>
            <div className="text-[10px] uppercase tracking-[0.1em]">Demo · acceso por rol</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

/**
 * Dept item with sub-items. The accordion is open whenever the current pathname
 * is one of the dept's subItems (no separate openDept state — derives from URL).
 * Clicking the dept header navigates to its Resumen (first subItem), which makes
 * the dept active and opens the accordion via the same derived rule.
 */
function ExpandableItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const navigate = useNavigate()
  const isActive = item.subItems?.some((s) => s.to === pathname) ?? false

  return (
    <div>
      <button
        onClick={() => navigate(item.to)}
        className={`flex w-full items-center justify-between border-l-2 px-6 py-2 text-left text-[13px] tracking-[0.04em] transition ${
          isActive
            ? 'border-l-oak-mid bg-white/5 text-riva-ivory'
            : 'border-l-transparent text-n-300 hover:bg-white/[0.03] hover:text-riva-ivory'
        }`}
      >
        <span>{item.label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isActive ? 'rotate-180' : ''}`}
          strokeWidth={1.5}
        />
      </button>
      {isActive && item.subItems && (
        <div className="bg-black/30">
          {item.subItems.map((s) => (
            <NavLink
              key={s.id}
              to={s.to}
              end
              className={({ isActive: subActive }) =>
                `flex items-center justify-between border-l-2 py-[7px] pl-12 pr-6 text-[12px] tracking-[0.04em] transition ${
                  subActive
                    ? 'border-l-oak-mid bg-white/[0.04] text-riva-ivory'
                    : 'border-l-transparent text-n-500 hover:text-n-300'
                }`
              }
            >
              <span>{s.label}</span>
              {s.badge && (
                <span
                  className={`px-[6px] py-[1px] text-[9px] font-semibold uppercase tracking-[0.1em] ${
                    s.flagship ? 'bg-oak-mid text-riva-black' : 'bg-white/[0.08] text-n-300'
                  }`}
                >
                  {s.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}
