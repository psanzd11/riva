import { useNavigate } from 'react-router-dom'
import { useStore } from '../../data/store'
import { PageHead } from '../../components/layout/PageHead'
import { Button } from '../../components/ui/Button'
import { Panel } from '../../components/ui/Panel'
import { Pill } from '../../components/ui/Pill'
import { KpiGrid } from '../../components/kpi/KpiGrid'
import { KpiCard } from '../../components/kpi/KpiCard'
import { ConversionBar } from '../../components/charts/ConversionBar'
import { Funnel } from '../../components/charts/Funnel'
import { LineArea } from '../../components/charts/LineArea'
import { RatioGrid } from '../../components/charts/RatioGrid'
import { Sparkline } from '../../components/charts/Sparkline'
import { FilterTabs } from '../../components/ui/FilterTabs'
import { dateRelative } from '../../lib/format'
import { useState } from 'react'
import { useRole } from '../../auth/RoleContext'

const PIPELINE_FILTERS = [
  { value: 'holding', label: 'Holding' },
  { value: 'riva_spain', label: 'RIVA Spain' },
  { value: 'tierra', label: 'TIERRA' },
  { value: 'flagship', label: 'Flagship' },
] as const
type PipelineFilter = (typeof PIPELINE_FILTERS)[number]['value']

const TIME_FILTERS = [
  { value: 'month', label: 'Mes' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'year', label: 'Año' },
] as const
type TimeFilter = (typeof TIME_FILTERS)[number]['value']

const DEPT_CARDS = [
  { id: 'operations', label: 'Operations', title: 'En curso', rows: [['Pedidos abiertos', '34'], ['Incidencias', '2'], ['SLA cumplido', '98%']] },
  { id: 'ventas', label: 'Ventas', title: 'Pipeline', rows: [['Deals abiertos', '118'], ['Forecast Q2', '€ 2,4M'], ['Cierre prom.', '42 d']] },
  { id: 'marketing', label: 'Marketing', title: 'Campañas', rows: [['Activas', '4'], ['Leads mes', '312'], ['CPL medio', '€ 28']] },
  { id: 'accounting', label: 'Accounting', title: 'Cobros', rows: [['Facturas emitidas', '184'], ['Pendientes', '€ 142k'], ['DSO', '34 d']] },
  { id: 'supply-chain', label: 'Supply Chain', title: 'Inventario', rows: [['SKUs activos', '142'], ['Stock crítico', '3'], ['Lead time', '28 d']] },
  { id: 'postventa', label: 'Postventa', title: 'Tickets', rows: [['Abiertos', '11'], ['NPS últim. 30d', '+62'], ['Tiempo resp.', '3,2 h']] },
  { id: 'tecnologia', label: 'Tecnología', title: 'Plataforma', rows: [['CRM interno', 'v2.4.1'], ['Uptime 30d', '99,97%'], ['HubSpot', 'email only']] },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const { role } = useRole()
  const automationRules = useStore((s) => s.automationRules)
  const notifications = useStore((s) => s.notifications)
  const apply = useStore((s) => s.apply)

  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilter>('holding')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('year')
  // Acknowledge state usage (filters bind UI even without re-computation)
  void pipelineFilter
  void timeFilter

  const myNotifs = notifications.filter((n) => !n.role || n.role === role)
  const unread = myNotifs.filter((n) => !n.read)

  const markRead = (id: string) => {
    const next = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    apply('notifications', next, { action: 'update', entity: 'notifications', entityId: id, userId: 'system' })
  }

  return (
    <>
      <PageHead
        eyebrow="The RIVA Company · Mayo 2026"
        title="Vista del holding"
        description="Resumen cross-sede de las operaciones del grupo. Ventas de partners y flagship, automatizaciones activas y estado por departamento."
        actions={
          <>
            <Button variant="outline">Exportar informe</Button>
            <Button>+ Nueva acción</Button>
          </>
        }
      />

      <KpiGrid>
        <KpiCard eyebrow="Ingresos mes · España" value="€ 384.200" delta={{ type: 'up', label: '↑ 12,4% vs abril' }} sub="31 partners activos" />
        <KpiCard eyebrow="Ingresos mes · USA" value="$ 412.800" delta={{ type: 'up', label: '↑ 8,1% vs abril' }} sub="16 showrooms activos" />
        <KpiCard eyebrow="Flagship Miami" value="€ 96.450" delta={{ type: 'up', label: '↑ 22,6% vs abril' }} sub="P&L independiente" />
        <KpiCard eyebrow="Automatizaciones" value="847" delta={{ type: 'up', label: '12 flujos activos' }} sub="Ahorro est. 142 h/mes" />
      </KpiGrid>

      {/* Flagship card */}
      <div
        className="mb-12 grid gap-12 bg-riva-black px-10 py-9 text-riva-ivory"
        style={{ gridTemplateColumns: '1.4fr 1fr' }}
      >
        <div>
          <div className="eyebrow !text-oak-light">Flagship · Sede propia</div>
          <h2 className="mb-3.5 mt-2.5 font-display text-[34px] font-light tracking-[0.04em]">Miami · Design District</h2>
          <p className="max-w-[480px] text-[13px] leading-[1.65] text-n-300">
            Primer showroom 100% RIVA. Tratado como partner en el sistema pero con P&L propio, equipo dedicado y reporting al detalle. Inaugurado febrero 2026.
          </p>
          <div className="mt-5 flex gap-2.5">
            <button
              onClick={() => navigate('/flagship')}
              className="btn btn-outline border-riva-ivory text-riva-ivory hover:bg-riva-ivory hover:text-riva-black"
            >
              Ver dashboard completo
            </button>
            <button className="btn btn-outline border-riva-ivory text-riva-ivory hover:bg-riva-ivory hover:text-riva-black">
              Cuenta de resultados
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px self-start bg-white/[0.08]">
          {[
            { lbl: 'Visitas Mayo', num: '412', ch: '↑ 18% vs abril' },
            { lbl: 'Tasa conversión', num: '14,3%', ch: '↑ 2,1 pp' },
            { lbl: 'Ticket medio', num: '€ 9.840', ch: '↑ 5,4%' },
            { lbl: 'Margen bruto', num: '38,2%', ch: '— estable' },
          ].map((s) => (
            <div key={s.lbl} className="bg-riva-black px-5 py-5">
              <div className="text-[10px] uppercase tracking-[0.18em] text-n-500">{s.lbl}</div>
              <div className="mt-2 font-display text-[28px] font-light text-riva-ivory">{s.num}</div>
              <div className="mt-1.5 text-[11px] uppercase tracking-[0.08em] text-oak-light">{s.ch}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline header */}
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-[26px] font-light tracking-[0.04em]">Pipeline comercial</h2>
        <FilterTabs options={PIPELINE_FILTERS} value={pipelineFilter} onChange={setPipelineFilter} />
      </div>

      <Panel
        title="Conversión por etapa"
        action={<FilterTabs options={TIME_FILTERS} value={timeFilter} onChange={setTimeFilter} variant="time" />}
        className="mb-8"
      >
        <ConversionBar
          segments={[
            { label: 'Lead', pct: 100 },
            { label: 'Cualificado', pct: 62 },
            { label: 'Propuesta', pct: 38 },
            { label: 'Negociación', pct: 22 },
            { label: 'Cierre', pct: 14 },
          ]}
        />
      </Panel>

      <div className="mb-12 grid gap-8" style={{ gridTemplateColumns: '1.1fr 1.4fr 1fr' }}>
        <Panel title="Embudo de pipeline" action={<a className="link text-[11px]">·# · €</a>}>
          <Funnel
            rows={[
              { stage: 'Lead', count: 312, amountLabel: '€ 4,2M', pct: 100, widthPct: 100 },
              { stage: 'Cualif.', count: 192, amountLabel: '€ 3,1M', pct: 62, widthPct: 78 },
              { stage: 'Propuesta', count: 118, amountLabel: '€ 2,1M', pct: 38, widthPct: 54 },
              { stage: 'Negoc.', count: 68, amountLabel: '€ 1,4M', pct: 22, widthPct: 32 },
              { stage: 'Cierre', count: 42, amountLabel: '€ 840k', pct: 14, widthPct: 18 },
            ]}
          />
        </Panel>

        <Panel title="Won — últimos 12 meses" action={<a className="link text-[11px] cursor-pointer">Por mes</a>}>
          <LineArea
            points={[8, 10, 11, 9, 14, 16, 18, 22, 25, 26, 30, 34]}
            xLabels={['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May']}
            totals={{ left: 'Total 12m · <b>142 deals won</b>', right: '<b>€ 2,84M</b>' }}
          />
        </Panel>

        <Panel title="Ratios & velocidad" action={<a className="link text-[11px] cursor-pointer">Detalle</a>}>
          <RatioGrid
            items={[
              { label: 'Leads-to-Close', value: '14,3%', spark: <Sparkline points={[18, 16, 17, 14, 12, 10, 8, 6, 4]} /> },
              { label: 'Closing Ratio', value: '31%', spark: <Sparkline points={[14, 15, 12, 11, 10, 9, 8, 7, 6]} /> },
              { label: 'Ciclo medio', value: '42 d', delta: { type: 'neutral', label: '— estable' } },
              { label: 'Velocidad', value: '9,2/mes', delta: { type: 'up', label: '↑ 14%' } },
              { label: 'Abiertos', value: '118', delta: { type: 'up', label: '↑ 22 vs mes ant.' } },
              { label: 'Won YTD', value: '42', delta: { type: 'up', label: '↑ 18% vs 2025' } },
            ]}
          />
        </Panel>
      </div>

      {/* Auto + notifs */}
      <div className="mb-12 grid gap-8" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <Panel
          title="Automatizaciones recientes"
          action={<a className="link text-[11px] cursor-pointer" onClick={() => navigate('/automations')}>Ver todas</a>}
        >
          <div>
            {automationRules.slice(0, 6).map((r) => (
              <div
                key={r.id}
                className="grid items-center gap-4 border-b border-n-100 px-6 py-4 last:border-b-0"
                style={{ gridTemplateColumns: '36px 1fr auto auto' }}
              >
                <div className="flex h-9 w-9 items-center justify-center bg-riva-ivory font-display text-[14px] text-cove">
                  {r.icon ?? r.name[0]}
                </div>
                <div className="text-[13px] leading-[1.4] text-n-900">
                  <span className="text-n-500">{r.name}</span>
                </div>
                <Pill variant={r.active ? 'ok' : 'warn'}>{r.active ? 'Activo' : 'Piloto'}</Pill>
                <div className="text-right text-[11px] uppercase tracking-[0.08em] text-n-500">
                  {r.runs} ejec/mes
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Notificaciones" action={<a className="link text-[11px]">{unread.length} nuevas</a>}>
          <div>
            {myNotifs.length === 0 && (
              <div className="px-6 py-8 text-center text-[12px] text-n-500">Sin notificaciones</div>
            )}
            {myNotifs.map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className="flex w-full gap-3.5 border-b border-n-100 px-6 py-4 text-left last:border-b-0 hover:bg-n-100"
              >
                <div className={`mt-[7px] h-[6px] w-[6px] flex-shrink-0 ${n.read ? 'bg-n-300' : 'bg-oak-mid'}`} />
                <div className="flex-1 text-[13px]">
                  <div>
                    <span className="font-medium">{n.source}</span> · {n.message}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.06em] text-n-500">
                    {dateRelative(n.createdAt)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      {/* Departments */}
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-[26px] font-light tracking-[0.04em]">Departamentos</h2>
        <div className="eyebrow">7 áreas · vista resumen</div>
      </div>
      <div className="mb-12 grid grid-cols-2 gap-px border border-n-300 bg-n-300 lg:grid-cols-4">
        {DEPT_CARDS.map((d) => (
          <button
            key={d.id}
            onClick={() => navigate(`/dept/${d.id}`)}
            className="bg-riva-white px-5 py-5 pb-4 text-left transition hover:bg-n-100"
          >
            <div className="eyebrow !text-[10px]">{d.label}</div>
            <h4 className="my-2 font-display text-[18px] font-normal tracking-[0.03em]">{d.title}</h4>
            {d.rows.map(([k, v]) => (
              <div key={k} className="flex justify-between border-t border-n-100 py-1 text-[12px] text-n-700 first:border-t-0">
                <span>{k}</span>
                <b className="font-medium text-n-900">{v}</b>
              </div>
            ))}
          </button>
        ))}
        <div className="bg-n-100 px-5 py-5 pb-4">
          <div className="eyebrow !text-[10px] !text-cove">+ Añadir vista</div>
          <h4 className="my-2 font-display text-[18px] font-light tracking-[0.03em] text-n-500">Custom</h4>
          <div className="text-[12px] text-n-500">Cuadro de mando ad-hoc para el holding o una sede.</div>
        </div>
      </div>
    </>
  )
}
