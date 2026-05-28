import { useMemo, useState } from 'react'
import { useStore } from '../../../data/store'
import { Panel } from '../../../components/ui/Panel'
import { Pill } from '../../../components/ui/Pill'
import { FilterTabs } from '../../../components/ui/FilterTabs'
import { LbBar } from '../../../components/data-table/Leaderboard'
import type { Sku } from '../../../data/schema'

const GRADE_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'premium', label: 'Premium' },
  { value: 'regular', label: 'Regular' },
] as const

const WAREHOUSE_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'es', label: 'Madrid · ES' },
  { value: 'us', label: 'Newark · USA' },
] as const

const STOCK_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'below', label: 'Bajo mín.' },
  { value: 'top', label: 'Top demand' },
  { value: 'slow', label: 'Slow' },
] as const

interface SkuTableProps {
  /** Read-only catalog mode: hides the "OC sugerida" replenishment column. */
  readOnly?: boolean
  /** When provided, renders a per-row action button (e.g. "Cotizar") in catalog mode. */
  onQuote?: (sku: Sku) => void
  /** Label for the per-row action button. Defaults to "Cotizar". */
  quoteLabel?: string
  /** Max rows to render. */
  limit?: number
}

/**
 * Shared SKU/inventory table with grade · warehouse · stock filters.
 * Used by Supply Chain (full, with replenishment column) and by Ventas → Catálogo
 * (read-only, with a "Cotizar" action that pushes the SKU to the TPV).
 */
export function SkuTable({ readOnly = false, onQuote, quoteLabel = 'Cotizar', limit = 30 }: SkuTableProps) {
  const skus = useStore((s) => s.skus)
  const [gradeFilter, setGradeFilter] = useState<(typeof GRADE_FILTERS)[number]['value']>('all')
  const [warehouseFilter, setWarehouseFilter] = useState<(typeof WAREHOUSE_FILTERS)[number]['value']>('all')
  const [stockFilter, setStockFilter] = useState<(typeof STOCK_FILTERS)[number]['value']>('all')

  const filtered = useMemo(() => {
    let list = skus
    if (gradeFilter !== 'all') list = list.filter((s) => s.grade === gradeFilter)
    if (warehouseFilter !== 'all') list = list.filter((s) => s.warehouse === warehouseFilter)
    if (stockFilter === 'below') list = list.filter((s) => s.stockM2 < s.thresholdM2)
    if (stockFilter === 'top') list = [...list].sort((a, b) => b.demandLast90 - a.demandLast90)
    if (stockFilter === 'slow') list = [...list].sort((a, b) => a.demandLast90 - b.demandLast90)
    return list
  }, [skus, gradeFilter, warehouseFilter, stockFilter])

  return (
    <>
      <Panel headless className="mb-6">
        <div className="flex flex-wrap items-center gap-4 p-5">
          <div className="flex items-center gap-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-n-500">Grade</div>
            <FilterTabs options={GRADE_FILTERS} value={gradeFilter} onChange={setGradeFilter} />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-n-500">Almacén</div>
            <FilterTabs options={WAREHOUSE_FILTERS} value={warehouseFilter} onChange={setWarehouseFilter} />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-n-500">Stock</div>
            <FilterTabs options={STOCK_FILTERS} value={stockFilter} onChange={setStockFilter} variant="time" />
          </div>
        </div>
      </Panel>

      <table className="data-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Tipo madera</th>
            <th>Grade</th>
            <th>Almacén</th>
            <th>Stock</th>
            <th>Umbral</th>
            <th>Cobertura</th>
            <th>Precio/m²</th>
            {!readOnly && <th>OC sugerida</th>}
            <th>Estado</th>
            {onQuote && <th></th>}
          </tr>
        </thead>
        <tbody>
          {filtered.slice(0, limit).map((s) => {
            const ratio = s.stockM2 / s.thresholdM2
            const variant: 'err' | 'warn' | 'ok' = ratio < 0.35 ? 'err' : ratio < 1 ? 'warn' : 'ok'
            const label = variant === 'err' ? 'Crítico' : variant === 'warn' ? 'Bajo' : 'OK'
            const coverDays = Math.round(s.stockM2 / Math.max(1, s.demandLast90 / 90))
            const fillColor = variant === 'err' ? 'var(--error)' : variant === 'warn' ? 'var(--warning)' : undefined
            const sugQty = variant === 'ok' ? '—' : `${Math.round(s.thresholdM2 * 1.4)} m²`
            return (
              <tr key={s.id}>
                <td>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-[11px] text-n-500">{s.collection} · {s.finish}</div>
                </td>
                <td className="text-[12px]">{s.woodType}</td>
                <td>
                  <span
                    className="border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]"
                    style={{
                      borderColor: s.grade === 'premium' ? 'var(--cove)' : 'var(--n-300)',
                      color: s.grade === 'premium' ? 'var(--cove)' : 'var(--n-700)',
                    }}
                  >
                    {s.grade}
                  </span>
                </td>
                <td>
                  <span
                    className="border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]"
                    style={{
                      borderColor: s.warehouse === 'es' ? 'var(--cove)' : 'var(--oak-mid)',
                      color: s.warehouse === 'es' ? 'var(--cove)' : 'var(--oak-mid)',
                    }}
                  >
                    {s.warehouse === 'es' ? 'Madrid ES' : 'Newark USA'}
                  </span>
                </td>
                <td>{s.stockM2} m²</td>
                <td>{s.thresholdM2} m²</td>
                <td>
                  <LbBar pct={Math.min(100, ratio * 100)} fillColor={fillColor} variant={variant === 'ok' ? 'success' : 'cove'} value={`${coverDays} d`} />
                </td>
                <td>€ {s.pricePerM2}</td>
                {!readOnly && <td>{sugQty}</td>}
                <td><Pill variant={variant}>{label}</Pill></td>
                {onQuote && (
                  <td>
                    <button
                      onClick={() => onQuote(s)}
                      disabled={s.stockM2 <= 0}
                      className="whitespace-nowrap border border-riva-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-riva-black transition hover:bg-riva-black hover:text-riva-ivory disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      {quoteLabel}
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}
