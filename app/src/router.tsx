import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { PartnersPage } from './features/partners/PartnersPage'
import { FlagshipPage } from './features/flagship/FlagshipPage'
import { IntegrationsPage } from './features/integrations/IntegrationsPage'
import { AutomationsPage } from './features/automations/AutomationsPage'
import { VentasPage } from './features/departments/ventas/VentasPage'
import { AccountingPage } from './features/departments/accounting/AccountingPage'
import { OperationsPage } from './features/departments/operations/OperationsPage'
import { SupplyChainPage } from './features/departments/supply-chain/SupplyChainPage'
import { MarketingPage } from './features/departments/marketing/MarketingPage'
import { PostventaPage } from './features/departments/postventa/PostventaPage'
import { TecnologiaPage } from './features/departments/tecnologia/TecnologiaPage'

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
      { path: 'dept/ventas', element: <VentasPage /> },
      { path: 'dept/accounting', element: <AccountingPage /> },
      { path: 'dept/operations', element: <OperationsPage /> },
      { path: 'dept/supply-chain', element: <SupplyChainPage /> },
      { path: 'dept/marketing', element: <MarketingPage /> },
      { path: 'dept/postventa', element: <PostventaPage /> },
      { path: 'dept/tecnologia', element: <TecnologiaPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
