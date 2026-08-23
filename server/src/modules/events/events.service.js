import { Event } from './events.schema.js';
import paginate from '../../common/lib/paginate.js';
import { getContext } from '../../common/middleware/request-context.js';

export async function append({ actor, action, resourceType, resourceId, payload, rationale, correlationId, timestamp }) {
  const normalizedActor = normalizeActor(actor);

  const event = await Event.create({
    actor: normalizedActor,
    action,
    resourceType,
    resourceId: String(resourceId),
    payload: payload ?? {},
    rationale: rationale ?? null,
    correlationId: correlationId ?? getContext().correlationId,
    timestamp: timestamp ?? new Date(),
  });

  return event.toObject();
}

export async function query({ resourceType, resourceId, actorId, action, from, to, page, limit }) {
  const filter = {};

  if (resourceType) filter.resourceType = resourceType;
  if (resourceId) filter.resourceId = resourceId;
  if (actorId) filter['actor.id'] = actorId;
  if (action) filter.action = action;

  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from);
    if (to) filter.timestamp.$lte = new Date(to);
  }

  return paginate(Event, { filter, page, limit, sort: { timestamp: -1 } });
}

export async function getByResource(resourceType, resourceId, { page, limit } = {}) {
  return query({ resourceType, resourceId, page, limit });
}

function normalizeActor(actor) {
  if (!actor) {
    return { id: null, type: 'system', email: null, role: null };
  }

  if (typeof actor === 'string') {
    return { id: actor, type: 'user', email: null, role: null };
  }

  return {
    id: actor.id ?? actor._id?.toString?.() ?? null,
    type: actor.type ?? 'user',
    email: actor.email ?? null,
    role: actor.role ?? null,
  };
}

export default { append, query, getByResource };
