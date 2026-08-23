export function toPublic(project) {
  if (!project) return null;
  return {
    id: project._id?.toString?.() ?? project.id,
    challengeId: project.challengeId?.toString?.() ?? project.challengeId,
    title: project.title,
    status: project.status,
    trlCurrent: project.trlCurrent,
    srlCurrent: project.srlCurrent,
  };
}

export function toAssignee(project) {
  if (!project) return null;
  return {
    ...toPublic(project),
    description: project.description,
    trlTarget: project.trlTarget,
    srlTarget: project.srlTarget,
    boardItems: (project.boardItems ?? []).map((item) => ({
      id: item._id?.toString?.() ?? item.id,
      type: item.type,
      title: item.title,
      status: item.status,
    })),
    teamId: project.teamId?.toString?.() ?? project.teamId,
    orgId: project.orgId?.toString?.() ?? project.orgId,
    createdAt: project.createdAt,
  };
}

export function toInternal(project) {
  if (!project) return null;
  return {
    id: project._id?.toString?.() ?? project.id,
    challengeId: project.challengeId?.toString?.() ?? project.challengeId,
    teamId: project.teamId?.toString?.() ?? project.teamId,
    orgId: project.orgId?.toString?.() ?? project.orgId,
    title: project.title,
    description: project.description,
    status: project.status,
    trlTarget: project.trlTarget,
    srlTarget: project.srlTarget,
    trlCurrent: project.trlCurrent,
    srlCurrent: project.srlCurrent,
    boardItems: project.boardItems ?? [],
    claimId: project.claimId?.toString?.() ?? project.claimId,
    createdBy: project.createdBy?.toString?.() ?? project.createdBy,
    metadata: project.metadata,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export default { toPublic, toAssignee, toInternal };
