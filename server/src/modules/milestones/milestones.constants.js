export const MILESTONE_STATUS = Object.freeze({
  PENDING: 'pending',
  EVIDENCE_SUBMITTED: 'evidence_submitted',
  UNDER_REVIEW: 'under_review',
  PASSED: 'passed',
  FAILED: 'failed',
  WAIVED: 'waived',
});

export const GATE_REVIEW_OUTCOME = Object.freeze({
  PASS: 'pass',
  FAIL: 'fail',
  CONDITIONAL: 'conditional',
});

export default { MILESTONE_STATUS, GATE_REVIEW_OUTCOME };
