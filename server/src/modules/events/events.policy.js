import { toPublic, toAssignee, toInternal } from './events.mapper.js';

export const eventsPolicy = {
  async can({ actor, action, context }) {
    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (actor.role === 'pmu_admin') {
      return { allowed: true, projection: 'internal' };
    }

    if (action === 'read' || action === 'list') {
      if (['district_officer', 'hei_faculty', 'org_admin'].includes(actor.role)) {
        return { allowed: true, projection: 'assignee' };
      }
      return { allowed: true, projection: 'public' };
    }

    if (action === 'create') {
      return actor.role === 'pmu_admin' || context?.req?.user
        ? { allowed: true, projection: 'internal' }
        : { allowed: false, reason: 'Only authenticated actors can append events' };
    }

    return { allowed: false, reason: 'Events are append-only' };
  },
};

export function projectEvent(event, level = 'public') {
  switch (level) {
    case 'internal':
      return toInternal(event);
    case 'assignee':
      return toAssignee(event);
    default:
      return toPublic(event);
  }
}

export default eventsPolicy;
