import { WorkflowInstance } from './workflow.schema.js';
import { createStateMachine } from '../../common/lib/state-machine.js';
import { publish } from '../../common/lib/event-bus.js';
import { NotFoundError, BadRequestError } from '../../common/errors/http-errors.js';
import { CHALLENGE_WORKFLOW_STATES } from '../../config/constants.js';
import { STATE_CONFIG, WORKFLOW_TRANSITIONS } from './workflow.constants.js';

const workflowFsm = createStateMachine({
  states: Object.values(CHALLENGE_WORKFLOW_STATES),
  transitions: [
    { from: CHALLENGE_WORKFLOW_STATES.SUBMITTED, event: WORKFLOW_TRANSITIONS.TRIAGE, to: CHALLENGE_WORKFLOW_STATES.TRIAGED },
    { from: CHALLENGE_WORKFLOW_STATES.SUBMITTED, event: WORKFLOW_TRANSITIONS.SCOPE, to: CHALLENGE_WORKFLOW_STATES.SCOPED },
    { from: CHALLENGE_WORKFLOW_STATES.TRIAGED, event: WORKFLOW_TRANSITIONS.SCOPE, to: CHALLENGE_WORKFLOW_STATES.SCOPED },
    { from: CHALLENGE_WORKFLOW_STATES.SCOPED, event: WORKFLOW_TRANSITIONS.CLAIM, to: CHALLENGE_WORKFLOW_STATES.CLAIMED },
    { from: CHALLENGE_WORKFLOW_STATES.CLAIMED, event: WORKFLOW_TRANSITIONS.START_PROJECT, to: CHALLENGE_WORKFLOW_STATES.IN_PROJECT },
    { from: CHALLENGE_WORKFLOW_STATES.IN_PROJECT, event: WORKFLOW_TRANSITIONS.VALIDATE, to: CHALLENGE_WORKFLOW_STATES.VALIDATED },
    { from: CHALLENGE_WORKFLOW_STATES.VALIDATED, event: WORKFLOW_TRANSITIONS.CLOSE, to: CHALLENGE_WORKFLOW_STATES.CLOSED },
    { from: CHALLENGE_WORKFLOW_STATES.CLOSED, event: WORKFLOW_TRANSITIONS.REOPEN, to: CHALLENGE_WORKFLOW_STATES.IN_PROJECT },
  ],
});

function computeSlaDeadline(state) {
  const config = STATE_CONFIG[state];
  if (!config?.slaHours) return null;
  return new Date(Date.now() + config.slaHours * 60 * 60 * 1000);
}

export async function getOrCreate(challengeId) {
  let instance = await WorkflowInstance.findOne({ challengeId });
  if (!instance) {
    const config = STATE_CONFIG[CHALLENGE_WORKFLOW_STATES.SUBMITTED];
    instance = await WorkflowInstance.create({
      challengeId,
      currentState: CHALLENGE_WORKFLOW_STATES.SUBMITTED,
      ownerRole: config.owner,
      visibility: config.visibility,
      slaDeadline: computeSlaDeadline(CHALLENGE_WORKFLOW_STATES.SUBMITTED),
    });
  }
  return instance.toObject();
}

export async function findByChallengeId(challengeId) {
  const instance = await WorkflowInstance.findOne({ challengeId }).lean();
  if (!instance) throw new NotFoundError('Workflow instance not found');
  return instance;
}

export async function transition(challengeId, event, actor, { rationale } = {}) {
  const instance = await WorkflowInstance.findOne({ challengeId });
  if (!instance) {
    await getOrCreate(challengeId);
    return transition(challengeId, event, actor, { rationale });
  }

  const result = await workflowFsm.transition({
    currentState: instance.currentState,
    event,
    actor,
    resource: instance.toObject(),
  });

  if (!result.allowed) {
    throw new BadRequestError(result.reason);
  }

  const config = STATE_CONFIG[result.to] ?? {};

  instance.currentState = result.to;
  instance.ownerRole = config.owner ?? instance.ownerRole;
  instance.visibility = config.visibility ?? instance.visibility;
  instance.slaDeadline = computeSlaDeadline(result.to);
  instance.transitionLog.push({
    from: result.from,
    to: result.to,
    event,
    actorId: actor.id,
    rationale,
    at: new Date(),
  });

  await instance.save();

  await publish({
    actor: { id: actor.id, type: 'user', role: actor.role },
    action: 'workflow.transitioned',
    resourceType: 'workflow',
    resourceId: instance._id.toString(),
    payload: {
      challengeId,
      from: result.from,
      to: result.to,
      event,
    },
    rationale,
  });

  return instance.toObject();
}

export default { getOrCreate, findByChallengeId, transition };
