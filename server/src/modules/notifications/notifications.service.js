import { Notification, NotificationPrefs } from './notifications.schema.js';
import paginate from '../../common/lib/paginate.js';
import { NOTIFICATION_CHANNELS, NOTIFICATION_STATUS } from './notifications.constants.js';
import logger from '../../common/lib/logger.js';

const DEFAULT_SUBSCRIBED_EVENTS = [
  'challenge.state_changed',
  'workflow.transitioned',
  'claim.created',
  'claim.released',
  'project.created',
  'milestone.reviewed',
  'validation.sign_off',
  'dispute.escalated',
  'matching.run_completed',
];

export async function list(userId, { status, page, limit }) {
  const filter = { userId };
  if (status) filter.status = status;
  return paginate(Notification, { filter, page, limit });
}

export async function getOrCreatePrefs(userId) {
  let prefs = await NotificationPrefs.findOne({ userId });
  if (!prefs) {
    prefs = await NotificationPrefs.create({
      userId,
      subscribedEvents: DEFAULT_SUBSCRIBED_EVENTS,
    });
  }
  return prefs.toObject();
}

export async function patchPrefs(userId, data) {
  const prefs = await NotificationPrefs.findOneAndUpdate(
    { userId },
    { $set: data },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();
  return prefs;
}

export async function createFromEvent(event, targetUserIds = []) {
  if (!targetUserIds.length) return [];

  const created = [];

  for (const userId of targetUserIds) {
    const prefs = await getOrCreatePrefs(userId);
    const subscribed = prefs.subscribedEvents ?? DEFAULT_SUBSCRIBED_EVENTS;

    if (!subscribed.includes(event.action) && !subscribed.includes('*')) {
      continue;
    }

    const channels = prefs.channels ?? { in_app: true };
    if (!channels.in_app) continue;

    const notification = await Notification.create({
      userId,
      channel: NOTIFICATION_CHANNELS.IN_APP,
      status: NOTIFICATION_STATUS.SENT,
      title: formatTitle(event.action),
      body: event.rationale ?? JSON.stringify(event.payload ?? {}),
      eventAction: event.action,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
    });

    created.push(notification.toObject());
  }

  return created;
}

function formatTitle(action) {
  return action.replace(/\./g, ' ').replace(/_/g, ' ');
}

export async function handleStateChangeEvent(event) {
  const actorId = event.actor?.id;
  if (!actorId || actorId === 'system') {
    logger.debug({ action: event.action }, 'Notification: state change without target user');
    return;
  }

  await createFromEvent(event, [actorId]);
}

export default {
  list,
  getOrCreatePrefs,
  patchPrefs,
  createFromEvent,
  handleStateChangeEvent,
};
