import { toPublic, toAssignee, toInternal } from './workflow.mapper.js';

export const workflowPolicy = {
  async can({ actor, resource, action }) {
    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (actor.role === 'pmu_admin') {
      return { allowed: true, projection: 'internal' };
    }

    if (action === 'transition') {
      if (actor.role === 'district_officer' || actor.role === 'hei_faculty') {
        return { allowed: true, projection: 'assignee' };
      }
      return { allowed: false, reason: 'Role cannot transition workflow' };
    }

    if (action === 'read') {
      return { allowed: true, projection: resource?.visibility === 'public' ? 'public' : 'assignee' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectWorkflow(instance, level = 'assignee') {
  switch (level) {
    case 'internal':
      return toInternal(instance);
    case 'assignee':
      return toAssignee(instance);
    default:
      return toPublic(instance);
  }
}

export default workflowPolicy;
