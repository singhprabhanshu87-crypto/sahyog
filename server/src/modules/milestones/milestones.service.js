import { Milestone } from './milestones.schema.js';
import { publish } from '../../common/lib/event-bus.js';
import { NotFoundError, BadRequestError } from '../../common/errors/http-errors.js';
import { MILESTONE_STATUS, GATE_REVIEW_OUTCOME } from './milestones.constants.js';

export async function submitEvidence(id, { evidenceRefs }, actor) {
  const milestone = await Milestone.findById(id);
  if (!milestone) throw new NotFoundError('Milestone not found');

  if (milestone.status === MILESTONE_STATUS.PASSED) {
    throw new BadRequestError('Milestone already passed');
  }

  milestone.evidenceRefs = [...new Set([...(milestone.evidenceRefs ?? []), ...evidenceRefs])];
  milestone.evidenceSubmittedAt = new Date();
  milestone.evidenceSubmittedBy = actor.id;
  milestone.status = MILESTONE_STATUS.EVIDENCE_SUBMITTED;

  await milestone.save();

  await publish({
    actor: { id: actor.id, type: 'user', role: actor.role },
    action: 'milestone.evidence_submitted',
    resourceType: 'milestone',
    resourceId: id,
    payload: {
      projectId: milestone.projectId.toString(),
      challengeId: milestone.challengeId.toString(),
      evidenceCount: milestone.evidenceRefs.length,
    },
  });

  return milestone.toObject();
}

export async function review(id, { outcome, comments }, actor) {
  const milestone = await Milestone.findById(id);
  if (!milestone) throw new NotFoundError('Milestone not found');

  if (!milestone.evidenceSubmittedAt) {
    throw new BadRequestError('Evidence must be submitted before review');
  }

  milestone.gateReviews.push({
    reviewerId: actor.id,
    outcome,
    comments,
    reviewedAt: new Date(),
  });

  milestone.status = MILESTONE_STATUS.UNDER_REVIEW;

  if (outcome === GATE_REVIEW_OUTCOME.PASS) {
    milestone.status = MILESTONE_STATUS.PASSED;
  } else if (outcome === GATE_REVIEW_OUTCOME.FAIL) {
    milestone.status = MILESTONE_STATUS.FAILED;
  }

  await milestone.save();

  await publish({
    actor: { id: actor.id, type: 'user', role: actor.role },
    action: 'milestone.reviewed',
    resourceType: 'milestone',
    resourceId: id,
    payload: {
      outcome,
      projectId: milestone.projectId.toString(),
      challengeId: milestone.challengeId.toString(),
    },
  });

  return milestone.toObject();
}

export async function findById(id) {
  const milestone = await Milestone.findById(id).lean();
  if (!milestone) throw new NotFoundError('Milestone not found');
  return milestone;
}

export default { submitEvidence, review, findById };
