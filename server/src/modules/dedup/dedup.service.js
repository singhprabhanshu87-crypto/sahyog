import config from '../../config/index.js';
import { Submission } from '../submissions/submissions.schema.js';
import { DedupDecision } from './dedup.schema.js';
import { DEDUP_DECISIONS } from './dedup.constants.js';
import * as geoService from '../geo/geo.service.js';
import * as aiService from '../ai/ai.service.js';
import * as clustersService from '../clusters/clusters.service.js';
import * as submissionsService from '../submissions/submissions.service.js';
import { haversineDistance } from '../../common/utils/geo-utils.js';
import { publish } from '../../common/lib/event-bus.js';
import { NotFoundError } from '../../common/errors/http-errors.js';
import { EMITTED } from './dedup.events.js';

function daysBetween(dateA, dateB) {
  return Math.abs(dateA - dateB) / (1000 * 60 * 60 * 24);
}

export async function findCandidates(submission) {
  const timeWindowMs = config.DEDUP_TIME_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const since = new Date(Date.now() - timeWindowMs);

  const filter = {
    _id: { $ne: submission._id },
    createdAt: { $gte: since },
    embedding: { $exists: true, $ne: null },
  };

  if (submission.location?.districtCode) {
    filter['location.districtCode'] = submission.location.districtCode;
  }

  const candidates = await Submission.find(filter)
    .select('+embedding')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const results = [];

  for (const candidate of candidates) {
    let geoDistance = null;
    if (
      submission.location?.lat &&
      submission.location?.lng &&
      candidate.location?.lat &&
      candidate.location?.lng
    ) {
      geoDistance = haversineDistance(
        submission.location.lat,
        submission.location.lng,
        candidate.location.lat,
        candidate.location.lng,
      );

      if (geoDistance > config.DEDUP_RADIUS_METERS) continue;
    }

    const similarity = submission.embedding && candidate.embedding
      ? aiService.cosineSimilarity(submission.embedding, candidate.embedding)
      : 0;

    if (similarity < config.DEDUP_SIMILARITY_THRESHOLD) continue;

    results.push({
      candidate,
      similarity,
      geoDistanceMeters: geoDistance,
      timeDeltaDays: daysBetween(new Date(submission.createdAt), new Date(candidate.createdAt)),
    });
  }

  results.sort((a, b) => b.similarity - a.similarity);
  return results;
}

export async function runDedup(submissionId) {
  const submission = await Submission.findById(submissionId).select('+embedding').lean();
  if (!submission) throw new NotFoundError('Submission not found');

  const candidates = await findCandidates(submission);
  let decision;
  let clusterId = null;
  let matchedSubmissionId = null;
  let similarity = null;
  let geoDistanceMeters = null;
  let timeDeltaDays = null;

  if (candidates.length > 0) {
    const best = candidates[0];
    matchedSubmissionId = best.candidate._id;
    similarity = best.similarity;
    geoDistanceMeters = best.geoDistanceMeters;
    timeDeltaDays = best.timeDeltaDays;

    if (best.candidate.clusterId) {
      clusterId = best.candidate.clusterId;
      await clustersService.attachSubmission(clusterId.toString(), submissionId);
      decision = DEDUP_DECISIONS.ATTACH_CLUSTER;
    } else {
      const cluster = await clustersService.createFromSubmissions(
        [best.candidate._id.toString(), submissionId],
        { districtCode: submission.location?.districtCode },
      );
      clusterId = cluster._id || cluster.id;
      decision = DEDUP_DECISIONS.ATTACH_EXISTING;
    }

    await publish({
      actor: { id: 'system', type: 'system' },
      action: EMITTED.MATCHED,
      resourceType: 'submission',
      resourceId: submissionId,
      payload: { matchedSubmissionId: matchedSubmissionId.toString(), similarity },
    });
  } else {
    const cluster = await clustersService.createFromSubmissions([submissionId], {
      districtCode: submission.location?.districtCode,
    });
    clusterId = cluster._id || cluster.id;
    decision = DEDUP_DECISIONS.CREATE_CLUSTER;
  }

  const record = await DedupDecision.create({
    submissionId,
    matchedSubmissionId,
    matchedClusterId: clusterId,
    decision,
    similarity,
    geoDistanceMeters,
    timeDeltaDays,
  });

  await submissionsService.updateAfterDedup(submissionId, { clusterId });

  await publish({
    actor: { id: 'system', type: 'system' },
    action: EMITTED.DECIDED,
    resourceType: 'dedup_decision',
    resourceId: record._id.toString(),
    payload: { submissionId, decision, clusterId: clusterId?.toString?.() },
  });

  return {
    decision: record.toObject(),
    clusterId,
    matchedSubmissionId,
    similarity,
  };
}

export async function radiusQueryForDedup(lat, lng) {
  return geoService.radiusQuery(lat, lng, config.DEDUP_RADIUS_METERS);
}

export default { findCandidates, runDedup, radiusQueryForDedup };
