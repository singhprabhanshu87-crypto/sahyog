import { toPublic, toAssignee, toInternal } from './teams.mapper.js';

export const teamsPolicy = {
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
      const isMember = (resource.members ?? []).some((m) => m.userId?.toString?.() === actor.id);
      if (isMember) {
        return { allowed: true, projection: 'assignee' };
      }
    }

    if (action === 'read') {
      return { allowed: true, projection: 'assignee' };
    }

    if (action === 'update_members' && resource && actor.orgId === resource.orgId?.toString?.()) {
      return { allowed: true, projection: 'internal' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectTeam(team, level = 'assignee') {
  switch (level) {
    case 'internal':
      return toInternal(team);
    case 'assignee':
      return toAssignee(team);
    default:
      return toPublic(team);
  }
}

export default teamsPolicy;
