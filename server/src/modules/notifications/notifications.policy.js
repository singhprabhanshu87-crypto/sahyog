import { toAssignee, toPrefsPublic } from './notifications.mapper.js';

export const notificationsPolicy = {
  async can({ actor, action }) {
    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (action === 'list' || action === 'update_prefs') {
      return { allowed: true, projection: 'assignee' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectNotification(notification, level = 'assignee') {
  return toAssignee(notification);
}

export function projectPrefs(prefs) {
  return toPrefsPublic(prefs);
}

export default notificationsPolicy;
