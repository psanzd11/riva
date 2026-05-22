import { z } from 'zod'

export const sede = z.enum(['es', 'us', 'global'])
export type Sede = z.infer<typeof sede>

export const roleId = z.enum([
  'ceo',
  'director_comercial',
  'comercial',
  'director_accounting',
  'operations_manager',
  'marketing_lead',
  'customer_success',
  'tech_lead',
])
export type RoleId = z.infer<typeof roleId>

const isoDate = z.string().min(8)

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: roleId,
  sede,
  avatarColor: z.string(),
  active: z.boolean(),
  /** Department membership for "Equipo" sub-views. */
  dept: z.enum([
    'ventas', 'accounting', 'operations', 'supply-chain', 'marketing', 'postventa', 'tecnologia', 'leadership',
  ]),
  /** Free-form title for dept Equipo display, e.g. "Accountant ES". */
  deptRole: z.string().optional(),
})
export type User = z.infer<typeof userSchema>

export const partnerSchema = z.object({
  id: z.string(),
  name: z.string(),
  sede,
  type: z.enum(['corner', 'espacio', 'flagship']),
  m2: z.number(),
  salesYtd: z.number(),
  currency: z.enum(['EUR', 'USD']),
  lastActivity: isoDate,
  status: z.enum(['active', 'inactive_7d', 'inactive_3d', 'below_target']),
  assignedTo: z.string(),
  commissionPct: z.number(),
  address: z.string(),
})
export type Partner = z.infer<typeof partnerSchema>

export const dealSchema = z.object({
  id: z.string(),
  clientName: z.string(),
  partnerId: z.string(),
  ownerId: z.string(),
  stage: z.enum(['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost']),
  amount: z.number(),
  currency: z.enum(['EUR', 'USD']),
  createdAt: isoDate,
  expectedCloseDate: isoDate,
  probability: z.number(),
  brand: z.enum(['riva_spain', 'tierra', 'flagship']),
  notes: z.string().optional(),
})
export type Deal = z.infer<typeof dealSchema>

export const activitySchema = z.object({
  id: z.string(),
  dealId: z.string().optional(),
  partnerId: z.string().optional(),
  type: z.enum(['call', 'email', 'visit', 'note']),
  userId: z.string(),
  at: isoDate,
  content: z.string(),
})
export type Activity = z.infer<typeof activitySchema>

export const invoiceSchema = z.object({
  id: z.string(),
  number: z.string(),
  partnerId: z.string(),
  dealId: z.string().optional(),
  amount: z.number(),
  currency: z.enum(['EUR', 'USD']),
  issuedAt: isoDate,
  dueAt: isoDate,
  status: z.enum(['draft', 'sent', 'partial', 'paid', 'overdue']),
  agingBucket: z.enum(['current', '0_30', '31_60', '61_90', '90_plus']),
  paymentLink: z.string().optional(),
  qbExternalId: z.string().optional(),
  /** RIVA payment flow: deposit 60% on order, final 40% before warehouse ship. */
  kind: z.enum(['deposit', 'final', 'full']),
  /** For 'final' kind, references the deposit invoice. */
  parentInvoiceId: z.string().optional(),
  /** Total order value (deposit + final amounts equal this). */
  orderTotal: z.number(),
})
export type Invoice = z.infer<typeof invoiceSchema>

export const paymentSchema = z.object({
  id: z.string(),
  invoiceId: z.string(),
  amount: z.number(),
  at: isoDate,
  method: z.enum(['stripe', 'square', 'bank']),
  externalId: z.string().optional(),
})
export type Payment = z.infer<typeof paymentSchema>

export const installationSchema = z.object({
  id: z.string(),
  dealId: z.string(),
  project: z.string(),
  startAt: isoDate,
  endAt: isoDate,
  crewId: z.string(),
  sede,
  status: z.enum(['scheduled', 'in_progress', 'done', 'incident']),
  m2: z.number(),
  damageReportId: z.string().optional(),
})
export type Installation = z.infer<typeof installationSchema>

export const crewSchema = z.object({
  id: z.string(),
  name: z.string(),
  sede,
  members: z.number(),
  specialty: z.string(),
  capacity: z.number(),
})
export type Crew = z.infer<typeof crewSchema>

export const ticketSchema = z.object({
  id: z.string(),
  type: z.string(),
  partnerId: z.string().optional(),
  dealId: z.string().optional(),
  clientName: z.string(),
  assigneeId: z.string().optional(),
  priority: z.enum(['low', 'med', 'high']),
  status: z.enum(['open', 'in_progress', 'closed']),
  description: z.string(),
  slaHours: z.number(),
  createdAt: isoDate,
  closedAt: isoDate.optional(),
  /** 'customer' = postventa-facing, 'internal' = Hub/CRM/IT issues from employees. */
  category: z.enum(['customer', 'internal']),
  /** For internal tickets: requester is a user. */
  requesterId: z.string().optional(),
})
export type Ticket = z.infer<typeof ticketSchema>

export const reviewSchema = z.object({
  id: z.string(),
  partnerId: z.string().optional(),
  clientName: z.string(),
  score: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  text: z.string(),
  source: z.string(),
  at: isoDate,
})
export type Review = z.infer<typeof reviewSchema>

export const skuSchema = z.object({
  id: z.string(),
  name: z.string(),
  collection: z.string(),
  finish: z.string(),
  warehouse: z.enum(['es', 'us']),
  stockM2: z.number(),
  thresholdM2: z.number(),
  supplierId: z.string(),
  leadTimeDays: z.number(),
  demandLast90: z.number(),
  /** RIVA wood grade: premium = top-tier (Cove, Vedetta) · regular = standard line. */
  grade: z.enum(['premium', 'regular']),
  /** Wood type / species (oak, ash, walnut...) - distinct from collection. */
  woodType: z.string(),
  /** Price per m² in EUR. Premium ~30% above regular. */
  pricePerM2: z.number(),
})
export type Sku = z.infer<typeof skuSchema>

export const purchaseOrderSchema = z.object({
  id: z.string(),
  number: z.string(),
  skuId: z.string(),
  quantity: z.number(),
  supplierId: z.string(),
  status: z.enum(['factory', 'transit', 'customs', 'warehouse', 'available']),
  etaAt: isoDate,
  totalCost: z.number(),
  currency: z.enum(['EUR', 'USD']),
})
export type PurchaseOrder = z.infer<typeof purchaseOrderSchema>

export const supplierSchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
  leadTimeAvg: z.number(),
})
export type Supplier = z.infer<typeof supplierSchema>

export const campaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  channel: z.string(),
  periodStart: isoDate,
  periodEnd: isoDate,
  spend: z.number(),
  currency: z.enum(['EUR', 'USD']),
  leadsCount: z.number(),
  conversionRate: z.number(),
  status: z.enum(['active', 'upcoming', 'closed']),
})
export type Campaign = z.infer<typeof campaignSchema>

export const leadSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  sede,
  channel: z.string(),
  score: z.number(),
  stage: z.enum(['new', 'mql', 'sql', 'opportunity', 'customer']),
  ownerId: z.string().optional(),
  createdAt: isoDate,
})
export type Lead = z.infer<typeof leadSchema>

export const automationRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  trigger: z.object({ event: z.string() }),
  conditions: z.array(
    z.object({
      field: z.string(),
      op: z.enum(['eq', 'lt', 'gt', 'contains']),
      value: z.unknown(),
    }),
  ),
  actions: z.array(
    z.object({
      type: z.enum([
        'create_notification',
        'create_invoice',
        'create_ticket',
        'assign_user',
        'send_email_mock',
        'create_purchase_order',
        'log',
      ]),
      params: z.record(z.unknown()),
    }),
  ),
  active: z.boolean(),
  runs: z.number(),
  lastRunAt: isoDate.optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
})
export type AutomationRule = z.infer<typeof automationRuleSchema>

export const integrationSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  status: z.enum(['connected', 'disconnected', 'warn']),
  statusLabel: z.string(),
  latencyMs: z.number(),
  lastSync: isoDate,
  config: z.record(z.unknown()),
})
export type Integration = z.infer<typeof integrationSchema>

export const notificationSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  role: roleId.optional(),
  type: z.string(),
  source: z.string(),
  message: z.string(),
  relatedEntity: z.string().optional(),
  read: z.boolean(),
  createdAt: isoDate,
})
export type Notification = z.infer<typeof notificationSchema>

export const auditLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  action: z.enum(['create', 'update', 'remove']),
  entity: z.string(),
  entityId: z.string(),
  diff: z.record(z.unknown()).optional(),
  at: isoDate,
})
export type AuditLog = z.infer<typeof auditLogSchema>

export interface SeedShape {
  users: User[]
  partners: Partner[]
  deals: Deal[]
  activities: Activity[]
  invoices: Invoice[]
  payments: Payment[]
  installations: Installation[]
  crews: Crew[]
  tickets: Ticket[]
  reviews: Review[]
  skus: Sku[]
  purchaseOrders: PurchaseOrder[]
  suppliers: Supplier[]
  campaigns: Campaign[]
  leads: Lead[]
  automationRules: AutomationRule[]
  integrations: Integration[]
  notifications: Notification[]
  auditLog: AuditLog[]
}
