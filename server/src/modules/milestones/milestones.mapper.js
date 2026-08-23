export function toPublic(milestone) {
  if (!milestone) return null;
  return {
    id: milestone._id?.toString?.() ?? milestone.id,
    projectId: milestone.projectId?.toString?.() ?? milestone.projectId,
    title: milestone.title,
    status: milestone.status,
  };
}

export function toAssignee(milestone) {
  if (!milestone) return null;
  return {
    ...toPublic(milestone),
    description: milestone.description,
    gateDefinition: milestone.gateDefinition,
    evidenceCount: (milestone.evidenceRefs ?? []).length,
    dueDate: milestone.dueDate,
    evidenceSubmittedAt: milestone.evidenceSubmittedAt,
  };
}

export function toInternal(milestone) {
  if (!milestone) return null;
  return {
    id: milestone._id?.toString?.() ?? milestone.id,
    projectId: milestone.projectId?.toString?.() ?? milestone.projectId,
    challengeId: milestone.challengeId?.toString?.() ?? milestone.challengeId,
    title: milestone.title,
    description: milestone.description,
    gateDefinition: milestone.gateDefinition,
    status: milestone.status,
    evidenceRefs: milestone.evidenceRefs ?? [],
    evidenceSubmittedAt: milestone.evidenceSubmittedAt,
    evidenceSubmittedBy: milestone.evidenceSubmittedBy?.toString?.() ?? milestone.evidenceSubmittedBy,
    gateReviews: milestone.gateReviews ?? [],
    dueDate: milestone.dueDate,
    metadata: milestone.metadata,
    createdAt: milestone.createdAt,
    updatedAt: milestone.updatedAt,
  };
}

export default { toPublic, toAssignee, toInternal };
