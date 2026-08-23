import { abacHelpers } from '../../common/lib/policy-engine.js';
import { toPublic, toAssignee, toInternal } from './organizations.mapper.js';

export const organizationsPolicy = {
  async can({ actor, resource, action, context }) {
    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (actor.role === 'pmu_admin') {
      return { allowed: true, projection: 'internal' };
    }

    if (action === 'create') {
      return ['org_admin', 'hei_faculty', 'industry_member'].includes(actor.role)
        ? { allowed: true, projection: 'assignee' }
        : { allowed: false, reason: 'Only institutional users can create organizations' };
    }

    if (action === 'verify') {
      return actor.role === 'pmu_admin'
        ? { allowed: true, projection: 'internal' }
        : { allowed: false, reason: 'Only PMU admins can verify organizations' };
    }

    if (action === 'list') {
      return { allowed: true, projection: 'assignee' };
    }

    if (resource) {
      if (actor.orgId && resource._id?.toString?.() === actor.orgId) {
        return { allowed: true, projection: 'internal' };
      }

      if (actor.role === 'district_officer' && abacHelpers.districtScope(actor, {
        districtCode: resource.districtCodes?.[0],
      })) {
        return { allowed: true, projection: 'assignee' };
      }

      if (resource.verificationStatus === 'active') {
        return { allowed: true, projection: 'public' };
      }
    }

    if (action === 'read' && context?.params?.id) {
      return { allowed: true, projection: 'public' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectOrganization(org, level = 'public') {
  switch (level) {
    case 'internal':
      return toInternal(org);
    case 'assignee':
      return toAssignee(org);
    default:
      return toPublic(org);
  }
}

export default organizationsPolicy;
