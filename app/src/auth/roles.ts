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

export interface NavSubItem {
  id: string
  label: string
  to: string
}

export interface NavItem {
  id: string
  label: string
  to: string
  badge?: string
  flagship?: boolean
  subItems?: NavSubItem[]
}

export interface NavSection {
  id: string
  label: string
  items: NavItem[]
}

// Subsecciones por departamento — orden importa, primera es la "Resumen"
const DEPT_SUBNAV: Record<string, NavSubItem[]> = {
  ventas: [
    { id: 'ventas-resumen', label: 'Resumen', to: '/dept/ventas' },
    { id: 'ventas-pipeline', label: 'Pipeline', to: '/dept/ventas/pipeline' },
    { id: 'ventas-leads', label: 'Leads', to: '/dept/ventas/leads' },
    { id: 'ventas-equipo', label: 'Equipo', to: '/dept/ventas/equipo' },
    { id: 'ventas-forecast', label: 'Forecast', to: '/dept/ventas/forecast' },
    { id: 'ventas-actividad', label: 'Actividad', to: '/dept/ventas/actividad' },
  ],
  accounting: [
    { id: 'acc-resumen', label: 'Resumen', to: '/dept/accounting' },
    { id: 'acc-facturas', label: 'Facturas', to: '/dept/accounting/facturas' },
    { id: 'acc-aging', label: 'Aging & cobros', to: '/dept/accounting/aging' },
    { id: 'acc-pl', label: 'P&L', to: '/dept/accounting/pl' },
    { id: 'acc-cierre', label: 'Cierre mes', to: '/dept/accounting/cierre' },
    { id: 'acc-equipo', label: 'Equipo', to: '/dept/accounting/equipo' },
  ],
  operations: [
    { id: 'ops-resumen', label: 'Resumen', to: '/dept/operations' },
    { id: 'ops-instalaciones', label: 'Instalaciones', to: '/dept/operations/instalaciones' },
    { id: 'ops-equipos', label: 'Crews', to: '/dept/operations/equipos' },
    { id: 'ops-sla', label: 'SLA & capacidad', to: '/dept/operations/sla' },
    { id: 'ops-equipo', label: 'Equipo', to: '/dept/operations/equipo' },
  ],
  'supply-chain': [
    { id: 'sc-resumen', label: 'Resumen', to: '/dept/supply-chain' },
    { id: 'sc-inventario', label: 'Inventario', to: '/dept/supply-chain/inventario' },
    { id: 'sc-oc', label: 'Pipeline OC', to: '/dept/supply-chain/oc' },
    { id: 'sc-proveedores', label: 'Proveedores', to: '/dept/supply-chain/proveedores' },
    { id: 'sc-equipo', label: 'Equipo', to: '/dept/supply-chain/equipo' },
  ],
  marketing: [
    { id: 'mkt-resumen', label: 'Resumen', to: '/dept/marketing' },
    { id: 'mkt-campanas', label: 'Campañas', to: '/dept/marketing/campanas' },
    { id: 'mkt-embudo', label: 'Embudo & ratios', to: '/dept/marketing/embudo' },
    { id: 'mkt-equipo', label: 'Equipo', to: '/dept/marketing/equipo' },
  ],
  postventa: [
    { id: 'pv-resumen', label: 'Resumen', to: '/dept/postventa' },
    { id: 'pv-tickets', label: 'Tickets', to: '/dept/postventa/tickets' },
    { id: 'pv-resenas', label: 'Reseñas', to: '/dept/postventa/resenas' },
    { id: 'pv-nps', label: 'NPS & causas', to: '/dept/postventa/nps' },
    { id: 'pv-equipo', label: 'Equipo', to: '/dept/postventa/equipo' },
  ],
  tecnologia: [
    { id: 'tech-resumen', label: 'Resumen', to: '/dept/tecnologia' },
    { id: 'tech-roadmap', label: 'Roadmap', to: '/dept/tecnologia/roadmap' },
    { id: 'tech-integraciones', label: 'Integraciones', to: '/dept/tecnologia/integraciones' },
    { id: 'tech-internal', label: 'Tickets internos', to: '/dept/tecnologia/internal' },
    { id: 'tech-audit', label: 'Audit log', to: '/dept/tecnologia/audit' },
    { id: 'tech-equipo', label: 'Equipo', to: '/dept/tecnologia/equipo' },
  ],
}

function deptItem(id: string, label: string): NavItem {
  return {
    id,
    label,
    to: DEPT_SUBNAV[id][0].to,
    subItems: DEPT_SUBNAV[id],
  }
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
      deptItem('ventas', 'Ventas'),
      deptItem('accounting', 'Accounting'),
      deptItem('operations', 'Operations'),
      deptItem('supply-chain', 'Supply Chain'),
      deptItem('marketing', 'Marketing'),
      deptItem('postventa', 'Postventa'),
      deptItem('tecnologia', 'Tecnología'),
    ],
  }

  switch (role) {
    case 'ceo':
      return [overview, partners, depts]
    case 'director_comercial':
      return [overview, partners, { ...depts, items: depts.items.filter((i) => i.id === 'ventas') }]
    case 'comercial':
      return [{ ...overview, items: overview.items.filter((i) => i.id === 'dashboard') }, partners]
    case 'director_accounting':
      return [overview, { ...depts, items: depts.items.filter((i) => i.id === 'accounting') }]
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

/** Map a route pathname to a human-friendly label for breadcrumbs / topbar. */
export function labelForRoute(pathname: string): { dept?: string; section: string } {
  // Look in all subnavs
  for (const [deptId, subs] of Object.entries(DEPT_SUBNAV)) {
    const exact = subs.find((s) => s.to === pathname)
    if (exact) {
      const deptLabel = ({
        ventas: 'Ventas',
        accounting: 'Accounting',
        operations: 'Operations',
        'supply-chain': 'Supply Chain',
        marketing: 'Marketing',
        postventa: 'Postventa',
        tecnologia: 'Tecnología',
      } as Record<string, string>)[deptId]
      return { dept: deptLabel, section: exact.label }
    }
  }
  const top: Record<string, string> = {
    '/': 'Dashboard',
    '/automations': 'Automatizaciones',
    '/integrations': 'Integraciones',
    '/partners': 'Partners',
    '/flagship': 'Flagship Miami',
  }
  return { section: top[pathname] ?? 'Dashboard' }
}
