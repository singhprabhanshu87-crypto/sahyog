import { toPublic, toInternal } from './dedup.mapper.js';

export const dedupPolicy = {
  async can({ actor }) {
    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (['pmu_admin', 'district_officer'].includes(actor.role)) {
      return { allowed: true, projection: 'internal' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectDedupDecision(decision, level = 'public') {
  return level === 'internal' ? toInternal(decision) : toPublic(decision);
}

export default dedupPolicy;
