import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { canAccessOrg, ROLES } from '@/lib/permissions'

export function RequireOrgScope({ orgId, children, fallback = '/' }) {
  const user = useAuthStore((s) => s.user)
  const activeOrgId = useAuthStore((s) => s.activeOrgId)

  const targetOrgId = orgId ?? activeOrgId

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role === ROLES.STATE_PMU) {
    return children
  }

  if (!targetOrgId || !canAccessOrg(user, targetOrgId)) {
    return <Navigate to={fallback} replace />
  }

  return children
}
