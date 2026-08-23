import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ROLES } from '@/lib/permissions'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      activeRole: null,
      activeOrgId: null,

      login: (user, tokens) =>
        set({
          user,
          accessToken: tokens.accessToken ?? tokens,
          refreshToken: tokens.refreshToken ?? null,
          activeRole: user?.role ?? null,
          activeOrgId: user?.orgId ?? null,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          activeRole: null,
          activeOrgId: null,
        }),

      setActiveRole: (role) => set({ activeRole: role }),

      setActiveOrg: (orgId) => set({ activeOrgId: orgId }),

      isAuthenticated: () => Boolean(get().accessToken && get().user),

      getEffectiveRole: () => get().activeRole ?? get().user?.role ?? null,
    }),
    {
      name: 'sahyog-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        activeRole: state.activeRole,
        activeOrgId: state.activeOrgId,
      }),
    },
  ),
)

export const DEMO_USER = {
  id: 'demo-user-1',
  name: 'Priya Sharma',
  email: 'priya.sharma@example.gov.in',
  role: ROLES.STATE_PMU,
  orgId: 'org-jharkhand-pmu',
  orgName: 'Jharkhand Innovation PMU',
  roles: [ROLES.STATE_PMU, ROLES.REVIEWER, ROLES.DOMAIN_OFFICER],
  district: 'Ranchi',
}
