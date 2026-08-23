export function toPublic(call) {
  if (!call) return null;
  return {
    operation: call.operation,
    success: call.success,
    latencyMs: call.latencyMs,
  };
}

export function toInternal(call) {
  if (!call) return null;
  return {
    id: call._id?.toString?.() ?? call.id,
    operation: call.operation,
    model: call.model,
    provider: call.provider,
    resourceType: call.resourceType,
    resourceId: call.resourceId,
    prompt: call.prompt,
    response: call.response,
    latencyMs: call.latencyMs,
    success: call.success,
    error: call.error,
    tokenUsage: call.tokenUsage,
    createdAt: call.createdAt,
  };
}

export default { toPublic, toInternal };
