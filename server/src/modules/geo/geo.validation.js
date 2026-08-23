import { z } from 'zod';
import { BOUNDARY_LEVELS } from './geo.constants.js';

export const resolvePointSchema = {
  body: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
};

export const listBoundariesSchema = {
  query: z.object({
    level: z.enum(Object.values(BOUNDARY_LEVELS)).optional(),
    parentCode: z.string().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(50),
  }),
};

export default { resolvePointSchema, listBoundariesSchema };
