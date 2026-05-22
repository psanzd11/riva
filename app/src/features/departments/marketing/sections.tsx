import { useState } from 'react'
import { useStore } from '../../../data/store'
import { campaignsRepo } from '../../../data/repo'
import { useRole } from '../../../auth/RoleContext'
import { PageHead } from '../../../components/layout/PageHead'
import { Button } from '../../../components/ui/Button'
import { Panel } from '../../../components/ui/Panel'
import { Pill } from '../../../components/ui/Pill'
import { Modal } from '../../../components/ui/Modal'
import { Drawer } from '../../../components/ui/Drawer'
import { Field, Input, Select } from '../../../components/ui/Field'
import { KpiGrid } from '../../../components/kpi/KpiGrid'
import { KpiCard } from '../../../components/kpi/KpiCard'
import { ConversionBar } from '../../../components/charts/ConversionBar'
import { VBarChart } from '../../../components/charts/VBarChart'
import { MultiLine } from '../../../components/charts/MultiLine'
import { LineArea } from '../../../components/charts/LineArea'
import { RatioGrid } from '../../../components/charts/RatioGrid'
import { LbBar } from '../../../components/data-table/Leaderboard'
import { money, moneyCompact, dateShort } from '../../../lib/format'
import { DeptEquipo } from '../shared/DeptEquipo'
import type { Campaign } from '../../../data/schema'

function MktHeader({ actions }: { actions?: React.ReactNode }) {
  return (
    <PageHead
      eyebrow="Departamento"
      title="Marketing"
      description="Campañas, contenido, brand. Genera demanda que pasa a Ventas como leads. Email marketing aún en HubSpot — pendiente migrar al Hub."
      actions={actions}
    />
  )
}

// ====================================================================
// RESUMEN — rico
// ====================================================================
export function MktResumen() {
  const campaigns = useStore((s) => s.campaigns)
  const leads = useStore((s) => s.leads)
  const activeCampaigns = campaigns.filter((c) => c.status === 'active')
  const totalSpend = campaigns.reduce((a, c) => a + c.spend, 0)
  const totalLeadsByCmp = campaigns.reduce((a, c) => a + c.leadsCount, 0)
  const avgCpl = totalLeadsByCmp > 0 ? Math.round(totalSpend / totalLeadsByCmp) : 0

  // Funnel-like quick stats
  const promotion = [184, 88, 44, 21, 8]
  const promotionLabels = ['Impresiones (k)', 'Sesiones web', 'Leads', 'MQL', 'Won-attributed']

  return (
    <>
      <MktHeader
        actions={
          <>
            <Button variant="outline">Calendario</Button>
            <Button>+ Campaña</Button>
          </>
        }
      />

      <KpiGrid cols={8}>
        <KpiCard eyebrow="Campañas activas" value={String(activeCampaigns.length)} sub="2 ES · 2 USA" />
        <KpiCard eyebrow="Leads mes" value={String(leads.length)} delta={{ type: 'up', label: '↑ 24% vs abril' }} />
        <KpiCard eyebrow="Spend total" value={moneyCompact(totalSpend, 'EUR')} sub="campañas activas" />
        <KpiCard eyebrow="CPL medio" value={`€ ${avgCpl}`} delta={{ type: 'up', label: '−€ 4 vs Q1' }} />
        <KpiCard eyebrow="Open rate email" value="38%" delta={{ type: 'up', label: '↑ 6 pp' }} />
        <KpiCard eyebrow="CTR email" value="12,4%" delta={{ type: 'up', label: '↑ 2,1 pp' }} />
        <KpiCard eyebrow="ROAS paid" value="3,8x" delta={{ type: 'up', label: '↑ 0,4x' }} />
        <KpiCard eyebrow="Web sessions" value="42k" delta={{ type: 'up', label: '↑ 18%' }} />
      </KpiGrid>

      <Panel title="Embudo Lead → Cliente" className="mb-8">
        <ConversionBar
          segments={[
            { label: 'Lead', pct: 100 },
            { label: 'MQL', pct: 48 },
            { label: 'SQL', pct: 24 },
            { label: 'Oportunidad', pct: 11 },
            { label: 'Cliente', pct: 4.2 },
          ]}
        />
      </Panel>

      <div className="mb-8 grid gap-8" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <Panel title="Leads 12 meses · por canal">
          <MultiLine
            series={[
              { name: 'Orgánico', color: 'var(--cove)', points: [148, 142, 138, 124, 116, 98, 86, 74, 68, 58, 46, 38, 30] },
              { name: 'Paid', color: 'var(--oak-mid)', points: [168, 162, 158, 150, 142, 130, 118, 108, 98, 86, 76, 68, 60] },
              { name: 'Partners', color: 'var(--sage)', points: [178, 170, 166, 158, 148, 140, 128, 118, 108, 98, 90, 84, 78] },
            ]}
            xLabels={['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', '']}
          />
        </Panel>

        <Panel title="Funnel marketing-to-revenue">
          <div className="px-6 py-5">
            {promotion.map((v, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="mb-1 flex justify-between text-[12px]">
                  <span className="text-n-900">{promotionLabels[i]}</span>
                  <span className="font-display text-[14px] text-n-700">{v}{i === 0 ? 'k' : ''}</span>
                </div>
                <div className="h-[6px] bg-n-100">
                  <div className="h-full" style={{ width: `${(v / promotion[0]) * 100}%`, background: ['#2a1a0e', '#3f2616', 'var(--cove)', '#7a5230', 'var(--sage)'][i] }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mb-8 grid gap-8" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Panel title="Ratios marketing">
          <RatioGrid
            items={[
              { label: 'Lead → cliente', value: '4,2%', delta: { type: 'up', label: '↑ 1,1 pp' } },
              { label: 'CAC', value: '€ 680', delta: { type: 'up', label: '−€ 90' } },
              { label: 'LTV / CAC', value: '4,8x', delta: { type: 'up', label: '↑ 0,4x' } },
              { label: 'Payback', value: '6 m', delta: { type: 'up', label: '−1 m' } },
              { label: 'Brand search', value: '+34%', delta: { type: 'up', label: 'vs 12m' } },
              { label: 'Eventos asistencia', value: '162', delta: { type: 'up', label: '↑ 18%' } },
            ]}
          />
        </Panel>

        <Panel title="Top campañas activas">
          <table className="data-table border-0">
            <thead><tr><th>Campaña</th><th>Spend</th><th>Leads</th><th>CPL</th></tr></thead>
            <tbody>
              {activeCampaigns.map((c) => {
                const cpl = c.leadsCount > 0 ? Math.round(c.spend / c.leadsCount) : 0
                return (
                  <tr key={c.id}>
                    <td>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-[11px] text-n-500">{c.channel}</div>
                    </td>
                    <td>{money(c.spend, c.currency)}</td>
                    <td>{c.leadsCount}</td>
                    <td>{money(cpl, c.currency)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Panel>
      </div>

      <Panel title="Web sessions · 12m">
        <LineArea
          points={[28, 30, 32, 34, 33, 35, 37, 38, 40, 39, 41, 42]}
          xLabels={['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May']}
          totals={{ left: 'Sessions · <b>42k</b>', right: '<b>↑ 18% YoY</b>' }}
        />
      </Panel>
    </>
  )
}

// ====================================================================
// CAMPAÑAS — clicables → drawer
// ====================================================================
export function MktCampanas() {
  const { currentUserId } = useRole()
  const campaigns = useStore((s) => s.campaigns)
  const [open, setOpen] = useState(false)
  const [drawerId, setDrawerId] = useState<string | null>(null)

  return (
    <>
      <MktHeader
        actions={
          <>
            <Button variant="outline">Exportar</Button>
            <Button onClick={() => setOpen(true)}>+ Campaña</Button>
          </>
        }
      />
      <h2 className="mb-4 font-display text-[26px] font-light tracking-[0.04em]">Campañas activas</h2>
      <p className="mb-4 text-[12px] text-n-500">Click sobre una fila para ver detalle de la campaña.</p>
      <table className="data-table">
        <thead>
          <tr><th>Campaña</th><th>Canal</th><th>Periodo</th><th>Spend</th><th>Leads</th><th>CPL</th><th>Conv.</th><th>Estado</th></tr>
        </thead>
        <tbody>
          {campaigns.map((c) => {
            const cpl = c.leadsCount > 0 ? Math.round(c.spend / c.leadsCount) : 0
            return (
              <tr key={c.id} onClick={() => setDrawerId(c.id)}>
                <td>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-[11px] text-n-500">{c.channel}</div>
                </td>
                <td>{c.channel}</td>
                <td>{dateShort(c.periodStart)} — {dateShort(c.periodEnd)}</td>
                <td>{money(c.spend, c.currency)}</td>
                <td>{c.leadsCount}</td>
                <td><LbBar pct={Math.min(100, 90 - cpl)} value={money(cpl, c.currency)} /></td>
                <td>{c.conversionRate.toFixed(1)}%</td>
                <td><Pill variant={c.status === 'active' ? 'ok' : 'default'}>{c.status === 'active' ? 'En curso' : c.status}</Pill></td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <NewCampaignModal open={open} onClose={() => setOpen(false)} userId={currentUserId} />
      <CampaignDrawer campaignId={drawerId} onClose={() => setDrawerId(null)} />
    </>
  )
}

interface CampaignDrawerProps {
  campaignId: string | null
  onClose: () => void
}

function CampaignDrawer({ campaignId, onClose }: CampaignDrawerProps) {
  const campaigns = useStore((s) => s.campaigns)
  const leads = useStore((s) => s.leads)
  const c = campaigns.find((x) => x.id === campaignId)
  if (!c) return null

  const cpl = c.leadsCount > 0 ? Math.round(c.spend / c.leadsCount) : 0
  // Synthetic attribution: assume 30% of leads in c.channel
  const attributedLeads = leads.filter((l) => l.channel.toLowerCase().includes(c.channel.split(' ')[0].toLowerCase())).slice(0, 10)
  const customers = Math.round(c.leadsCount * c.conversionRate * 0.01)
  const avgDealValue = 18000
  const revenue = customers * avgDealValue
  const roi = c.spend > 0 ? (revenue / c.spend).toFixed(1) : '—'

  // Content / asset list (mock)
  const assets = [
    { kind: 'Hero', name: 'Imagen hero TIERRA · campo' },
    { kind: 'Email', name: 'Welcome · día 0' },
    { kind: 'Email', name: 'Storytelling · día 4' },
    { kind: 'Email', name: 'Showroom invitation · día 14' },
    { kind: 'Social', name: 'Carousel IG · 6 frames' },
    { kind: 'Landing', name: 'Landing /tierra-cove' },
  ]

  return (
    <Drawer open={!!campaignId} onClose={onClose} title={c.name} subtitle={c.channel} width={620}>
      <div className="px-6 py-5">
        <div className="mb-5 grid grid-cols-2 gap-px bg-n-300">
          <div className="bg-riva-white p-4">
            <div className="eyebrow !mb-1.5 !text-[10px]">Periodo</div>
            <div className="text-[13px] font-medium">{dateShort(c.periodStart)} — {dateShort(c.periodEnd)}</div>
          </div>
          <div className="bg-riva-white p-4">
            <div className="eyebrow !mb-1.5 !text-[10px]">Estado</div>
            <Pill variant={c.status === 'active' ? 'ok' : 'default'}>{c.status === 'active' ? 'En curso' : c.status}</Pill>
          </div>
        </div>

        <h4 className="mb-3 font-display text-[14px] uppercase tracking-[0.08em]">Spend & resultados</h4>
        <div className="mb-6 grid grid-cols-2 gap-px bg-n-300">
          <div className="bg-riva-white p-4">
            <div className="eyebrow !mb-1.5 !text-[10px]">Spend</div>
            <div className="font-display text-[22px] font-light">{money(c.spend, c.currency)}</div>
          </div>
          <div className="bg-riva-white p-4">
            <div className="eyebrow !mb-1.5 !text-[10px]">Leads</div>
            <div className="font-display text-[22px] font-light">{c.leadsCount}</div>
          </div>
          <div className="bg-riva-white p-4">
            <div className="eyebrow !mb-1.5 !text-[10px]">CPL</div>
            <div className="font-display text-[22px] font-light">{money(cpl, c.currency)}</div>
          </div>
          <div className="bg-riva-white p-4">
            <div className="eyebrow !mb-1.5 !text-[10px]">Conversion</div>
            <div className="font-display text-[22px] font-light">{c.conversionRate.toFixed(1)}%</div>
          </div>
          <div className="bg-riva-white p-4">
            <div className="eyebrow !mb-1.5 !text-[10px]">Clientes</div>
            <div className="font-display text-[22px] font-light">{customers}</div>
          </div>
          <div className="bg-riva-white p-4">
            <div className="eyebrow !mb-1.5 !text-[10px]">ROAS estimado</div>
            <div className="font-display text-[22px] font-light">{roi}x</div>
          </div>
        </div>

        <h4 className="mb-3 font-display text-[14px] uppercase tracking-[0.08em]">Assets</h4>
        <div className="mb-6 border border-n-300">
          {assets.map((a, i) => (
            <div key={i} className="flex items-center justify-between border-b border-n-100 px-4 py-2.5 last:border-b-0">
              <div className="text-[13px]">{a.name}</div>
              <span className="text-[10px] uppercase tracking-[0.12em] text-n-500">{a.kind}</span>
            </div>
          ))}
        </div>

        <h4 className="mb-3 font-display text-[14px] uppercase tracking-[0.08em]">Leads atribuidos</h4>
        <div className="border border-n-300">
          {attributedLeads.length === 0 && (
            <div className="px-4 py-6 text-center text-[12px] text-n-500">No hay leads atribuidos todavía.</div>
          )}
          {attributedLeads.map((l) => (
            <div key={l.id} className="flex items-center justify-between border-b border-n-100 px-4 py-2.5 last:border-b-0">
              <div>
                <div className="text-[13px] font-medium">{l.name}</div>
                <div className="text-[11px] text-n-500">{l.email}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[11px] uppercase tracking-[0.08em] text-n-500">{l.stage}</div>
                <LbBar pct={l.score} value={String(l.score)} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          <Button>Editar campaña</Button>
        </div>
      </div>
    </Drawer>
  )
}

function NewCampaignModal({ open, onClose, userId }: { open: boolean; onClose: () => void; userId: string }) {
  const [name, setName] = useState('')
  const [channel, setChannel] = useState('Paid')
  const [spend, setSpend] = useState(10000)

  const submit = () => {
    if (!name.trim()) return
    const c: Omit<Campaign, 'id'> = {
      name: name.trim(),
      channel,
      periodStart: new Date().toISOString(),
      periodEnd: new Date(Date.now() + 60 * 86400000).toISOString(),
      spend,
      currency: 'EUR',
      leadsCount: 0,
      conversionRate: 0,
      status: 'active',
    }
    campaignsRepo.create(c, userId)
    setName('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Nueva campaña">
      <Field label="Nombre"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label="Canal">
        <Select value={channel} onChange={(e) => setChannel(e.target.value)}>
          {['Paid', 'Eventos', 'Email', 'PR', 'Partners'].map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </Field>
      <Field label="Spend (€)"><Input type="number" value={spend} onChange={(e) => setSpend(Number(e.target.value))} /></Field>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={submit}>Crear campaña</Button>
      </div>
    </Modal>
  )
}

// ====================================================================
// EMBUDO & RATIOS
// ====================================================================
export function MktEmbudo() {
  const leads = useStore((s) => s.leads)
  const byChannel = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.channel] = (acc[l.channel] ?? 0) + 1
    return acc
  }, {})
  const channelBars = Object.entries(byChannel)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, n], i) => ({
      label: name,
      value: String(n),
      heightPct: Math.min(95, (n / Math.max(...Object.values(byChannel))) * 80),
      variant: (['cove', 'oak', 'sage', 'mid', 'dark', 'cove'] as const)[i],
    }))

  return (
    <>
      <MktHeader />
      <Panel title="Embudo Lead → Cliente" className="mb-8">
        <ConversionBar
          segments={[
            { label: 'Lead', pct: 100 },
            { label: 'MQL', pct: 48 },
            { label: 'SQL', pct: 24 },
            { label: 'Oportunidad', pct: 11 },
            { label: 'Cliente', pct: 4.2 },
          ]}
        />
      </Panel>
      <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Panel title="Leads por canal · mes">
          <VBarChart bars={channelBars} foot={{ left: `Total · ${leads.length}`, right: 'CPL medio · € 28' }} />
        </Panel>
        <Panel title="Ratios marketing">
          <RatioGrid
            items={[
              { label: 'Lead → cliente', value: '4,2%', delta: { type: 'up', label: '↑ 1,1 pp' } },
              { label: 'CAC', value: '€ 680', delta: { type: 'up', label: '−€ 90' } },
              { label: 'ROAS paid', value: '3,8x', delta: { type: 'up', label: '↑ 0,4x' } },
              { label: 'CTR email', value: '12,4%', delta: { type: 'up', label: '↑ 2,1 pp' } },
              { label: 'Web sessions', value: '42k', delta: { type: 'up', label: '↑ 18%' } },
              { label: 'Brand search', value: '+34%', delta: { type: 'up', label: 'vs 12m' } },
            ]}
          />
        </Panel>
      </div>
    </>
  )
}

// ====================================================================
// EQUIPO
// ====================================================================
export function MktEquipo() {
  return (
    <>
      <MktHeader />
      <DeptEquipo
        dept="marketing"
        title="Equipo de Marketing"
        description="Content + paid media + PR/partnerships. Producen las campañas que se convierten en leads para Ventas."
      />
    </>
  )
}
