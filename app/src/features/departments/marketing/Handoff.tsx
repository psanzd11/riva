import { useMemo } from 'react'
import { useStore } from '../../../data/store'
import { PageHead } from '../../../components/layout/PageHead'
import { Pill } from '../../../components/ui/Pill'
import { KpiGrid } from '../../../components/kpi/KpiGrid'
import { KpiCard } from '../../../components/kpi/KpiCard'
import { LbBar } from '../../../components/data-table/Leaderboard'
import { dateRelative } from '../../../lib/format'

/**
 * Handoff a Ventas — Marketing. Qué pasa con los leads que Marketing entrega al
 * equipo comercial: cuáles son SQL/oportunidad, quién los lleva y cuántos convierten.
 */
export function MktHandoff() {
  const leads = useStore((s) => s.leads)
  const users = useStore((s) => s.users)

  const ownerName = (id?: string) => (id ? users.find((u) => u.id === id)?.name ?? id : null)

  const sql = leads.filter((l) => l.stage === 'sql')
  const opportunity = leads.filter((l) => l.stage === 'opportunity')
  const customers = leads.filter((l) => l.stage === 'customer')
  const delivered = useMemo(
    () =>
      leads
        .filter((l) => l.stage === 'sql' || l.stage === 'opportunity')
        .sort((a, b) => b.score - a.score),
    [leads],
  )
  const convRate = Math.round((customers.length / Math.max(1, leads.length)) * 100)
  const unassigned = delivered.filter((l) => !l.ownerId).length

  return (
    <>
      <PageHead
        eyebrow="Marketing · Handoff"
        title="Entrega a Ventas"
        description="Los leads que Marketing cualifica y pasa al equipo comercial. Seguimiento del traspaso: quién los lleva y cuántos acaban convirtiendo."
      />

      <KpiGrid cols={4}>
        <KpiCard eyebrow="SQL listos" value={String(sql.length)} sub="cualificados para ventas" />
        <KpiCard eyebrow="En oportunidad" value={String(opportunity.length)} sub="ya en pipeline" />
        <KpiCard eyebrow="Convertidos" value={String(customers.length)} delta={{ type: 'up', label: `${convRate}% del total` }} />
        <KpiCard eyebrow="Sin asignar" value={String(unassigned)} delta={unassigned > 0 ? { type: 'down', label: 'esperando comercial' } : undefined} />
      </KpiGrid>

      <h2 className="mb-4 font-display text-[26px] font-light tracking-[0.04em]">Leads entregados a Ventas</h2>
      <table className="data-table">
        <thead>
          <tr><th>Lead</th><th>Canal</th><th>Sede</th><th>Comercial</th><th>Score</th><th>Stage</th><th>Creado</th></tr>
        </thead>
        <tbody>
          {delivered.length === 0 && <tr><td colSpan={7} className="text-center text-n-500">Aún no hay leads en handoff.</td></tr>}
          {delivered.slice(0, 30).map((l) => (
            <tr key={l.id}>
              <td className="font-medium">{l.name}</td>
              <td>{l.channel}</td>
              <td>{l.sede.toUpperCase()}</td>
              <td>{ownerName(l.ownerId) ?? <span className="text-n-500">Sin asignar</span>}</td>
              <td><LbBar pct={l.score} value={String(l.score)} /></td>
              <td><Pill variant={l.stage === 'opportunity' ? 'ok' : 'warn'}>{l.stage}</Pill></td>
              <td className="text-n-500">{dateRelative(l.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
