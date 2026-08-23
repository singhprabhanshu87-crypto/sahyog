export function toPublic(cluster) {
  if (!cluster) return null;
  return {
    id: cluster._id?.toString?.() ?? cluster.id,
    status: cluster.status,
    duplicateCount: cluster.duplicateCount,
    districtCode: cluster.districtCode,
    triageType: cluster.triageType,
    categories: (cluster.categories || []).map((c) => ({
      domainId: c.domainId,
      label: c.label,
    })),
    summary: cluster.summary,
    createdAt: cluster.createdAt,
  };
}

export function toAssignee(cluster) {
  if (!cluster) return null;
  return {
    ...toPublic(cluster),
    representativeSubmissionId:
      cluster.representativeSubmissionId?.toString?.() ?? cluster.representativeSubmissionId,
    submissionCount: (cluster.submissionIds || []).length,
    updatedAt: cluster.updatedAt,
  };
}

export function toInternal(cluster) {
  if (!cluster) return null;
  return {
    id: cluster._id?.toString?.() ?? cluster.id,
    status: cluster.status,
    representativeSubmissionId:
      cluster.representativeSubmissionId?.toString?.() ?? cluster.representativeSubmissionId,
    submissionIds: (cluster.submissionIds || []).map((id) => id?.toString?.() ?? id),
    duplicateCount: cluster.duplicateCount,
    districtCode: cluster.districtCode,
    triageType: cluster.triageType,
    categories: cluster.categories,
    summary: cluster.summary,
    metadata: cluster.metadata,
    createdAt: cluster.createdAt,
    updatedAt: cluster.updatedAt,
  };
}

export default { toPublic, toAssignee, toInternal };
