import { z } from 'zod';

export const queueStatusSchema = {
  query: z.object({
    queue: z.string().optional(),
  }),
};

export default { queueStatusSchema };
