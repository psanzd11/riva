import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../../../data/store'
import { useRole } from '../../../auth/RoleContext'
import { PageHead } from '../../../components/layout/PageHead'
import { Button } from '../../../components/ui/Button'
import { Panel } from '../../../components/ui/Panel'
import { Pill } from '../../../components/ui/Pill'
import { KpiGrid } from '../../../components/kpi/KpiGrid'
import { KpiCard } from '../../../components/kpi/KpiCard'
import { FilterTabs } from '../../../components/ui/FilterTabs'
import { Heatmap } from '../../../components/charts/Heatmap'
import { VBarChart } from '../../../components/charts/VBarChart'
import { MultiLine } from '../../../components/charts/MultiLine'
import { Roadmap } from '../../../components/charts/Roadmap'
import { dateRelative, dateShort } from '../../../lib/format'
import type { Integration } from '../../../data/schema'

const HEAT = Array.from({ length: 30 }, (_, i) => (i === 17 ? -1 : i === 11 ? 3 : 4)) as (0 | 1 | 2 | 3 | 4 | -1)[]

const TIME_FILTERS = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
] as const

const ROADMAP_BACKLOG = [
  { id: 'rb_1', title: 'Caché warehouse para BI', meta: 'Datos · reducción queries 40%', variant: 'cove' as const },
  { id: 'rb_2', title: 'SSO Google Workspace', meta: 'Seguridad · Q2', variant: 'oak' as const },
  { id: 'rb_3', title: 'App móvil para instaladores', meta: 'Operations', variant: 'cove' as const },
  { id: 'rb_4', title: 'Forecast IA pipeline', meta: 'Ventas · Q3', variant: 'cove' as const },
]
const ROADMAP_DOING = [
  { id: 'rd_1', title: 'Conector Square + Flagship', meta: 'Cierre caja diario · 80%', variant: 'sage' as const },
  { id: 'rd_2', title: 'Multi-currency QB', meta: 'Accounting · 60%', variant: 'oak' as const },
  { id: 'rd_3', title: 'Dashboard partners', meta: 'Ventas · 40%', variant: 'cove' as const },
]
const ROADMAP_REVIEW = [
  { id: 'rr_1', title: 'Alertas stock Slack', meta: 'Supply Chain', variant: 'oak' as const },
  { id: 'rr_2', title: 'Plantillas email partners', meta: 'Marketing', variant: 'sage' as const },
]
const ROADMAP_DONE = [
  { id: 'rdo_1', title: 'CRM v2.4.1 deploy', meta: 'Ayer', variant: 'sage' as const },
  { id: 'rdo_2', title: 'Webhook QB ↔ Stripe', meta: '12 may', variant: 'sage' as const },
  { id: 'rdo_3', title: 'Ticket auto 2★ reseñas', meta: '8 may', variant: 'sage' as const },
]

export function TecnologiaPage() {
  const { role } = useRole()
  const integrations = useStore((s) => s.integrations)
  const auditLog = useStore((s) => s.auditLog)
  const users = useStore((s) => s.users)
  const [timeWindow, setTimeWindow] = useState<(typeof TIME_FILTERS)[number]['value']>('30d')
  void timeWindow

  const [pingTick, setPingTick] = useState(0)
  useEffect(() => {
    // Simulate periodic latency refresh every 12s (Phase 0 had no refresh)
    const interval = setInterval(() => {
      const next = integrations.map((i) => ({
        ...i,
        latencyMs:
          i.status === 'disconnected'
            ? 0
            : Math.max(40, i.latencyMs + Math.round((Math.random() - 0.5) * 30)),
        lastSync: new Date().toISOString(),
      }))
      useStore.setState({ integrations: next })
      setPingTick((t) => t + 1)
    }, 12000)
    return () => clearInterval(interval)
    // We intentionally re-run only on mount; integrations are mutated via setState.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  void pingTick

  const recentAudit = useMemo(() => {
    return [...auditLog].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 30)
  }, [auditLog])

  const sortedIntegrations = useMemo(() => [...integrations].sort((a, b) => b.latencyMs - a.latencyMs), [integrations])

  if (role !== 'tech_lead' && role !== 'ceo') {
    return (
      <>
        <PageHead eyebrow="Departamento" title="Tecnología" description="Vista restringida — solo CEO y Tech Lead." />
        <Panel headless>
          <div className="p-8 text-center text-[13px] text-n-500">Cambia a rol Tech Lead o CEO para acceder.</div>
        </Panel>
      </>
    )
  }

  return (
    <>
      <PageHead
        eyebrow="Departamento"
        title="Tecnología"
        description="CRM interno construido in-house con IA, integraciones del Hub, infraestructura cloud, automatizaciones."
        actions={
          <>
            <Button variant="outline">Roadmap</Button>
            <Button>+ Issue</Button>
          </>
        }
      />

      <KpiGrid>
        <KpiCard eyebrow="Uptime 30d" value="99,97%" delta={{ type: 'up', label: 'SLA 99,9%' }} />
        <KpiCard eyebrow="CRM Interno" value="v2.4.1" sub="Deploy ayer" />
        <KpiCard eyebrow="Integraciones" value={String(integrations.length)} sub={`${integrations.filter((i) => i.status === 'connected').length} conectadas`} />
        <KpiCard eyebrow="Audit · 24h" value={String(auditLog.filter((a) => Date.now() - new Date(a.at).getTime() < 86400000).length)} sub="acciones registradas" />
      </KpiGrid>

      <Panel title="Uptime · últimos 30 días" action={<FilterTabs options={TIME_FILTERS} value={timeWindow} onChange={setTimeWindow} variant="time" />} className="mb-8">
        <Heatmap cells={HEAT} cols={15} legendLeft="22 abr — 21 may · 1 incidente menor (18 min)" />
      </Panel>

      <div className="mb-12 grid gap-8" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <Panel title="Salud integraciones" action={<a className="link text-[11px] cursor-pointer">{integrations.filter((i) => i.status === 'connected').length} conectadas</a>}>
          <table className="data-table border-0">
            <thead><tr><th>Sistema</th><th>Lat.</th><th>Estado</th></tr></thead>
            <tbody>
              {sortedIntegrations.map((i: Integration) => (
                <tr key={i.id}>
                  <td>{i.name}</td>
                  <td>{i.latencyMs > 0 ? `${i.latencyMs} ms` : '—'}</td>
                  <td>
                    <Pill variant={i.status === 'connected' ? 'ok' : i.status === 'warn' ? 'warn' : 'default'}>
                      {i.status === 'connected' ? 'OK' : i.status === 'warn' ? 'Warn' : 'Off'}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Coste tech mensual por componente" action={<a className="link text-[11px] cursor-pointer">/ mes</a>}>
          <VBarChart
            bars={[
              { label: 'Cloud<br>hosting', value: '€ 2.4k', heightPct: 100, variant: 'cove' },
              { label: 'AI APIs', value: '€ 1.8k', heightPct: 75, variant: 'oak' },
              { label: 'Integraciones', value: '€ 1.2k', heightPct: 50, variant: 'mid' },
              { label: 'Dev tools', value: '€ 0.9k', heightPct: 38, variant: 'sage' },
              { label: 'Monitoring', value: '€ 0.6k', heightPct: 25, variant: 'dark' },
            ]}
            foot={{ left: 'Total · <b style="color:var(--n-900)">€ 6,9k / mes</b>', right: '−8% vs Q1' }}
          />
        </Panel>

        <Panel title="Response time & errores" action={<div className="flex gap-1.5"><button className="filter-btn active">Resp.</button><button className="filter-btn">Error</button></div>}>
          <MultiLine
            series={[
              { name: 'p95 resp. 142 ms', color: 'var(--cove)', points: [128, 124, 132, 118, 114, 108, 98, 90, 88, 82, 78, 72, 68] },
              { name: 'error rate 0,14%', color: 'var(--oak-mid)', points: [168, 170, 166, 160, 162, 156, 158, 154, 152, 148, 146, 144, 142] },
            ]}
            xLabels={['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', '']}
          />
        </Panel>
      </div>

      <h2 className="mb-4 font-display text-[26px] font-light tracking-[0.04em]">Roadmap Q2</h2>
      <Roadmap
        columns={[
          { title: 'Backlog', items: ROADMAP_BACKLOG },
          { title: 'En curso', items: ROADMAP_DOING },
          { title: 'Review', items: ROADMAP_REVIEW },
          { title: 'Done · mayo', items: ROADMAP_DONE },
        ]}
      />

      <h2 className="mt-12 mb-4 font-display text-[26px] font-light tracking-[0.04em]">Audit log · últimas 30 acciones</h2>
      <table className="data-table">
        <thead><tr><th>Cuándo</th><th>Usuario</th><th>Acción</th><th>Entidad</th><th>ID</th></tr></thead>
        <tbody>
          {recentAudit.map((a) => (
            <tr key={a.id}>
              <td>{dateRelative(a.at)} · {dateShort(a.at)}</td>
              <td>{users.find((u) => u.id === a.userId)?.name ?? a.userId}</td>
              <td><Pill variant={a.action === 'create' ? 'ok' : a.action === 'remove' ? 'err' : 'warn'}>{a.action}</Pill></td>
              <td>{a.entity}</td>
              <td className="text-n-500">{a.entityId}</td>
            </tr>
          ))}
          {recentAudit.length === 0 && <tr><td colSpan={5} className="text-center text-n-500">Sin actividad reciente.</td></tr>}
        </tbody>
      </table>
    </>
  )
}
