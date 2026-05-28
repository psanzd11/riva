import { useStore } from '../../data/store'
import { useRole } from '../../auth/RoleContext'
import { relevantIntegrationIds } from '../../auth/integrationsForRole'
import { PageHead } from '../../components/layout/PageHead'
import type { Integration } from '../../data/schema'

function IntegrationCard({ i, dimmed }: { i: Integration; dimmed?: boolean }) {
  const stClass =
    i.status === 'connected' ? 'text-success' : i.status === 'warn' ? 'text-warning' : 'text-error'
  const cleanLabel = i.statusLabel.replace(/^[●○]\s*/, '')
  const dotChar = i.status === 'disconnected' ? '○' : '●'
  return (
    <div className={`bg-riva-white text-center ${dimmed ? 'opacity-45' : ''}`} style={{ padding: '22px 18px' }}>
      <div className="mb-2 font-display text-[14px] font-normal tracking-[0.06em]">{i.name}</div>
      <div className={`text-[10px] uppercase tracking-[0.15em] ${stClass}`}>
        <span className="mr-1">{dotChar}</span>{cleanLabel}
      </div>
    </div>
  )
}

export function IntegrationsPage() {
  const integrations = useStore((s) => s.integrations)
  const { role } = useRole()
  const relevant = relevantIntegrationIds(role)

  // Admin/read-all roles (CEO, Tech Lead) see the flat grid.
  if (!relevant) {
    return (
      <>
        <PageHead
          eyebrow="Stack conectado al Hub"
          title="Integraciones"
          description="Sistemas externos conectados al Hub: facturación, pagos, CRM interno, productividad. Cada integración se monitoriza en tiempo real desde Tecnología."
        />
        <div className="mb-12 grid grid-cols-2 gap-px border border-n-300 bg-n-300 md:grid-cols-3 lg:grid-cols-6">
          {integrations.map((i) => <IntegrationCard key={i.id} i={i} />)}
          <div className="bg-riva-white text-center" style={{ padding: '22px 18px' }}>
            <div className="mb-2 font-display text-[14px] font-normal tracking-[0.06em]">+ Añadir</div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-n-500">Catálogo</div>
          </div>
        </div>
      </>
    )
  }

  const mine = integrations.filter((i) => relevant.has(i.id))
  const others = integrations.filter((i) => !relevant.has(i.id))

  return (
    <>
      <PageHead
        eyebrow="Stack conectado al Hub"
        title="Integraciones"
        description="Tu stack para el día a día aparece primero. El resto de sistemas conectados al Hub se muestran como referencia."
      />

      <h2 className="mb-3 font-display text-[20px] font-light tracking-[0.04em]">Tu stack</h2>
      <div className="mb-10 grid grid-cols-2 gap-px border border-n-300 bg-n-300 md:grid-cols-3 lg:grid-cols-6">
        {mine.length === 0 && (
          <div className="bg-riva-white p-6 text-[12px] text-n-500">Sin integraciones asignadas a tu rol.</div>
        )}
        {mine.map((i) => <IntegrationCard key={i.id} i={i} />)}
      </div>

      <h2 className="mb-3 font-display text-[20px] font-light tracking-[0.04em] text-n-500">Resto del Hub</h2>
      <div className="mb-12 grid grid-cols-2 gap-px border border-n-300 bg-n-300 md:grid-cols-3 lg:grid-cols-6">
        {others.map((i) => <IntegrationCard key={i.id} i={i} dimmed />)}
      </div>
    </>
  )
}
