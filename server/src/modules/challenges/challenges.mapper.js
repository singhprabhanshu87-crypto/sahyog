export function toPublic(challenge) {
  if (!challenge) return null;
  return {
    id: challenge._id?.toString?.() ?? challenge.id,
    title: challenge.title,
    workflowState: challenge.workflowState,
    districtCode: challenge.districtCode,
    problemResolution: challenge.problemResolution,
    solutionMaturity: challenge.solutionMaturity,
    scopedBrief: challenge.scopedBrief?.title
      ? { title: challenge.scopedBrief.title, summary: challenge.scopedBrief.summary }
      : null,
    createdAt: challenge.createdAt,
  };
}

export function toAssignee(challenge) {
  if (!challenge) return null;
  return {
    ...toPublic(challenge),
    description: challenge.description,
    location: challenge.location,
    scopedBrief: challenge.scopedBrief,
    claimedOrgId: challenge.claimedOrgId?.toString?.() ?? challenge.claimedOrgId,
    projectId: challenge.projectId?.toString?.() ?? challenge.projectId,
  };
}

export function toInternal(challenge) {
  if (!challenge) return null;
  return {
    id: challenge._id?.toString?.() ?? challenge.id,
    title: challenge.title,
    description: challenge.description,
    submittedBy: challenge.submittedBy?.toString?.() ?? challenge.submittedBy,
    districtCode: challenge.districtCode,
    location: challenge.location,
    workflowState: challenge.workflowState,
    problemResolution: challenge.problemResolution,
    solutionMaturity: challenge.solutionMaturity,
    scopedBrief: challenge.scopedBrief,
    claimedOrgId: challenge.claimedOrgId?.toString?.() ?? challenge.claimedOrgId,
    projectId: challenge.projectId?.toString?.() ?? challenge.projectId,
    metadata: challenge.metadata,
    createdAt: challenge.createdAt,
    updatedAt: challenge.updatedAt,
  };
}

export default { toPublic, toAssignee, toInternal };
