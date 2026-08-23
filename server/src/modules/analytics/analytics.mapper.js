export function toPublic(snapshot) {
  if (!snapshot) return null;
  return {
    type: snapshot.type,
    metrics: {
      challengeVolume: snapshot.metrics?.challengeVolume,
      challengeCoverage: snapshot.metrics?.challengeCoverage,
      coverageRatio: snapshot.metrics?.coverageRatio,
    },
    computedAt: snapshot.computedAt,
  };
}

export function toAssignee(snapshot) {
  if (!snapshot) return null;
  return {
    ...toPublic(snapshot),
    metrics: snapshot.metrics,
    breakdown: snapshot.breakdown,
    districtCode: snapshot.districtCode,
  };
}

export function toInternal(snapshot) {
  if (!snapshot) return null;
  return {
    id: snapshot._id?.toString?.() ?? snapshot.id,
    type: snapshot.type,
    districtCode: snapshot.districtCode,
    periodStart: snapshot.periodStart,
    periodEnd: snapshot.periodEnd,
    metrics: snapshot.metrics,
    breakdown: snapshot.breakdown,
    computedAt: snapshot.computedAt,
    metadata: snapshot.metadata,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  };
}

export default { toPublic, toAssignee, toInternal };
