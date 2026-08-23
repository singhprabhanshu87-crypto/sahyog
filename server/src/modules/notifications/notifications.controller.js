import * as service from './notifications.service.js';
import notificationsPolicy, { projectNotification, projectPrefs } from './notifications.policy.js';

export async function listNotifications(req, res) {
  const result = await service.list(req.user.id, req.query);
  res.json({
    data: result.data.map((n) => projectNotification(n, req.projection || 'assignee')),
    pagination: result.pagination,
  });
}

export async function patchPrefs(req, res) {
  const prefs = await service.patchPrefs(req.user.id, req.body);
  res.json({ data: projectPrefs(prefs) });
}

export default { listNotifications, patchPrefs };
