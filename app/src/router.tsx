import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { PartnersPage } from './features/partners/PartnersPage'
import { FlagshipPage } from './features/flagship/FlagshipPage'
import { IntegrationsPage } from './features/integrations/IntegrationsPage'
import { AutomationsPage } from './features/automations/AutomationsPage'
import { RequestAutomationPage } from './features/automations/RequestAutomationPage'

import {
  VentasResumen,
  VentasPipeline,
  VentasLeads,
  VentasEquipo,
  VentasForecast,
  VentasActividad,
} from './features/departments/ventas/sections'
import { VentasTpv } from './features/departments/ventas/Tpv'
import { VentasCatalogo } from './features/departments/ventas/Catalogo'
import { VentasAgenda } from './features/departments/ventas/Agenda'
import { VentasComisiones } from './features/departments/ventas/Comisiones'
import {
  AccountingResumen,
  AccountingFacturas,
  AccountingAging,
  AccountingPL,
  AccountingCierre,
  AccountingEquipo,
} from './features/departments/accounting/sections'
import {
  OperationsResumen,
  OperationsInstalaciones,
  OperationsEquipos,
  OperationsSla,
  OperationsEquipo,
} from './features/departments/operations/sections'
import { OperationsDia } from './features/departments/operations/MiDia'
import {
  ScResumen,
  ScInventario,
  ScOc,
  ScProveedores,
  ScEquipo,
} from './features/departments/supply-chain/sections'
import {
  MktResumen,
  MktCampanas,
  MktEmbudo,
  MktEquipo,
} from './features/departments/marketing/sections'
import { MktHandoff } from './features/departments/marketing/Handoff'
import {
  PvResumen,
  PvTickets,
  PvResenas,
  PvNps,
  PvEquipo,
} from './features/departments/postventa/sections'
import { PvDia } from './features/departments/postventa/MiDia'
import {
  TechResumen,
  TechRoadmap,
  TechIntegraciones,
  TechInternal,
  TechAudit,
  TechEquipo,
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
      { path: 'automations/request', element: <RequestAutomationPage /> },

      { path: 'dept/ventas', element: <VentasResumen /> },
      { path: 'dept/ventas/pipeline', element: <VentasPipeline /> },
      { path: 'dept/ventas/tpv', element: <VentasTpv /> },
      { path: 'dept/ventas/catalogo', element: <VentasCatalogo /> },
      { path: 'dept/ventas/agenda', element: <VentasAgenda /> },
      { path: 'dept/ventas/leads', element: <VentasLeads /> },
      { path: 'dept/ventas/comisiones', element: <VentasComisiones /> },
      { path: 'dept/ventas/equipo', element: <VentasEquipo /> },
      { path: 'dept/ventas/forecast', element: <VentasForecast /> },
      { path: 'dept/ventas/actividad', element: <VentasActividad /> },

      { path: 'dept/accounting', element: <AccountingResumen /> },
      { path: 'dept/accounting/facturas', element: <AccountingFacturas /> },
      { path: 'dept/accounting/aging', element: <AccountingAging /> },
      { path: 'dept/accounting/pl', element: <AccountingPL /> },
      { path: 'dept/accounting/cierre', element: <AccountingCierre /> },
      { path: 'dept/accounting/equipo', element: <AccountingEquipo /> },

      { path: 'dept/operations', element: <OperationsResumen /> },
      { path: 'dept/operations/dia', element: <OperationsDia /> },
      { path: 'dept/operations/instalaciones', element: <OperationsInstalaciones /> },
      { path: 'dept/operations/equipos', element: <OperationsEquipos /> },
      { path: 'dept/operations/sla', element: <OperationsSla /> },
      { path: 'dept/operations/equipo', element: <OperationsEquipo /> },

      { path: 'dept/supply-chain', element: <ScResumen /> },
      { path: 'dept/supply-chain/inventario', element: <ScInventario /> },
      { path: 'dept/supply-chain/oc', element: <ScOc /> },
      { path: 'dept/supply-chain/proveedores', element: <ScProveedores /> },
      { path: 'dept/supply-chain/equipo', element: <ScEquipo /> },

      { path: 'dept/marketing', element: <MktResumen /> },
      { path: 'dept/marketing/handoff', element: <MktHandoff /> },
      { path: 'dept/marketing/campanas', element: <MktCampanas /> },
      { path: 'dept/marketing/embudo', element: <MktEmbudo /> },
      { path: 'dept/marketing/equipo', element: <MktEquipo /> },

      { path: 'dept/postventa', element: <PvResumen /> },
      { path: 'dept/postventa/dia', element: <PvDia /> },
      { path: 'dept/postventa/tickets', element: <PvTickets /> },
      { path: 'dept/postventa/resenas', element: <PvResenas /> },
      { path: 'dept/postventa/nps', element: <PvNps /> },
      { path: 'dept/postventa/equipo', element: <PvEquipo /> },

      { path: 'dept/tecnologia', element: <TechResumen /> },
      { path: 'dept/tecnologia/roadmap', element: <TechRoadmap /> },
      { path: 'dept/tecnologia/integraciones', element: <TechIntegraciones /> },
      { path: 'dept/tecnologia/internal', element: <TechInternal /> },
      { path: 'dept/tecnologia/audit', element: <TechAudit /> },
      { path: 'dept/tecnologia/equipo', element: <TechEquipo /> },

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
