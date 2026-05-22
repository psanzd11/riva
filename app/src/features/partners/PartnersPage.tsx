import { useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useStore } from '../../data/store'
import { useRole } from '../../auth/RoleContext'
import { PageHead } from '../../components/layout/PageHead'
import { Button } from '../../components/ui/Button'
import { Pill } from '../../components/ui/Pill'
import { FilterTabs } from '../../components/ui/FilterTabs'
import { money, dateRelative } from '../../lib/format'

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'es', label: 'España' },
  { value: 'us', label: 'USA' },
  { value: 'flagship', label: 'Flagship' },
  { value: 'top10', label: 'Top 10' },
] as const
type FilterValue = (typeof FILTERS)[number]['value']

const STATUS_PILL: Record<string, { label: string; variant: 'ok' | 'warn' | 'err' | 'default' }> = {
  active: { label: 'Activo', variant: 'ok' },
  inactive_3d: { label: 'Sin actividad 3d', variant: 'warn' },
  inactive_7d: { label: 'Sin actividad 7d', variant: 'warn' },
  below_target: { label: 'Bajo objetivo', variant: 'warn' },
}

export function PartnersPage() {
  const navigate = useNavigate()
  const { role, currentUserId } = useRole()
  const allPartners = useStore((s) => s.partners)
  const [filter, setFilter] = useState<FilterValue>('all')

  const partners = useMemo(() => {
    // Comercial only sees their assigned partners
    let list = allPartners
    if (role === 'comercial') {
      list = list.filter((p) => p.assignedTo === currentUserId)
    }
    switch (filter) {
      case 'es':
        list = list.filter((p) => p.sede === 'es')
        break
      case 'us':
        list = list.filter((p) => p.sede === 'us')
        break
      case 'flagship':
        list = list.filter((p) => p.type === 'flagship')
        break
      case 'top10':
        list = [...list].sort((a, b) => b.salesYtd - a.salesYtd).slice(0, 10)
        break
      default:
        break
    }
    // Flagship first, then by sales desc
    return [...list].sort((a, b) => {
      if (a.type === 'flagship' && b.type !== 'flagship') return -1
      if (b.type === 'flagship' && a.type !== 'flagship') return 1
      return b.salesYtd - a.salesYtd
    })
  }, [allPartners, filter, role, currentUserId])

  return (
    <>
      <PageHead
        eyebrow="Red comercial"
        title="Partners & Showrooms"
        description="47 partners activos. La mayoría son corners en showrooms de terceros. El Flagship Miami es sede propia y se trata aquí como un partner más, con dashboard ampliado."
        actions={
          <>
            <Button variant="outline">Exportar</Button>
            <Button>+ Nuevo partner</Button>
          </>
        }
      />

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-[26px] font-light tracking-[0.04em]">Listado</h2>
        <FilterTabs options={FILTERS} value={filter} onChange={setFilter} />
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Partner</th>
            <th>Sede</th>
            <th>Tipo</th>
            <th>Ventas YTD</th>
            <th>Última actividad</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((p) => {
            const status = STATUS_PILL[p.status] ?? { label: 'Activo', variant: 'ok' as const }
            const isFlag = p.type === 'flagship'
            return (
              <tr
                key={p.id}
                onClick={() => (isFlag ? navigate('/flagship') : null)}
                style={isFlag ? { background: '#fcfaf6' } : undefined}
              >
                <td style={isFlag ? { borderLeft: '3px solid var(--oak-mid)' } : undefined}>
                  <div className="text-[14px] font-medium">
                    {p.name}
                    {isFlag && (
                      <span className="ml-2 text-[9.5px] font-bold uppercase tracking-[0.18em] text-oak-mid">Own</span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] tracking-[0.04em] text-n-500">
                    {p.address} · {p.type === 'flagship' ? 'sede propia' : `${p.type} ${p.m2} m²`}
                  </div>
                </td>
                <td>{p.sede === 'es' ? 'España' : 'USA'}</td>
                <td className="capitalize">{p.type}</td>
                <td>{money(p.salesYtd, p.currency)}</td>
                <td>{dateRelative(p.lastActivity)}</td>
                <td>
                  <Pill variant={status.variant}>{status.label}</Pill>
                </td>
              </tr>
            )
          })}
          {partners.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center text-n-500">
                No hay partners visibles para este rol/filtro.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  )
}
