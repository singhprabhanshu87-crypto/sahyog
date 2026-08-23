import { toPublic, toAssignee, toInternal } from './projects.mapper.js';

export const projectsPolicy = {
  async can({ actor, resource, action }) {
    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (actor.role === 'pmu_admin') {
      return { allowed: true, projection: 'internal' };
    }

    if (action === 'create' && ['hei_faculty', 'org_admin'].includes(actor.role)) {
      return { allowed: true, projection: 'assignee' };
    }

    if (resource) {
      if (actor.orgId && resource.orgId?.toString?.() === actor.orgId) {
        return { allowed: true, projection: 'internal' };
      }
    }

    if (action === 'read') {
      return { allowed: true, projection: 'assignee' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectProject(project, level = 'assignee') {
  switch (level) {
    case 'internal':
      return toInternal(project);
    case 'assignee':
      return toAssignee(project);
    default:
      return toPublic(project);
  }
}

export default projectsPolicy;
