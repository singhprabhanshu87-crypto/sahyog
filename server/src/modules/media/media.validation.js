import { z } from 'zod';
import { MEDIA_RESOURCE_TYPES } from './media.constants.js';

export const createMediaSchema = {
  body: z.object({
    resourceType: z.enum(Object.values(MEDIA_RESOURCE_TYPES)),
    resourceId: z.string().min(1),
    filename: z.string().min(1),
    originalName: z.string().min(1),
    mimeType: z.string().min(1),
    sizeBytes: z.number().int().positive(),
  }),
};

export const mediaIdParamsSchema = {
  params: z.object({
    id: z.string().min(1),
  }),
};

export const listMediaSchema = {
  query: z.object({
    resourceType: z.enum(Object.values(MEDIA_RESOURCE_TYPES)).optional(),
    resourceId: z.string().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
};

export default { createMediaSchema, mediaIdParamsSchema, listMediaSchema };
