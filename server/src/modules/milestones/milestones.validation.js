import { z } from 'zod';
import { GATE_REVIEW_OUTCOME } from './milestones.constants.js';

export const milestoneIdParamsSchema = {
  params: z.object({ id: z.string().min(1) }),
};

export const submitEvidenceSchema = {
  params: milestoneIdParamsSchema.params,
  body: z.object({
    evidenceRefs: z.array(z.string().min(1)).min(1),
  }),
};

export const reviewMilestoneSchema = {
  params: milestoneIdParamsSchema.params,
  body: z.object({
    outcome: z.enum(Object.values(GATE_REVIEW_OUTCOME)),
    comments: z.string().max(5000).optional(),
  }),
};

export default { milestoneIdParamsSchema, submitEvidenceSchema, reviewMilestoneSchema };
