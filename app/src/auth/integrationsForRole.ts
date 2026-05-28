import type { RoleId } from '../data/schema'

/**
 * Which integrations each role uses day-to-day. Keyed by integration `id` from seed.
 * `'all'` means full admin/read visibility (CEO, Tech Lead).
 * Used by IntegrationsPage to surface each role's relevant stack first.
 */
export const INTEGRATIONS_FOR_ROLE: Record<RoleId, string[] | 'all'> = {
  ceo: 'all',
  tech_lead: 'all',
  // Comercial: cobra en TPV (Stripe/Square), agenda en Google, CRM interno.
  comercial: ['itg_stripe', 'itg_square', 'itg_gws', 'itg_crm'],
  // Director comercial: CRM + comunicación + visibilidad de cobros.
  director_comercial: ['itg_crm', 'itg_slack', 'itg_stripe', 'itg_gws'],
  // Accounting: facturación + pasarelas de pago.
  director_accounting: ['itg_qb', 'itg_stripe', 'itg_square', 'itg_paypal'],
  // Operations: agenda/coordinación.
  operations_manager: ['itg_gws', 'itg_slack', 'itg_docusign'],
  // Marketing: productividad + diseño + comunicación.
  marketing_lead: ['itg_gws', 'itg_slack', 'itg_canva'],
  // Customer Success: comunicación + agenda.
  customer_success: ['itg_gws', 'itg_slack'],
}

/** Returns the set of relevant integration ids for a role, or null if it sees all. */
export function relevantIntegrationIds(role: RoleId): Set<string> | null {
  const v = INTEGRATIONS_FOR_ROLE[role]
  return v === 'all' ? null : new Set(v)
}
