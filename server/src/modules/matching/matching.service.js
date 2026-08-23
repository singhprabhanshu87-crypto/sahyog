import config from '../../config/index.js';
import { MatchRun, MatchRationale } from './matching.schema.js';
import { CapabilityProfile } from '../capability-profiles/capability-profiles.schema.js';
import { Challenge } from '../challenges/challenges.schema.js';
import { Organization } from '../organizations/organizations.schema.js';
import { publish } from '../../common/lib/event-bus.js';
import { NotFoundError } from '../../common/errors/http-errors.js';
import { MATCH_RUN_STATUS, MATCH_STAGE } from './matching.constants.js';
import { ORG_VERIFICATION_STATES } from '../../config/constants.js';

function scoreRelevance(challenge, profile) {
  const topicCodes = challenge.scopedBrief?.taxonomyCodes ?? [];
  const profileTopics = (profile?.axes?.topics ?? []).map((t) => t.code);
  if (!topicCodes.length || !profileTopics.length) return 0.5;
  const overlap = topicCodes.filter((c) => profileTopics.includes(c)).length;
  return Math.min(1, overlap / topicCodes.length);
}

function scoreCapacity(profile) {
  const max = profile?.axes?.capacity?.maxConcurrentChallenges ?? config.MATCH_CAPACITY_DEFAULT;
  const load = profile?.axes?.capacity?.currentLoad ?? 0;
  if (max <= 0) return 0;
  return Math.max(0, 1 - load / max);
}

function scoreFairness(orgId, assignmentCounts) {
  const count = assignmentCounts.get(orgId.toString()) ?? 0;
  const maxCount = Math.max(1, ...assignmentCounts.values());
  return 1 - count / maxCount;
}

function hasCoi(profile, challenge) {
  const flags = profile?.coiFlags ?? [];
  if (flags.includes(challenge.districtCode)) return true;
  return false;
}

export async function runMatch(challengeId, actor, { shortlistSize } = {}) {
  const challenge = await Challenge.findById(challengeId).lean();
  if (!challenge) throw new NotFoundError('Challenge not found');

  const size = shortlistSize ?? config.MATCH_SHORTLIST_SIZE;

  const run = await MatchRun.create({
    challengeId,
    shortlistSize: size,
    status: MATCH_RUN_STATUS.SCORING,
    stage: MATCH_STAGE.RELEVANCE,
    triggeredBy: actor.id,
  });

  const orgs = await Organization.find({
    verificationStatus: ORG_VERIFICATION_STATES.ACTIVE,
    type: { $in: ['hei', 'industry', 'incubator'] },
  }).lean();

  const profiles = await CapabilityProfile.find({
    orgId: { $in: orgs.map((o) => o._id) },
  }).lean();

  const profileMap = new Map(profiles.map((p) => [p.orgId.toString(), p]));

  const assignmentCounts = new Map();
  const fairnessWeight = config.MATCH_FAIRNESS_WEIGHT;

  let scores = orgs.map((org) => {
    const profile = profileMap.get(org._id.toString());
    const relevance = scoreRelevance(challenge, profile);
    const capacity = scoreCapacity(profile);
    const fairness = scoreFairness(org._id, assignmentCounts);
    const coiBlocked = hasCoi(profile, challenge);
    const composite = coiBlocked
      ? 0
      : relevance * (1 - fairnessWeight) + fairness * fairnessWeight * 0.5 + capacity * fairnessWeight * 0.5;

    return {
      orgId: org._id,
      relevanceScore: relevance,
      capacityScore: capacity,
      fairnessScore: fairness,
      coiBlocked,
      compositeScore: composite,
      rank: null,
      assigned: false,
    };
  });

  scores.sort((a, b) => b.compositeScore - a.compositeScore);
  scores = scores.map((s, i) => ({ ...s, rank: i + 1 }));

  for (const s of scores.slice(0, 10)) {
    await MatchRationale.create({
      matchRunId: run._id,
      challengeId,
      orgId: s.orgId,
      stage: MATCH_STAGE.RELEVANCE,
      rationale: `Relevance ${s.relevanceScore.toFixed(2)}, capacity ${s.capacityScore.toFixed(2)}, fairness ${s.fairnessScore.toFixed(2)}`,
      factors: {
        relevanceScore: s.relevanceScore,
        capacityScore: s.capacityScore,
        fairnessScore: s.fairnessScore,
        coiBlocked: s.coiBlocked,
      },
    });
  }

  run.stage = MATCH_STAGE.ASSIGNMENT;
  run.status = MATCH_RUN_STATUS.ASSIGNING;
  run.scores = scores;

  const eligible = scores.filter((s) => !s.coiBlocked && s.capacityScore > 0).slice(0, size);
  const assignedOrgIds = [];

  for (const entry of eligible) {
    entry.assigned = true;
    assignedOrgIds.push(entry.orgId);
    await MatchRationale.create({
      matchRunId: run._id,
      challengeId,
      orgId: entry.orgId,
      stage: MATCH_STAGE.ASSIGNMENT,
      rationale: `Assigned rank ${entry.rank} with composite ${entry.compositeScore.toFixed(2)}`,
      factors: { rank: entry.rank, compositeScore: entry.compositeScore },
    });
  }

  run.assignedOrgIds = assignedOrgIds;
  run.scores = scores;
  run.status = MATCH_RUN_STATUS.COMPLETED;
  run.completedAt = new Date();
  await run.save();

  await publish({
    actor: { id: actor.id, type: 'user', role: actor.role },
    action: 'matching.run_completed',
    resourceType: 'match_run',
    resourceId: run._id.toString(),
    payload: { challengeId, assignedOrgIds: assignedOrgIds.map((id) => id.toString()) },
  });

  return run.toObject();
}

export async function getLatestRun(challengeId) {
  const run = await MatchRun.findOne({ challengeId }).sort({ createdAt: -1 }).lean();
  if (!run) throw new NotFoundError('No match run found for challenge');
  return run;
}

export async function getRationales(matchRunId) {
  return MatchRationale.find({ matchRunId }).lean();
}

export default { runMatch, getLatestRun, getRationales };
