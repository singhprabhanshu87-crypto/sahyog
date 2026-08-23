export const DISPUTE_STATUS = Object.freeze({
  FILED: 'filed',
  TEAM_REVIEW: 'team_review',
  DISTRICT_REVIEW: 'district_review',
  PMU_REVIEW: 'pmu_review',
  RESOLVED: 'resolved',
  ESCALATED_CLOSED: 'escalated_closed',
});

export const ESCALATION_EVENTS = Object.freeze({
  ESCALATE: 'escalate',
  RESOLVE: 'resolve',
  CLOSE: 'close',
});

export default { DISPUTE_STATUS, ESCALATION_EVENTS };
