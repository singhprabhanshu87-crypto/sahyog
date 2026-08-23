export const EMITTED = Object.freeze({
  EVIDENCE_SUBMITTED: 'milestone.evidence_submitted',
  REVIEWED: 'milestone.reviewed',
});

export const SUBSCRIPTIONS = ['project.created'];

export function registerMilestoneHandlers() {
  // Milestones created via seed or future admin API
}

export default { EMITTED, SUBSCRIPTIONS, registerMilestoneHandlers };
