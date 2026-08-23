import { toPublic, toAssignee, toInternal } from './validation.mapper.js';

export const validationPolicy = {
  async can({ actor, action }) {
    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (actor.role === 'pmu_admin') {
      return { allowed: true, projection: 'internal' };
    }

    if (action === 'sign_off' && ['community_validator', 'facilitator', 'citizen'].includes(actor.role)) {
      return { allowed: true, projection: 'assignee' };
    }

    if (action === 'read') {
      return { allowed: true, projection: 'assignee' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectValidation(record, level = 'assignee') {
  switch (level) {
    case 'internal':
      return toInternal(record);
    case 'assignee':
      return toAssignee(record);
    default:
      return toPublic(record);
  }
}

export default validationPolicy;
