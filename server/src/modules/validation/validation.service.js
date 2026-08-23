import { ValidationRecord } from './validation.schema.js';
import { Challenge } from '../challenges/challenges.schema.js';
import { publish } from '../../common/lib/event-bus.js';
import { NotFoundError } from '../../common/errors/http-errors.js';
import { VALIDATION_STATUS } from './validation.constants.js';
import { PROBLEM_RESOLUTION_LEVELS } from '../challenges/challenges.constants.js';

export async function signOff(challengeId, data, actor) {
  let record = await ValidationRecord.findOne({ challengeId });
  if (!record) {
    record = await ValidationRecord.create({ challengeId });
  }

  record.signOffs.push({
    userId: actor.id,
    role: actor.role,
    comments: data.comments,
    signedAt: new Date(),
  });

  if (data.communityFeedback) {
    record.communityFeedback = data.communityFeedback;
  }

  const fullySigned = record.signOffs.length >= record.requiredSignOffCount;

  if (fullySigned) {
    record.status = VALIDATION_STATUS.SIGNED_OFF;
    const resolution = data.problemResolution ?? PROBLEM_RESOLUTION_LEVELS.RESOLVED;
    record.problemResolution = resolution;

    await Challenge.findByIdAndUpdate(challengeId, {
      $set: { problemResolution: resolution },
    });
  }

  await record.save();

  if (fullySigned) {
    await publish({
      actor: { id: actor.id, type: 'user', role: actor.role },
      action: 'validation.sign_off',
      resourceType: 'challenge',
      resourceId: challengeId,
      payload: {
        problemResolution: record.problemResolution,
        signOffCount: record.signOffs.length,
      },
    });
  }

  return record.toObject();
}

export async function findByChallengeId(challengeId) {
  const record = await ValidationRecord.findOne({ challengeId }).lean();
  if (!record) throw new NotFoundError('Validation record not found');
  return record;
}

export default { signOff, findByChallengeId };
