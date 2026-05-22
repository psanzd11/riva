import { PageHead } from '../../components/layout/PageHead'

const DEPT_LABELS: Record<string, { title: string; eyebrow: string; descr: string }> = {
  ventas: {
    eyebrow: 'Departamento',
    title: 'Ventas',
    descr: 'Pipeline cross-sede, equipo comercial por sede + partners. Módulo en fase de construcción — entra en Fase 1.',
  },
  accounting: {
    eyebrow: 'Departamento',
    title: 'Accounting',
    descr: 'Facturación QuickBooks, cobros automáticos vía link de pago, conciliación, P&L. Entra en Fase 2.',
  },
  operations: {
    eyebrow: 'Departamento',
    title: 'Operations',
    descr: 'Pedidos, logística, instalaciones, coordinación cross-sede. Entra en Fase 3.',
  },
  'supply-chain': {
    eyebrow: 'Departamento',
    title: 'Supply Chain',
    descr: 'Inventario, lead times, OC a fábrica, almacenes ES y USA. Entra en Fase 4.',
  },
  marketing: {
    eyebrow: 'Departamento',
    title: 'Marketing',
    descr: 'Campañas, generación de leads, contenido. Entra en Fase 5.',
  },
  postventa: {
    eyebrow: 'Departamento',
    title: 'Postventa',
    descr: 'Tickets, reseñas, NPS, garantías y mantenimiento. Entra en Fase 6.',
  },
  tecnologia: {
    eyebrow: 'Departamento',
    title: 'Tecnología',
    descr: 'CRM interno, integraciones, roadmap, audit log. Entra en Fase 7.',
  },
}

interface UnderConstructionProps {
  dept: keyof typeof DEPT_LABELS
}

export function UnderConstruction({ dept }: UnderConstructionProps) {
  const meta = DEPT_LABELS[dept]
  return (
    <>
      <PageHead eyebrow={meta.eyebrow} title={meta.title} description={meta.descr} />
      <div className="border border-n-300 bg-riva-white p-12 text-center">
        <div className="eyebrow !mb-3 !text-[10px]">En construcción</div>
        <h2 className="font-display text-[26px] font-light tracking-[0.04em] text-n-900">
          Este módulo se entrega en su fase
        </h2>
        <p className="mx-auto mt-4 max-w-[480px] text-[14px] text-n-700">
          La SPA está actualmente en Fase 0 — shell, dataLayer, vistas no-departamentales. Los
          departamentos entran uno por fase a partir de Fase 1.
        </p>
      </div>
    </>
  )
}
