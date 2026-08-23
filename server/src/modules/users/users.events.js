export const EMITTED = Object.freeze({
  CREATED: 'user.created',
  UPDATED: 'user.updated',
  MEMBERSHIP_CREATED: 'membership.created',
  MEMBERSHIP_UPDATED: 'membership.updated',
});

export const SUBSCRIPTIONS = [];

export function registerUserHandlers() {
  // Phase 1: no subscriptions
}

export default { EMITTED, SUBSCRIPTIONS, registerUserHandlers };
