export function toPublic(team) {
  if (!team) return null;
  return {
    id: team._id?.toString?.() ?? team.id,
    challengeId: team.challengeId?.toString?.() ?? team.challengeId,
    orgId: team.orgId?.toString?.() ?? team.orgId,
    name: team.name,
    memberCount: (team.members ?? []).length,
  };
}

export function toAssignee(team) {
  if (!team) return null;
  return {
    ...toPublic(team),
    members: (team.members ?? []).map((m) => ({
      userId: m.userId?.toString?.() ?? m.userId,
      role: m.role,
      orgId: m.orgId?.toString?.() ?? m.orgId,
    })),
    projectId: team.projectId?.toString?.() ?? team.projectId,
    createdAt: team.createdAt,
  };
}

export function toInternal(team) {
  if (!team) return null;
  return {
    id: team._id?.toString?.() ?? team.id,
    challengeId: team.challengeId?.toString?.() ?? team.challengeId,
    projectId: team.projectId?.toString?.() ?? team.projectId,
    orgId: team.orgId?.toString?.() ?? team.orgId,
    name: team.name,
    members: team.members ?? [],
    createdBy: team.createdBy?.toString?.() ?? team.createdBy,
    metadata: team.metadata,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  };
}

export default { toPublic, toAssignee, toInternal };
