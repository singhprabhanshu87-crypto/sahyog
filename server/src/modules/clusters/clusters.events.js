export const EMITTED = Object.freeze({
  CREATED: 'cluster.created',
  UPDATED: 'cluster.updated',
  STATUS_CHANGED: 'cluster.status_changed',
});

export const SUBSCRIPTIONS = [];

export function registerClusterHandlers() {
  // Clusters updated by dedup/classification pipeline
}

export default { EMITTED, SUBSCRIPTIONS, registerClusterHandlers };
