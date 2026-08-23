export function toPublic(dispute) {
  if (!dispute) return null;
  return {
    id: dispute._id?.toString?.() ?? dispute.id,
    challengeId: dispute.challengeId?.toString?.() ?? dispute.challengeId,
    status: dispute.status,
    category: dispute.category,
  };
}

export function toAssignee(dispute) {
  if (!dispute) return null;
  return {
    ...toPublic(dispute),
    description: dispute.description,
    escalationLevel: dispute.status,
    createdAt: dispute.createdAt,
  };
}

export function toInternal(dispute) {
  if (!dispute) return null;
  return {
    id: dispute._id?.toString?.() ?? dispute.id,
    challengeId: dispute.challengeId?.toString?.() ?? dispute.challengeId,
    projectId: dispute.projectId?.toString?.() ?? dispute.projectId,
    filedBy: dispute.filedBy?.toString?.() ?? dispute.filedBy,
    category: dispute.category,
    description: dispute.description,
    status: dispute.status,
    escalationLog: dispute.escalationLog ?? [],
    resolution: dispute.resolution,
    resolvedAt: dispute.resolvedAt,
    metadata: dispute.metadata,
    createdAt: dispute.createdAt,
    updatedAt: dispute.updatedAt,
  };
}

export default { toPublic, toAssignee, toInternal };
