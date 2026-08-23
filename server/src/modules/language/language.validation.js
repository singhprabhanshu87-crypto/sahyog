import { z } from 'zod';

export const translateSchema = {
  body: z.object({
    text: z.string().min(1).max(10000),
    sourceLocale: z.string().optional(),
    targetLocale: z.string().optional(),
  }),
};

export const detectSchema = {
  body: z.object({
    text: z.string().min(1).max(10000),
  }),
};

export default { translateSchema, detectSchema };
