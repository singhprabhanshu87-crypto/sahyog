import { toPublic, toInternal } from './classification.mapper.js';

export const classificationPolicy = {
  async can({ actor, action }) {
    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (['pmu_admin', 'district_officer', 'facilitator'].includes(actor.role)) {
      return { allowed: true, projection: 'internal' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectReviewItem(item, level = 'public') {
  return level === 'internal' ? toInternal(item) : toPublic(item);
}

export default classificationPolicy;
