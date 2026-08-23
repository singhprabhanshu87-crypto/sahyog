import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useUiStore } from '@/store/ui.store'

export function AppShell() {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)

  return (
    <div className="flex min-h-screen bg-surface-raised">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto px-6 py-8">
          <div className="mx-auto max-w-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export function AuthShell({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-raised p-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
