import { toPublic, toAssignee, toInternal } from './agreements.mapper.js';

export const agreementsPolicy = {
  async can({ actor, resource, action }) {
    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (actor.role === 'pmu_admin') {
      return { allowed: true, projection: 'internal' };
    }

    if (action === 'create' && ['hei_faculty', 'org_admin', 'pmu_admin'].includes(actor.role)) {
      return { allowed: true, projection: 'assignee' };
    }

    if (action === 'sign') {
      return { allowed: true, projection: 'assignee' };
    }

    if (action === 'read') {
      return { allowed: true, projection: 'assignee' };
    }

    if (resource && actor.orgId) {
      return { allowed: true, projection: 'assignee' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectAgreement(agreement, level = 'assignee') {
  switch (level) {
    case 'internal':
      return toInternal(agreement);
    case 'assignee':
      return toAssignee(agreement);
    default:
      return toPublic(agreement);
  }
}

export default agreementsPolicy;
