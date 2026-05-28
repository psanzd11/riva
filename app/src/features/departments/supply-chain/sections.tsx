import { useStore } from '../../../data/store'
import { purchaseOrdersRepo } from '../../../data/repo'
import { useRole } from '../../../auth/RoleContext'
import { PageHead } from '../../../components/layout/PageHead'
import { Button } from '../../../components/ui/Button'
import { Panel } from '../../../components/ui/Panel'
import { Pill } from '../../../components/ui/Pill'
import { KpiGrid } from '../../../components/kpi/KpiGrid'
import { KpiCard } from '../../../components/kpi/KpiCard'
import { Donut } from '../../../components/charts/Donut'
import { VBarChart } from '../../../components/charts/VBarChart'
import { RatioGrid } from '../../../components/charts/RatioGrid'
import { money, moneyCompact, dateShort } from '../../../lib/format'
import { OcKanban } from './OcKanban'
import { DeptEquipo } from '../shared/DeptEquipo'
import { SkuTable } from '../shared/SkuTable'

function ScHeader({ actions }: { actions?: React.ReactNode }) {
  return (
    <PageHead
      eyebrow="Departamento"
      title="Supply Chain"
      description="Inventario · Premium vs Regular · fábrica en España (Vilanova, Tabuyo) · almacenes Madrid + Newark · stock crítico genera OC automática."
      actions={actions}
    />
  )
}

// ====================================================================
// RESUMEN — rico
// ====================================================================
export function ScResumen() {
  const skus = useStore((s) => s.skus)
  const orders = useStore((s) => s.purchaseOrders)
  const critical = skus.filter((s) => s.stockM2 < s.thresholdM2)
  const openOcsValue = orders.reduce((acc, o) => acc + o.totalCost, 0)
  const totalStockEs = skus.filter((s) => s.warehouse === 'es').reduce((a, b) => a + b.stockM2, 0)
  const totalStockUs = skus.filter((s) => s.warehouse === 'us').reduce((a, b) => a + b.stockM2, 0)
  const premiumStock = skus.filter((s) => s.grade === 'premium').reduce((a, b) => a + b.stockM2, 0)
  const regularStock = skus.filter((s) => s.grade === 'regular').reduce((a, b) => a + b.stockM2, 0)
  const totalValue = skus.reduce((a, b) => a + b.stockM2 * b.pricePerM2, 0)

  return (
    <>
      <ScHeader
        actions={
          <>
            <Button variant="outline">Inventario</Button>
            <Button>+ OC</Button>
          </>
        }
      />

      <KpiGrid cols={8}>
        <KpiCard eyebrow="SKUs activos" value={String(skus.length)} sub={`${skus.filter((s) => s.warehouse === 'es').length} ES · ${skus.filter((s) => s.warehouse === 'us').length} USA`} />
        <KpiCard eyebrow="Stock total m²" value={String(totalStockEs + totalStockUs)} sub="todos los almacenes" />
        <KpiCard eyebrow="Stock crítico" value={String(critical.length)} delta={{ type: 'down', label: critical.slice(0, 2).map((s) => s.name).join(' · ') || 'OK' }} />
        <KpiCard eyebrow="Valor inventario" value={moneyCompact(totalValue, 'EUR')} sub="stock × price/m²" />
        <KpiCard eyebrow="Premium m²" value={String(premiumStock)} sub="línea top-tier" />
        <KpiCard eyebrow="Regular m²" value={String(regularStock)} sub="línea estándar" />
        <KpiCard eyebrow="OC abiertas" value={String(orders.length)} sub={`${money(openOcsValue, 'EUR')} en tránsito`} />
        <KpiCard eyebrow="Lead time medio" value="28 d" delta={{ type: 'up', label: '−3 d vs Q1' }} />
      </KpiGrid>

      {/* Modelo del negocio */}
      <Panel title="Modelo Supply Chain · cómo fluye el material">
        <div className="grid grid-cols-1 gap-px bg-n-300 md:grid-cols-4">
          <div className="bg-riva-white p-5">
            <div className="eyebrow !mb-2">Fábrica</div>
            <h4 className="font-display text-[18px] font-light">España</h4>
            <p className="mt-2 text-[12px] text-n-700">
              Vilanova, Tabuyo, Sevillana producen el material. Lead time medio <b>28 d</b>.
            </p>
          </div>
          <div className="bg-riva-white p-5">
            <div className="eyebrow !mb-2">Almacén local</div>
            <h4 className="font-display text-[18px] font-light">Madrid · Newark</h4>
            <p className="mt-2 text-[12px] text-n-700">
              <b>Madrid {totalStockEs} m²</b> · <b>Newark {totalStockUs} m²</b>.
              Cada SKU vive en uno de los dos.
            </p>
          </div>
          <div className="bg-riva-white p-5">
            <div className="eyebrow !mb-2">Grade</div>
            <h4 className="font-display text-[18px] font-light">Premium · Regular</h4>
            <p className="mt-2 text-[12px] text-n-700">
              Cada tipo de madera tiene línea Premium (Cove, Vedetta, Reserve) o Regular (Laguna, Cotton, Glaze).
              Premium ~30% más caro.
            </p>
          </div>
          <div className="bg-riva-white p-5">
            <div className="eyebrow !mb-2">Reposición</div>
            <h4 className="font-display text-[18px] font-light">Auto OC</h4>
            <p className="mt-2 text-[12px] text-n-700">
              <b>{critical.length}</b> SKUs bajo umbral · automation engine prepara OC pre-rellenadas.
            </p>
          </div>
        </div>
      </Panel>

      <div className="mt-8 mb-8 grid gap-8" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <Panel title="Stock por almacén">
          <Donut
            slices={[
              { label: 'Madrid · ES', value: totalStockEs, color: 'var(--cove)', valueLabel: `${totalStockEs} m²` },
              { label: 'Newark · USA', value: totalStockUs, color: 'var(--oak-mid)', valueLabel: `${totalStockUs} m²` },
            ]}
            total={{ label: 'Total', value: `${totalStockEs + totalStockUs} m²` }}
          />
        </Panel>

        <Panel title="Stock por grade">
          <Donut
            slices={[
              { label: 'Premium', value: premiumStock, color: 'var(--cove)', valueLabel: `${premiumStock} m²` },
              { label: 'Regular', value: regularStock, color: 'var(--sage)', valueLabel: `${regularStock} m²` },
            ]}
          />
        </Panel>

        <Panel title="Salud inventario">
          <RatioGrid
            items={[
              { label: 'Rotación', value: '4,2x', delta: { type: 'up', label: 'obj. 4,0x' } },
              { label: 'Cobertura', value: '68 d', delta: { type: 'neutral', label: 'estándar' } },
              { label: 'Stockouts', value: String(skus.filter((s) => s.stockM2 < s.thresholdM2 * 0.35).length), delta: { type: 'down', label: '↑ 1' } },
              { label: 'On-time pedido', value: '94%', delta: { type: 'up', label: '↑ 3 pp' } },
            ]}
          />
        </Panel>
      </div>

      <h2 className="mb-4 font-display text-[26px] font-light tracking-[0.04em]">SKUs críticos</h2>
      <table className="data-table">
        <thead>
          <tr><th>SKU</th><th>Grade</th><th>Almacén</th><th>Stock</th><th>Cobertura</th><th>Estado</th></tr>
        </thead>
        <tbody>
          {critical.slice(0, 6).map((s) => {
            const ratio = s.stockM2 / s.thresholdM2
            const variant: 'err' | 'warn' = ratio < 0.35 ? 'err' : 'warn'
            const coverDays = Math.round(s.stockM2 / Math.max(1, s.demandLast90 / 90))
            return (
              <tr key={s.id}>
                <td>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-[11px] text-n-500">{s.woodType} · {s.finish}</div>
                </td>
                <td>
                  <span className={`text-[10px] uppercase tracking-[0.12em] ${s.grade === 'premium' ? 'text-cove' : 'text-n-500'}`}>
                    {s.grade}
                  </span>
                </td>
                <td>{s.warehouse === 'es' ? 'Madrid' : 'Newark'}</td>
                <td>{s.stockM2}/{s.thresholdM2} m²</td>
                <td>{coverDays} d</td>
                <td><Pill variant={variant}>{variant === 'err' ? 'Crítico' : 'Bajo'}</Pill></td>
              </tr>
            )
          })}
          {critical.length === 0 && <tr><td colSpan={6} className="text-center text-n-500">Sin SKUs críticos.</td></tr>}
        </tbody>
      </table>
    </>
  )
}

// ====================================================================
// INVENTARIO — grade + warehouse + agrupación por madera
// ====================================================================
export function ScInventario() {
  const { currentUserId } = useRole()
  const skus = useStore((s) => s.skus)

  const createPoFromCritical = () => {
    const critical = skus.find((s) => s.stockM2 < s.thresholdM2)
    if (!critical) return
    purchaseOrdersRepo.create({
      number: `OC-${4400 + Math.floor(Math.random() * 99)}`,
      skuId: critical.id,
      quantity: Math.round(critical.thresholdM2 * 1.4),
      supplierId: critical.supplierId,
      status: 'factory',
      etaAt: new Date(Date.now() + critical.leadTimeDays * 86400000).toISOString(),
      totalCost: Math.round(critical.thresholdM2 * critical.pricePerM2),
      currency: 'EUR',
    }, currentUserId)
  }

  return (
    <>
      <ScHeader
        actions={
          <>
            <Button variant="outline">Exportar</Button>
            <Button onClick={createPoFromCritical}>+ OC sugerida</Button>
          </>
        }
      />

      <SkuTable />
    </>
  )
}

// ====================================================================
// PIPELINE OC — mejorado
// ====================================================================
export function ScOc() {
  const orders = useStore((s) => s.purchaseOrders)
  const skus = useStore((s) => s.skus)

  const factory = orders.filter((o) => o.status === 'factory')
  const transit = orders.filter((o) => o.status === 'transit')
  const customs = orders.filter((o) => o.status === 'customs')
  const warehouse = orders.filter((o) => o.status === 'warehouse')
  const totalValue = orders.reduce((a, o) => a + o.totalCost, 0)

  return (
    <>
      <ScHeader
        actions={
          <>
            <Button variant="outline">Exportar</Button>
            <Button>+ OC</Button>
          </>
        }
      />

      {/* OC KPI strip */}
      <KpiGrid cols={5}>
        <KpiCard eyebrow="En fábrica · ES" value={String(factory.length)} sub={`${money(factory.reduce((a, o) => a + o.totalCost, 0), 'EUR')}`} />
        <KpiCard eyebrow="En tránsito" value={String(transit.length)} sub={`${money(transit.reduce((a, o) => a + o.totalCost, 0), 'EUR')}`} />
        <KpiCard eyebrow="Aduanas" value={String(customs.length)} sub={`${money(customs.reduce((a, o) => a + o.totalCost, 0), 'EUR')}`} />
        <KpiCard eyebrow="En almacén · QA" value={String(warehouse.length)} sub={`${money(warehouse.reduce((a, o) => a + o.totalCost, 0), 'EUR')}`} />
        <KpiCard eyebrow="Total en tránsito" value={moneyCompact(totalValue, 'EUR')} sub={`${orders.length} OC abiertas`} />
      </KpiGrid>

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-[26px] font-light tracking-[0.04em]">Pipeline OC · fábrica al almacén</h2>
        <div className="text-[11px] uppercase tracking-[0.1em] text-n-500">Drag para mover OC entre estados</div>
      </div>
      <OcKanban />

      <h2 className="mb-4 font-display text-[26px] font-light tracking-[0.04em]">Detalle de OC abiertas</h2>
      <table className="data-table">
        <thead>
          <tr><th>OC</th><th>SKU</th><th>Cantidad</th><th>Coste</th><th>ETA</th><th>Estado</th></tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const sku = skus.find((s) => s.id === o.skuId)
            return (
              <tr key={o.id}>
                <td className="font-medium">{o.number}</td>
                <td>
                  <div>{sku?.name ?? '—'}</div>
                  <div className="text-[11px] text-n-500">{sku?.woodType} · {sku?.grade}</div>
                </td>
                <td>{o.quantity} m²</td>
                <td>{money(o.totalCost, o.currency)}</td>
                <td>{dateShort(o.etaAt)}</td>
                <td><Pill variant={o.status === 'warehouse' ? 'ok' : o.status === 'customs' ? 'warn' : 'default'}>{o.status}</Pill></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

// ====================================================================
// PROVEEDORES
// ====================================================================
export function ScProveedores() {
  const suppliers = useStore((s) => s.suppliers)
  const skus = useStore((s) => s.skus)

  const ltBars = suppliers.slice(0, 6).map((sp, i) => ({
    label: sp.name.split(' ')[0],
    value: String(sp.leadTimeAvg),
    heightPct: Math.min(90, sp.leadTimeAvg * 2),
    variant: i === 0 ? ('sage' as const) : i === 1 ? ('cove' as const) : i === 2 ? ('oak' as const) : i === 5 ? ('error' as const) : ('mid' as const),
  }))

  return (
    <>
      <ScHeader />
      <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Panel title="Lead time por proveedor">
          <VBarChart bars={ltBars} foot={{ left: 'Objetivo < 28 d', right: 'Media · 31 d' }} />
        </Panel>
        <Panel title="Rotación & salud">
          <RatioGrid
            items={[
              { label: 'Rotación stock', value: '4,2x', delta: { type: 'up', label: 'objetivo 4,0x' } },
              { label: 'Días cobertura', value: '68 d', delta: { type: 'neutral', label: 'estándar' } },
              { label: 'Stockouts', value: String(skus.filter((s) => s.stockM2 < s.thresholdM2 * 0.35).length), delta: { type: 'down', label: '↑ 1 vs abril' } },
              { label: 'Merma', value: '0,8%', delta: { type: 'up', label: '−0,3 pp' } },
              { label: 'Capacity', value: '76%', delta: { type: 'neutral', label: 'de 13.200 m²' } },
              { label: 'On-time pedido', value: '94%', delta: { type: 'up', label: '↑ 3 pp' } },
            ]}
          />
        </Panel>
      </div>

      <h2 className="mb-4 mt-8 font-display text-[26px] font-light tracking-[0.04em]">Proveedores</h2>
      <table className="data-table">
        <thead>
          <tr><th>Proveedor</th><th>País</th><th>Lead time medio</th><th>SKUs asociados</th></tr>
        </thead>
        <tbody>
          {suppliers.map((sp) => {
            const skuCount = skus.filter((sk) => sk.supplierId === sp.id).length
            return (
              <tr key={sp.id}>
                <td className="font-medium">{sp.name}</td>
                <td>{sp.country}</td>
                <td>{sp.leadTimeAvg} d</td>
                <td>{skuCount}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

// ====================================================================
// EQUIPO
// ====================================================================
export function ScEquipo() {
  return (
    <>
      <ScHeader />
      <DeptEquipo
        dept="supply-chain"
        title="Equipo de Supply Chain"
        description="Procurement + warehouse management + análisis de inventario. Coordinan la fábrica española y los dos almacenes (Madrid + Newark)."
      />
    </>
  )
}
