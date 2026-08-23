import { z } from 'zod';

export const challengeIdParamsSchema = {
  params: z.object({ challengeId: z.string().min(1) }),
};

export const runMatchSchema = {
  params: challengeIdParamsSchema.params,
  body: z.object({
    shortlistSize: z.number().int().positive().max(20).optional(),
  }).optional().default({}),
};

export default { challengeIdParamsSchema, runMatchSchema };
