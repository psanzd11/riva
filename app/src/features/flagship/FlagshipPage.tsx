import { PageHead } from '../../components/layout/PageHead'
import { Button } from '../../components/ui/Button'
import { Panel } from '../../components/ui/Panel'
import { Pill } from '../../components/ui/Pill'
import { KpiGrid } from '../../components/kpi/KpiGrid'
import { KpiCard } from '../../components/kpi/KpiCard'

export function FlagshipPage() {
  return (
    <>
      <PageHead
        eyebrow="Flagship · Sede propia · Miami"
        title="Design District"
        description="Dashboard ampliado del único showroom 100% RIVA. Tratado como partner en el sistema, con P&L independiente, equipo dedicado y reporting al detalle."
        actions={
          <>
            <Button variant="outline">P&L completo</Button>
            <Button>+ Reservar visita</Button>
          </>
        }
      />

      <KpiGrid cols={8}>
        <KpiCard eyebrow="Ingresos mes" value="€ 96.450" delta={{ type: 'up', label: '↑ 22,6%' }} />
        <KpiCard eyebrow="Visitas mes" value="412" delta={{ type: 'up', label: '↑ 18%' }} />
        <KpiCard eyebrow="Conversión" value="14,3%" delta={{ type: 'up', label: '↑ 2,1 pp' }} />
        <KpiCard eyebrow="Margen bruto" value="38,2%" sub="Objetivo 40%" />
        <KpiCard eyebrow="Ticket medio" value="€ 9.840" delta={{ type: 'up', label: '↑ 5,4%' }} />
        <KpiCard eyebrow="Equipo" value="6" sub="2 ventas · 2 diseño · 2 ops" />
        <KpiCard eyebrow="Stock SKUs" value="94" sub="3 en reposición" />
        <KpiCard eyebrow="NPS" value="+71" delta={{ type: 'up', label: 'vs +62 holding' }} />
      </KpiGrid>

      <div className="grid gap-8" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <Panel title="Pipeline propio" action={<a className="link text-[11px] cursor-pointer">Ver todos</a>}>
          <table className="data-table border-0">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Proyecto</th>
                <th>Importe</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Casa Velázquez</td><td>Reforma 220 m²</td><td>€ 28.400</td><td><Pill variant="ok">Cerrado</Pill></td></tr>
              <tr><td>Hotel La Reserva</td><td>Suites 8 unid.</td><td>€ 64.200</td><td><Pill variant="warn">Negociación</Pill></td></tr>
              <tr><td>R. Estudio</td><td>Vivienda 140 m²</td><td>€ 18.900</td><td><Pill variant="ok">Cerrado</Pill></td></tr>
              <tr><td>Promotor Eolo</td><td>3 viviendas</td><td>€ 42.100</td><td><Pill variant="warn">Propuesta</Pill></td></tr>
              <tr><td>Estudio Mora</td><td>Local comercial</td><td>€ 12.600</td><td><Pill>Lead</Pill></td></tr>
            </tbody>
          </table>
        </Panel>

        <Panel title="Actividad de hoy">
          <div>
            {[
              { msg: '3 visitas reservadas', time: '10:00 · 12:30 · 17:00', read: false },
              { msg: 'Factura #M-0142 cobrada', time: '€ 28.400 · Casa Velázquez', read: false },
              { msg: 'Reposición Cove llega mañana', time: 'Lote 28 m²', read: true },
              { msg: 'Sesión foto producto · 16:00', time: 'Para campaña TIERRA junio', read: true },
            ].map((row, i) => (
              <div key={i} className="flex gap-3.5 border-b border-n-100 px-6 py-4 last:border-b-0">
                <div className={`mt-[7px] h-[6px] w-[6px] flex-shrink-0 ${row.read ? 'bg-n-300' : 'bg-oak-mid'}`} />
                <div className="flex-1 text-[13px]">
                  <div>{row.msg}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.06em] text-n-500">{row.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  )
}
