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
  badge?: string
  flagship?: boolean
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
    { id: 'ventas-tpv', label: 'TPV · Pedido', to: '/dept/ventas/tpv', badge: 'NEW', flagship: true },
    { id: 'ventas-catalogo', label: 'Catálogo', to: '/dept/ventas/catalogo' },
    { id: 'ventas-agenda', label: 'Agenda', to: '/dept/ventas/agenda' },
    { id: 'ventas-leads', label: 'Leads', to: '/dept/ventas/leads' },
    { id: 'ventas-comisiones', label: 'Comisiones', to: '/dept/ventas/comisiones' },
    { id: 'ventas-forecast', label: 'Forecast', to: '/dept/ventas/forecast' },
    { id: 'ventas-equipo', label: 'Equipo', to: '/dept/ventas/equipo' },
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

/**
 * Builds a dept nav item. When `only` is passed, the subItems are restricted to
 * (and ordered by) those ids — this is how each role sees just the subsections it
 * actually uses day-to-day. The landing route (`to`) is the first visible subitem.
 */
function deptItem(id: string, label: string, only?: string[]): NavItem {
  const all = DEPT_SUBNAV[id]
  const subItems = only
    ? only
        .map((sid) => all.find((s) => s.id === sid))
        .filter((s): s is NavSubItem => Boolean(s))
    : all
  return {
    id,
    label,
    to: subItems[0]?.to ?? all[0].to,
    subItems,
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

  // Comercial works partner-by-partner: their own book + their daily tools.
  const onlyPartnersList = (label = 'Todos los partners') => ({
    ...partners,
    items: partners.items
      .filter((i) => i.id === 'partners-list')
      .map((i) => ({ ...i, label, badge: undefined })),
  })

  switch (role) {
    case 'ceo':
      return [overview, partners, depts]
    case 'tech_lead':
      return [overview, partners, depts]

    case 'director_comercial':
      // Todo Ventas + stock de Supply Chain (lectura) para comprometer fechas/cerrar deals.
      return [
        overview,
        partners,
        {
          ...depts,
          items: [
            deptItem('ventas', 'Ventas'),
            deptItem('supply-chain', 'Supply Chain', ['sc-inventario']),
          ],
        },
      ]

    case 'comercial':
      // Su día a día: pipeline propio, TPV, agenda de visitas, catálogo, leads, comisiones, forecast.
      return [
        { ...overview, items: overview.items.filter((i) => i.id === 'dashboard') },
        {
          ...partners,
          items: [
            { id: 'partners-list', label: 'Mis partners', to: '/partners' },
            ...partners.items.filter((i) => i.id === 'flagship'),
          ],
        },
        {
          id: 'depts',
          label: 'Mi trabajo',
          items: [
            deptItem('ventas', 'Ventas', [
              'ventas-pipeline',
              'ventas-tpv',
              'ventas-agenda',
              'ventas-catalogo',
              'ventas-leads',
              'ventas-comisiones',
              'ventas-forecast',
            ]),
          ],
        },
      ]

    case 'director_accounting':
      // Accounting completo + visibilidad de pipeline/forecast para anticipar cobros.
      return [
        overview,
        onlyPartnersList(),
        {
          ...depts,
          items: [
            deptItem('accounting', 'Accounting'),
            deptItem('ventas', 'Ventas', ['ventas-pipeline', 'ventas-forecast']),
          ],
        },
      ]

    case 'operations_manager':
      return [
        { ...overview, items: overview.items.filter((i) => i.id === 'dashboard' || i.id === 'automations') },
        {
          ...depts,
          items: [deptItem('operations', 'Operations'), deptItem('supply-chain', 'Supply Chain')],
        },
      ]

    case 'marketing_lead':
      // Marketing completo + los leads que entrega a Ventas (handoff).
      return [
        { ...overview, items: overview.items.filter((i) => i.id === 'dashboard' || i.id === 'automations') },
        onlyPartnersList(),
        {
          ...depts,
          items: [deptItem('marketing', 'Marketing'), deptItem('ventas', 'Ventas', ['ventas-leads'])],
        },
      ]

    case 'customer_success':
      // Postventa completo + actividad comercial del cliente para tener contexto.
      return [
        { ...overview, items: overview.items.filter((i) => i.id === 'dashboard') },
        onlyPartnersList(),
        {
          ...depts,
          items: [deptItem('postventa', 'Postventa'), deptItem('ventas', 'Ventas', ['ventas-actividad'])],
        },
      ]
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
    '/automations/request': 'Solicitar automatización',
    '/integrations': 'Integraciones',
    '/partners': 'Partners',
    '/flagship': 'Flagship Miami',
  }
  return { section: top[pathname] ?? 'Dashboard' }
}
