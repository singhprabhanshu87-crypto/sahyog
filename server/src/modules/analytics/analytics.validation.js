import { z } from 'zod';

export const dashboardQuerySchema = {
  query: z.object({
    refresh: z.coerce.boolean().optional().default(false),
  }),
};

export const districtsQuerySchema = {
  query: z.object({
    districtCode: z.string().optional(),
    refresh: z.coerce.boolean().optional().default(false),
  }),
};

export default { dashboardQuerySchema, districtsQuerySchema };
