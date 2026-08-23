export function toPublic(event) {
  if (!event) return null;
  return {
    id: event._id?.toString?.() ?? event.id,
    action: event.action,
    resourceType: event.resourceType,
    resourceId: event.resourceId,
    timestamp: event.timestamp,
    payload: sanitizePublicPayload(event.payload),
  };
}

export function toAssignee(event) {
  if (!event) return null;
  return {
    ...toPublic(event),
    actor: event.actor
      ? { type: event.actor.type, role: event.actor.role }
      : null,
    rationale: event.rationale,
    correlationId: event.correlationId,
  };
}

export function toInternal(event) {
  if (!event) return null;
  return {
    id: event._id?.toString?.() ?? event.id,
    actor: event.actor,
    action: event.action,
    resourceType: event.resourceType,
    resourceId: event.resourceId,
    payload: event.payload,
    rationale: event.rationale,
    correlationId: event.correlationId,
    timestamp: event.timestamp,
  };
}

function sanitizePublicPayload(payload) {
  if (!payload || typeof payload !== 'object') return {};
  const { email, phone, password, token, ...safe } = payload;
  return safe;
}

export default { toPublic, toAssignee, toInternal };
