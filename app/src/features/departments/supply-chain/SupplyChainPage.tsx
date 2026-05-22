import { useMemo, useState } from 'react'
import { useStore } from '../../../data/store'
import { purchaseOrdersRepo } from '../../../data/repo'
import { useRole } from '../../../auth/RoleContext'
import { PageHead } from '../../../components/layout/PageHead'
import { Button } from '../../../components/ui/Button'
import { Panel } from '../../../components/ui/Panel'
import { Pill } from '../../../components/ui/Pill'
import { KpiGrid } from '../../../components/kpi/KpiGrid'
import { KpiCard } from '../../../components/kpi/KpiCard'
import { FilterTabs } from '../../../components/ui/FilterTabs'
import { Donut } from '../../../components/charts/Donut'
import { VBarChart } from '../../../components/charts/VBarChart'
import { RatioGrid } from '../../../components/charts/RatioGrid'
import { LbBar } from '../../../components/data-table/Leaderboard'
import { money } from '../../../lib/format'
import { OcKanban } from './OcKanban'

const SKU_FILTERS = [
  { value: 'below', label: 'Bajo mín.' },
  { value: 'top', label: 'Top demand' },
  { value: 'slow', label: 'Slow' },
] as const

export function SupplyChainPage() {
  const { currentUserId } = useRole()
  const skus = useStore((s) => s.skus)
  const suppliers = useStore((s) => s.suppliers)
  const orders = useStore((s) => s.purchaseOrders)
  const [skuFilter, setSkuFilter] = useState<(typeof SKU_FILTERS)[number]['value']>('top')

  const critical = skus.filter((s) => s.stockM2 < s.thresholdM2)
  const openOcsValue = orders.reduce((acc, o) => acc + o.totalCost, 0)

  const skusByFilter = useMemo(() => {
    if (skuFilter === 'below') return skus.filter((s) => s.stockM2 < s.thresholdM2)
    if (skuFilter === 'slow') return [...skus].sort((a, b) => a.demandLast90 - b.demandLast90).slice(0, 5)
    // top demand
    return [...skus].sort((a, b) => b.demandLast90 - a.demandLast90).slice(0, 8)
  }, [skus, skuFilter])

  const createPoFromCritical = () => {
    const target = critical[0]
    if (!target) return
    purchaseOrdersRepo.create(
      {
        number: `OC-${4400 + Math.floor(Math.random() * 99)}`,
        skuId: target.id,
        quantity: Math.round(target.thresholdM2 * 1.4),
        supplierId: target.supplierId,
        status: 'factory',
        etaAt: new Date(Date.now() + target.leadTimeDays * 86400000).toISOString(),
        totalCost: Math.round(target.thresholdM2 * 130),
        currency: 'EUR',
      },
      currentUserId,
    )
  }

  const totalStockEs = skus.filter((s) => s.warehouse === 'es').reduce((a, b) => a + b.stockM2, 0)
  const totalStockUs = skus.filter((s) => s.warehouse === 'us').reduce((a, b) => a + b.stockM2, 0)

  const ltBars = suppliers.slice(0, 6).map((sp, i) => ({
    label: sp.name.split(' ')[0],
    value: String(sp.leadTimeAvg),
    heightPct: Math.min(90, sp.leadTimeAvg * 2),
    variant: i === 0 ? ('sage' as const) : i === 1 ? ('cove' as const) : i === 2 ? ('oak' as const) : i === 5 ? ('error' as const) : ('mid' as const),
  }))

  return (
    <>
      <PageHead
        eyebrow="Departamento"
        title="Supply Chain"
        description="Inventario, lead times, OC a fábrica, almacenes ES y USA. Stock crítico genera alerta automática con OC pre-rellenada."
        actions={
          <>
            <Button variant="outline">Inventario</Button>
            <Button onClick={createPoFromCritical}>+ OC sugerida</Button>
          </>
        }
      />

      <KpiGrid>
        <KpiCard eyebrow="SKUs activos" value={String(skus.length)} sub={`${skus.filter((s) => s.warehouse === 'es').length} ES · ${skus.filter((s) => s.warehouse === 'us').length} USA`} />
        <KpiCard eyebrow="Stock crítico" value={String(critical.length)} delta={{ type: 'down', label: critical.slice(0, 3).map((s) => s.name).join(' · ') }} />
        <KpiCard eyebrow="Lead time medio" value="28 d" delta={{ type: 'up', label: '−3 d vs Q1' }} />
        <KpiCard eyebrow="OC abiertas" value={String(orders.length)} sub={`${money(openOcsValue, 'EUR')} en tránsito`} />
      </KpiGrid>

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-[26px] font-light tracking-[0.04em]">Pipeline de OC · fábrica al almacén</h2>
        <div className="text-[11px] uppercase tracking-[0.1em] text-n-500">Drag para mover OC entre estados</div>
      </div>
      <OcKanban />

      <div className="mb-12 grid gap-8" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <Panel title="Stock por almacén" action={<a className="link text-[11px] cursor-pointer">m² equivalentes</a>}>
          <Donut
            slices={[
              { label: 'Madrid · ES', value: totalStockEs, color: 'var(--cove)', valueLabel: `${totalStockEs} m²` },
              { label: 'Newark · USA', value: totalStockUs, color: 'var(--oak-mid)', valueLabel: `${totalStockUs} m²` },
            ]}
            total={{ label: 'Total', value: `${totalStockEs + totalStockUs} m²` }}
          />
        </Panel>

        <Panel title="Lead time por proveedor" action={<a className="link text-[11px] cursor-pointer">días</a>}>
          <VBarChart
            bars={ltBars}
            foot={{ left: 'Objetivo < 28 d', right: 'Media · 31 d' }}
          />
        </Panel>

        <Panel title="Rotación & salud" action={<a className="link text-[11px] cursor-pointer">YTD</a>}>
          <RatioGrid
            items={[
              { label: 'Rotación stock', value: '4,2x', delta: { type: 'up', label: 'objetivo 4,0x' } },
              { label: 'Días cobertura', value: '68 d', delta: { type: 'neutral', label: 'estándar' } },
              { label: 'Stockouts', value: String(critical.length), delta: { type: 'down', label: '↑ 1 vs abril' } },
              { label: 'Merma', value: '0,8%', delta: { type: 'up', label: '−0,3 pp' } },
              { label: 'Capacity', value: '76%', delta: { type: 'neutral', label: 'de 13.200 m²' } },
              { label: 'On-time pedido', value: '94%', delta: { type: 'up', label: '↑ 3 pp' } },
            ]}
          />
        </Panel>
      </div>

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-[26px] font-light tracking-[0.04em]">SKUs · reposición automática</h2>
        <FilterTabs options={SKU_FILTERS} value={skuFilter} onChange={setSkuFilter} variant="time" />
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Almacén</th>
            <th>Stock</th>
            <th>Umbral</th>
            <th>Cobertura</th>
            <th>OC sugerida</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {skusByFilter.map((s) => {
            const ratio = s.stockM2 / s.thresholdM2
            const variant: 'err' | 'warn' | 'ok' = ratio < 0.35 ? 'err' : ratio < 1 ? 'warn' : 'ok'
            const label = variant === 'err' ? 'Crítico' : variant === 'warn' ? 'Bajo' : 'OK'
            const coverDays = Math.round((s.stockM2 / Math.max(1, s.demandLast90 / 90)))
            const fillColor = variant === 'err' ? 'var(--error)' : variant === 'warn' ? 'var(--warning)' : undefined
            const sugQty = variant === 'ok' ? '—' : `${Math.round(s.thresholdM2 * 1.4)} m²`
            return (
              <tr key={s.id}>
                <td>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-[11px] text-n-500">{s.collection} · {s.finish}</div>
                </td>
                <td>{s.warehouse === 'es' ? 'Madrid' : 'Newark'}</td>
                <td>{s.stockM2} m²</td>
                <td>{s.thresholdM2} m²</td>
                <td>
                  <LbBar
                    pct={Math.min(100, ratio * 100)}
                    fillColor={fillColor}
                    variant={variant === 'ok' ? 'sage' : 'cove'}
                    value={`${coverDays} d`}
                  />
                </td>
                <td>{sugQty}</td>
                <td><Pill variant={variant}>{label}</Pill></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}
