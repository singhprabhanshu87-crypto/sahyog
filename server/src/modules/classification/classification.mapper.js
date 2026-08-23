export function toPublic(item) {
  if (!item) return null;
  return {
    id: item._id?.toString?.() ?? item.id,
    submissionId: item.submissionId?.toString?.() ?? item.submissionId,
    reason: item.reason,
    status: item.status,
    createdAt: item.createdAt,
  };
}

export function toInternal(item) {
  if (!item) return null;
  return {
    id: item._id?.toString?.() ?? item.id,
    submissionId: item.submissionId?.toString?.() ?? item.submissionId,
    reason: item.reason,
    status: item.status,
    triageResult: item.triageResult,
    categoryResult: item.categoryResult,
    assignedTo: item.assignedTo?.toString?.() ?? item.assignedTo,
    resolvedBy: item.resolvedBy?.toString?.() ?? item.resolvedBy,
    resolvedAt: item.resolvedAt,
    override: item.override,
    metadata: item.metadata,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export default { toPublic, toInternal };
