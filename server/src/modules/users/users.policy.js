import { abacHelpers } from '../../common/lib/policy-engine.js';
import { toPublic, toAssignee, toInternal } from './users.mapper.js';

export const usersPolicy = {
  async can({ actor, resource, action, context }) {
    if (!actor) {
      return action === 'create' ? { allowed: false, reason: 'Authentication required' } : { allowed: false };
    }

    if (actor.role === 'pmu_admin') {
      return { allowed: true, projection: 'internal' };
    }

    if (action === 'read' || action === 'update') {
      const targetId = resource?._id?.toString?.() ?? resource?.id ?? context?.params?.id;
      if (targetId === actor.id) {
        return { allowed: true, projection: 'assignee' };
      }
    }

    if (action === 'list' && ['district_officer', 'org_admin'].includes(actor.role)) {
      return { allowed: true, projection: 'assignee' };
    }

    if (action === 'create' && ['org_admin', 'pmu_admin'].includes(actor.role)) {
      return { allowed: true, projection: 'internal' };
    }

    if (resource && abacHelpers.districtScope(actor, resource)) {
      return { allowed: true, projection: 'assignee' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectUser(user, level = 'public') {
  switch (level) {
    case 'internal':
      return toInternal(user);
    case 'assignee':
      return toAssignee(user);
    default:
      return toPublic(user);
  }
}

export default usersPolicy;
