import { toPublic, toAssignee, toInternal } from './media.mapper.js';

export const mediaPolicy = {
  async can({ actor, resource, action }) {
    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (actor.role === 'pmu_admin') {
      return { allowed: true, projection: 'internal' };
    }

    if (resource && resource.uploadedBy?.toString?.() === actor.id) {
      return { allowed: true, projection: 'assignee' };
    }

    if (action === 'create' || action === 'read') {
      return { allowed: true, projection: 'assignee' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectMedia(asset, level = 'assignee') {
  switch (level) {
    case 'internal':
      return toInternal(asset);
    case 'assignee':
      return toAssignee(asset);
    default:
      return toPublic(asset);
  }
}

export default mediaPolicy;
