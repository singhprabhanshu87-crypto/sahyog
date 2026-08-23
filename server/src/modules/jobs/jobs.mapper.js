export function toPublic(record) {
  if (!record) return null;
  return {
    queueName: record.queueName,
    jobName: record.jobName,
    status: record.status,
    completedAt: record.completedAt,
  };
}

export function toInternal(record) {
  if (!record) return null;
  return {
    id: record._id?.toString?.() ?? record.id,
    queueName: record.queueName,
    jobName: record.jobName,
    jobId: record.jobId,
    resourceType: record.resourceType,
    resourceId: record.resourceId,
    status: record.status,
    attempts: record.attempts,
    result: record.result,
    error: record.error,
    completedAt: record.completedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export default { toPublic, toInternal };
