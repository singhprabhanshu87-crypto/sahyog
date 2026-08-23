import { z } from 'zod';

export const completeSchema = {
  body: z.object({
    prompt: z.string().min(1).max(50000),
    model: z.string().optional(),
    systemPrompt: z.string().optional(),
  }),
};

export default { completeSchema };
