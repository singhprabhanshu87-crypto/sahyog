import { abacHelpers } from '../../common/lib/policy-engine.js';
import { toPublic, toAssignee, toInternal } from './challenges.mapper.js';

export const challengesPolicy = {
  async can({ actor, resource, action, context }) {
    if (!actor) {
      if (action === 'list' || action === 'read') {
        return { allowed: true, projection: 'public' };
      }
      return { allowed: false, reason: 'Authentication required' };
    }

    if (actor.role === 'pmu_admin') {
      return { allowed: true, projection: 'internal' };
    }

    if (action === 'create') {
      return ['citizen', 'facilitator', 'district_officer', 'hei_faculty'].includes(actor.role)
        ? { allowed: true, projection: 'assignee' }
        : { allowed: false, reason: 'Role cannot submit challenges' };
    }

    if (action === 'list') {
      return { allowed: true, projection: 'assignee' };
    }

    if (resource) {
      if (resource.submittedBy?.toString?.() === actor.id) {
        return { allowed: true, projection: 'assignee' };
      }

      if (actor.orgId && resource.claimedOrgId?.toString?.() === actor.orgId) {
        return { allowed: true, projection: 'internal' };
      }

      if (actor.role === 'district_officer' && abacHelpers.districtScope(actor, {
        districtCode: resource.districtCode,
      })) {
        return { allowed: true, projection: 'assignee' };
      }
    }

    if (action === 'read') {
      return { allowed: true, projection: 'public' };
    }

    if (action === 'update_scope' && actor.role === 'district_officer') {
      return { allowed: true, projection: 'internal' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectChallenge(challenge, level = 'public') {
  switch (level) {
    case 'internal':
      return toInternal(challenge);
    case 'assignee':
      return toAssignee(challenge);
    default:
      return toPublic(challenge);
  }
}

export default challengesPolicy;
