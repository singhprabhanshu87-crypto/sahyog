import { z } from 'zod';

export const queryEventsSchema = {
  query: z.object({
    resourceType: z.string().optional(),
    resourceId: z.string().optional(),
    actorId: z.string().optional(),
    action: z.string().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
};

export const resourceParamsSchema = {
  params: z.object({
    resourceType: z.string().min(1),
    resourceId: z.string().min(1),
  }),
};

export default { queryEventsSchema, resourceParamsSchema };
