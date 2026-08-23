import { toPublic, toDomainList, toInternal } from './taxonomy.mapper.js';

export const taxonomyPolicy = {
  async can({ actor, action }) {
    if (action === 'read' || action === 'list') {
      return { allowed: true, projection: 'public' };
    }

    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (actor.role === 'pmu_admin') {
      return { allowed: true, projection: 'internal' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectTaxonomy(taxonomy, level = 'public') {
  if (level === 'internal') return toInternal(taxonomy);
  return toPublic(taxonomy);
}

export default taxonomyPolicy;
