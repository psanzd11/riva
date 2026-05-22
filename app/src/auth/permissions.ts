import type { RoleId } from '../data/schema'

/** Format: `<entity>:<action>`. Read defaults to true if not specified. */
type Permission = string

const PERMISSIONS: Record<RoleId, ReadonlySet<Permission>> = {
  ceo: new Set([
    '*:read',
    'partner:create', 'partner:update',
    'deal:read', 'invoice:read',
  ]),
  director_comercial: new Set([
    '*:read',
    'partner:create', 'partner:update', 'partner:read_all',
    'deal:create', 'deal:update', 'deal:update_stage', 'deal:remove',
    'lead:create', 'lead:assign',
    'activity:create',
  ]),
  comercial: new Set([
    'partner:read_own',
    'deal:read_own', 'deal:create', 'deal:update_own', 'deal:update_stage_own',
    'lead:read_own', 'lead:create',
    'activity:create',
  ]),
  director_accounting: new Set([
    '*:read',
    'invoice:create', 'invoice:update', 'invoice:remove',
    'payment:create', 'payment:update',
    'automation:read', 'automation:update',
  ]),
  operations_manager: new Set([
    '*:read',
    'installation:create', 'installation:update', 'installation:remove',
    'crew:create', 'crew:update',
    'purchaseOrder:create', 'purchaseOrder:update',
    'sku:update',
  ]),
  marketing_lead: new Set([
    'partner:read_all',
    'campaign:create', 'campaign:update', 'campaign:remove',
    'lead:create', 'lead:update', 'lead:remove',
  ]),
  customer_success: new Set([
    'partner:read_all',
    'ticket:create', 'ticket:update', 'ticket:close',
    'review:create', 'review:update',
  ]),
  tech_lead: new Set([
    '*:read', '*:create', '*:update',
    'automation:read', 'automation:create', 'automation:update', 'automation:remove',
    'integration:update',
    'auditLog:read',
  ]),
}

export function can(role: RoleId, entity: string, action: string, opts?: { isOwner?: boolean }): boolean {
  const perms = PERMISSIONS[role]
  if (!perms) return false
  // read is implicit for many
  if (action === 'read') {
    if (perms.has(`*:read`)) return true
    if (perms.has(`${entity}:read`)) return true
    if (perms.has(`${entity}:read_all`)) return true
    if (perms.has(`${entity}:read_own`) && opts?.isOwner) return true
    return false
  }
  if (perms.has(`*:${action}`)) return true
  if (perms.has(`${entity}:${action}`)) return true
  if (perms.has(`${entity}:${action}_own`) && opts?.isOwner) return true
  return false
}
