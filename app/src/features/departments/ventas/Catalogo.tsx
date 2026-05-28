import { useNavigate } from 'react-router-dom'
import { useStore } from '../../../data/store'
import { PageHead } from '../../../components/layout/PageHead'
import { KpiGrid } from '../../../components/kpi/KpiGrid'
import { KpiCard } from '../../../components/kpi/KpiCard'
import { moneyCompact } from '../../../lib/format'
import { SkuTable } from '../shared/SkuTable'
import type { Sku } from '../../../data/schema'

/**
 * Read-only product catalog for the sales team — stock by warehouse + price/m²,
 * so a comercial can quote without entering Supply Chain. "Cotizar" pushes the
 * selected SKU into the TPV order builder.
 */
export function VentasCatalogo() {
  const navigate = useNavigate()
  const skus = useStore((s) => s.skus)

  const premium = skus.filter((s) => s.grade === 'premium')
  const inStock = skus.filter((s) => s.stockM2 > 0)
  const avgPremiumPrice = premium.length
    ? Math.round(premium.reduce((a, s) => a + s.pricePerM2, 0) / premium.length)
    : 0
  const totalValue = skus.reduce((a, s) => a + s.stockM2 * s.pricePerM2, 0)

  const onQuote = (sku: Sku) => {
    navigate('/dept/ventas/tpv', { state: { skuId: sku.id } })
  }

  return (
    <>
      <PageHead
        eyebrow="Ventas · Producto"
        title="Catálogo"
        description="Colecciones disponibles con stock por almacén y precio/m². Consulta disponibilidad y cotiza al instante — el botón Cotizar lleva el SKU al TPV."
      />

      <KpiGrid cols={4}>
        <KpiCard eyebrow="Referencias" value={String(skus.length)} sub={`${inStock.length} con stock`} />
        <KpiCard eyebrow="Premium" value={String(premium.length)} sub="línea top-tier" />
        <KpiCard eyebrow="Precio medio premium" value={`€ ${avgPremiumPrice}/m²`} sub="línea Cove · Vedetta" />
        <KpiCard eyebrow="Valor catálogo" value={moneyCompact(totalValue, 'EUR')} sub="stock × price/m²" />
      </KpiGrid>

      <SkuTable readOnly onQuote={onQuote} />
    </>
  )
}
