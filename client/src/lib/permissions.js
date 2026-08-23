export const ROLES = {
  CITIZEN: 'citizen',
  FACILITATOR: 'facilitator',
  REVIEWER: 'reviewer',
  DOMAIN_OFFICER: 'domain_officer',
  HEI_ADMIN: 'hei_admin',
  HEI_FACULTY: 'hei_faculty',
  HEI_STUDENT: 'hei_student',
  INDUSTRY: 'industry',
  STATE_PMU: 'state_pmu',
  ORG_ADMIN: 'org_admin',
}

export const PERMISSIONS = {
  SUBMISSIONS_READ: 'submissions:read',
  SUBMISSIONS_WRITE: 'submissions:write',
  TRIAGE_READ: 'triage:read',
  TRIAGE_WRITE: 'triage:write',
  CHALLENGES_READ: 'challenges:read',
  CHALLENGES_WRITE: 'challenges:write',
  CLAIMS_READ: 'claims:read',
  CLAIMS_WRITE: 'claims:write',
  TEAMS_READ: 'teams:read',
  TEAMS_WRITE: 'teams:write',
  PROJECTS_READ: 'projects:read',
  PROJECTS_WRITE: 'projects:write',
  WORKFLOW_READ: 'workflow:read',
  WORKFLOW_WRITE: 'workflow:write',
  ORGANIZATIONS_READ: 'organizations:read',
  ORGANIZATIONS_WRITE: 'organizations:write',
  ANALYTICS_READ: 'analytics:read',
  VALIDATION_READ: 'validation:read',
  VALIDATION_WRITE: 'validation:write',
  DISPUTES_READ: 'disputes:read',
  DISPUTES_WRITE: 'disputes:write',
}

const ROLE_PERMISSIONS = {
  [ROLES.CITIZEN]: [PERMISSIONS.SUBMISSIONS_READ, PERMISSIONS.SUBMISSIONS_WRITE],
  [ROLES.FACILITATOR]: [
    PERMISSIONS.SUBMISSIONS_READ,
    PERMISSIONS.SUBMISSIONS_WRITE,
  ],
  [ROLES.REVIEWER]: [
    PERMISSIONS.TRIAGE_READ,
    PERMISSIONS.TRIAGE_WRITE,
    PERMISSIONS.CHALLENGES_READ,
  ],
  [ROLES.DOMAIN_OFFICER]: [
    PERMISSIONS.TRIAGE_READ,
    PERMISSIONS.CHALLENGES_READ,
    PERMISSIONS.CHALLENGES_WRITE,
    PERMISSIONS.WORKFLOW_READ,
    PERMISSIONS.WORKFLOW_WRITE,
  ],
  [ROLES.HEI_ADMIN]: [
    PERMISSIONS.CHALLENGES_READ,
    PERMISSIONS.CLAIMS_READ,
    PERMISSIONS.CLAIMS_WRITE,
    PERMISSIONS.TEAMS_READ,
    PERMISSIONS.TEAMS_WRITE,
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.PROJECTS_WRITE,
    PERMISSIONS.WORKFLOW_READ,
    PERMISSIONS.VALIDATION_READ,
  ],
  [ROLES.HEI_FACULTY]: [
    PERMISSIONS.CHALLENGES_READ,
    PERMISSIONS.CLAIMS_READ,
    PERMISSIONS.CLAIMS_WRITE,
    PERMISSIONS.TEAMS_READ,
    PERMISSIONS.TEAMS_WRITE,
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.PROJECTS_WRITE,
    PERMISSIONS.WORKFLOW_READ,
    PERMISSIONS.VALIDATION_READ,
  ],
  [ROLES.HEI_STUDENT]: [
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.TEAMS_READ,
  ],
  [ROLES.INDUSTRY]: [
    PERMISSIONS.CHALLENGES_READ,
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.TEAMS_READ,
  ],
  [ROLES.STATE_PMU]: Object.values(PERMISSIONS),
  [ROLES.ORG_ADMIN]: [
    PERMISSIONS.ORGANIZATIONS_READ,
    PERMISSIONS.ORGANIZATIONS_WRITE,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.DISPUTES_READ,
    PERMISSIONS.DISPUTES_WRITE,
  ],
}

export function hasPermission(role, permission) {
  if (!role) return false
  const permissions = ROLE_PERMISSIONS[role] ?? []
  return permissions.includes(permission)
}

export function hasAnyPermission(role, permissions) {
  return permissions.some((p) => hasPermission(role, p))
}

export function hasRole(user, ...roles) {
  if (!user?.role) return false
  return roles.includes(user.role)
}

export function canAccessOrg(user, orgId) {
  if (!user) return false
  if (user.role === ROLES.STATE_PMU) return true
  return user.orgId === orgId
}

export function getRoleLabel(role) {
  const labels = {
    [ROLES.CITIZEN]: 'Citizen',
    [ROLES.FACILITATOR]: 'Facilitator',
    [ROLES.REVIEWER]: 'Reviewer',
    [ROLES.DOMAIN_OFFICER]: 'Domain officer',
    [ROLES.HEI_ADMIN]: 'HEI admin',
    [ROLES.HEI_FACULTY]: 'Faculty',
    [ROLES.HEI_STUDENT]: 'Student',
    [ROLES.INDUSTRY]: 'Industry partner',
    [ROLES.STATE_PMU]: 'State PMU',
    [ROLES.ORG_ADMIN]: 'Org admin',
  }
  return labels[role] ?? role
}
