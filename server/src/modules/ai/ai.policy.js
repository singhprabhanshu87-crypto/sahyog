import { toPublic, toInternal } from './ai.mapper.js';

export const aiPolicy = {
  async can({ actor, action }) {
    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (actor.role === 'pmu_admin') {
      return { allowed: true, projection: 'internal' };
    }

    if (action === 'complete') {
      return ['facilitator', 'district_officer'].includes(actor.role)
        ? { allowed: true, projection: 'public' }
        : { allowed: false, reason: 'Insufficient permissions' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectAiCall(call, level = 'public') {
  return level === 'internal' ? toInternal(call) : toPublic(call);
}

export default aiPolicy;
