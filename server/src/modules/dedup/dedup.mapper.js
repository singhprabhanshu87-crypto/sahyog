export function toPublic(decision) {
  if (!decision) return null;
  return {
    decision: decision.decision,
    similarity: decision.similarity,
  };
}

export function toInternal(decision) {
  if (!decision) return null;
  return {
    id: decision._id?.toString?.() ?? decision.id,
    submissionId: decision.submissionId?.toString?.() ?? decision.submissionId,
    matchedSubmissionId: decision.matchedSubmissionId?.toString?.() ?? decision.matchedSubmissionId,
    matchedClusterId: decision.matchedClusterId?.toString?.() ?? decision.matchedClusterId,
    decision: decision.decision,
    similarity: decision.similarity,
    geoDistanceMeters: decision.geoDistanceMeters,
    timeDeltaDays: decision.timeDeltaDays,
    metadata: decision.metadata,
    createdAt: decision.createdAt,
  };
}

export default { toPublic, toInternal };
