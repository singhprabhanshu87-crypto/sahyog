import { Agreement } from './agreements.schema.js';
import { publish } from '../../common/lib/event-bus.js';
import { NotFoundError, BadRequestError } from '../../common/errors/http-errors.js';
import { AGREEMENT_STATUS } from './agreements.constants.js';

export async function create(data, actor) {
  const agreement = await Agreement.create({
    ...data,
    status: AGREEMENT_STATUS.PENDING_SIGNATURES,
    createdBy: actor.id,
    requiredSigners: data.requiredSigners ?? ['hei_rep', 'industry_rep'],
  });

  await publish({
    actor: { id: actor.id, type: 'user', role: actor.role },
    action: 'agreement.created',
    resourceType: 'agreement',
    resourceId: agreement._id.toString(),
    payload: { challengeId: data.challengeId },
  });

  return agreement.toObject();
}

export async function findById(id) {
  const agreement = await Agreement.findById(id).lean();
  if (!agreement) throw new NotFoundError('Agreement not found');
  return agreement;
}

export async function sign(id, { role, signatureRef }, actor) {
  const agreement = await Agreement.findById(id);
  if (!agreement) throw new NotFoundError('Agreement not found');

  if (agreement.status === AGREEMENT_STATUS.SIGNED) {
    throw new BadRequestError('Agreement already fully signed');
  }

  const alreadySigned = agreement.signatures.some(
    (s) => s.userId.toString() === actor.id && s.role === role,
  );
  if (alreadySigned) {
    throw new BadRequestError('Already signed for this role');
  }

  agreement.signatures.push({
    userId: actor.id,
    role,
    signatureRef,
    signedAt: new Date(),
  });

  const required = agreement.requiredSigners ?? [];
  const signedRoles = new Set(agreement.signatures.map((s) => s.role));
  const allSigned = required.every((r) => signedRoles.has(r));

  if (allSigned) {
    agreement.status = AGREEMENT_STATUS.SIGNED;
  }

  await agreement.save();

  await publish({
    actor: { id: actor.id, type: 'user', role: actor.role },
    action: allSigned ? 'agreement.signed' : 'agreement.signature_added',
    resourceType: 'agreement',
    resourceId: id,
    payload: { role, fullySigned: allSigned, challengeId: agreement.challengeId.toString() },
  });

  return agreement.toObject();
}

export async function isIndustryBlocked(challengeId) {
  const agreement = await Agreement.findOne({
    challengeId,
    blocksIndustryUntilSigned: true,
    status: { $ne: AGREEMENT_STATUS.SIGNED },
  }).lean();
  return Boolean(agreement);
}

export default { create, findById, sign, isIndustryBlocked };
