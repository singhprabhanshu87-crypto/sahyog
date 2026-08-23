import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { useAuthStore } from '@/store/auth.store'
import { getRoleLabel } from '@/lib/permissions'

export function RoleSwitcher() {
  const user = useAuthStore((s) => s.user)
  const activeRole = useAuthStore((s) => s.activeRole)
  const setActiveRole = useAuthStore((s) => s.setActiveRole)

  const roles = user?.roles?.length ? user.roles : user?.role ? [user.role] : []

  if (roles.length <= 1) return null

  return (
    <div className="hidden md:flex items-center gap-2">
      <span className="text-small text-text-secondary">Acting as</span>
      <Select
        value={activeRole ?? user?.role ?? ''}
        onChange={(e) => setActiveRole(e.target.value)}
        className="w-40 h-8 text-small"
        aria-label="Switch role"
      >
        {roles.map((role) => (
          <option key={role} value={role}>
            {getRoleLabel(role)}
          </option>
        ))}
      </Select>
    </div>
  )
}

export function RoleSwitcherCompact() {
  const user = useAuthStore((s) => s.user)
  const activeRole = useAuthStore((s) => s.activeRole)
  const setActiveRole = useAuthStore((s) => s.setActiveRole)

  const roles = user?.roles?.length ? user.roles : user?.role ? [user.role] : []

  if (roles.length <= 1) return null

  return (
    <Button variant="secondary" size="sm" className="gap-1">
      {getRoleLabel(activeRole ?? user?.role)}
      <ChevronDown className="h-3 w-3" strokeWidth={1.5} />
      <select
        className="absolute inset-0 opacity-0 cursor-pointer"
        value={activeRole ?? user?.role ?? ''}
        onChange={(e) => setActiveRole(e.target.value)}
        aria-label="Switch role"
      >
        {roles.map((role) => (
          <option key={role} value={role}>
            {getRoleLabel(role)}
          </option>
        ))}
      </select>
    </Button>
  )
}
