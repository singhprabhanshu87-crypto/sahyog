import { z } from 'zod';
import { WORKFLOW_TRANSITIONS } from './workflow.constants.js';

export const challengeIdParamsSchema = {
  params: z.object({ challengeId: z.string().min(1) }),
};

export const transitionSchema = {
  params: challengeIdParamsSchema.params,
  body: z.object({
    event: z.enum(Object.values(WORKFLOW_TRANSITIONS)),
    rationale: z.string().max(2000).optional(),
  }),
};

export default { challengeIdParamsSchema, transitionSchema };
