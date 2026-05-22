import { useStore } from '../../../data/store'
import { Panel } from '../../../components/ui/Panel'
import { initials } from '../../../lib/format'
import type { User } from '../../../data/schema'

interface DeptEquipoProps {
  dept: User['dept']
  title: string
  description?: string
}

/**
 * Lists the staff that work in a department. Each card shows avatar, name,
 * role label, sede pill.
 */
export function DeptEquipo({ dept, title, description }: DeptEquipoProps) {
  const users = useStore((s) => s.users)
  const members = users.filter((u) => u.dept === dept && u.active)

  return (
    <>
      <h2 className="mb-2 font-display text-[26px] font-light tracking-[0.04em]">{title}</h2>
      {description && <p className="mb-6 text-[13px] text-n-700 max-w-prose">{description}</p>}

      <Panel headless>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-n-300">
          {members.map((m) => (
            <div key={m.id} className="bg-riva-white p-5">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center text-[14px] font-semibold tracking-[0.08em]"
                  style={{ background: `var(--${m.avatarColor})`, color: 'var(--riva-ivory)' }}
                >
                  {initials(m.name)}
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-medium text-n-900">{m.name}</div>
                  <div className="mt-0.5 text-[11px] uppercase tracking-[0.1em] text-n-500">
                    {m.deptRole ?? m.role.replace(/_/g, ' ')}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <span className="border border-n-300 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-n-700">
                      {m.sede === 'global' ? 'Global' : m.sede.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 border-t border-n-100 pt-2.5 text-[11px] text-n-500">
                {m.email}
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <div className="bg-riva-white p-8 text-center text-[13px] text-n-500">
              No hay miembros asignados a este departamento.
            </div>
          )}
        </div>
      </Panel>
    </>
  )
}
