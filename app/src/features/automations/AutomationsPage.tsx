import { useNavigate } from 'react-router-dom'
import { useStore } from '../../data/store'
import { PageHead } from '../../components/layout/PageHead'
import { Button } from '../../components/ui/Button'
import { Panel } from '../../components/ui/Panel'
import { Pill } from '../../components/ui/Pill'
import { KpiGrid } from '../../components/kpi/KpiGrid'
import { KpiCard } from '../../components/kpi/KpiCard'

export function AutomationsPage() {
  const navigate = useNavigate()
  const rules = useStore((s) => s.automationRules)
  const active = rules.filter((r) => r.active).length

  return (
    <>
      <PageHead
        eyebrow="Núcleo del Hub"
        title="Automatizaciones"
        description="Flujos que reemplazan tareas manuales: facturación QuickBooks, links de pago, registro de actividad comercial, conciliación bancaria, alertas de postventa."
        actions={
          <>
            <Button variant="outline">Logs</Button>
            <Button variant="outline" onClick={() => navigate('/automations/request')}>
              Solicitar automatización
            </Button>
            <Button>+ Crear flujo</Button>
          </>
        }
      />

      <KpiGrid>
        <KpiCard eyebrow="Flujos activos" value={String(active)} sub="3 ES · 4 USA · 5 globales" />
        <KpiCard eyebrow="Ejecuciones 30d" value="8.412" delta={{ type: 'up', label: '↑ 14% vs mes anterior' }} />
        <KpiCard eyebrow="Éxito" value="99,2%" sub="63 reintentos automáticos" />
        <KpiCard eyebrow="Horas ahorradas" value="142 h" sub="Equivale a ~0,9 FTE" />
      </KpiGrid>

      <Panel title="Catálogo de flujos" action={<a className="link text-[11px] cursor-pointer">Ver plantillas</a>}>
        <div>
          {rules.map((r) => (
            <div
              key={r.id}
              className="grid items-center gap-4 border-b border-n-100 px-6 py-4 last:border-b-0"
              style={{ gridTemplateColumns: '36px 1fr auto auto' }}
            >
              <div className="flex h-9 w-9 items-center justify-center bg-riva-ivory font-display text-[14px] text-cove">
                {r.icon ?? r.name[0]}
              </div>
              <div className="text-[13px] leading-[1.4]">
                <b className="font-medium text-n-900">{r.name}</b>
                <div className="mt-1 text-n-500">{r.description}</div>
              </div>
              <Pill variant={r.active ? 'ok' : 'warn'}>{r.active ? 'Activo' : 'Piloto'}</Pill>
              <div className="text-right text-[11px] uppercase tracking-[0.08em] text-n-500">
                {r.runs} ejec/mes
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="mt-8 border border-n-300 bg-riva-white px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-display text-[16px] font-light uppercase tracking-[0.08em]">¿Echas algo en falta?</div>
            <p className="mt-1 max-w-[480px] text-[13px] text-n-700">
              Cuéntanos qué flujo te gustaría tener automatizado. Tecnología lo recoge como solicitud
              y lo prioriza junto con el roadmap.
            </p>
          </div>
          <Button onClick={() => navigate('/automations/request')}>Solicitar automatización</Button>
        </div>
      </div>
    </>
  )
}
