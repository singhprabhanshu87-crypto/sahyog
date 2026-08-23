import { toPublic, toAssignee, toInternal } from './matching.mapper.js';

export const matchingPolicy = {
  async can({ actor, action }) {
    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (actor.role === 'pmu_admin' || actor.role === 'district_officer') {
      return { allowed: true, projection: 'internal' };
    }

    if (action === 'read' && ['hei_faculty', 'org_admin'].includes(actor.role)) {
      return { allowed: true, projection: 'assignee' };
    }

    if (action === 'run' && ['pmu_admin', 'district_officer'].includes(actor.role)) {
      return { allowed: true, projection: 'internal' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectMatchRun(run, level = 'assignee') {
  switch (level) {
    case 'internal':
      return toInternal(run);
    case 'assignee':
      return toAssignee(run);
    default:
      return toPublic(run);
  }
}

export default matchingPolicy;
