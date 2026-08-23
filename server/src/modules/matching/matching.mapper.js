export function toPublic(run) {
  if (!run) return null;
  return {
    id: run._id?.toString?.() ?? run.id,
    challengeId: run.challengeId?.toString?.() ?? run.challengeId,
    status: run.status,
    assignedOrgIds: (run.assignedOrgIds ?? []).map((id) => id?.toString?.() ?? id),
    completedAt: run.completedAt,
  };
}

export function toAssignee(run) {
  if (!run) return null;
  return {
    ...toPublic(run),
    stage: run.stage,
    shortlistSize: run.shortlistSize,
    scores: (run.scores ?? []).map((s) => ({
      orgId: s.orgId?.toString?.() ?? s.orgId,
      compositeScore: s.compositeScore,
      rank: s.rank,
      assigned: s.assigned,
      coiBlocked: s.coiBlocked,
    })),
    createdAt: run.createdAt,
  };
}

export function toInternal(run) {
  if (!run) return null;
  return {
    id: run._id?.toString?.() ?? run.id,
    challengeId: run.challengeId?.toString?.() ?? run.challengeId,
    status: run.status,
    stage: run.stage,
    shortlistSize: run.shortlistSize,
    scores: run.scores ?? [],
    assignedOrgIds: (run.assignedOrgIds ?? []).map((id) => id?.toString?.() ?? id),
    triggeredBy: run.triggeredBy?.toString?.() ?? run.triggeredBy,
    completedAt: run.completedAt,
    error: run.error,
    metadata: run.metadata,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
  };
}

export default { toPublic, toAssignee, toInternal };
