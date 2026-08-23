export function toPublic(notification) {
  if (!notification) return null;
  return {
    id: notification._id?.toString?.() ?? notification.id,
    title: notification.title,
    status: notification.status,
    createdAt: notification.createdAt,
  };
}

export function toAssignee(notification) {
  if (!notification) return null;
  return {
    ...toPublic(notification),
    body: notification.body,
    eventAction: notification.eventAction,
    resourceType: notification.resourceType,
    resourceId: notification.resourceId,
    readAt: notification.readAt,
    channel: notification.channel,
  };
}

export function toInternal(notification) {
  if (!notification) return null;
  return {
    id: notification._id?.toString?.() ?? notification.id,
    userId: notification.userId?.toString?.() ?? notification.userId,
    channel: notification.channel,
    status: notification.status,
    title: notification.title,
    body: notification.body,
    eventAction: notification.eventAction,
    resourceType: notification.resourceType,
    resourceId: notification.resourceId,
    readAt: notification.readAt,
    metadata: notification.metadata,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
}

export function toPrefsPublic(prefs) {
  if (!prefs) return null;
  return {
    channels: prefs.channels,
    subscribedEvents: prefs.subscribedEvents ?? [],
  };
}

export default { toPublic, toAssignee, toInternal, toPrefsPublic };
