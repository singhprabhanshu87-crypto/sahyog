import { Bell, Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RoleSwitcher } from './RoleSwitcher'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { useAuthStore } from '@/store/auth.store'
import { useUiStore } from '@/store/ui.store'
import { getRoleLabel } from '@/lib/permissions'

export function Topbar() {
  const user = useAuthStore((s) => s.user)
  const effectiveRole = useAuthStore((s) => s.getEffectiveRole())
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-surface px-4 shadow-card">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
        <Menu className="h-5 w-5" strokeWidth={1.5} />
      </Button>

      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" strokeWidth={1.5} />
        <Input
          placeholder="Search challenges, submissions…"
          className="pl-9 bg-surface-overlay"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <LanguageSwitcher />
        <RoleSwitcher />

        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" strokeWidth={1.5} />
        </Button>

        {user && (
          <div className="hidden sm:flex items-center gap-3 border-l border-border pl-3">
            <div className="text-right">
              <p className="text-subheading text-text-primary">{user.name}</p>
              <p className="text-small text-text-secondary">
                {getRoleLabel(effectiveRole)}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-subtle text-primary text-subheading font-semibold">
              {user.name?.charAt(0) ?? 'U'}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
