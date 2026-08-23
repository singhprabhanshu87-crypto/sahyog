import { CHALLENGE_WORKFLOW_STATES } from '../../config/constants.js';

export const CHALLENGE_STATES = CHALLENGE_WORKFLOW_STATES;

export const PROBLEM_RESOLUTION_LEVELS = Object.freeze({
  UNRESOLVED: 'unresolved',
  PARTIAL: 'partial',
  RESOLVED: 'resolved',
});

export const SOLUTION_MATURITY_LEVELS = Object.freeze({
  IDEA: 'idea',
  PROTOTYPE: 'prototype',
  PILOT: 'pilot',
  SCALE: 'scale',
});

export default { CHALLENGE_STATES, PROBLEM_RESOLUTION_LEVELS, SOLUTION_MATURITY_LEVELS };
