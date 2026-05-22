import type { RoleId } from '../data/schema'

export const ROLES: { id: RoleId; label: string; description: string }[] = [
  { id: 'ceo', label: 'CEO', description: 'Acceso global · lectura' },
  { id: 'director_comercial', label: 'Director comercial', description: 'Ventas, partners, equipo' },
  { id: 'comercial', label: 'Comercial', description: 'Su cartera, sus deals' },
  { id: 'director_accounting', label: 'Dir. Accounting', description: 'Facturas, P&L, cobros' },
  { id: 'operations_manager', label: 'Operations Manager', description: 'Instalaciones, supply chain' },
  { id: 'marketing_lead', label: 'Marketing Lead', description: 'Campañas, leads, contenido' },
  { id: 'customer_success', label: 'Customer Success', description: 'Tickets, NPS, reseñas' },
  { id: 'tech_lead', label: 'Tech Lead', description: 'Roadmap, integraciones, audit' },
]

export interface NavItem {
  id: string
  label: string
  to: string
  badge?: string
  flagship?: boolean
}

export interface NavSection {
  id: string
  label: string
  items: NavItem[]
}

/** Returns sidebar sections filtered by role. */
export function navForRole(role: RoleId): NavSection[] {
  const overview: NavSection = {
    id: 'overview',
    label: 'Vista general',
    items: [
      { id: 'dashboard', label: 'Dashboard', to: '/' },
      { id: 'automations', label: 'Automatizaciones', to: '/automations', badge: '12' },
      { id: 'integrations', label: 'Integraciones', to: '/integrations' },
    ],
  }
  const partners: NavSection = {
    id: 'partners',
    label: 'Partners · Showrooms',
    items: [
      { id: 'partners-list', label: 'Todos los partners', to: '/partners', badge: '47' },
      { id: 'flagship', label: 'Flagship Miami', to: '/flagship', badge: 'OWN', flagship: true },
    ],
  }
  const depts: NavSection = {
    id: 'depts',
    label: 'Departamentos',
    items: [
      { id: 'ventas', label: 'Ventas', to: '/dept/ventas' },
      { id: 'accounting', label: 'Accounting', to: '/dept/accounting' },
      { id: 'operations', label: 'Operations', to: '/dept/operations' },
      { id: 'supply-chain', label: 'Supply Chain', to: '/dept/supply-chain' },
      { id: 'marketing', label: 'Marketing', to: '/dept/marketing' },
      { id: 'postventa', label: 'Postventa', to: '/dept/postventa' },
      { id: 'tecnologia', label: 'Tecnología', to: '/dept/tecnologia' },
    ],
  }

  switch (role) {
    case 'ceo':
      return [overview, partners, depts]
    case 'director_comercial':
      return [
        overview,
        partners,
        { ...depts, items: depts.items.filter((i) => i.id === 'ventas') },
      ]
    case 'comercial':
      return [
        { ...overview, items: overview.items.filter((i) => i.id === 'dashboard') },
        { ...partners, items: partners.items.filter((i) => i.id !== 'flagship' || true) },
      ]
    case 'director_accounting':
      return [
        overview,
        { ...depts, items: depts.items.filter((i) => i.id === 'accounting') },
      ]
    case 'operations_manager':
      return [
        { ...overview, items: overview.items.filter((i) => i.id === 'dashboard') },
        { ...depts, items: depts.items.filter((i) => i.id === 'operations' || i.id === 'supply-chain') },
      ]
    case 'marketing_lead':
      return [
        { ...overview, items: overview.items.filter((i) => i.id === 'dashboard') },
        { ...partners, items: partners.items.filter((i) => i.id === 'partners-list') },
        { ...depts, items: depts.items.filter((i) => i.id === 'marketing') },
      ]
    case 'customer_success':
      return [
        { ...overview, items: overview.items.filter((i) => i.id === 'dashboard') },
        { ...partners, items: partners.items.filter((i) => i.id === 'partners-list') },
        { ...depts, items: depts.items.filter((i) => i.id === 'postventa') },
      ]
    case 'tech_lead':
      return [overview, partners, depts]
  }
}
