export const EMITTED = Object.freeze({
  CREATED: 'org.created',
  UPDATED: 'org.updated',
  VERIFIED: 'org.verified',
  REJECTED: 'org.rejected',
  ACTIVATED: 'org.activated',
});

export const SUBSCRIPTIONS = [];

export function registerOrganizationHandlers() {
  // Phase 1: no subscriptions
}

export default { EMITTED, SUBSCRIPTIONS, registerOrganizationHandlers };
