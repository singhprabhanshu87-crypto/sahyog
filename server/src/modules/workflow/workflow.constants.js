import { CHALLENGE_WORKFLOW_STATES } from '../../config/constants.js';

export const WORKFLOW_STATES = CHALLENGE_WORKFLOW_STATES;

export const WORKFLOW_TRANSITIONS = Object.freeze({
  TRIAGE: 'triage',
  SCOPE: 'scope',
  CLAIM: 'claim',
  START_PROJECT: 'start_project',
  VALIDATE: 'validate',
  CLOSE: 'close',
  REOPEN: 'reopen',
});

export const STATE_CONFIG = Object.freeze({
  [WORKFLOW_STATES.SUBMITTED]: {
    owner: 'district_officer',
    slaHours: 48,
    visibility: 'internal',
    exitCriteria: ['initial_review_complete'],
  },
  [WORKFLOW_STATES.TRIAGED]: {
    owner: 'district_officer',
    slaHours: 72,
    visibility: 'internal',
    exitCriteria: ['scope_drafted'],
  },
  [WORKFLOW_STATES.SCOPED]: {
    owner: 'pmu_admin',
    slaHours: 168,
    visibility: 'assignee',
    exitCriteria: ['match_run_complete'],
  },
  [WORKFLOW_STATES.CLAIMED]: {
    owner: 'hei_faculty',
    slaHours: 336,
    visibility: 'assignee',
    exitCriteria: ['team_formed', 'agreement_signed'],
  },
  [WORKFLOW_STATES.IN_PROJECT]: {
    owner: 'hei_faculty',
    slaHours: 720,
    visibility: 'assignee',
    exitCriteria: ['milestones_complete'],
  },
  [WORKFLOW_STATES.VALIDATED]: {
    owner: 'community_validator',
    slaHours: 168,
    visibility: 'public',
    exitCriteria: ['community_sign_off'],
  },
  [WORKFLOW_STATES.CLOSED]: {
    owner: 'pmu_admin',
    slaHours: null,
    visibility: 'public',
    exitCriteria: [],
  },
});

export default { WORKFLOW_STATES, WORKFLOW_TRANSITIONS, STATE_CONFIG };
