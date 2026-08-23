export const EMITTED = Object.freeze({
  CREATED: 'team.created',
  MEMBERS_UPDATED: 'team.members_updated',
});

export const SUBSCRIPTIONS = [];

export function registerTeamHandlers() {
  // Phase 5: no inbound subscriptions
}

export default { EMITTED, SUBSCRIPTIONS, registerTeamHandlers };
