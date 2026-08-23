import { Dispute } from './disputes.schema.js';
import { createStateMachine } from '../../common/lib/state-machine.js';
import { publish } from '../../common/lib/event-bus.js';
import { NotFoundError, BadRequestError } from '../../common/errors/http-errors.js';
import { DISPUTE_STATUS, ESCALATION_EVENTS } from './disputes.constants.js';

const escalationFsm = createStateMachine({
  states: Object.values(DISPUTE_STATUS),
  transitions: [
    { from: DISPUTE_STATUS.FILED, event: ESCALATION_EVENTS.ESCALATE, to: DISPUTE_STATUS.TEAM_REVIEW },
    { from: DISPUTE_STATUS.TEAM_REVIEW, event: ESCALATION_EVENTS.ESCALATE, to: DISPUTE_STATUS.DISTRICT_REVIEW },
    { from: DISPUTE_STATUS.DISTRICT_REVIEW, event: ESCALATION_EVENTS.ESCALATE, to: DISPUTE_STATUS.PMU_REVIEW },
    { from: DISPUTE_STATUS.PMU_REVIEW, event: ESCALATION_EVENTS.ESCALATE, to: DISPUTE_STATUS.ESCALATED_CLOSED },
    { from: DISPUTE_STATUS.TEAM_REVIEW, event: ESCALATION_EVENTS.RESOLVE, to: DISPUTE_STATUS.RESOLVED },
    { from: DISPUTE_STATUS.DISTRICT_REVIEW, event: ESCALATION_EVENTS.RESOLVE, to: DISPUTE_STATUS.RESOLVED },
    { from: DISPUTE_STATUS.PMU_REVIEW, event: ESCALATION_EVENTS.RESOLVE, to: DISPUTE_STATUS.RESOLVED },
    { from: DISPUTE_STATUS.FILED, event: ESCALATION_EVENTS.RESOLVE, to: DISPUTE_STATUS.RESOLVED },
    { from: DISPUTE_STATUS.RESOLVED, event: ESCALATION_EVENTS.CLOSE, to: DISPUTE_STATUS.ESCALATED_CLOSED },
  ],
});

export async function create(data, actor) {
  const dispute = await Dispute.create({
    ...data,
    filedBy: actor.id,
    status: DISPUTE_STATUS.FILED,
  });

  await publish({
    actor: { id: actor.id, type: 'user', role: actor.role },
    action: 'dispute.created',
    resourceType: 'dispute',
    resourceId: dispute._id.toString(),
    payload: { challengeId: data.challengeId, category: data.category },
  });

  return dispute.toObject();
}

export async function findById(id) {
  const dispute = await Dispute.findById(id).lean();
  if (!dispute) throw new NotFoundError('Dispute not found');
  return dispute;
}

export async function escalate(id, { event, rationale, resolution }, actor) {
  const dispute = await Dispute.findById(id);
  if (!dispute) throw new NotFoundError('Dispute not found');

  const result = await escalationFsm.transition({
    currentState: dispute.status,
    event,
    actor,
    resource: dispute.toObject(),
  });

  if (!result.allowed) {
    throw new BadRequestError(result.reason);
  }

  dispute.status = result.to;
  dispute.escalationLog.push({
    from: result.from,
    to: result.to,
    event,
    actorId: actor.id,
    rationale,
    at: new Date(),
  });

  if (event === ESCALATION_EVENTS.RESOLVE) {
    dispute.resolution = resolution ?? rationale;
    dispute.resolvedAt = new Date();
  }

  await dispute.save();

  await publish({
    actor: { id: actor.id, type: 'user', role: actor.role },
    action: event === ESCALATION_EVENTS.ESCALATE ? 'dispute.escalated' : 'dispute.updated',
    resourceType: 'dispute',
    resourceId: id,
    payload: { from: result.from, to: result.to, event, challengeId: dispute.challengeId.toString() },
    rationale,
  });

  return dispute.toObject();
}

export default { create, findById, escalate };
