import { toAssignee, toInternal } from './analytics.mapper.js';

export const analyticsPolicy = {
  async can({ actor, action }) {
    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (['pmu_admin', 'district_officer'].includes(actor.role)) {
      return { allowed: true, projection: 'internal' };
    }

    if (action === 'read') {
      return { allowed: true, projection: 'assignee' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectSnapshot(snapshot, level = 'assignee') {
  switch (level) {
    case 'internal':
      return toInternal(snapshot);
    default:
      return toAssignee(snapshot);
  }
}

export default analyticsPolicy;
