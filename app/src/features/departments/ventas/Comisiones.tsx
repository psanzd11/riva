import { useMemo } from 'react'
import { useStore } from '../../../data/store'
import { useRole } from '../../../auth/RoleContext'
import { PageHead } from '../../../components/layout/PageHead'
import { Panel } from '../../../components/ui/Panel'
import { KpiGrid } from '../../../components/kpi/KpiGrid'
import { KpiCard } from '../../../components/kpi/KpiCard'
import { LbBar, LbAvatar, LbRank } from '../../../components/data-table/Leaderboard'
import { money, moneyCompact, initials } from '../../../lib/format'

/** Comisión del comercial: % sobre ventas ganadas. Cuota anual objetivo (mock demo). */
const COMMISSION_RATE = 0.03
const ANNUAL_QUOTA = 600_000

/**
 * Comisiones y objetivos.
 * · Comercial: su cuota, avance, comisión estimada y desglose por deal won.
 * · Director / CEO: leaderboard de comisiones de todo el equipo.
 */
export function VentasComisiones() {
  const { role, currentUserId, currentUserName } = useRole()
  const deals = useStore((s) => s.deals)
  const partners = useStore((s) => s.partners)
  const users = useStore((s) => s.users)

  const isComercial = role === 'comercial'

  // Vista individual (comercial)
  const myWon = useMemo(
    () => deals.filter((d) => d.ownerId === currentUserId && d.stage === 'won'),
    [deals, currentUserId],
  )
  const myWonAmount = myWon.reduce((a, d) => a + d.amount, 0)
  const myCommission = Math.round(myWonAmount * COMMISSION_RATE)
  const quotaPct = Math.round((myWonAmount / ANNUAL_QUOTA) * 100)

  // Vista equipo (director / ceo / tech)
  const team = useMemo(() => {
    return users
      .filter((u) => u.role === 'comercial')
      .map((u) => {
        const won = deals.filter((d) => d.ownerId === u.id && d.stage === 'won')
        const wonAmount = won.reduce((a, d) => a + d.amount, 0)
        return {
          user: u,
          wonCount: won.length,
          wonAmount,
          commission: Math.round(wonAmount * COMMISSION_RATE),
          quotaPct: Math.round((wonAmount / ANNUAL_QUOTA) * 100),
        }
      })
      .sort((a, b) => b.wonAmount - a.wonAmount)
  }, [users, deals])

  const partnerName = (id: string) => partners.find((p) => p.id === id)?.name ?? '—'

  return (
    <>
      <PageHead
        eyebrow={isComercial ? `Ventas · ${currentUserName}` : 'Ventas · Equipo'}
        title={isComercial ? 'Mis comisiones' : 'Comisiones del equipo'}
        description={
          isComercial
            ? `Cuota anual ${moneyCompact(ANNUAL_QUOTA, 'EUR')} · comisión del ${(COMMISSION_RATE * 100).toFixed(1).replace('.', ',')}% sobre ventas ganadas.`
            : `Avance de cuota y comisión estimada por comercial · comisión del ${(COMMISSION_RATE * 100).toFixed(1).replace('.', ',')}% sobre Won.`
        }
      />

      {isComercial ? (
        <>
          <KpiGrid cols={4}>
            <KpiCard eyebrow="Cuota anual" value={moneyCompact(ANNUAL_QUOTA, 'EUR')} sub="objetivo 2026" />
            <KpiCard eyebrow="Won YTD" value={moneyCompact(myWonAmount, 'EUR')} sub={`${myWon.length} deals ganados`} />
            <KpiCard eyebrow="Cumplimiento" value={`${quotaPct}%`} delta={{ type: quotaPct >= 50 ? 'up' : 'neutral', label: quotaPct >= 100 ? 'cuota superada' : 'de la cuota' }} />
            <KpiCard eyebrow="Comisión estimada" value={moneyCompact(myCommission, 'EUR')} sub="sobre Won YTD" />
          </KpiGrid>

          <Panel title="Avance de cuota" className="mb-8">
            <div className="p-6">
              <LbBar pct={Math.min(100, quotaPct)} variant="success" value={`${money(myWonAmount, 'EUR')} / ${money(ANNUAL_QUOTA, 'EUR')}`} />
              <div className="mt-2 text-[11px] text-n-500">{quotaPct}% de la cuota anual · faltan {money(Math.max(0, ANNUAL_QUOTA - myWonAmount), 'EUR')}</div>
            </div>
          </Panel>

          <h2 className="mb-4 font-display text-[26px] font-light tracking-[0.04em]">Deals ganados · comisión por operación</h2>
          <table className="data-table">
            <thead>
              <tr><th>Cliente</th><th>Partner</th><th>Importe</th><th>Comisión</th></tr>
            </thead>
            <tbody>
              {myWon.length === 0 && <tr><td colSpan={4} className="text-center text-n-500">Aún no tienes deals ganados.</td></tr>}
              {myWon.map((d) => (
                <tr key={d.id}>
                  <td className="font-medium">{d.clientName}</td>
                  <td className="text-n-500">{partnerName(d.partnerId)}</td>
                  <td>{money(d.amount, d.currency)}</td>
                  <td className="font-medium text-success">{money(Math.round(d.amount * COMMISSION_RATE), d.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <>
          <KpiGrid cols={4}>
            <KpiCard eyebrow="Comerciales" value={String(team.length)} sub="con cuota activa" />
            <KpiCard eyebrow="Won equipo" value={moneyCompact(team.reduce((a, t) => a + t.wonAmount, 0), 'EUR')} sub={`${team.reduce((a, t) => a + t.wonCount, 0)} deals`} />
            <KpiCard eyebrow="Comisión total" value={moneyCompact(team.reduce((a, t) => a + t.commission, 0), 'EUR')} sub="estimada" />
            <KpiCard eyebrow="Cuota media" value={`${Math.round(team.reduce((a, t) => a + t.quotaPct, 0) / Math.max(1, team.length))}%`} sub="cumplimiento" />
          </KpiGrid>

          <h2 className="mb-4 font-display text-[26px] font-light tracking-[0.04em]">Ranking de comisiones</h2>
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Comercial</th><th>Won YTD</th><th>Cuota</th><th>Comisión</th></tr>
            </thead>
            <tbody>
              {team.map((t, idx) => (
                <tr key={t.user.id}>
                  <td><LbRank n={idx + 1} /></td>
                  <td>
                    <div className="flex items-center gap-3">
                      <LbAvatar initials={initials(t.user.name)} bg={`var(--${t.user.avatarColor})`} color="var(--riva-ivory)" />
                      <div>
                        <div className="font-medium">{t.user.name}</div>
                        <div className="text-[11px] text-n-500">{t.user.deptRole}</div>
                      </div>
                    </div>
                  </td>
                  <td>{money(t.wonAmount, 'EUR')}</td>
                  <td><LbBar pct={Math.min(100, t.quotaPct)} variant="success" value={`${t.quotaPct}%`} /></td>
                  <td className="font-medium">{money(t.commission, 'EUR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  )
}
