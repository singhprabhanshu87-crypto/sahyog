import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  Building2,
  ClipboardCheck,
  FileText,
  FolderKanban,
  Gavel,
  GitBranch,
  Handshake,
  Inbox,
  LayoutDashboard,
  Scale,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/cn'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/submissions', label: 'Submissions', icon: Inbox },
  { to: '/triage', label: 'Triage', icon: ClipboardCheck },
  { to: '/challenges', label: 'Challenges', icon: FileText },
  { to: '/claims', label: 'Claims', icon: Handshake },
  { to: '/teams', label: 'Teams', icon: Users },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/workflow', label: 'Workflow', icon: GitBranch },
  { to: '/organizations', label: 'Organizations', icon: Building2 },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/validation', label: 'Validation', icon: Scale },
  { to: '/disputes', label: 'Disputes', icon: Gavel },
]

export function Sidebar({ collapsed }) {
  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen flex-col border-r border-border bg-surface shadow-card transition-all',
        collapsed ? 'w-16' : 'w-sidebar',
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-subheading font-bold">
          S
        </div>
        {!collapsed && (
          <div>
            <p className="text-subheading text-text-primary">Sahyog</p>
            <p className="text-small text-text-secondary">Innovation portal</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-body transition-colors',
                    isActive
                      ? 'bg-primary-subtle text-primary font-medium'
                      : 'text-text-secondary hover:bg-surface-overlay hover:text-text-primary',
                    collapsed && 'justify-center px-2',
                  )
                }
                title={collapsed ? label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {!collapsed && (
        <div className="border-t border-border p-4">
          <p className="text-small text-text-secondary">
            Jharkhand Societal Innovation
          </p>
        </div>
      )}
    </aside>
  )
}
