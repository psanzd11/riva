import { useStore } from '../../data/store'
import { PageHead } from '../../components/layout/PageHead'
import { Panel } from '../../components/ui/Panel'
import { Button } from '../../components/ui/Button'

export function IntegrationsPage() {
  const integrations = useStore((s) => s.integrations)

  return (
    <>
      <PageHead
        eyebrow="Stack conectado al Hub"
        title="Integraciones"
        description="El Hub conecta QuickBooks, Stripe, el CRM interno y otros sistemas. HubSpot queda relegado a email marketing — se evalúa sustituirlo por una alternativa más barata."
      />

      <div className="mb-12 grid grid-cols-2 gap-px border border-n-300 bg-n-300 md:grid-cols-3 lg:grid-cols-6">
        {integrations.map((i) => {
          const stClass =
            i.status === 'connected' ? 'text-success' : i.status === 'warn' ? 'text-warning' : 'text-n-500'
          return (
            <div key={i.id} className="bg-riva-white px-4.5 py-5 text-center" style={{ padding: '22px 18px' }}>
              <div className="mb-2 font-display text-[14px] font-normal tracking-[0.06em]">{i.name}</div>
              <div className={`text-[10px] uppercase tracking-[0.15em] ${stClass}`}>{i.statusLabel}</div>
            </div>
          )
        })}
        <div className="bg-riva-white px-4.5 py-5 text-center" style={{ padding: '22px 18px' }}>
          <div className="mb-2 font-display text-[14px] font-normal tracking-[0.06em]">+ Añadir</div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-n-500">Catálogo</div>
        </div>
      </div>

      <Panel title="Recomendación · HubSpot">
        <div className="p-6">
          <p className="mb-3.5 text-[13px]">
            Actualmente HubSpot se usa exclusivamente para envíos masivos de email marketing y cuesta una suscripción
            completa que no se está aprovechando.
          </p>
          <p className="mb-3.5 text-[13px]">
            <b>Alternativas:</b> migrar a un proveedor de email (Mailchimp, Brevo, Resend) integrado vía API al CRM
            interno. Ahorro estimado: 70-85% del coste actual de HubSpot.
          </p>
          <div className="flex gap-2.5">
            <Button variant="outline">Ver comparativa</Button>
            <Button>Plan de migración</Button>
          </div>
        </div>
      </Panel>
    </>
  )
}
