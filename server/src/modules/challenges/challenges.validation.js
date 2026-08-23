import { z } from 'zod';
import { CHALLENGE_WORKFLOW_STATES } from '../../config/constants.js';
import { PROBLEM_RESOLUTION_LEVELS, SOLUTION_MATURITY_LEVELS } from './challenges.constants.js';

export const createChallengeSchema = {
  body: z.object({
    title: z.string().min(3).max(300),
    description: z.string().min(10).max(10000),
    districtCode: z.string().optional(),
    location: z
      .object({
        lat: z.number().optional(),
        lng: z.number().optional(),
        precision: z.string().optional(),
      })
      .optional(),
    problemResolution: z.enum(Object.values(PROBLEM_RESOLUTION_LEVELS)).optional(),
    solutionMaturity: z.enum(Object.values(SOLUTION_MATURITY_LEVELS)).optional(),
  }),
};

export const challengeIdParamsSchema = {
  params: z.object({ id: z.string().min(1) }),
};

export const listChallengesSchema = {
  query: z.object({
    workflowState: z.enum(Object.values(CHALLENGE_WORKFLOW_STATES)).optional(),
    districtCode: z.string().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
};

export const patchScopeSchema = {
  params: challengeIdParamsSchema.params,
  body: z.object({
    scopedBrief: z.object({
      title: z.string().min(3).max(300),
      summary: z.string().min(10).max(10000),
      objectives: z.array(z.string()).optional(),
      constraints: z.array(z.string()).optional(),
      successCriteria: z.array(z.string()).optional(),
      taxonomyCodes: z.array(z.string()).optional(),
    }),
    problemResolution: z.enum(Object.values(PROBLEM_RESOLUTION_LEVELS)).optional(),
    solutionMaturity: z.enum(Object.values(SOLUTION_MATURITY_LEVELS)).optional(),
  }),
};

export default {
  createChallengeSchema,
  challengeIdParamsSchema,
  listChallengesSchema,
  patchScopeSchema,
};
