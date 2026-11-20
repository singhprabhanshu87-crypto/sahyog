import { abacHelpers } from '../../common/lib/policy-engine.js';
import { toPublic, toAssignee, toInternal } from './submissions.mapper.js';

export const submissionsPolicy = {
  async can({ actor, resource, action, context }) {
    if (action === 'track') {
      return { allowed: true, projection: 'public' };
    }

    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (actor.role === 'pmu_admin') {
      return { allowed: true, projection: 'internal' };
    }

    if (action === 'create') {
      return ['citizen', 'facilitator', 'community_validator'].includes(actor.role)
        ? { allowed: true, projection: 'assignee' }
        : { allowed: true, projection: 'assignee' };
    }

    if (action === 'list') {
      if (actor.role === 'district_officer') {
        return { allowed: true, projection: 'assignee' };
      }
      if (['facilitator', 'community_validator'].includes(actor.role)) {
        return { allowed: true, projection: 'assignee' };
      }
      if (actor.role === 'citizen') {
        return { allowed: true, projection: 'assignee' };
      }
      return { allowed: false, reason: 'Insufficient permissions' };
    }

    if (resource) {
      if (actor.id === resource.submittedBy?.toString?.()) {
        return { allowed: true, projection: 'assignee' };
      }

      if (actor.role === 'district_officer' && abacHelpers.districtScope(actor, {
        districtCode: resource.location?.districtCode,
      })) {
        return { allowed: true, projection: 'assignee' };
      }
    }

  if (action === 'read' && context?.params?.id) {
      return { allowed: false, reason: 'Insufficient permissions' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectSubmission(submission, level = 'public') {
  switch (level) {
    case 'internal':
      return toInternal(submission);
    case 'assignee':
      return toAssignee(submission);
    default:
      return toPublic(submission);
  }
}

export default submissionsPolicy;
