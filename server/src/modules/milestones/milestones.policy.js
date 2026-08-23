import { toPublic, toAssignee, toInternal } from './milestones.mapper.js';

export const milestonesPolicy = {
  async can({ actor, resource, action }) {
    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (actor.role === 'pmu_admin') {
      return { allowed: true, projection: 'internal' };
    }

    if (action === 'submit_evidence' && ['hei_faculty', 'hei_student', 'org_admin'].includes(actor.role)) {
      return { allowed: true, projection: 'assignee' };
    }

    if (action === 'review' && ['pmu_admin', 'district_officer', 'hei_faculty'].includes(actor.role)) {
      return { allowed: true, projection: 'internal' };
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

export function projectMilestone(milestone, level = 'assignee') {
  switch (level) {
    case 'internal':
      return toInternal(milestone);
    case 'assignee':
      return toAssignee(milestone);
    default:
      return toPublic(milestone);
  }
}

export default milestonesPolicy;
