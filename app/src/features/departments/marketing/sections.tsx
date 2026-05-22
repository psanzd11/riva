import { useRef, useState } from 'react'
import { useStore } from '../../../data/store'
import { campaignsRepo, leadsRepo } from '../../../data/repo'
import { useRole } from '../../../auth/RoleContext'
import { PageHead } from '../../../components/layout/PageHead'
import { Button } from '../../../components/ui/Button'
import { Panel } from '../../../components/ui/Panel'
import { Pill } from '../../../components/ui/Pill'
import { Modal } from '../../../components/ui/Modal'
import { Field, Input, Select } from '../../../components/ui/Field'
import { KpiGrid } from '../../../components/kpi/KpiGrid'
import { KpiCard } from '../../../components/kpi/KpiCard'
import { ConversionBar } from '../../../components/charts/ConversionBar'
import { VBarChart } from '../../../components/charts/VBarChart'
import { MultiLine } from '../../../components/charts/MultiLine'
import { RatioGrid } from '../../../components/charts/RatioGrid'
import { LbBar } from '../../../components/data-table/Leaderboard'
import { money, dateShort } from '../../../lib/format'
import type { Campaign, Lead } from '../../../data/schema'

function MktHeader({ actions }: { actions?: React.ReactNode }) {
  return (
    <PageHead
      eyebrow="Departamento"
      title="Marketing"
      description="Campañas, generación de leads, contenido. Email marketing aún en HubSpot — pendiente migrar al Hub."
      actions={actions}
    />
  )
}

export function MktResumen() {
  const campaigns = useStore((s) => s.campaigns)
  const leads = useStore((s) => s.leads)
  return (
    <>
      <MktHeader actions={<><Button variant="outline">Calendario</Button><Button>+ Campaña</Button></>} />
      <KpiGrid>
        <KpiCard eyebrow="Campañas activas" value={String(campaigns.filter((c) => c.status === 'active').length)} sub="2 ES · 2 USA" />
        <KpiCard eyebrow="Leads mes" value={String(leads.length)} delta={{ type: 'up', label: '↑ 24% vs abril' }} />
        <KpiCard eyebrow="CPL medio" value="€ 28" delta={{ type: 'up', label: '−€ 4 vs Q1' }} />
        <KpiCard eyebrow="Open rate email" value="38%" delta={{ type: 'up', label: '↑ 6 pp' }} />
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

      <p className="text-[13px] text-n-700 max-w-prose">
        Subsecciones: <b>Campañas</b> (CRUD + métricas), <b>Leads</b> (tabla + import CSV),
        <b> Embudo & ratios</b> (canales + ratios).
      </p>
    </>
  )
}

export function MktCampanas() {
  const { currentUserId } = useRole()
  const campaigns = useStore((s) => s.campaigns)
  const [open, setOpen] = useState(false)
  return (
    <>
      <MktHeader actions={<><Button variant="outline">Exportar</Button><Button onClick={() => setOpen(true)}>+ Campaña</Button></>} />
      <h2 className="mb-4 font-display text-[26px] font-light tracking-[0.04em]">Campañas activas</h2>
      <table className="data-table">
        <thead>
          <tr><th>Campaña</th><th>Canal</th><th>Periodo</th><th>Spend</th><th>Leads</th><th>CPL</th><th>Conv.</th><th>Estado</th></tr>
        </thead>
        <tbody>
          {campaigns.map((c) => {
            const cpl = c.leadsCount > 0 ? Math.round(c.spend / c.leadsCount) : 0
            return (
              <tr key={c.id}>
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
    </>
  )
}

export function MktLeads() {
  const { currentUserId } = useRole()
  const leads = useStore((s) => s.leads)
  const [importOpen, setImportOpen] = useState(false)
  return (
    <>
      <MktHeader actions={<><Button variant="outline" onClick={() => setImportOpen(true)}>Importar CSV</Button><Button>+ Lead</Button></>} />
      <h2 className="mb-4 font-display text-[26px] font-light tracking-[0.04em]">Leads recientes</h2>
      <table className="data-table">
        <thead>
          <tr><th>Lead</th><th>Email</th><th>Canal</th><th>Sede</th><th>Score</th><th>Stage</th></tr>
        </thead>
        <tbody>
          {leads.slice(0, 30).map((l) => (
            <tr key={l.id}>
              <td>{l.name}</td>
              <td className="text-n-500">{l.email}</td>
              <td>{l.channel}</td>
              <td>{l.sede.toUpperCase()}</td>
              <td><LbBar pct={l.score} value={String(l.score)} /></td>
              <td><Pill variant={l.score >= 75 ? 'ok' : l.score >= 50 ? 'warn' : 'default'}>{l.stage}</Pill></td>
            </tr>
          ))}
        </tbody>
      </table>
      <ImportLeadsModal open={importOpen} onClose={() => setImportOpen(false)} userId={currentUserId} />
    </>
  )
}

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
      <Panel title="Leads 12 meses por canal" className="mt-8">
        <MultiLine
          series={[
            { name: 'Orgánico', color: 'var(--cove)', points: [148, 142, 138, 124, 116, 98, 86, 74, 68, 58, 46, 38, 30] },
            { name: 'Paid', color: 'var(--oak-mid)', points: [168, 162, 158, 150, 142, 130, 118, 108, 98, 86, 76, 68, 60] },
            { name: 'Partners', color: 'var(--sage)', points: [178, 170, 166, 158, 148, 140, 128, 118, 108, 98, 90, 84, 78] },
          ]}
          xLabels={['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', '']}
        />
      </Panel>
    </>
  )
}

function ImportLeadsModal({ open, onClose, userId }: { open: boolean; onClose: () => void; userId: string }) {
  const [text, setText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  void fileRef

  const parsePreview = (raw: string): Omit<Lead, 'id'>[] => {
    const lines = raw.trim().split(/\r?\n/).filter(Boolean)
    return lines.slice(0, 50).map((line) => {
      const [name, email, channel, sede] = line.split(',').map((s) => s.trim())
      return {
        name: name ?? 'Lead',
        email: email ?? 'lead@example.com',
        sede: (sede as 'es' | 'us') ?? 'es',
        channel: channel ?? 'Manual',
        score: 50,
        stage: 'new' as const,
        ownerId: userId,
        createdAt: new Date().toISOString(),
      } satisfies Omit<Lead, 'id'>
    })
  }

  const previews = parsePreview(text)
  const doImport = () => {
    previews.forEach((l) => leadsRepo.create(l, userId))
    setText('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Importar leads CSV">
      <p className="mb-4 text-[13px] text-n-700">Formato: <code className="text-cove">name,email,channel,sede</code></p>
      <div className="mb-4">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={async (e) => {
            const f = e.target.files?.[0]
            if (f) setText(await f.text())
          }}
          className="text-[12px]"
        />
      </div>
      <Field label="O pega CSV">
        <textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-n-300 bg-transparent p-3 text-[13px] focus:border-riva-black focus:outline-none"
          placeholder="Casa Mendel,info@casamendel.es,Partners,es"
        />
      </Field>
      <div className="mb-4 text-[12px] text-n-500">{previews.length} leads detectados.</div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={doImport} disabled={previews.length === 0}>Importar {previews.length}</Button>
      </div>
    </Modal>
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
