import { STATE_CONFIG } from './workflow.constants.js';

export function toPublic(instance) {
  if (!instance) return null;
  return {
    challengeId: instance.challengeId?.toString?.() ?? instance.challengeId,
    currentState: instance.currentState,
    visibility: instance.visibility,
  };
}

export function toAssignee(instance) {
  if (!instance) return null;
  const config = STATE_CONFIG[instance.currentState] ?? {};
  return {
    ...toPublic(instance),
    ownerRole: instance.ownerRole,
    slaDeadline: instance.slaDeadline,
    exitCriteria: config.exitCriteria ?? [],
  };
}

export function toInternal(instance) {
  if (!instance) return null;
  return {
    id: instance._id?.toString?.() ?? instance.id,
    challengeId: instance.challengeId?.toString?.() ?? instance.challengeId,
    currentState: instance.currentState,
    ownerRole: instance.ownerRole,
    slaDeadline: instance.slaDeadline,
    visibility: instance.visibility,
    transitionLog: instance.transitionLog ?? [],
    stateConfig: STATE_CONFIG[instance.currentState],
    metadata: instance.metadata,
    createdAt: instance.createdAt,
    updatedAt: instance.updatedAt,
  };
}

export default { toPublic, toAssignee, toInternal };
