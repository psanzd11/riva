import { useStore } from '../data/store'
import { id as makeId } from '../lib/id'
import type { AutomationRule, Notification, Invoice, Ticket, PurchaseOrder } from '../data/schema'

type Payload = Record<string, unknown>

type ListenerFn = (event: string, payload: Payload) => void

const listeners = new Set<ListenerFn>()

export function subscribeAutomation(fn: ListenerFn): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function emit(event: string, payload: Payload = {}): void {
  for (const fn of listeners) fn(event, payload)
  runRules(event, payload)
}

// Match conditions on payload
function evalCondition(payload: Payload, cond: AutomationRule['conditions'][number]): boolean {
  const value = payload[cond.field]
  switch (cond.op) {
    case 'eq':
      return value === cond.value
    case 'lt':
      return typeof value === 'number' && typeof cond.value === 'number' && value < cond.value
    case 'gt':
      return typeof value === 'number' && typeof cond.value === 'number' && value > cond.value
    case 'contains':
      return typeof value === 'string' && typeof cond.value === 'string' && value.includes(cond.value)
    default:
      return false
  }
}

function runRules(event: string, payload: Payload): void {
  const state = useStore.getState()
  const matching = state.automationRules.filter((r) => r.active && r.trigger.event === event)
  if (matching.length === 0) return

  for (const rule of matching) {
    const passes = rule.conditions.every((c) => evalCondition(payload, c))
    if (!passes) continue

    for (const action of rule.actions.slice(0, 10)) {
      executeAction(action.type, action.params, payload)
    }

    // bump runs counter + lastRunAt
    const updatedRules = state.automationRules.map((r) =>
      r.id === rule.id ? { ...r, runs: r.runs + 1, lastRunAt: new Date().toISOString() } : r,
    )
    useStore.setState({ automationRules: updatedRules })
  }
}

function executeAction(
  type: AutomationRule['actions'][number]['type'],
  params: Payload,
  payload: Payload,
): void {
  switch (type) {
    case 'create_notification': {
      const next: Notification = {
        id: makeId('ntf'),
        role: (params.role as Notification['role']) ?? 'ceo',
        type: (params.type as string) ?? 'auto',
        source: (params.source as string) ?? 'Automation',
        message: (params.message as string) ?? `Evento ${JSON.stringify(payload).slice(0, 60)}`,
        read: false,
        createdAt: new Date().toISOString(),
      }
      const list = useStore.getState().notifications
      useStore.setState({ notifications: [next, ...list].slice(0, 500) })
      break
    }
    case 'create_invoice': {
      const dealId = (payload.id as string) ?? (payload.dealId as string) ?? ''
      const total = (payload.amount as number) ?? 0
      const currency = ((payload.currency as Invoice['currency']) ?? 'EUR')
      const partnerId = (payload.partnerId as string) ?? ''
      const today = new Date()
      const due = new Date(today)
      due.setDate(due.getDate() + 30)
      const kind = (params.kind as Invoice['kind']) ?? 'deposit'
      const factor = kind === 'deposit' ? 0.6 : kind === 'final' ? 0.4 : 1
      const amount = Math.round(total * factor)
      const next: Invoice = {
        id: makeId('inv'),
        number: `2026-${String(500 + Math.floor(Math.random() * 99)).padStart(4, '0')}`,
        partnerId,
        dealId,
        amount,
        currency,
        issuedAt: today.toISOString(),
        dueAt: due.toISOString(),
        status: (params.status as Invoice['status']) ?? 'draft',
        agingBucket: 'current',
        kind,
        orderTotal: total,
        parentInvoiceId: (payload.parentInvoiceId as string | undefined) ?? undefined,
      }
      const list = useStore.getState().invoices
      useStore.setState({ invoices: [next, ...list] })
      emit('invoice.created', next as unknown as Payload)
      break
    }
    case 'create_ticket': {
      const next: Ticket = {
        id: makeId('tkt'),
        type: (params.type as string) ?? 'auto',
        clientName: (payload.clientName as string) ?? (payload.partnerId as string) ?? 'Sin nombre',
        priority: (params.priority as Ticket['priority']) ?? 'med',
        status: 'open',
        description: (params.description as string) ?? (payload.text as string) ?? 'Automático',
        slaHours: (params.slaHours as number) ?? 48,
        createdAt: new Date().toISOString(),
        partnerId: payload.partnerId as string | undefined,
        category: (params.category as Ticket['category']) ?? 'customer',
      }
      const list = useStore.getState().tickets
      useStore.setState({ tickets: [next, ...list] })
      emit('ticket.created', next as unknown as Payload)
      break
    }
    case 'create_purchase_order': {
      const next: PurchaseOrder = {
        id: makeId('po'),
        number: `OC-${4400 + Math.floor(Math.random() * 99)}`,
        skuId: (payload.id as string) ?? '',
        quantity: ((payload.thresholdM2 as number) ?? 100) * 1.2,
        supplierId: (payload.supplierId as string) ?? '',
        status: (params.status as PurchaseOrder['status']) ?? 'factory',
        etaAt: new Date(Date.now() + 14 * 86400000).toISOString(),
        totalCost: 0,
        currency: 'EUR',
      }
      const list = useStore.getState().purchaseOrders
      useStore.setState({ purchaseOrders: [next, ...list] })
      break
    }
    case 'assign_user': {
      // no-op stub for least_pipeline strategy
      break
    }
    case 'send_email_mock': {
      // Simulate by writing a notification
      const next: Notification = {
        id: makeId('ntf'),
        role: (params.to as Notification['role']) ?? 'ceo',
        type: 'email_mock',
        source: 'Email · mock',
        message: `Plantilla "${params.template ?? params.sequence ?? 'genérica'}" enviada`,
        read: false,
        createdAt: new Date().toISOString(),
      }
      const list = useStore.getState().notifications
      useStore.setState({ notifications: [next, ...list].slice(0, 500) })
      break
    }
    case 'log':
    default:
      // eslint-disable-next-line no-console
      console.debug('[automation:log]', payload)
      break
  }
}

/**
 * Hook the engine into the store. Replaces the stub emit set in store.ts.
 * Called once at app boot.
 */
export function installAutomationEngine(): void {
  const original = useStore.getState().emitAutomation
  useStore.setState({
    emitAutomation(event, payload) {
      original(event, payload as Payload)
      emit(event, payload as Payload)
    },
  })
}
