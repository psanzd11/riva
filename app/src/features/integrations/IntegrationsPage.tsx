import { useStore } from '../../data/store'
import { PageHead } from '../../components/layout/PageHead'

export function IntegrationsPage() {
  const integrations = useStore((s) => s.integrations)

  return (
    <>
      <PageHead
        eyebrow="Stack conectado al Hub"
        title="Integraciones"
        description="Sistemas externos conectados al Hub: facturación, pagos, CRM interno, productividad. Cada integración se monitoriza en tiempo real desde Tecnología."
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
    </>
  )
}
