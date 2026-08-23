import { toPublic, toAssignee, toInternal } from './disputes.mapper.js';

export const disputesPolicy = {
  async can({ actor, resource, action }) {
    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (actor.role === 'pmu_admin') {
      return { allowed: true, projection: 'internal' };
    }

    if (action === 'create') {
      return { allowed: true, projection: 'assignee' };
    }

    if (action === 'escalate' && ['district_officer', 'hei_faculty', 'pmu_admin'].includes(actor.role)) {
      return { allowed: true, projection: 'internal' };
    }

    if (resource && resource.filedBy?.toString?.() === actor.id) {
      return { allowed: true, projection: 'assignee' };
    }

    if (action === 'read') {
      return { allowed: true, projection: 'assignee' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectDispute(dispute, level = 'assignee') {
  switch (level) {
    case 'internal':
      return toInternal(dispute);
    case 'assignee':
      return toAssignee(dispute);
    default:
      return toPublic(dispute);
  }
}

export default disputesPolicy;
