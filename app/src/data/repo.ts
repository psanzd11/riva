import type { SeedShape } from './schema'
import { useStore } from './store'
import { id as makeId } from '../lib/id'

type CollectionKey = keyof SeedShape
type WithId = { id: string }

export interface Repo<T extends WithId> {
  list(filters?: Partial<T> & { _q?: string }): T[]
  get(id: string): T | undefined
  create(input: Omit<T, 'id'>, userId?: string): T
  update(id: string, patch: Partial<T>, userId?: string): T
  remove(id: string, userId?: string): void
  subscribe(fn: (state: T[]) => void): () => void
}

const matchesFilter = <T extends Record<string, unknown>>(item: T, filters: Partial<T>): boolean => {
  for (const k of Object.keys(filters)) {
    if (k === '_q') continue
    const fv = filters[k as keyof T]
    if (fv === undefined) continue
    if (item[k as keyof T] !== fv) return false
  }
  return true
}

const matchesQuery = (item: Record<string, unknown>, q: string): boolean => {
  const haystack = Object.values(item).join(' ').toLowerCase()
  return haystack.includes(q.toLowerCase())
}

function makeRepo<T extends WithId>(key: CollectionKey, prefix: string): Repo<T> {
  return {
    list(filters) {
      const items = useStore.getState()[key] as unknown as T[]
      if (!filters) return items
      const { _q, ...rest } = filters as Partial<T> & { _q?: string }
      let out = items
      if (Object.keys(rest).length) {
        out = out.filter((it) => matchesFilter(it as unknown as Record<string, unknown>, rest as Partial<T>))
      }
      if (_q) {
        out = out.filter((it) => matchesQuery(it as unknown as Record<string, unknown>, _q))
      }
      return out
    },
    get(itemId) {
      const items = useStore.getState()[key] as unknown as T[]
      return items.find((it) => it.id === itemId)
    },
    create(input, userId = 'system') {
      const items = useStore.getState()[key] as unknown as T[]
      const item = { ...(input as object), id: makeId(prefix) } as T
      useStore.getState().apply(key, [...items, item] as unknown as SeedShape[typeof key], {
        action: 'create',
        entity: key,
        entityId: item.id,
        diff: input as Record<string, unknown>,
        userId,
      })
      useStore.getState().emitAutomation(`${key}.created`, { id: item.id, ...(input as object) })
      return item
    },
    update(itemId, patch, userId = 'system') {
      const items = useStore.getState()[key] as unknown as T[]
      const idx = items.findIndex((it) => it.id === itemId)
      if (idx === -1) throw new Error(`${key}: ${itemId} not found`)
      const before = items[idx]
      const next = { ...before, ...patch } as T
      const nextList = [...items]
      nextList[idx] = next
      useStore.getState().apply(key, nextList as unknown as SeedShape[typeof key], {
        action: 'update',
        entity: key,
        entityId: itemId,
        diff: patch as Record<string, unknown>,
        userId,
      })
      useStore.getState().emitAutomation(`${key}.updated`, { id: itemId, patch })
      return next
    },
    remove(itemId, userId = 'system') {
      const items = useStore.getState()[key] as unknown as T[]
      const next = items.filter((it) => it.id !== itemId)
      useStore.getState().apply(key, next as unknown as SeedShape[typeof key], {
        action: 'remove',
        entity: key,
        entityId: itemId,
        userId,
      })
      useStore.getState().emitAutomation(`${key}.removed`, { id: itemId })
    },
    subscribe(fn) {
      return useStore.subscribe((state) => fn(state[key] as unknown as T[]))
    },
  }
}

export const partnersRepo = makeRepo<SeedShape['partners'][number]>('partners', 'prt')
export const dealsRepo = makeRepo<SeedShape['deals'][number]>('deals', 'dl')
export const activitiesRepo = makeRepo<SeedShape['activities'][number]>('activities', 'act')
export const invoicesRepo = makeRepo<SeedShape['invoices'][number]>('invoices', 'inv')
export const paymentsRepo = makeRepo<SeedShape['payments'][number]>('payments', 'pay')
export const installationsRepo = makeRepo<SeedShape['installations'][number]>('installations', 'ins')
export const crewsRepo = makeRepo<SeedShape['crews'][number]>('crews', 'crw')
export const ticketsRepo = makeRepo<SeedShape['tickets'][number]>('tickets', 'tkt')
export const reviewsRepo = makeRepo<SeedShape['reviews'][number]>('reviews', 'rv')
export const skusRepo = makeRepo<SeedShape['skus'][number]>('skus', 'sku')
export const purchaseOrdersRepo = makeRepo<SeedShape['purchaseOrders'][number]>('purchaseOrders', 'po')
export const suppliersRepo = makeRepo<SeedShape['suppliers'][number]>('suppliers', 'sup')
export const campaignsRepo = makeRepo<SeedShape['campaigns'][number]>('campaigns', 'cmp')
export const leadsRepo = makeRepo<SeedShape['leads'][number]>('leads', 'ld')
export const automationRulesRepo = makeRepo<SeedShape['automationRules'][number]>('automationRules', 'ar')
export const integrationsRepo = makeRepo<SeedShape['integrations'][number]>('integrations', 'itg')
export const notificationsRepo = makeRepo<SeedShape['notifications'][number]>('notifications', 'ntf')
export const auditLogRepo = makeRepo<SeedShape['auditLog'][number]>('auditLog', 'al')
export const usersRepo = makeRepo<SeedShape['users'][number]>('users', 'usr')
