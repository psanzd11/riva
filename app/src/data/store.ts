import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { SeedShape, AuditLog } from './schema'
import seedData from './seed.json'
import { id as makeId } from '../lib/id'

const STORAGE_KEY = 'riva-hub-store-v2'

interface StoreActions {
  ingest<T extends keyof SeedShape>(key: T, value: SeedShape[T]): void
  /** Apply mutation + log to audit + emit automation event. */
  apply<T extends keyof SeedShape>(
    key: T,
    next: SeedShape[T],
    audit: {
      action: AuditLog['action']
      entity: string
      entityId: string
      diff?: Record<string, unknown>
      userId: string
    },
  ): void
  emitAutomation(event: string, payload: Record<string, unknown>): void
  /** Reset to initial seed (dev only). */
  resetSeed(): void
}

export type StoreState = SeedShape & StoreActions

const baseSeed = seedData as unknown as SeedShape

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...baseSeed,
      ingest(key, value) {
        set({ [key]: value } as Partial<StoreState>)
      },
      apply(key, next, audit) {
        const entry: AuditLog = {
          id: makeId('al'),
          userId: audit.userId,
          action: audit.action,
          entity: audit.entity,
          entityId: audit.entityId,
          diff: audit.diff,
          at: new Date().toISOString(),
        }
        const log = get().auditLog
        const trimmed = log.length >= 500 ? log.slice(log.length - 499) : log
        set({
          [key]: next,
          auditLog: [...trimmed, entry],
        } as Partial<StoreState>)
        // eslint-disable-next-line no-console
        console.debug('[audit]', audit.action, audit.entity, audit.entityId, audit.diff)
      },
      emitAutomation(event, payload) {
        // Stub: real engine in Phase 1+
        // eslint-disable-next-line no-console
        console.debug('[automation]', event, payload)
      },
      resetSeed() {
        set({ ...baseSeed })
      },
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => {
        const {
          ingest: _i,
          apply: _a,
          emitAutomation: _e,
          resetSeed: _r,
          ...persisted
        } = s
        return persisted
      },
    },
  ),
)
