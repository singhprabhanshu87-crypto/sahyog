import { z } from 'zod';
import { TRIAGE_TYPES } from './classification.constants.js';

export const listReviewQueueSchema = {
  query: z.object({
    status: z.string().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
};

export const overrideSchema = {
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    triage: z
      .object({
        type: z.enum(Object.values(TRIAGE_TYPES)),
        confidence: z.number().min(0).max(1).optional(),
      })
      .optional(),
    categories: z
      .array(
        z.object({
          domainId: z.string(),
          label: z.string().optional(),
          confidence: z.number().min(0).max(1).optional(),
        }),
      )
      .optional(),
    rationale: z.string().max(2000).optional(),
  }),
};

export default { listReviewQueueSchema, overrideSchema };
