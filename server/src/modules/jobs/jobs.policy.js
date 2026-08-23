import { toPublic, toInternal } from './jobs.mapper.js';

export const jobsPolicy = {
  async can({ actor, action }) {
    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (actor.role === 'pmu_admin') {
      return { allowed: true, projection: 'internal' };
    }

    if (action === 'status') {
      return ['district_officer', 'facilitator'].includes(actor.role)
        ? { allowed: true, projection: 'public' }
        : { allowed: false, reason: 'Insufficient permissions' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectJob(record, level = 'public') {
  return level === 'internal' ? toInternal(record) : toPublic(record);
}

export default jobsPolicy;
