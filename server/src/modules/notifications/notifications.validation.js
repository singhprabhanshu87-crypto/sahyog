import { z } from 'zod';

export const listNotificationsSchema = {
  query: z.object({
    status: z.string().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
};

export const patchPrefsSchema = {
  body: z.object({
    channels: z.object({
      in_app: z.boolean().optional(),
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
    }).optional(),
    subscribedEvents: z.array(z.string()).optional(),
    quietHours: z.object({
      enabled: z.boolean().optional(),
      start: z.string().optional(),
      end: z.string().optional(),
    }).optional(),
  }),
};

export default { listNotificationsSchema, patchPrefsSchema };
