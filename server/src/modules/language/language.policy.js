import { toPublic, toInternal } from './language.mapper.js';

export const languagePolicy = {
  async can({ actor, action }) {
    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (['pmu_admin', 'facilitator', 'district_officer'].includes(actor.role)) {
      return { allowed: true, projection: 'internal' };
    }

    if (action === 'translate' || action === 'detect') {
      return { allowed: true, projection: 'public' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectLanguageResult(result, level = 'public') {
  return level === 'internal' ? toInternal(result) : toPublic(result);
}

export default languagePolicy;
