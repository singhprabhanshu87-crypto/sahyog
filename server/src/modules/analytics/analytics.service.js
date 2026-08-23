import { AnalyticsSnapshot } from './analytics.schema.js';
import { Challenge } from '../challenges/challenges.schema.js';
import { Project } from '../projects/projects.schema.js';
import { Organization } from '../organizations/organizations.schema.js';
import { CHALLENGE_WORKFLOW_STATES } from '../../config/constants.js';
import { SNAPSHOT_TYPES } from './analytics.constants.js';

const JHARKHAND_DISTRICT_COUNT = 24;

async function computeMetrics({ districtCode } = {}) {
  const challengeFilter = {};
  if (districtCode) challengeFilter.districtCode = districtCode;

  const [challengeCount, validatedCount, activeProjects, orgCount, districtBreakdown] = await Promise.all([
    Challenge.countDocuments(challengeFilter),
    Challenge.countDocuments({ ...challengeFilter, workflowState: CHALLENGE_WORKFLOW_STATES.VALIDATED }),
    Project.countDocuments({ status: 'active' }),
    Organization.countDocuments({ verificationStatus: 'active' }),
    Challenge.aggregate([
      { $match: challengeFilter },
      { $group: { _id: '$districtCode', count: { $sum: 1 } } },
    ]),
  ]);

  const districtsWithChallenges = districtBreakdown.filter((d) => d._id).length;
  const coverageRatio = districtsWithChallenges / JHARKHAND_DISTRICT_COUNT;
  const volumeRatio = challengeCount > 0 ? validatedCount / challengeCount : 0;

  return {
    challengeVolume: challengeCount,
    challengeCoverage: districtsWithChallenges,
    activeProjects,
    validatedChallenges: validatedCount,
    orgParticipation: orgCount,
    districtCount: districtsWithChallenges,
    coverageRatio,
    volumeRatio,
    breakdown: Object.fromEntries(districtBreakdown.map((d) => [d._id ?? 'unknown', d.count])),
  };
}

export async function getDashboard({ refresh } = {}) {
  if (!refresh) {
    const cached = await AnalyticsSnapshot.findOne({ type: SNAPSHOT_TYPES.DASHBOARD })
      .sort({ computedAt: -1 })
      .lean();
    if (cached) return cached;
  }

  const metrics = await computeMetrics();
  const snapshot = await AnalyticsSnapshot.create({
    type: SNAPSHOT_TYPES.DASHBOARD,
    metrics,
    breakdown: metrics.breakdown,
    computedAt: new Date(),
  });

  return snapshot.toObject();
}

export async function getDistricts({ districtCode, refresh } = {}) {
  if (!refresh && !districtCode) {
    const cached = await AnalyticsSnapshot.findOne({ type: SNAPSHOT_TYPES.DISTRICT })
      .sort({ computedAt: -1 })
      .lean();
    if (cached) return cached;
  }

  const metrics = await computeMetrics({ districtCode });
  const snapshot = await AnalyticsSnapshot.create({
    type: SNAPSHOT_TYPES.DISTRICT,
    districtCode,
    metrics,
    breakdown: metrics.breakdown,
    computedAt: new Date(),
  });

  return snapshot.toObject();
}

export async function rebuildOnEvent(event) {
  await AnalyticsSnapshot.create({
    type: SNAPSHOT_TYPES.DAILY,
    metrics: { eventAction: event.action },
    metadata: { triggeredBy: event.action, resourceId: event.resourceId },
    computedAt: new Date(),
  });
}

export default { getDashboard, getDistricts, rebuildOnEvent };
