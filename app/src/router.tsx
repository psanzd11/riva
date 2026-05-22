import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { PartnersPage } from './features/partners/PartnersPage'
import { FlagshipPage } from './features/flagship/FlagshipPage'
import { IntegrationsPage } from './features/integrations/IntegrationsPage'
import { AutomationsPage } from './features/automations/AutomationsPage'
import { UnderConstruction } from './features/departments/UnderConstruction'

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
      { path: 'dept/ventas', element: <UnderConstruction dept="ventas" /> },
      { path: 'dept/accounting', element: <UnderConstruction dept="accounting" /> },
      { path: 'dept/operations', element: <UnderConstruction dept="operations" /> },
      { path: 'dept/supply-chain', element: <UnderConstruction dept="supply-chain" /> },
      { path: 'dept/marketing', element: <UnderConstruction dept="marketing" /> },
      { path: 'dept/postventa', element: <UnderConstruction dept="postventa" /> },
      { path: 'dept/tecnologia', element: <UnderConstruction dept="tecnologia" /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
