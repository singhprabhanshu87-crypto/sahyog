import { z } from 'zod';
import { ESCALATION_EVENTS } from './disputes.constants.js';

export const createDisputeSchema = {
  body: z.object({
    challengeId: z.string().min(1),
    projectId: z.string().optional(),
    category: z.string().min(1).max(100),
    description: z.string().min(10).max(10000),
  }),
};

export const disputeIdParamsSchema = {
  params: z.object({ id: z.string().min(1) }),
};

export const escalateDisputeSchema = {
  params: disputeIdParamsSchema.params,
  body: z.object({
    event: z.enum(Object.values(ESCALATION_EVENTS)),
    rationale: z.string().max(5000).optional(),
    resolution: z.string().max(5000).optional(),
  }),
};

export default { createDisputeSchema, disputeIdParamsSchema, escalateDisputeSchema };
