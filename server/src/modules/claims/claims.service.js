import config from '../../config/index.js';
import { Claim } from './claims.schema.js';
import { Challenge } from '../challenges/challenges.schema.js';
import { CapabilityProfile } from '../capability-profiles/capability-profiles.schema.js';
import paginate from '../../common/lib/paginate.js';
import { publish } from '../../common/lib/event-bus.js';
import { NotFoundError, BadRequestError, ConflictError } from '../../common/errors/http-errors.js';
import { CLAIM_STATUS } from './claims.constants.js';
import { CHALLENGE_WORKFLOW_STATES } from '../../config/constants.js';

export async function create({ challengeId, orgId }, actor) {
  const resolvedOrgId = orgId ?? actor.orgId;
  if (!resolvedOrgId) throw new BadRequestError('orgId required');

  const challenge = await Challenge.findById(challengeId);
  if (!challenge) throw new NotFoundError('Challenge not found');

  if (challenge.workflowState !== CHALLENGE_WORKFLOW_STATES.SCOPED) {
    throw new BadRequestError('Challenge is not in scoped state for claiming');
  } 

  const activeClaim = await Claim.findOne({
    challengeId,
    status: CLAIM_STATUS.ACTIVE,
    exclusivityLock: true,
  });

  if (activeClaim && activeClaim.orgId.toString() !== resolvedOrgId) {
    throw new ConflictError('Challenge has an active exclusivity lock by another org');
  }

  const profile = await CapabilityProfile.findOne({ orgId: resolvedOrgId }).lean();
  const coiFlags = profile?.coiFlags ?? [];
  const coiHit = coiFlags.includes(challenge.districtCode);

  if (coiHit) {
    throw new BadRequestError('Conflict of interest detected for this challenge');
  }

  const claimWindowEndsAt = new Date(Date.now() + config.CLAIM_WINDOW_HOURS * 60 * 60 * 1000);

  const claim = await Claim.create({
    challengeId,
    orgId: resolvedOrgId,
    claimedBy: actor.id,
    status: CLAIM_STATUS.ACTIVE,
    exclusivityLock: true,
    coiChecked: true,
    coiFlags: coiHit ? coiFlags : [],
    claimWindowEndsAt,
    lastActivityAt: new Date(),
  });

  challenge.claimedOrgId = resolvedOrgId;
  await challenge.save();

  await publish({
    actor: { id: actor.id, type: 'user', role: actor.role },
    action: 'claim.created',
    resourceType: 'claim',
    resourceId: claim._id.toString(),
    payload: { challengeId, orgId: resolvedOrgId },
  });

  return claim.toObject();
}

export async function findById(id) {
  const claim = await Claim.findById(id).lean();
  if (!claim) throw new NotFoundError('Claim not found');
  return claim;
}

export async function list({ challengeId, orgId, status, page, limit }) {
  const filter = {};
  if (challengeId) filter.challengeId = challengeId;
  if (orgId) filter.orgId = orgId;
  if (status) filter.status = status;
  return paginate(Claim, { filter, page, limit });
}

export async function release(id, actor, { reason } = {}) {
  const claim = await Claim.findById(id);
  if (!claim) throw new NotFoundError('Claim not found');

  if (claim.status !== CLAIM_STATUS.ACTIVE) {
    throw new BadRequestError('Claim is not active');
  }

  claim.status = CLAIM_STATUS.RELEASED;
  claim.exclusivityLock = false;
  claim.releasedAt = new Date();
  claim.releasedBy = actor.id;
  claim.releaseReason = reason ?? 'Manual release';
  await claim.save();

  await publish({
    actor: { id: actor.id, type: 'user', role: actor.role },
    action: 'claim.released',
    resourceType: 'claim',
    resourceId: id,
    payload: { challengeId: claim.challengeId.toString(), reason },
  });

  return claim.toObject();
}

export async function autoReleaseExpired() {
  const now = new Date();
  const expired = await Claim.find({
    status: CLAIM_STATUS.ACTIVE,
    claimWindowEndsAt: { $lt: now },
  });

  for (const claim of expired) {
    claim.status = CLAIM_STATUS.EXPIRED;
    claim.exclusivityLock = false;
    claim.releasedAt = now;
    claim.releaseReason = 'Claim window expired';
    await claim.save();

    await publish({
      actor: { id: 'system', type: 'system' },
      action: 'claim.released',
      resourceType: 'claim',
      resourceId: claim._id.toString(),
      payload: { challengeId: claim.challengeId.toString(), reason: 'auto-expired' },
    });
  }

  return expired.length;
}

export async function autoReleaseInactive() {
  const cutoff = new Date(Date.now() - config.CLAIM_INACTIVITY_DAYS * 24 * 60 * 60 * 1000);
  const inactive = await Claim.find({
    status: CLAIM_STATUS.ACTIVE,
    lastActivityAt: { $lt: cutoff },
  });

  for (const claim of inactive) {
    claim.status = CLAIM_STATUS.RELEASED;
    claim.exclusivityLock = false;
    claim.releasedAt = new Date();
    claim.releaseReason = 'Inactivity auto-release';
    await claim.save();

    await publish({
      actor: { id: 'system', type: 'system' },
      action: 'claim.released',
      resourceType: 'claim',
      resourceId: claim._id.toString(),
      payload: { challengeId: claim.challengeId.toString(), reason: 'inactivity' },
    });
  }

  return inactive.length;
}

export default { create, findById, list, release, autoReleaseExpired, autoReleaseInactive };
