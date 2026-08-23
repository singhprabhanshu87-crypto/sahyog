export function toPublic(profile) {
  if (!profile) return null;
  return {
    orgId: profile.orgId?.toString?.() ?? profile.orgId,
    axes: {
      topics: (profile.axes?.topics ?? []).map((t) => ({ code: t.code, label: t.label })),
      applications: (profile.axes?.applications ?? []).map((t) => ({ code: t.code, label: t.label })),
    },
  };
}

export function toAssignee(profile) {
  if (!profile) return null;
  return {
    ...toPublic(profile),
    axes: profile.axes,
    selfDeclaration: profile.selfDeclaration
      ? { summary: profile.selfDeclaration.summary, strengths: profile.selfDeclaration.strengths }
      : null,
    updatedAt: profile.updatedAt,
  };
}

export function toInternal(profile) {
  if (!profile) return null;
  return {
    id: profile._id?.toString?.() ?? profile.id,
    orgId: profile.orgId?.toString?.() ?? profile.orgId,
    axes: profile.axes,
    selfDeclaration: profile.selfDeclaration,
    enrichment: profile.enrichment,
    coiFlags: profile.coiFlags ?? [],
    metadata: profile.metadata,
    updatedBy: profile.updatedBy?.toString?.() ?? profile.updatedBy,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export default { toPublic, toAssignee, toInternal };
