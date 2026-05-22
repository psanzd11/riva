import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { RoleId } from '../data/schema'

const STORAGE_KEY = 'riva-role-active-v1'
const DEFAULT_ROLE: RoleId = 'ceo'

interface RoleContextValue {
  role: RoleId
  setRole: (role: RoleId) => void
  /** The user id corresponding to the current role (mock mapping). */
  currentUserId: string
  currentUserName: string
}

const RoleContext = createContext<RoleContextValue | null>(null)

const USER_FOR_ROLE: Record<RoleId, { id: string; name: string }> = {
  ceo: { id: 'usr_ps', name: 'Pablo Sanz' },
  director_comercial: { id: 'usr_dc', name: 'Inés Vergara' },
  comercial: { id: 'usr_cm', name: 'Carla Méndez' },
  director_accounting: { id: 'usr_dacc', name: 'Tomás Riera' },
  operations_manager: { id: 'usr_ops', name: 'Mateo Lara' },
  marketing_lead: { id: 'usr_mkt', name: 'Helena Costa' },
  customer_success: { id: 'usr_cs', name: 'Sara Vidal' },
  tech_lead: { id: 'usr_tech', name: 'Andrés Bravo' },
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<RoleId>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return stored as RoleId
    } catch {
      /* noop */
    }
    return DEFAULT_ROLE
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, role)
    } catch {
      /* noop */
    }
  }, [role])

  const user = USER_FOR_ROLE[role]

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole: setRoleState,
        currentUserId: user.id,
        currentUserName: user.name,
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used inside RoleProvider')
  return ctx
}
