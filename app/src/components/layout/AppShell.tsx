import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
  return (
    <div className="grid min-h-screen" style={{ gridTemplateColumns: 'var(--sidebar-w) 1fr' }}>
      <Sidebar />
      <main className="flex min-h-screen flex-col">
        <Topbar />
        <div className="max-w-page flex-1 px-12 pb-20 pt-10">
          <Outlet />
        </div>
        <footer className="mt-auto flex justify-between border-t border-n-300 px-12 py-6 text-[11px] uppercase tracking-[0.1em] text-n-500">
          <div>The RIVA Company · Hub · v0.1</div>
          <div>Madrid · New York</div>
        </footer>
      </main>
    </div>
  )
}
