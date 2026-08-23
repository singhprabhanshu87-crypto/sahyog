import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { hasRole } from '@/lib/permissions'

export function RequireRole({ roles, children, fallback = '/login' }) {
  const user = useAuthStore((s) => s.user)
  const activeRole = useAuthStore((s) => s.activeRole)
  const effectiveUser = user ? { ...user, role: activeRole ?? user.role } : null

  if (!effectiveUser || !hasRole(effectiveUser, ...roles)) {
    return <Navigate to={fallback} replace />
  }

  return children
}
