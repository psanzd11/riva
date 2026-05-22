// Generates src/data/seed.json with data coherent with hub-demo.html numbers
// + RIVA-specific business model:
//   - Invoices in deposit (60%) + final (40%) flow
//   - SKUs with premium/regular grade and wood type
//   - Per-department staff with deptRole titles
//   - Internal tickets (employee issues) alongside customer tickets

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../src/data/seed.json')

let _s = 1
const rand = () => {
  _s = (_s * 9301 + 49297) % 233280
  return _s / 233280
}
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const int = (min, max) => Math.floor(min + rand() * (max - min + 1))

const TODAY = '2026-05-22'
const isoDaysAgo = (d) => {
  const dt = new Date(TODAY)
  dt.setDate(dt.getDate() - d)
  return dt.toISOString()
}
const isoDaysAhead = (d) => isoDaysAgo(-d)

// ============ USERS ============
// Each user has: id, name, email, role (one of 8 canonical), sede, avatarColor,
// active, dept, deptRole.
const users = [
  // Leadership
  { id: 'usr_ps', name: 'Pablo Sanz', email: 'ps@riva.com', role: 'ceo', sede: 'global', avatarColor: 'oak-mid', active: true, dept: 'leadership', deptRole: 'CEO' },
  { id: 'usr_dc', name: 'Inés Vergara', email: 'iv@riva.com', role: 'director_comercial', sede: 'global', avatarColor: 'cove', active: true, dept: 'ventas', deptRole: 'Directora comercial' },
  { id: 'usr_dacc', name: 'Tomás Riera', email: 'tr@riva.com', role: 'director_accounting', sede: 'global', avatarColor: 'oak-mid', active: true, dept: 'accounting', deptRole: 'Director Accounting' },
  { id: 'usr_ops', name: 'Mateo Lara', email: 'ml@riva.com', role: 'operations_manager', sede: 'global', avatarColor: 'sage', active: true, dept: 'operations', deptRole: 'Operations Manager' },
  { id: 'usr_mkt', name: 'Helena Costa', email: 'hc@riva.com', role: 'marketing_lead', sede: 'global', avatarColor: 'cove-mid', active: true, dept: 'marketing', deptRole: 'Marketing Lead' },
  { id: 'usr_cs', name: 'Sara Vidal', email: 'sv@riva.com', role: 'customer_success', sede: 'global', avatarColor: 'oak-mid', active: true, dept: 'postventa', deptRole: 'Head of Customer Success' },
  { id: 'usr_tech', name: 'Andrés Bravo', email: 'ab@riva.com', role: 'tech_lead', sede: 'global', avatarColor: 'cove-dark', active: true, dept: 'tecnologia', deptRole: 'Tech Lead' },

  // Ventas team (comerciales)
  { id: 'usr_cm', name: 'Carla Méndez', email: 'cm@riva.com', role: 'comercial', sede: 'es', avatarColor: 'cove', active: true, dept: 'ventas', deptRole: 'Senior · España' },
  { id: 'usr_jr', name: 'Jake Roberts', email: 'jr@riva.com', role: 'comercial', sede: 'us', avatarColor: 'oak-mid', active: true, dept: 'ventas', deptRole: 'Senior · USA East' },
  { id: 'usr_da', name: 'Diego Arrieta', email: 'da@riva.com', role: 'comercial', sede: 'us', avatarColor: 'sage', active: true, dept: 'ventas', deptRole: 'Mid · USA East + Flagship' },
  { id: 'usr_at', name: 'Ashley Tan', email: 'at@riva.com', role: 'comercial', sede: 'us', avatarColor: 'cove-mid', active: true, dept: 'ventas', deptRole: 'Mid · USA West' },
  { id: 'usr_lp', name: 'Laura Pinto', email: 'lp@riva.com', role: 'comercial', sede: 'es', avatarColor: 'cove-dark', active: true, dept: 'ventas', deptRole: 'Junior · España' },
  { id: 'usr_mo', name: 'Marc Olivier', email: 'mo@riva.com', role: 'comercial', sede: 'us', avatarColor: 'cove-deepest', active: true, dept: 'ventas', deptRole: 'Junior · USA' },

  // Accounting team
  { id: 'usr_acc_1', name: 'Núria Bellver', email: 'nb@riva.com', role: 'director_accounting', sede: 'es', avatarColor: 'cove', active: true, dept: 'accounting', deptRole: 'Senior Accountant ES' },
  { id: 'usr_acc_2', name: 'Marcos Téllez', email: 'mt@riva.com', role: 'director_accounting', sede: 'us', avatarColor: 'oak-mid', active: true, dept: 'accounting', deptRole: 'Accountant USA' },
  { id: 'usr_acc_3', name: 'Pol Aragón', email: 'pa@riva.com', role: 'director_accounting', sede: 'global', avatarColor: 'sage', active: true, dept: 'accounting', deptRole: 'Collections specialist' },

  // Operations team
  { id: 'usr_ops_1', name: 'Eric Maldonado', email: 'em@riva.com', role: 'operations_manager', sede: 'es', avatarColor: 'cove', active: true, dept: 'operations', deptRole: 'Logistics ES' },
  { id: 'usr_ops_2', name: 'Tara Beckett', email: 'tb@riva.com', role: 'operations_manager', sede: 'us', avatarColor: 'oak-mid', active: true, dept: 'operations', deptRole: 'Install coord. USA' },
  { id: 'usr_ops_3', name: 'Yago Pueyo', email: 'yp@riva.com', role: 'operations_manager', sede: 'es', avatarColor: 'sage', active: true, dept: 'operations', deptRole: 'Quality assurance' },

  // Supply Chain team
  { id: 'usr_sc_1', name: 'Mireia Sallés', email: 'ms@riva.com', role: 'operations_manager', sede: 'es', avatarColor: 'cove-mid', active: true, dept: 'supply-chain', deptRole: 'Procurement lead' },
  { id: 'usr_sc_2', name: 'Brent Hollis', email: 'bh@riva.com', role: 'operations_manager', sede: 'us', avatarColor: 'oak-mid', active: true, dept: 'supply-chain', deptRole: 'Warehouse manager USA' },
  { id: 'usr_sc_3', name: 'Carmen Olaza', email: 'co@riva.com', role: 'operations_manager', sede: 'es', avatarColor: 'cove', active: true, dept: 'supply-chain', deptRole: 'Inventory analyst' },

  // Marketing team
  { id: 'usr_mkt_1', name: 'Vega Romero', email: 'vr@riva.com', role: 'marketing_lead', sede: 'es', avatarColor: 'cove', active: true, dept: 'marketing', deptRole: 'Content designer' },
  { id: 'usr_mkt_2', name: 'Sebastián Aguirre', email: 'sa@riva.com', role: 'marketing_lead', sede: 'us', avatarColor: 'oak-mid', active: true, dept: 'marketing', deptRole: 'Paid media · USA' },
  { id: 'usr_mkt_3', name: 'Aina Costa', email: 'ac@riva.com', role: 'marketing_lead', sede: 'es', avatarColor: 'sage', active: true, dept: 'marketing', deptRole: 'PR & partnerships' },

  // Postventa team
  { id: 'usr_pv_1', name: 'Lucas Marín', email: 'lm@riva.com', role: 'customer_success', sede: 'es', avatarColor: 'cove', active: true, dept: 'postventa', deptRole: 'CS agent ES' },
  { id: 'usr_pv_2', name: 'Priya Shankar', email: 'ps2@riva.com', role: 'customer_success', sede: 'us', avatarColor: 'oak-mid', active: true, dept: 'postventa', deptRole: 'CS agent USA' },
  { id: 'usr_pv_3', name: 'Roi Cabaleiro', email: 'rc@riva.com', role: 'customer_success', sede: 'global', avatarColor: 'cove-mid', active: true, dept: 'postventa', deptRole: 'Warranty specialist' },

  // Tecnología team
  { id: 'usr_tech_1', name: 'Eva Wang', email: 'ew@riva.com', role: 'tech_lead', sede: 'global', avatarColor: 'cove', active: true, dept: 'tecnologia', deptRole: 'Senior dev · CRM' },
  { id: 'usr_tech_2', name: 'Mark Dyson', email: 'md@riva.com', role: 'tech_lead', sede: 'us', avatarColor: 'oak-mid', active: true, dept: 'tecnologia', deptRole: 'DevOps + integraciones' },
  { id: 'usr_tech_3', name: 'Sofía Caballero', email: 'sc@riva.com', role: 'tech_lead', sede: 'es', avatarColor: 'sage', active: true, dept: 'tecnologia', deptRole: 'Data + analytics' },
]
const COMERCIALES = ['usr_cm', 'usr_jr', 'usr_da', 'usr_at', 'usr_lp', 'usr_mo']

// ============ SUPPLIERS ============
const suppliers = [
  { id: 'sup_cordeiro', name: 'Cordeiro Wood', country: 'PT', leadTimeAvg: 22 },
  { id: 'sup_vilanova', name: 'Vilanova Hardwoods', country: 'ES', leadTimeAvg: 26 },
  { id: 'sup_tabuyo', name: 'Tabuyo Sawmill', country: 'ES', leadTimeAvg: 28 },
  { id: 'sup_sevillana', name: 'Sevillana Floors', country: 'ES', leadTimeAvg: 32 },
  { id: 'sup_adriatic', name: 'Adriatic Engineered', country: 'HR', leadTimeAvg: 38 },
  { id: 'sup_usoak', name: 'US-Oak Co.', country: 'US', leadTimeAvg: 42 },
]

// ============ CREWS ============
const crews = [
  { id: 'crw_mad_a', name: 'Crew Madrid A', sede: 'es', members: 3, specialty: 'wide plank', capacity: 8 },
  { id: 'crw_mad_b', name: 'Crew Madrid B', sede: 'es', members: 3, specialty: 'herringbone', capacity: 7 },
  { id: 'crw_bcn', name: 'Crew Barcelona', sede: 'es', members: 2, specialty: 'chevron', capacity: 5 },
  { id: 'crw_ny', name: 'Crew NY East', sede: 'us', members: 4, specialty: 'wide plank', capacity: 6 },
  { id: 'crw_mia', name: 'Crew Miami', sede: 'us', members: 3, specialty: 'flagship', capacity: 4 },
]

// ============ PARTNERS ============
const PARTNER_DATA = [
  { id: 'prt_flagship_mia', name: 'Flagship Miami', sede: 'es', type: 'flagship', m2: 320, salesYtd: 384200, currency: 'EUR', status: 'active', assignedTo: 'usr_da', commissionPct: 0, address: 'Design District, Miami', lastActivityDays: 0 },
  { id: 'prt_studio_rota', name: 'Studio Rota', sede: 'es', type: 'corner', m2: 18, salesYtd: 142800, currency: 'EUR', status: 'active', assignedTo: 'usr_cm', commissionPct: 12, address: 'Barcelona', lastActivityDays: 0 },
  { id: 'prt_casa_mendel', name: 'Casa Mendel', sede: 'es', type: 'corner', m2: 12, salesYtd: 96420, currency: 'EUR', status: 'active', assignedTo: 'usr_cm', commissionPct: 12, address: 'Valencia', lastActivityDays: 1 },
  { id: 'prt_duchateau_bil', name: 'DuChâteau Bilbao', sede: 'es', type: 'corner', m2: 10, salesYtd: 48220, currency: 'EUR', status: 'inactive_3d', assignedTo: 'usr_lp', commissionPct: 12, address: 'Bilbao', lastActivityDays: 3 },
  { id: 'prt_hakwood_sev', name: 'Hakwood Sevilla', sede: 'es', type: 'corner', m2: 8, salesYtd: 32180, currency: 'EUR', status: 'below_target', assignedTo: 'usr_lp', commissionPct: 12, address: 'Sevilla', lastActivityDays: 5 },
  { id: 'prt_arenal', name: 'Arenal Showroom', sede: 'es', type: 'corner', m2: 14, salesYtd: 78400, currency: 'EUR', status: 'active', assignedTo: 'usr_cm', commissionPct: 12, address: 'Madrid', lastActivityDays: 0 },
  { id: 'prt_atelier_mlg', name: 'Atelier Málaga', sede: 'es', type: 'corner', m2: 11, salesYtd: 54200, currency: 'EUR', status: 'active', assignedTo: 'usr_lp', commissionPct: 12, address: 'Málaga', lastActivityDays: 1 },
  { id: 'prt_ebony_ny', name: 'Ebony & Oak NY', sede: 'us', type: 'corner', m2: 22, salesYtd: 198400, currency: 'USD', status: 'active', assignedTo: 'usr_jr', commissionPct: 14, address: 'Manhattan, NY', lastActivityDays: 0 },
  { id: 'prt_floorhaus_mia', name: 'FloorHaus Miami', sede: 'us', type: 'espacio', m2: 30, salesYtd: 162100, currency: 'USD', status: 'active', assignedTo: 'usr_da', commissionPct: 14, address: 'Wynwood, Miami', lastActivityDays: 0 },
  { id: 'prt_mcgee_slc', name: 'McGee Showroom', sede: 'us', type: 'corner', m2: 14, salesYtd: 88940, currency: 'USD', status: 'inactive_7d', assignedTo: 'usr_at', commissionPct: 14, address: 'Salt Lake City, UT', lastActivityDays: 7 },
  { id: 'prt_upwall_aspen', name: 'UpWall Aspen', sede: 'us', type: 'espacio', m2: 25, salesYtd: 122300, currency: 'USD', status: 'active', assignedTo: 'usr_at', commissionPct: 14, address: 'Aspen, CO', lastActivityDays: 0 },
  { id: 'prt_mirage_bos', name: 'Mirage Boston', sede: 'us', type: 'corner', m2: 12, salesYtd: 64100, currency: 'USD', status: 'active', assignedTo: 'usr_jr', commissionPct: 14, address: 'Boston, MA', lastActivityDays: 2 },
  { id: 'prt_oakhaus_chi', name: 'OakHaus Chicago', sede: 'us', type: 'corner', m2: 16, salesYtd: 92500, currency: 'USD', status: 'active', assignedTo: 'usr_at', commissionPct: 14, address: 'Chicago, IL', lastActivityDays: 1 },
  { id: 'prt_grain_la', name: 'Grain LA', sede: 'us', type: 'espacio', m2: 28, salesYtd: 138200, currency: 'USD', status: 'active', assignedTo: 'usr_at', commissionPct: 14, address: 'Los Angeles, CA', lastActivityDays: 0 },
]
const fillerNamesES = ['Casa Lumen', 'Madera Atelier', 'Roble Vivo', 'Albero Studio', 'Bosque Sur', 'Bilbao Living', 'Sevilla Wood', 'Granada Floors', 'Toledo Madera', 'Valladolid Roble', 'San Sebastián Studio', 'Pamplona Wood', 'Zaragoza Lumber', 'Galicia Pine', 'Asturias Oak', 'Cantabria Floors', 'León Madera', 'Murcia Atelier', 'Castilla Wood']
const fillerNamesUS = ['Northwood Seattle', 'Cedar Studio Portland', 'Pacific Floors SF', 'Coastal Wood SD', 'Texas Oak Austin', 'Lone Star Dallas', 'Magnolia Atlanta', 'Carolina Wood Charlotte', 'Brooklyn Lumber', 'Hudson Yards Studio', 'Capital Wood DC', 'Pine State Concord']

let partners = [...PARTNER_DATA]
fillerNamesES.forEach((nm, i) => {
  partners.push({
    id: `prt_es_${i}`,
    name: nm,
    sede: 'es',
    type: i % 5 === 0 ? 'espacio' : 'corner',
    m2: int(8, 22),
    salesYtd: int(8000, 64000),
    currency: 'EUR',
    status: pick(['active', 'active', 'active', 'inactive_3d', 'below_target']),
    assignedTo: pick(['usr_cm', 'usr_lp']),
    commissionPct: 12,
    address: pick(['Madrid', 'Barcelona', 'Valencia', 'Bilbao', 'Sevilla', 'Granada', 'Málaga', 'Murcia']),
    lastActivityDays: int(0, 10),
  })
})
fillerNamesUS.forEach((nm, i) => {
  partners.push({
    id: `prt_us_${i}`,
    name: nm,
    sede: 'us',
    type: i % 4 === 0 ? 'espacio' : 'corner',
    m2: int(10, 28),
    salesYtd: int(12000, 88000),
    currency: 'USD',
    status: pick(['active', 'active', 'active', 'inactive_7d']),
    assignedTo: pick(['usr_jr', 'usr_da', 'usr_at', 'usr_mo']),
    commissionPct: 14,
    address: nm.split(' ').slice(-1)[0],
    lastActivityDays: int(0, 9),
  })
})

partners = partners.map((p) => ({ ...p, lastActivity: isoDaysAgo(p.lastActivityDays) }))
partners.forEach((p) => delete p.lastActivityDays)

// ============ DEALS ============
const STAGE_COUNTS = { qualified: 42, proposal: 34, negotiation: 22, won: 20, lost: 8 }
const STAGE_PROB = { lead: 10, qualified: 25, proposal: 50, negotiation: 75, won: 100, lost: 0 }

const CLIENTS_ES = ['Casa Velázquez', 'Hotel La Reserva', 'R. Estudio', 'Promotor Eolo', 'Estudio Mora', 'Reforma Pedralbes', 'Office HQ Bilbao', 'Restaurante Velos', 'Hotel Catalonia', 'Loft Gracia', 'Casa Sotogrande', 'Penthouse Castellana', 'Villa Marbella', 'Atelier 22', 'Chalet Pozuelo', 'Residencia Pirineos', 'Hotel Boutique Cádiz', 'Edificio La Latina']
const CLIENTS_US = ['Penthouse Tribeca', 'Brownstone UWS', 'FloorHaus Project', 'Hotel Aspen Lodge', 'Penthouse Miami', 'Loft Soho', 'Brownstone Brooklyn', 'Mansion Greenwich', 'Hotel Boulevard LA', 'Beach House Malibu', 'Office Midtown', 'Loft DUMBO', 'Townhouse Back Bay', 'Resort Sedona', 'Hotel Hudson', 'Penthouse Pacific Heights']
const BRANDS = ['riva_spain', 'tierra', 'flagship']

const deals = []
let dealIdx = 0
const dealId = () => `dl_${String(++dealIdx).padStart(4, '0')}`
const mkDeal = (stage) => {
  const partner = pick(partners)
  const currency = partner.currency
  const clients = currency === 'EUR' ? CLIENTS_ES : CLIENTS_US
  const amount = int(8000, 92000)
  const createdDaysAgo = stage === 'won' || stage === 'lost' ? int(30, 180) : int(2, 110)
  const closeDays = stage === 'won' || stage === 'lost' ? -int(0, 30) : int(5, 60)
  return {
    id: dealId(),
    clientName: pick(clients),
    partnerId: partner.id,
    ownerId: partner.assignedTo,
    stage,
    amount,
    currency,
    createdAt: isoDaysAgo(createdDaysAgo),
    expectedCloseDate: isoDaysAhead(closeDays),
    probability: STAGE_PROB[stage],
    brand: pick(BRANDS),
    notes: '',
  }
}
for (const [stage, n] of Object.entries(STAGE_COUNTS)) {
  for (let i = 0; i < n; i++) deals.push(mkDeal(stage))
}
for (let i = 0; i < 122; i++) deals.push(mkDeal('won'))

const KAN_CARDS = [
  { stage: 'qualified', clientName: 'Hotel La Reserva', amount: 64200, currency: 'EUR', partnerId: 'prt_studio_rota' },
  { stage: 'qualified', clientName: 'Promotor Eolo', amount: 42100, currency: 'EUR', partnerId: 'prt_flagship_mia' },
  { stage: 'qualified', clientName: 'Penthouse Tribeca', amount: 88400, currency: 'USD', partnerId: 'prt_ebony_ny' },
  { stage: 'qualified', clientName: 'Restaurante Velos', amount: 28900, currency: 'EUR', partnerId: 'prt_casa_mendel' },
  { stage: 'proposal', clientName: 'Casa Velázquez', amount: 28400, currency: 'EUR', partnerId: 'prt_flagship_mia' },
  { stage: 'proposal', clientName: 'FloorHaus Project', amount: 124000, currency: 'USD', partnerId: 'prt_floorhaus_mia' },
  { stage: 'proposal', clientName: 'Hotel Aspen Lodge', amount: 96800, currency: 'USD', partnerId: 'prt_upwall_aspen' },
  { stage: 'negotiation', clientName: 'Reforma Pedralbes', amount: 38200, currency: 'EUR', partnerId: 'prt_studio_rota' },
  { stage: 'negotiation', clientName: 'Brownstone NY', amount: 72100, currency: 'USD', partnerId: 'prt_ebony_ny' },
  { stage: 'negotiation', clientName: 'Office HQ Bilbao', amount: 54800, currency: 'EUR', partnerId: 'prt_duchateau_bil' },
  { stage: 'won', clientName: 'R. Estudio', amount: 18900, currency: 'EUR', partnerId: 'prt_flagship_mia' },
  { stage: 'won', clientName: 'Penthouse Miami', amount: 42300, currency: 'USD', partnerId: 'prt_floorhaus_mia' },
  { stage: 'won', clientName: 'Casa Sotogrande', amount: 32600, currency: 'EUR', partnerId: 'prt_casa_mendel' },
  { stage: 'lost', clientName: 'Loft Soho', amount: 38000, currency: 'USD', partnerId: 'prt_mirage_bos' },
  { stage: 'lost', clientName: 'Chalet Sierra', amount: 22400, currency: 'EUR', partnerId: 'prt_hakwood_sev' },
]
KAN_CARDS.forEach((card) => {
  const idx = deals.findIndex((d) => d.stage === card.stage && !d._named)
  if (idx >= 0) {
    deals[idx] = {
      ...deals[idx],
      ...card,
      ownerId: partners.find((p) => p.id === card.partnerId)?.assignedTo ?? deals[idx].ownerId,
      _named: true,
    }
  }
})
deals.forEach((d) => delete d._named)

// ============ INVOICES — RIVA payment flow (60% deposit + 40% final) ============
// Each won deal generates a paired set: deposit invoice + final invoice.
// The deposit is paid at order; final paid before warehouse ship.
const wonDeals = deals.filter((d) => d.stage === 'won')
const invoices = []
let invIdx = 0
const nextNumber = () => `2026-${String(400 + ++invIdx).padStart(4, '0')}`

// Distribution of overall order status — used to determine state of deposit/final pair
// 75% fully paid (deposit + final), 12% deposit paid waiting final, 8% deposit overdue, 5% draft
const DEAL_FLOW = wonDeals.map((d, i) => {
  const r = i / wonDeals.length
  if (r < 0.75) return 'paid'
  if (r < 0.87) return 'deposit_paid_final_pending'
  if (r < 0.95) return 'deposit_overdue'
  return 'draft'
})

DEAL_FLOW.forEach((flow, i) => {
  const d = wonDeals[i]
  const orderTotal = d.amount
  const depAmount = Math.round(orderTotal * 0.6)
  const finAmount = orderTotal - depAmount
  const ageDays = int(0, 120)
  const depDue = isoDaysAgo(ageDays - 30) // depDue ~30d after creation
  const finDue = isoDaysAgo(ageDays - 90) // final due ~90d after creation
  const depIssued = isoDaysAgo(ageDays)
  const finIssued = isoDaysAgo(ageDays - 60)

  let depStatus = 'paid'
  let finStatus = 'paid'
  let depBucket = 'current'
  let finBucket = 'current'

  if (flow === 'deposit_paid_final_pending') {
    finStatus = 'sent'
    finBucket = ageDays < 30 ? 'current' : '0_30'
  } else if (flow === 'deposit_overdue') {
    depStatus = 'overdue'
    finStatus = 'draft'
    depBucket = ageDays < 30 ? '0_30' : ageDays < 60 ? '31_60' : ageDays < 90 ? '61_90' : '90_plus'
  } else if (flow === 'draft') {
    depStatus = 'draft'
    finStatus = 'draft'
  }

  const depId = `inv_${String(invIdx + 1).padStart(4, '0')}_d`
  const depositInv = {
    id: depId,
    number: nextNumber(),
    partnerId: d.partnerId,
    dealId: d.id,
    amount: depAmount,
    currency: d.currency,
    issuedAt: depIssued,
    dueAt: depDue,
    status: depStatus,
    agingBucket: depBucket,
    kind: 'deposit',
    orderTotal,
  }
  const finalInv = {
    id: `inv_${String(invIdx + 1).padStart(4, '0')}_f`,
    number: nextNumber(),
    partnerId: d.partnerId,
    dealId: d.id,
    amount: finAmount,
    currency: d.currency,
    issuedAt: finIssued,
    dueAt: finDue,
    status: finStatus,
    agingBucket: finBucket,
    kind: 'final',
    parentInvoiceId: depId,
    orderTotal,
  }
  invoices.push(depositInv, finalInv)
})

// ============ PAYMENTS ============
const payments = invoices
  .filter((inv) => inv.status === 'paid')
  .slice(0, 200)
  .map((inv, i) => ({
    id: `pay_${String(i).padStart(4, '0')}`,
    invoiceId: inv.id,
    amount: inv.amount,
    at: isoDaysAgo(int(0, 60)),
    method: pick(['stripe', 'square', 'bank']),
    externalId: `ext_${int(100000, 999999)}`,
  }))

// ============ INSTALLATIONS ============
const installations = [
  { project: 'Hotel La Reserva', sede: 'es', m2: 420, crewId: 'crw_mad_a', daysFromToday: 1 },
  { project: 'Casa Velázquez', sede: 'es', m2: 220, crewId: 'crw_mad_a', daysFromToday: 2 },
  { project: 'Penthouse Tribeca', sede: 'us', m2: 380, crewId: 'crw_ny', daysFromToday: 4 },
  { project: 'Brownstone UWS', sede: 'us', m2: 290, crewId: 'crw_ny', daysFromToday: 6 },
  { project: 'Casa Sotogrande', sede: 'es', m2: 540, crewId: 'crw_mad_b', daysFromToday: 8 },
  { project: 'R. Estudio', sede: 'es', m2: 140, crewId: 'crw_bcn', daysFromToday: 11 },
  { project: 'FloorHaus Project', sede: 'us', m2: 320, crewId: 'crw_mia', daysFromToday: 14 },
  { project: 'Hotel Aspen Lodge', sede: 'us', m2: 280, crewId: 'crw_ny', daysFromToday: 17 },
  { project: 'Casa Velázquez II', sede: 'es', m2: 180, crewId: 'crw_mad_b', daysFromToday: 21 },
  { project: 'Promotor Eolo', sede: 'es', m2: 360, crewId: 'crw_mad_a', daysFromToday: 24 },
  { project: 'Penthouse Miami', sede: 'us', m2: 240, crewId: 'crw_mia', daysFromToday: 27 },
  { project: 'Beach House Malibu', sede: 'us', m2: 410, crewId: 'crw_ny', daysFromToday: 30 },
].map((it, i) => {
  const start = new Date(TODAY)
  start.setDate(start.getDate() + it.daysFromToday)
  const end = new Date(start)
  end.setDate(end.getDate() + Math.ceil(it.m2 / 80))
  return {
    id: `ins_${String(i).padStart(3, '0')}`,
    dealId: wonDeals[i % wonDeals.length]?.id ?? '',
    project: it.project,
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    crewId: it.crewId,
    sede: it.sede,
    status: 'scheduled',
    m2: it.m2,
  }
})

// ============ SKUS — RIVA collections with grade + wood type ============
// Wood types: european-oak, white-oak, american-walnut, ash, douglas-fir, smoked-oak,
// engineered oak, walnut, ash.
// Grade: premium (Cove, Vedetta, Mercury, Storm) vs regular (Cotton, Sand, Glaze, Laguna, Earth, Velino)
const SKU_DEFS = [
  // Premium line — top-tier
  { name: 'Cove',    collection: 'TIERRA',     woodType: 'european-oak',  finish: 'dark·brushed',  grade: 'premium', warehouse: 'es', thresholdM2: 180, stockM2: 42,  pricePerM2: 145 },
  { name: 'Cove',    collection: 'TIERRA',     woodType: 'european-oak',  finish: 'dark·brushed',  grade: 'premium', warehouse: 'us', thresholdM2: 140, stockM2: 86,  pricePerM2: 165 },
  { name: 'Vedetta', collection: 'RIVA Spain', woodType: 'smoked-oak',    finish: 'smoke·wide plank', grade: 'premium', warehouse: 'us', thresholdM2: 140, stockM2: 184, pricePerM2: 158 },
  { name: 'Vedetta', collection: 'RIVA Spain', woodType: 'smoked-oak',    finish: 'smoke·wide plank', grade: 'premium', warehouse: 'es', thresholdM2: 120, stockM2: 102, pricePerM2: 142 },
  { name: 'Mercury', collection: 'RIVA Spain', woodType: 'grey-oak',      finish: 'grey·matte',    grade: 'premium', warehouse: 'us', thresholdM2: 120, stockM2: 92,  pricePerM2: 154 },
  { name: 'Storm',   collection: 'TIERRA',     woodType: 'charred-oak',   finish: 'charcoal',      grade: 'premium', warehouse: 'es', thresholdM2: 100, stockM2: 142, pricePerM2: 162 },

  // Regular line
  { name: 'Laguna',  collection: 'TIERRA',     woodType: 'white-oak',     finish: 'light·chevron', grade: 'regular', warehouse: 'es', thresholdM2: 160, stockM2: 68,  pricePerM2: 102 },
  { name: 'Laguna',  collection: 'TIERRA',     woodType: 'white-oak',     finish: 'light·chevron', grade: 'regular', warehouse: 'us', thresholdM2: 120, stockM2: 158, pricePerM2: 118 },
  { name: 'Velino',  collection: 'TIERRA',     woodType: 'ash',           finish: 'herringbone',   grade: 'regular', warehouse: 'us', thresholdM2: 140, stockM2: 54,  pricePerM2: 96 },
  { name: 'Velino',  collection: 'TIERRA',     woodType: 'ash',           finish: 'herringbone',   grade: 'regular', warehouse: 'es', thresholdM2: 120, stockM2: 132, pricePerM2: 86 },
  { name: 'Glaze',   collection: 'RIVA Spain', woodType: 'oak-light',     finish: 'wide plank',    grade: 'regular', warehouse: 'es', thresholdM2: 180, stockM2: 248, pricePerM2: 88 },
  { name: 'Glaze',   collection: 'RIVA Spain', woodType: 'oak-light',     finish: 'wide plank',    grade: 'regular', warehouse: 'us', thresholdM2: 150, stockM2: 198, pricePerM2: 98 },
  { name: 'Cotton',  collection: 'TIERRA',     woodType: 'white-oak',     finish: 'natural·matte', grade: 'regular', warehouse: 'es', thresholdM2: 120, stockM2: 320, pricePerM2: 92 },
  { name: 'Sand',    collection: 'TIERRA',     woodType: 'oak-natural',   finish: 'natural',       grade: 'regular', warehouse: 'us', thresholdM2: 100, stockM2: 280, pricePerM2: 104 },
  { name: 'Earth',   collection: 'TIERRA',     woodType: 'american-walnut', finish: 'walnut·oil',  grade: 'regular', warehouse: 'es', thresholdM2: 110, stockM2: 152, pricePerM2: 118 },
  { name: 'Earth',   collection: 'TIERRA',     woodType: 'american-walnut', finish: 'walnut·oil',  grade: 'regular', warehouse: 'us', thresholdM2: 90,  stockM2: 88,  pricePerM2: 132 },

  // More variants for breadth
  { name: 'Mist',    collection: 'TIERRA',     woodType: 'oak-light',     finish: 'pale·brushed',  grade: 'regular', warehouse: 'es', thresholdM2: 90,  stockM2: 124, pricePerM2: 82 },
  { name: 'Mist',    collection: 'TIERRA',     woodType: 'oak-light',     finish: 'pale·brushed',  grade: 'regular', warehouse: 'us', thresholdM2: 80,  stockM2: 88,  pricePerM2: 92 },
  { name: 'Ridge',   collection: 'RIVA Spain', woodType: 'european-oak',  finish: 'rustic',        grade: 'regular', warehouse: 'es', thresholdM2: 100, stockM2: 142, pricePerM2: 94 },
  { name: 'Ridge',   collection: 'RIVA Spain', woodType: 'european-oak',  finish: 'rustic',        grade: 'regular', warehouse: 'us', thresholdM2: 80,  stockM2: 64,  pricePerM2: 106 },
  { name: 'Slate',   collection: 'TIERRA',     woodType: 'oak-dark',      finish: 'dark·matte',    grade: 'premium', warehouse: 'es', thresholdM2: 100, stockM2: 78,  pricePerM2: 138 },
  { name: 'Slate',   collection: 'TIERRA',     woodType: 'oak-dark',      finish: 'dark·matte',    grade: 'premium', warehouse: 'us', thresholdM2: 90,  stockM2: 56,  pricePerM2: 152 },
  { name: 'Dune',    collection: 'TIERRA',     woodType: 'oak-natural',   finish: 'sand·oil',      grade: 'regular', warehouse: 'es', thresholdM2: 80,  stockM2: 102, pricePerM2: 78 },
  { name: 'Dune',    collection: 'TIERRA',     woodType: 'oak-natural',   finish: 'sand·oil',      grade: 'regular', warehouse: 'us', thresholdM2: 70,  stockM2: 90,  pricePerM2: 90 },
  { name: 'Reserve', collection: 'RIVA Spain', woodType: 'french-oak',    finish: 'aged·hand',     grade: 'premium', warehouse: 'es', thresholdM2: 80,  stockM2: 64,  pricePerM2: 178 },
  { name: 'Reserve', collection: 'RIVA Spain', woodType: 'french-oak',    finish: 'aged·hand',     grade: 'premium', warehouse: 'us', thresholdM2: 70,  stockM2: 44,  pricePerM2: 198 },
  { name: 'Cliff',   collection: 'RIVA Spain', woodType: 'douglas-fir',   finish: 'natural·wide',  grade: 'regular', warehouse: 'es', thresholdM2: 90,  stockM2: 142, pricePerM2: 86 },
  { name: 'Cliff',   collection: 'RIVA Spain', woodType: 'douglas-fir',   finish: 'natural·wide',  grade: 'regular', warehouse: 'us', thresholdM2: 80,  stockM2: 122, pricePerM2: 96 },
  { name: 'Forge',   collection: 'TIERRA',     woodType: 'iron-oak',      finish: 'iron·brushed',  grade: 'premium', warehouse: 'es', thresholdM2: 60,  stockM2: 38,  pricePerM2: 168 },
]

const skus = SKU_DEFS.map((sk, i) => ({
  id: `sku_${String(i).padStart(3, '0')}`,
  name: sk.name,
  collection: sk.collection,
  finish: sk.finish,
  woodType: sk.woodType,
  grade: sk.grade,
  warehouse: sk.warehouse,
  stockM2: sk.stockM2,
  thresholdM2: sk.thresholdM2,
  pricePerM2: sk.pricePerM2,
  supplierId: pick(suppliers).id,
  leadTimeDays: int(20, 42),
  demandLast90: int(60, 280),
}))

// ============ PURCHASE ORDERS ============
const purchaseOrders = [
  { number: 'OC-4421', sku: 'Cove',    quantity: 240, totalCost: 32000, currency: 'EUR', status: 'factory',   etaDays: 14 },
  { number: 'OC-4419', sku: 'Laguna',  quantity: 180, totalCost: 26000, currency: 'EUR', status: 'factory',   etaDays: 14 },
  { number: 'OC-4417', sku: 'Velino',  quantity: 140, totalCost: 22000, currency: 'USD', status: 'factory',   etaDays: 14 },
  { number: 'OC-4412', sku: 'Glaze',   quantity: 200, totalCost: 28000, currency: 'EUR', status: 'transit',   etaDays: 7 },
  { number: 'OC-4408', sku: 'Vedetta', quantity: 160, totalCost: 28000, currency: 'USD', status: 'transit',   etaDays: 7 },
  { number: 'OC-4402', sku: 'Mercury', quantity: 180, totalCost: 32000, currency: 'USD', status: 'customs',   etaDays: 3 },
  { number: 'OC-4395', sku: 'Earth',   quantity: 120, totalCost: 18000, currency: 'EUR', status: 'warehouse', etaDays: 1 },
].map((po, i) => {
  const sk = skus.find((s) => s.name === po.sku)
  return {
    id: `po_${String(i).padStart(3, '0')}`,
    number: po.number,
    skuId: sk?.id ?? skus[0].id,
    quantity: po.quantity,
    supplierId: sk?.supplierId ?? suppliers[0].id,
    status: po.status,
    etaAt: isoDaysAhead(po.etaDays),
    totalCost: po.totalCost,
    currency: po.currency,
  }
})

// ============ TICKETS — customer + internal ============
const customerTickets = [
  { num: '882', type: 'Defecto acabado', clientName: 'Casa Velázquez', partnerId: 'prt_flagship_mia', assigneeId: 'usr_pv_2', priority: 'high', status: 'open', slaHours: 24, openHoursAgo: 3 },
  { num: '881', type: 'Pedido recibido incompleto', clientName: 'Studio Rota', partnerId: 'prt_studio_rota', assigneeId: 'usr_pv_1', priority: 'med', status: 'open', slaHours: 48, openHoursAgo: 6 },
  { num: '880', type: 'Consulta mantenimiento', clientName: 'UpWall Aspen', partnerId: 'prt_upwall_aspen', assigneeId: 'usr_pv_2', priority: 'low', status: 'open', slaHours: 72, openHoursAgo: 12 },
  { num: '879', type: 'Reposición garantía', clientName: 'FloorHaus Miami', partnerId: 'prt_floorhaus_mia', assigneeId: 'usr_pv_3', priority: 'med', status: 'open', slaHours: 48, openHoursAgo: 24 },
  { num: '878', type: 'Defecto color · lote', clientName: 'Hotel Aspen Lodge', assigneeId: undefined, priority: 'high', status: 'open', slaHours: 24, openHoursAgo: 24 },
  { num: '876', type: 'Consulta limpieza', clientName: 'Casa Mendel', partnerId: 'prt_casa_mendel', assigneeId: 'usr_pv_1', priority: 'low', status: 'open', slaHours: 96, openHoursAgo: 48 },
].map((t) => ({
  id: `tkt_${t.num}`,
  type: t.type,
  partnerId: t.partnerId,
  clientName: t.clientName,
  assigneeId: t.assigneeId,
  priority: t.priority,
  status: t.status,
  description: t.type,
  slaHours: t.slaHours,
  createdAt: new Date(Date.parse(TODAY) - t.openHoursAgo * 3600 * 1000).toISOString(),
  category: 'customer',
}))

const internalTickets = [
  { num: 'i_1042', type: 'CRM: dashboard de partners lento', priority: 'med', status: 'open', requesterId: 'usr_cm', assigneeId: 'usr_tech_1', slaHours: 24, openHoursAgo: 4 },
  { num: 'i_1041', type: 'No me llegan emails de QuickBooks', priority: 'high', status: 'in_progress', requesterId: 'usr_dacc', assigneeId: 'usr_tech_2', slaHours: 12, openHoursAgo: 6 },
  { num: 'i_1040', type: 'Pedir acceso Stripe live', priority: 'low', status: 'open', requesterId: 'usr_acc_2', assigneeId: undefined, slaHours: 72, openHoursAgo: 26 },
  { num: 'i_1039', type: 'VPN cae cada 2h en Flagship', priority: 'high', status: 'in_progress', requesterId: 'usr_da', assigneeId: 'usr_tech_2', slaHours: 8, openHoursAgo: 10 },
  { num: 'i_1038', type: 'Plantillas Word con logo nuevo', priority: 'low', status: 'open', requesterId: 'usr_mkt_1', assigneeId: 'usr_tech_3', slaHours: 96, openHoursAgo: 40 },
  { num: 'i_1037', type: 'Slack channel nuevo para Ops/SC', priority: 'low', status: 'closed', requesterId: 'usr_ops_1', assigneeId: 'usr_tech_2', slaHours: 24, openHoursAgo: 72 },
  { num: 'i_1036', type: 'Sync calendarios Google ↔ Hub', priority: 'med', status: 'open', requesterId: 'usr_cm', assigneeId: 'usr_tech_3', slaHours: 48, openHoursAgo: 18 },
  { num: 'i_1035', type: 'Exportar leads a CSV no funciona', priority: 'med', status: 'open', requesterId: 'usr_mkt', assigneeId: 'usr_tech_1', slaHours: 48, openHoursAgo: 30 },
].map((t) => ({
  id: `tkt_${t.num}`,
  type: t.type,
  clientName: users.find((u) => u.id === t.requesterId)?.name ?? 'staff',
  assigneeId: t.assigneeId,
  priority: t.priority,
  status: t.status,
  description: t.type,
  slaHours: t.slaHours,
  createdAt: new Date(Date.parse(TODAY) - t.openHoursAgo * 3600 * 1000).toISOString(),
  category: 'internal',
  requesterId: t.requesterId,
}))

const tickets = [...customerTickets, ...internalTickets]

// ============ REVIEWS ============
const reviews = []
for (let i = 0; i < 22; i++) reviews.push({ id: `rv_5_${i}`, partnerId: pick(partners).id, clientName: `Cliente ${i}`, score: 5, text: 'Excelente acabado, instalación impecable.', source: 'google', at: isoDaysAgo(int(0, 30)) })
for (let i = 0; i < 4; i++) reviews.push({ id: `rv_4_${i}`, partnerId: pick(partners).id, clientName: `Cliente ${i}`, score: 4, text: 'Muy buen producto, plazos cumplidos.', source: 'google', at: isoDaysAgo(int(0, 30)) })
reviews.push({ id: 'rv_3_0', partnerId: pick(partners).id, clientName: 'Cliente 3-1', score: 3, text: 'Aceptable, pero el plazo de entrega se alargó.', source: 'google', at: isoDaysAgo(8) })
reviews.push({ id: 'rv_2_0', partnerId: pick(partners).id, clientName: 'Cliente 2-1', score: 2, text: 'Defecto en una caja, gestión lenta.', source: 'google', at: isoDaysAgo(3) })

// ============ CAMPAIGNS ============
const campaigns = [
  { id: 'cmp_tierra_spring', name: 'TIERRA · spring', channel: 'Paid + email', periodStart: '2026-04-01', periodEnd: '2026-05-31', spend: 14200, currency: 'EUR', leadsCount: 184, conversionRate: 5.1, status: 'active' },
  { id: 'cmp_riva_arch',     name: 'RIVA Spain · arquitectos', channel: 'Eventos + LI', periodStart: '2026-04-15', periodEnd: '2026-06-30', spend: 22800, currency: 'EUR', leadsCount: 72, conversionRate: 8.3, status: 'active' },
  { id: 'cmp_flag_madrid',   name: 'Flagship · Madrid', channel: 'Local + IG', periodStart: '2026-05-01', periodEnd: '2026-06-15', spend: 8400, currency: 'EUR', leadsCount: 42, conversionRate: 11.9, status: 'active' },
  { id: 'cmp_cove_launch',   name: 'Cove · lanzamiento', channel: 'PR + paid', periodStart: '2026-05-10', periodEnd: '2026-06-30', spend: 18400, currency: 'USD', leadsCount: 14, conversionRate: 0, status: 'active' },
]

// ============ LEADS ============
const leads = []
for (let i = 0; i < 80; i++) {
  leads.push({
    id: `ld_${String(i).padStart(3, '0')}`,
    name: `Lead ${i + 1}`,
    email: `lead${i + 1}@example.com`,
    sede: pick(['es', 'us']),
    channel: pick(['Orgánico', 'Paid', 'Partners', 'Referidos', 'Eventos']),
    score: int(0, 100),
    stage: pick(['new', 'mql', 'sql', 'opportunity']),
    ownerId: pick(COMERCIALES),
    createdAt: isoDaysAgo(int(0, 30)),
  })
}

// ============ AUTOMATION RULES ============
const automationRules = [
  { id: 'ar_qb_invoice', name: 'Factura → link de pago → conciliación', icon: 'QB', description: 'QuickBooks emite factura · Stripe genera link · cobro concilia en QB automáticamente', trigger: { event: 'deal.stageChanged' }, conditions: [{ field: 'stage', op: 'eq', value: 'won' }], actions: [{ type: 'create_invoice', params: { status: 'draft' } }, { type: 'send_email_mock', params: { template: 'payment_link' } }], active: true, runs: 312 },
  { id: 'ar_dunning', name: 'Recordatorios de cobro D+7 / D+14 / D+21', icon: '$', description: 'Factura impagada · email automático en tono del partner · Postventa avisado en D+21', trigger: { event: 'invoice.overdue' }, conditions: [], actions: [{ type: 'send_email_mock', params: { template: 'reminder' } }], active: true, runs: 84 },
  { id: 'ar_activity_log', name: 'Registro de actividad comercial', icon: 'V', description: 'Llamada/email/visita · CRM interno log automático · QB ve histórico al facturar', trigger: { event: 'activity.created' }, conditions: [], actions: [{ type: 'log', params: {} }], active: true, runs: 1840 },
  { id: 'ar_sku_low', name: 'Stock crítico → reposición', icon: 'SC', description: 'SKU bajo umbral · alerta Supply Chain · OC preparada para aprobación', trigger: { event: 'sku.belowThreshold' }, conditions: [], actions: [{ type: 'create_purchase_order', params: { status: 'draft' } }, { type: 'create_notification', params: { role: 'operations_manager' } }], active: true, runs: 22 },
  { id: 'ar_low_review', name: 'Reseña ≤3★ → ticket Postventa', icon: 'P', description: 'Detección reseña · ticket asignado · plantilla de respuesta lista', trigger: { event: 'review.created' }, conditions: [{ field: 'score', op: 'lt', value: 4 }], actions: [{ type: 'create_ticket', params: { priority: 'high' } }], active: true, runs: 9 },
  { id: 'ar_lead_nurture', name: 'Lead → secuencia email automática', icon: 'M', description: 'Nuevo lead web · 4 emails en 21 días · score actualizado', trigger: { event: 'lead.created' }, conditions: [{ field: 'channel', op: 'eq', value: 'web' }], actions: [{ type: 'send_email_mock', params: { sequence: 'welcome' } }], active: true, runs: 142 },
  { id: 'ar_flag_close', name: 'Flagship · cierre de caja diario', icon: 'F', description: 'Cierre de día · ingresos a QB sede propia · informe email al CEO', trigger: { event: 'flagship.dayClose' }, conditions: [], actions: [{ type: 'send_email_mock', params: { template: 'flagship_summary', to: 'ceo' } }], active: true, runs: 30 },
  { id: 'ar_lead_assign', name: 'Lead → asignación comercial', icon: 'CRM', description: 'Lead nuevo · asignado al comercial con menos pipeline abierto en su sede', trigger: { event: 'lead.created' }, conditions: [], actions: [{ type: 'assign_user', params: { strategy: 'least_pipeline' } }], active: true, runs: 116 },
  { id: 'ar_deposit_paid', name: 'Depósito cobrado → factura final preparada', icon: 'QB', description: 'Al cobrarse el depósito 60%, se prepara automáticamente la factura final 40% pre-envío', trigger: { event: 'invoice.paid' }, conditions: [{ field: 'kind', op: 'eq', value: 'deposit' }], actions: [{ type: 'create_invoice', params: { kind: 'final', status: 'draft' } }], active: true, runs: 156 },
  { id: 'ar_nps_post', name: 'Instalación cerrada → NPS', icon: 'N', description: 'Instalación done · encuesta NPS al cliente 7 días después', trigger: { event: 'installation.completed' }, conditions: [], actions: [{ type: 'send_email_mock', params: { template: 'nps' } }], active: true, runs: 38 },
  { id: 'ar_deal_stale', name: 'Deal sin actividad 14d → notificación', icon: 'V', description: 'Cron diario · deals sin actividad ≥14d · notifica al owner', trigger: { event: 'deal.noActivity14d' }, conditions: [], actions: [{ type: 'create_notification', params: { role: 'comercial' } }], active: true, runs: 12 },
  { id: 'ar_tech_health', name: 'Integración con latencia alta → alerta', icon: 'T', description: 'Latencia > 500ms · alerta tech_lead', trigger: { event: 'integration.latencyMs' }, conditions: [{ field: 'latencyMs', op: 'gt', value: 500 }], actions: [{ type: 'create_notification', params: { role: 'tech_lead' } }], active: false, runs: 4 },
]

// ============ INTEGRATIONS ============
const integrations = [
  { id: 'itg_qb',       name: 'QuickBooks',      type: 'accounting',   status: 'connected',    statusLabel: '● Conectado',     latencyMs: 184, lastSync: isoDaysAgo(0), config: {} },
  { id: 'itg_stripe',   name: 'Stripe',          type: 'payments',     status: 'connected',    statusLabel: '● Conectado',     latencyMs: 92,  lastSync: isoDaysAgo(0), config: {} },
  { id: 'itg_crm',      name: 'CRM Interno',     type: 'crm',          status: 'connected',    statusLabel: '● Conectado',     latencyMs: 42,  lastSync: isoDaysAgo(0), config: {} },
  { id: 'itg_gws',      name: 'Google Workspace',type: 'productivity', status: 'connected',    statusLabel: '● Conectado',     latencyMs: 138, lastSync: isoDaysAgo(0), config: {} },
  { id: 'itg_slack',    name: 'Slack',           type: 'productivity', status: 'connected',    statusLabel: '● Conectado',     latencyMs: 78,  lastSync: isoDaysAgo(0), config: {} },
  { id: 'itg_shopify',  name: 'Shopify',         type: 'ecommerce',    status: 'disconnected', statusLabel: '○ Sin conectar',  latencyMs: 0,   lastSync: isoDaysAgo(30), config: {} },
  { id: 'itg_docusign', name: 'DocuSign',        type: 'docs',         status: 'connected',    statusLabel: '● Conectado',     latencyMs: 240, lastSync: isoDaysAgo(1), config: {} },
  { id: 'itg_square',   name: 'Square',          type: 'payments',     status: 'connected',    statusLabel: '● Flagship',      latencyMs: 112, lastSync: isoDaysAgo(0), config: {} },
  { id: 'itg_paypal',   name: 'PayPal',          type: 'payments',     status: 'disconnected', statusLabel: '○ Sin conectar',  latencyMs: 0,   lastSync: isoDaysAgo(60), config: {} },
  { id: 'itg_canva',    name: 'Canva',           type: 'design',       status: 'connected',    statusLabel: '● Marketing',     latencyMs: 320, lastSync: isoDaysAgo(1), config: {} },
]

// ============ NOTIFICATIONS ============
const notifications = [
  { id: 'ntf_1', role: 'ceo',                  type: 'flagship',  source: 'Flagship Miami', message: '3 visitas reservadas para mañana', read: false, createdAt: isoDaysAgo(0) },
  { id: 'ntf_2', role: 'ceo',                  type: 'accounting',source: 'Accounting',     message: '4 facturas USA vencen en 48h', read: false, createdAt: isoDaysAgo(0) },
  { id: 'ntf_3', role: 'ceo',                  type: 'supply',    source: 'Supply Chain',   message: 'Lote Cove agotado en almacén ES', read: false, createdAt: isoDaysAgo(0) },
  { id: 'ntf_4', role: 'ceo',                  type: 'marketing', source: 'Marketing',      message: 'Campaña TIERRA enviada (12.840 destinatarios)', read: true, createdAt: isoDaysAgo(1) },
  { id: 'ntf_5', role: 'ceo',                  type: 'tech',      source: 'Tecnología',     message: 'CRM interno · deploy v2.4.1', read: true, createdAt: isoDaysAgo(1) },
  { id: 'ntf_6', role: 'director_comercial',   type: 'sales',     source: 'Ventas',         message: '3 deals en negociación >30d', read: false, createdAt: isoDaysAgo(0) },
  { id: 'ntf_7', role: 'operations_manager',   type: 'ops',       source: 'Operations',     message: 'Crew Miami a 64% capacidad esta semana', read: false, createdAt: isoDaysAgo(0) },
]

// ============ ACTIVITIES ============
const activities = []
for (let i = 0; i < 24; i++) {
  activities.push({
    id: `act_${i}`,
    dealId: pick(deals).id,
    partnerId: pick(partners).id,
    type: pick(['call', 'email', 'visit', 'note']),
    userId: pick(COMERCIALES),
    at: isoDaysAgo(int(0, 14)),
    content: 'Seguimiento comercial',
  })
}

// ============ AUDIT LOG ============
const auditLog = []
for (let i = 0; i < 50; i++) {
  auditLog.push({
    id: `al_${i}`,
    userId: pick(users).id,
    action: pick(['create', 'update']),
    entity: pick(['deals', 'invoices', 'activities', 'notifications']),
    entityId: `entity_${i}`,
    at: isoDaysAgo(int(0, 30)),
  })
}

const seed = {
  users, partners, deals, activities, invoices, payments, installations, crews,
  tickets, reviews, skus, purchaseOrders, suppliers, campaigns, leads,
  automationRules, integrations, notifications, auditLog,
}

writeFileSync(OUT, JSON.stringify(seed, null, 2), 'utf8')
console.log('Wrote', OUT)
console.log('Counts:', Object.fromEntries(Object.entries(seed).map(([k, v]) => [k, v.length])))
