export const EMITTED = Object.freeze({
  CREATED: 'dispute.created',
  ESCALATED: 'dispute.escalated',
  UPDATED: 'dispute.updated',
});

export const SUBSCRIPTIONS = [];

export function registerDisputeHandlers() {
  // No inbound subscriptions
}

export default { EMITTED, SUBSCRIPTIONS, registerDisputeHandlers };
