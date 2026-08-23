import { toPublic, toAssignee, toInternal } from './capability-profiles.mapper.js';

export const capabilityProfilesPolicy = {
  async can({ actor, resource, action }) {
    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (actor.role === 'pmu_admin') {
      return { allowed: true, projection: 'internal' };
    }

    if (action === 'read' || action === 'list') {
      return { allowed: true, projection: 'assignee' };
    }

    if (resource && actor.orgId && resource.orgId?.toString?.() === actor.orgId) {
      return { allowed: true, projection: 'internal' };
    }

    if (['create', 'update'].includes(action) && actor.orgId) {
      return { allowed: true, projection: 'assignee' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectCapabilityProfile(profile, level = 'assignee') {
  switch (level) {
    case 'internal':
      return toInternal(profile);
    case 'assignee':
      return toAssignee(profile);
    default:
      return toPublic(profile);
  }
}

export default capabilityProfilesPolicy;
