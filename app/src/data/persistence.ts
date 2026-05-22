import { useStore } from './store'

/**
 * Hydrates the store on first load. zustand/persist already restores from
 * localStorage; this is a hook for any post-hydrate work (versioning, migrations).
 */
export function hydrateSeed(): void {
  // Touch the store so it pulls from storage if present.
  useStore.getState()
}
