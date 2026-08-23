import { Challenge } from './challenges.schema.js';
import paginate from '../../common/lib/paginate.js';
import { publish } from '../../common/lib/event-bus.js';
import { NotFoundError } from '../../common/errors/http-errors.js';
import { CHALLENGE_WORKFLOW_STATES } from '../../config/constants.js';

export async function create(data, submittedBy) {
  const challenge = await Challenge.create({
    ...data,
    submittedBy,
    workflowState: CHALLENGE_WORKFLOW_STATES.SUBMITTED,
  });

  await publish({
    actor: { id: submittedBy.toString(), type: 'user' },
    action: 'challenge.created',
    resourceType: 'challenge',
    resourceId: challenge._id.toString(),
    payload: { title: challenge.title, districtCode: challenge.districtCode },
  });

  return challenge.toObject();
}

export async function findById(id) {
  const challenge = await Challenge.findById(id).lean();
  if (!challenge) throw new NotFoundError('Challenge not found');
  return challenge;
}

export async function list({ workflowState, districtCode, page, limit }) {
  const filter = {};
  if (workflowState) filter.workflowState = workflowState;
  if (districtCode) filter.districtCode = districtCode;
  return paginate(Challenge, { filter, page, limit });
}

export async function patchScope(id, data, actor) {
  const challenge = await Challenge.findById(id);
  if (!challenge) throw new NotFoundError('Challenge not found');

  challenge.scopedBrief = {
    ...challenge.scopedBrief?.toObject?.() ?? challenge.scopedBrief ?? {},
    ...data.scopedBrief,
    scopedAt: new Date(),
    scopedBy: actor.id,
  };

  if (data.problemResolution) challenge.problemResolution = data.problemResolution;
  if (data.solutionMaturity) challenge.solutionMaturity = data.solutionMaturity;

  await challenge.save();

  await publish({
    actor: { id: actor.id, type: 'user', role: actor.role },
    action: 'challenge.scoped',
    resourceType: 'challenge',
    resourceId: id,
    payload: { scopedBrief: challenge.scopedBrief },
  });

  return challenge.toObject();
}

export async function updateWorkflowState(id, newState, actor, { from } = {}) {
  const challenge = await Challenge.findByIdAndUpdate(
    id,
    { $set: { workflowState: newState } },
    { new: true },
  ).lean();

  if (!challenge) throw new NotFoundError('Challenge not found');

  await publish({
    actor: { id: actor?.id ?? 'system', type: actor ? 'user' : 'system', role: actor?.role },
    action: 'challenge.state_changed',
    resourceType: 'challenge',
    resourceId: id,
    payload: { from, to: newState },
  });

  return challenge;
}

export default { create, findById, list, patchScope, updateWorkflowState };
