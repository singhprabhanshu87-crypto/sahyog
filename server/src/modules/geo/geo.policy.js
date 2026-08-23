import { toPublicBoundary, toResolvedLocation, toInternal } from './geo.mapper.js';

export const geoPolicy = {
  async can({ actor, action }) {
    if (action === 'resolve') {
      return { allowed: true, projection: 'public' };
    }

    if (action === 'list') {
      if (!actor) {
        return { allowed: true, projection: 'public' };
      }
      return ['pmu_admin', 'district_officer', 'facilitator'].includes(actor.role)
        ? { allowed: true, projection: 'internal' }
        : { allowed: true, projection: 'public' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectBoundary(boundary, level = 'public') {
  return level === 'internal' ? toInternal(boundary) : toPublicBoundary(boundary);
}

export default geoPolicy;
