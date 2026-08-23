import { toPublic, toAssignee, toInternal } from './claims.mapper.js';

export const claimsPolicy = {
  async can({ actor, resource, action }) {
    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (actor.role === 'pmu_admin') {
      return { allowed: true, projection: 'internal' };
    }

    if (action === 'create' && ['hei_faculty', 'org_admin'].includes(actor.role) && actor.orgId) {
      return { allowed: true, projection: 'assignee' };
    }

    if (action === 'list') {
      return { allowed: true, projection: 'assignee' };
    }

    if (resource) {
      if (actor.orgId && resource.orgId?.toString?.() === actor.orgId) {
        return { allowed: true, projection: 'internal' };
      }
      if (resource.claimedBy?.toString?.() === actor.id) {
        return { allowed: true, projection: 'assignee' };
      }
    }

    if (action === 'release' && resource) {
      if (actor.orgId === resource.orgId?.toString?.() || actor.role === 'district_officer') {
        return { allowed: true, projection: 'internal' };
      }
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectClaim(claim, level = 'assignee') {
  switch (level) {
    case 'internal':
      return toInternal(claim);
    case 'assignee':
      return toAssignee(claim);
    default:
      return toPublic(claim);
  }
}

export default claimsPolicy;
