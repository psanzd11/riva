import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../../../data/store'
import { ticketsRepo } from '../../../data/repo'
import { useRole } from '../../../auth/RoleContext'
import { PageHead } from '../../../components/layout/PageHead'
import { Button } from '../../../components/ui/Button'
import { Panel } from '../../../components/ui/Panel'
import { Pill } from '../../../components/ui/Pill'
import { Modal } from '../../../components/ui/Modal'
import { Field, Input, Select } from '../../../components/ui/Field'
import { KpiGrid } from '../../../components/kpi/KpiGrid'
import { KpiCard } from '../../../components/kpi/KpiCard'
import { FilterTabs } from '../../../components/ui/FilterTabs'
import { Heatmap } from '../../../components/charts/Heatmap'
import { VBarChart } from '../../../components/charts/VBarChart'
import { MultiLine } from '../../../components/charts/MultiLine'
import { RatioGrid } from '../../../components/charts/RatioGrid'
import { Roadmap } from '../../../components/charts/Roadmap'
import { Sparkline } from '../../../components/charts/Sparkline'
import { dateRelative, dateShort } from '../../../lib/format'
import { DeptEquipo } from '../shared/DeptEquipo'
import type { Ticket } from '../../../data/schema'

const HEAT: (0 | 1 | 2 | 3 | 4 | -1)[] = Array.from({ length: 30 }, (_, i) => (i === 17 ? -1 : i === 11 ? 3 : 4))

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

function TechHeader({ actions }: { actions?: React.ReactNode }) {
  return (
    <PageHead
      eyebrow="Departamento"
      title="Tecnología"
      description="CRM interno + integraciones + infraestructura cloud. Equipo que mantiene el Hub y resuelve tickets internos de empleados."
      actions={actions}
    />
  )
}

function useTechAccess(): { allowed: boolean } {
  const { role } = useRole()
  return { allowed: role === 'tech_lead' || role === 'ceo' }
}

function AccessDenied() {
  return (
    <Panel headless>
      <div className="p-8 text-center text-[13px] text-n-500">Vista restringida — cambia a rol Tech Lead o CEO.</div>
    </Panel>
  )
}

// ====================================================================
// RESUMEN — rico
// ====================================================================
export function TechResumen() {
  const { allowed } = useTechAccess()
  const integrations = useStore((s) => s.integrations)
  const auditLog = useStore((s) => s.auditLog)
  const internalTickets = useStore((s) => s.tickets).filter((t) => t.category === 'internal')
  const [timeWindow, setTimeWindow] = useState<(typeof TIME_FILTERS)[number]['value']>('30d')

  if (!allowed) return <><TechHeader /><AccessDenied /></>

  const openInternal = internalTickets.filter((t) => t.status !== 'closed')
  const highInternal = openInternal.filter((t) => t.priority === 'high')
  const avgLatency = Math.round(integrations.filter((i) => i.status === 'connected').reduce((a, i) => a + i.latencyMs, 0) / Math.max(1, integrations.filter((i) => i.status === 'connected').length))

  return (
    <>
      <TechHeader actions={<><Button variant="outline">Roadmap</Button><Button>+ Issue</Button></>} />

      <KpiGrid cols={8}>
        <KpiCard eyebrow="Uptime 30d" value="99,97%" delta={{ type: 'up', label: 'SLA 99,9%' }} />
        <KpiCard eyebrow="CRM Interno" value="v2.4.1" sub="Deploy ayer" />
        <KpiCard eyebrow="Integraciones" value={String(integrations.filter((i) => i.status === 'connected').length)} sub={`${integrations.length} totales`} />
        <KpiCard eyebrow="Latencia media" value={`${avgLatency} ms`} delta={{ type: 'up', label: '↓ 12 ms' }} />
        <KpiCard eyebrow="Tickets internos" value={String(openInternal.length)} sub={`${highInternal.length} urgentes`} />
        <KpiCard eyebrow="Audit · 24h" value={String(auditLog.filter((a) => Date.now() - new Date(a.at).getTime() < 86400000).length)} sub="acciones registradas" />
        <KpiCard eyebrow="Coste tech" value="€ 6,9k/m" delta={{ type: 'up', label: '−8% vs Q1' }} />
        <KpiCard eyebrow="p95 response" value="142 ms" delta={{ type: 'up', label: '↓ 16 ms' }} />
      </KpiGrid>

      <Panel title="Uptime · últimos 30 días" action={<FilterTabs options={TIME_FILTERS} value={timeWindow} onChange={setTimeWindow} variant="time" />} className="mb-8">
        <Heatmap cells={HEAT} cols={15} legendLeft="22 abr — 21 may · 1 incidente menor (18 min)" />
      </Panel>

      <div className="mb-8 grid gap-8" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <Panel title="Response time & errores">
          <MultiLine
            series={[
              { name: 'p95 resp. 142 ms', color: 'var(--cove)', points: [128, 124, 132, 118, 114, 108, 98, 90, 88, 82, 78, 72, 68] },
              { name: 'error rate 0,14%', color: 'var(--oak-mid)', points: [168, 170, 166, 160, 162, 156, 158, 154, 152, 148, 146, 144, 142] },
            ]}
            xLabels={['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', '']}
          />
        </Panel>

        <Panel title="Ratios plataforma">
          <RatioGrid
            items={[
              { label: 'Uptime', value: '99,97%', spark: <Sparkline points={[99.5, 99.6, 99.7, 99.8, 99.8, 99.9, 99.97]} /> },
              { label: 'Build time', value: '4,2 min', delta: { type: 'up', label: '↓ 1,1 min' } },
              { label: 'Deploys/mes', value: '8', delta: { type: 'up', label: '↑ 2' } },
              { label: 'Rollbacks', value: '0', delta: { type: 'neutral', label: 'sin incidencias' } },
            ]}
          />
        </Panel>
      </div>

      <h2 className="mb-4 font-display text-[26px] font-light tracking-[0.04em]">Tickets internos urgentes</h2>
      <p className="mb-4 text-[12px] text-n-500">Issues de empleados con el CRM / Hub / IT — atención prioritaria.</p>
      <table className="data-table">
        <thead><tr><th>Ticket</th><th>Solicitante</th><th>Tipo</th><th>Asignado</th><th>Tiempo abierto</th><th>Prioridad</th></tr></thead>
        <tbody>
          {highInternal.slice(0, 5).map((t) => (
            <tr key={t.id}>
              <td>#{t.id.replace('tkt_', '')}</td>
              <td>{t.clientName}</td>
              <td>{t.type}</td>
              <td>{t.assigneeId ?? <span className="text-n-500">Sin asignar</span>}</td>
              <td>{dateRelative(t.createdAt)}</td>
              <td><Pill variant="err">{t.priority}</Pill></td>
            </tr>
          ))}
          {highInternal.length === 0 && <tr><td colSpan={6} className="text-center text-n-500">Sin tickets urgentes ahora mismo.</td></tr>}
        </tbody>
      </table>
    </>
  )
}

// ====================================================================
// ROADMAP
// ====================================================================
export function TechRoadmap() {
  const { allowed } = useTechAccess()
  if (!allowed) return <><TechHeader /><AccessDenied /></>
  return (
    <>
      <TechHeader actions={<><Button variant="outline">Filtros</Button><Button>+ Issue</Button></>} />
      <h2 className="mb-4 font-display text-[26px] font-light tracking-[0.04em]">Roadmap Q2</h2>
      <Roadmap
        columns={[
          { title: 'Backlog', items: ROADMAP_BACKLOG },
          { title: 'En curso', items: ROADMAP_DOING },
          { title: 'Review', items: ROADMAP_REVIEW },
          { title: 'Done · mayo', items: ROADMAP_DONE },
        ]}
      />
    </>
  )
}

// ====================================================================
// INTEGRACIONES
// ====================================================================
export function TechIntegraciones() {
  const { allowed } = useTechAccess()
  const integrations = useStore((s) => s.integrations)
  const sorted = useMemo(() => [...integrations].sort((a, b) => b.latencyMs - a.latencyMs), [integrations])

  useEffect(() => {
    if (!allowed) return
    const tick = () => {
      const list = useStore.getState().integrations
      const next = list.map((i) => ({
        ...i,
        latencyMs: i.status === 'disconnected' ? 0 : Math.max(40, i.latencyMs + Math.round((Math.random() - 0.5) * 30)),
        lastSync: new Date().toISOString(),
      }))
      useStore.setState({ integrations: next })
    }
    const interval = setInterval(tick, 12000)
    return () => clearInterval(interval)
  }, [allowed])

  if (!allowed) return <><TechHeader /><AccessDenied /></>

  return (
    <>
      <TechHeader />
      <div className="mb-8 grid gap-8" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <Panel title="Salud integraciones" action={<a className="link text-[11px] cursor-pointer">{integrations.filter((i) => i.status === 'connected').length} conectadas</a>}>
          <table className="data-table border-0">
            <thead><tr><th>Sistema</th><th>Lat.</th><th>Last sync</th><th>Estado</th></tr></thead>
            <tbody>
              {sorted.map((i) => (
                <tr key={i.id}>
                  <td>{i.name}</td>
                  <td>{i.latencyMs > 0 ? `${i.latencyMs} ms` : '—'}</td>
                  <td>{dateRelative(i.lastSync)}</td>
                  <td><Pill variant={i.status === 'connected' ? 'ok' : i.status === 'warn' ? 'warn' : 'err'}>
                    {i.status === 'connected' ? 'OK' : i.status === 'warn' ? 'Warn' : 'Off'}
                  </Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Coste tech · mes">
          <VBarChart
            bars={[
              { label: 'Cloud<br>hosting', value: '€ 2.4k', heightPct: 100, variant: 'cove' },
              { label: 'AI APIs', value: '€ 1.8k', heightPct: 75, variant: 'oak' },
              { label: 'Integraciones', value: '€ 1.2k', heightPct: 50, variant: 'mid' },
              { label: 'Dev tools', value: '€ 0.9k', heightPct: 38, variant: 'sage' },
              { label: 'Monitoring', value: '€ 0.6k', heightPct: 25, variant: 'dark' },
            ]}
            foot={{ left: 'Total · <b style="color:var(--n-900)">€ 6,9k</b>', right: '−8% Q1' }}
          />
        </Panel>
      </div>

      <Panel title="Response time & errores">
        <MultiLine
          series={[
            { name: 'p95 resp. 142 ms', color: 'var(--cove)', points: [128, 124, 132, 118, 114, 108, 98, 90, 88, 82, 78, 72, 68] },
            { name: 'error rate 0,14%', color: 'var(--oak-mid)', points: [168, 170, 166, 160, 162, 156, 158, 154, 152, 148, 146, 144, 142] },
          ]}
          xLabels={['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', '']}
        />
      </Panel>
    </>
  )
}

// ====================================================================
// INTERNAL TICKETS — nueva sub-ruta
// ====================================================================
const INT_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'high', label: 'Urgente' },
  { value: 'unassigned', label: 'Sin asignar' },
  { value: 'closed', label: 'Cerrados' },
] as const

export function TechInternal() {
  const { allowed } = useTechAccess()
  const { currentUserId } = useRole()
  const tickets = useStore((s) => s.tickets)
  const users = useStore((s) => s.users)
  const [filter, setFilter] = useState<(typeof INT_FILTERS)[number]['value']>('all')
  const [newOpen, setNewOpen] = useState(false)

  const internal = useMemo(() => tickets.filter((t) => t.category === 'internal'), [tickets])
  const visible = useMemo(() => {
    let list = internal
    if (filter === 'closed') list = list.filter((t) => t.status === 'closed')
    else {
      list = list.filter((t) => t.status !== 'closed')
      if (filter === 'high') list = list.filter((t) => t.priority === 'high')
      if (filter === 'unassigned') list = list.filter((t) => !t.assigneeId)
    }
    return [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }, [internal, filter])

  const open = internal.filter((t) => t.status !== 'closed')
  const high = open.filter((t) => t.priority === 'high')
  const closedThisMonth = internal.filter((t) => t.status === 'closed').length

  if (!allowed) return <><TechHeader /><AccessDenied /></>

  return (
    <>
      <TechHeader actions={<><Button variant="outline">Plantillas</Button><Button onClick={() => setNewOpen(true)}>+ Internal ticket</Button></>} />

      <KpiGrid cols={4}>
        <KpiCard eyebrow="Abiertos" value={String(open.length)} delta={{ type: 'neutral', label: `${high.length} urgentes` }} />
        <KpiCard eyebrow="Cerrados mes" value={String(closedThisMonth)} delta={{ type: 'up', label: '↑ vs abril' }} />
        <KpiCard eyebrow="Tiempo respuesta" value="2,1 h" delta={{ type: 'up', label: '↓ 0,4 h' }} />
        <KpiCard eyebrow="Backlog" value={String(internal.length)} sub="totales" />
      </KpiGrid>

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-[26px] font-light tracking-[0.04em]">Tickets internos</h2>
        <FilterTabs options={INT_FILTERS} value={filter} onChange={setFilter} />
      </div>
      <p className="mb-4 text-[12px] text-n-500">
        Issues abiertos por empleados de la empresa sobre el CRM, integraciones, accesos, equipos.
      </p>

      <table className="data-table">
        <thead>
          <tr><th>Ticket</th><th>Solicitante</th><th>Issue</th><th>Asignado</th><th>Tiempo abierto</th><th>Prioridad</th><th>Estado</th></tr>
        </thead>
        <tbody>
          {visible.map((t) => (
            <tr key={t.id}>
              <td>#{t.id.replace('tkt_', '')}</td>
              <td>
                {users.find((u) => u.id === t.requesterId)?.name ?? t.clientName}
                {t.requesterId && (
                  <div className="text-[11px] text-n-500">{users.find((u) => u.id === t.requesterId)?.deptRole}</div>
                )}
              </td>
              <td>{t.type}</td>
              <td>{t.assigneeId ? users.find((u) => u.id === t.assigneeId)?.name : <span className="text-n-500">Sin asignar</span>}</td>
              <td>{dateRelative(t.createdAt)}</td>
              <td><Pill variant={t.priority === 'high' ? 'err' : t.priority === 'med' ? 'warn' : 'default'}>{t.priority}</Pill></td>
              <td><Pill variant={t.status === 'closed' ? 'ok' : t.status === 'in_progress' ? 'warn' : 'default'}>{t.status}</Pill></td>
            </tr>
          ))}
          {visible.length === 0 && <tr><td colSpan={7} className="text-center text-n-500">Sin tickets en este filtro.</td></tr>}
        </tbody>
      </table>

      <NewInternalTicketModal open={newOpen} onClose={() => setNewOpen(false)} userId={currentUserId} />
    </>
  )
}

function NewInternalTicketModal({ open, onClose, userId }: { open: boolean; onClose: () => void; userId: string }) {
  const [type, setType] = useState('')
  const [priority, setPriority] = useState<'low' | 'med' | 'high'>('med')

  const submit = () => {
    if (!type.trim()) return
    const t: Omit<Ticket, 'id'> = {
      type: type.trim(),
      clientName: 'staff',
      priority,
      status: 'open',
      description: type.trim(),
      slaHours: priority === 'high' ? 8 : priority === 'med' ? 24 : 72,
      createdAt: new Date().toISOString(),
      category: 'internal',
      requesterId: userId,
    }
    ticketsRepo.create(t, userId)
    setType('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo ticket interno">
      <Field label="Issue">
        <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="Ej: VPN cae en Flagship" />
      </Field>
      <Field label="Prioridad">
        <Select value={priority} onChange={(e) => setPriority(e.target.value as 'low' | 'med' | 'high')}>
          <option value="low">Baja</option>
          <option value="med">Media</option>
          <option value="high">Alta</option>
        </Select>
      </Field>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={submit}>Crear ticket</Button>
      </div>
    </Modal>
  )
}

// ====================================================================
// AUDIT LOG
// ====================================================================
export function TechAudit() {
  const { allowed } = useTechAccess()
  const auditLog = useStore((s) => s.auditLog)
  const users = useStore((s) => s.users)
  const recent = useMemo(() => [...auditLog].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 100), [auditLog])
  if (!allowed) return <><TechHeader /><AccessDenied /></>
  return (
    <>
      <TechHeader />
      <h2 className="mb-4 font-display text-[26px] font-light tracking-[0.04em]">Audit log · últimas 100 acciones</h2>
      <table className="data-table">
        <thead><tr><th>Cuándo</th><th>Usuario</th><th>Acción</th><th>Entidad</th><th>ID</th></tr></thead>
        <tbody>
          {recent.map((a) => (
            <tr key={a.id}>
              <td>{dateRelative(a.at)} · {dateShort(a.at)}</td>
              <td>{users.find((u) => u.id === a.userId)?.name ?? a.userId}</td>
              <td><Pill variant={a.action === 'create' ? 'ok' : a.action === 'remove' ? 'err' : 'warn'}>{a.action}</Pill></td>
              <td>{a.entity}</td>
              <td className="text-n-500">{a.entityId}</td>
            </tr>
          ))}
          {recent.length === 0 && <tr><td colSpan={5} className="text-center text-n-500">Sin actividad reciente.</td></tr>}
        </tbody>
      </table>
    </>
  )
}

// ====================================================================
// EQUIPO
// ====================================================================
export function TechEquipo() {
  const { allowed } = useTechAccess()
  if (!allowed) return <><TechHeader /><AccessDenied /></>
  return (
    <>
      <TechHeader />
      <DeptEquipo
        dept="tecnologia"
        title="Equipo de Tecnología"
        description="Devs full-stack + DevOps + data analytics. Mantienen el CRM interno, las integraciones y el sistema de automation."
      />
    </>
  )
}
