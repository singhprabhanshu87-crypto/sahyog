import { toPublic, toAssignee, toInternal } from './auth.mapper.js';

export const authPolicy = {
  async can({ actor, action }) {
    if (action === 'create' || action === 'read') {
      return { allowed: true, projection: 'public' };
    }

    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    return { allowed: true, projection: 'internal' };
  },
};

export function projectAuth(data, level = 'public') {
  switch (level) {
    case 'internal':
      return toInternal(data);
    case 'assignee':
      return toAssignee(data);
    default:
      return toPublic(data);
  }
}

export default authPolicy;
