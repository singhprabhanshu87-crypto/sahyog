export function toPublic(record) {
  if (!record) return null;
  return {
    challengeId: record.challengeId?.toString?.() ?? record.challengeId,
    status: record.status,
    problemResolution: record.problemResolution,
  };
}

export function toAssignee(record) {
  if (!record) return null;
  return {
    ...toPublic(record),
    signOffCount: (record.signOffs ?? []).length,
    requiredSignOffCount: record.requiredSignOffCount,
    communityFeedback: record.communityFeedback,
  };
}

export function toInternal(record) {
  if (!record) return null;
  return {
    id: record._id?.toString?.() ?? record.id,
    challengeId: record.challengeId?.toString?.() ?? record.challengeId,
    projectId: record.projectId?.toString?.() ?? record.projectId,
    status: record.status,
    problemResolution: record.problemResolution,
    signOffs: record.signOffs ?? [],
    requiredSignOffCount: record.requiredSignOffCount,
    communityFeedback: record.communityFeedback,
    metadata: record.metadata,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export default { toPublic, toAssignee, toInternal };
