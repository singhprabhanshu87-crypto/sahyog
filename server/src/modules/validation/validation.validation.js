import { z } from 'zod';
import { PROBLEM_RESOLUTION_LEVELS } from '../challenges/challenges.constants.js';

export const challengeIdParamsSchema = {
  params: z.object({ challengeId: z.string().min(1) }),
};

export const signOffSchema = {
  params: challengeIdParamsSchema.params,
  body: z.object({
    comments: z.string().max(5000).optional(),
    problemResolution: z.enum(Object.values(PROBLEM_RESOLUTION_LEVELS)).optional(),
    communityFeedback: z.string().max(10000).optional(),
  }),
};

export default { challengeIdParamsSchema, signOffSchema };
