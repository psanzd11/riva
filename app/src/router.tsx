import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { PartnersPage } from './features/partners/PartnersPage'
import { FlagshipPage } from './features/flagship/FlagshipPage'
import { IntegrationsPage } from './features/integrations/IntegrationsPage'
import { AutomationsPage } from './features/automations/AutomationsPage'

import {
  VentasResumen,
  VentasPipeline,
  VentasEquipo,
  VentasForecast,
  VentasActividad,
} from './features/departments/ventas/sections'
import {
  AccountingResumen,
  AccountingFacturas,
  AccountingAging,
  AccountingPL,
  AccountingCierre,
} from './features/departments/accounting/sections'
import {
  OperationsResumen,
  OperationsInstalaciones,
  OperationsEquipos,
  OperationsSla,
} from './features/departments/operations/sections'
import {
  ScResumen,
  ScInventario,
  ScOc,
  ScProveedores,
} from './features/departments/supply-chain/sections'
import {
  MktResumen,
  MktCampanas,
  MktLeads,
  MktEmbudo,
} from './features/departments/marketing/sections'
import {
  PvResumen,
  PvTickets,
  PvResenas,
  PvNps,
} from './features/departments/postventa/sections'
import {
  TechResumen,
  TechRoadmap,
  TechIntegraciones,
  TechAudit,
} from './features/departments/tecnologia/sections'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'partners', element: <PartnersPage /> },
      { path: 'flagship', element: <FlagshipPage /> },
      { path: 'integrations', element: <IntegrationsPage /> },
      { path: 'automations', element: <AutomationsPage /> },

      { path: 'dept/ventas', element: <VentasResumen /> },
      { path: 'dept/ventas/pipeline', element: <VentasPipeline /> },
      { path: 'dept/ventas/equipo', element: <VentasEquipo /> },
      { path: 'dept/ventas/forecast', element: <VentasForecast /> },
      { path: 'dept/ventas/actividad', element: <VentasActividad /> },

      { path: 'dept/accounting', element: <AccountingResumen /> },
      { path: 'dept/accounting/facturas', element: <AccountingFacturas /> },
      { path: 'dept/accounting/aging', element: <AccountingAging /> },
      { path: 'dept/accounting/pl', element: <AccountingPL /> },
      { path: 'dept/accounting/cierre', element: <AccountingCierre /> },

      { path: 'dept/operations', element: <OperationsResumen /> },
      { path: 'dept/operations/instalaciones', element: <OperationsInstalaciones /> },
      { path: 'dept/operations/equipos', element: <OperationsEquipos /> },
      { path: 'dept/operations/sla', element: <OperationsSla /> },

      { path: 'dept/supply-chain', element: <ScResumen /> },
      { path: 'dept/supply-chain/inventario', element: <ScInventario /> },
      { path: 'dept/supply-chain/oc', element: <ScOc /> },
      { path: 'dept/supply-chain/proveedores', element: <ScProveedores /> },

      { path: 'dept/marketing', element: <MktResumen /> },
      { path: 'dept/marketing/campanas', element: <MktCampanas /> },
      { path: 'dept/marketing/leads', element: <MktLeads /> },
      { path: 'dept/marketing/embudo', element: <MktEmbudo /> },

      { path: 'dept/postventa', element: <PvResumen /> },
      { path: 'dept/postventa/tickets', element: <PvTickets /> },
      { path: 'dept/postventa/resenas', element: <PvResenas /> },
      { path: 'dept/postventa/nps', element: <PvNps /> },

      { path: 'dept/tecnologia', element: <TechResumen /> },
      { path: 'dept/tecnologia/roadmap', element: <TechRoadmap /> },
      { path: 'dept/tecnologia/integraciones', element: <TechIntegraciones /> },
      { path: 'dept/tecnologia/audit', element: <TechAudit /> },

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
