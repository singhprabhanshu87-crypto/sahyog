import { abacHelpers } from '../../common/lib/policy-engine.js';
import { toPublic, toAssignee, toInternal } from './clusters.mapper.js';

export const clustersPolicy = {
  async can({ actor, resource, action }) {
    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (actor.role === 'pmu_admin') {
      return { allowed: true, projection: 'internal' };
    }

    if (action === 'list') {
      return ['district_officer', 'facilitator', 'hei_faculty'].includes(actor.role)
        ? { allowed: true, projection: 'assignee' }
        : { allowed: false, reason: 'Insufficient permissions' };
    }

    if (resource) {
      if (actor.role === 'district_officer' && abacHelpers.districtScope(actor, {
        districtCode: resource.districtCode,
      })) {
        return { allowed: true, projection: 'assignee' };
      }
    }

    if (action === 'read') {
      return { allowed: true, projection: 'assignee' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectCluster(cluster, level = 'public') {
  switch (level) {
    case 'internal':
      return toInternal(cluster);
    case 'assignee':
      return toAssignee(cluster);
    default:
      return toPublic(cluster);
  }
}

export default clustersPolicy;
