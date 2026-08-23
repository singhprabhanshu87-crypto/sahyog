export function toPublic(log) {
  if (!log) return null;
  return {
    id: log._id?.toString?.() ?? log.id,
    provider: log.provider,
    status: log.status,
    action: log.action,
  };
}

export function toAssignee(log) {
  if (!log) return null;
  return {
    ...toPublic(log),
    createdAt: log.createdAt,
  };
}

export function toInternal(log) {
  if (!log) return null;
  return {
    id: log._id?.toString?.() ?? log.id,
    provider: log.provider,
    status: log.status,
    action: log.action,
    payload: log.payload,
    response: log.response,
    error: log.error,
    triggeredBy: log.triggeredBy?.toString?.() ?? log.triggeredBy,
    correlationId: log.correlationId,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  };
}

export default { toPublic, toAssignee, toInternal };
