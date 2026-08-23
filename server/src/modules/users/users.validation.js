import { z } from 'zod';
import { ROLES } from '../../config/constants.js';

export const updateProfileSchema = {
  body: z.object({
    name: z.string().min(1).max(120).optional(),
    phone: z.string().min(10).max(15).optional(),
    locale: z.string().min(2).max(10).optional(),
  }),
};

export const userIdParamsSchema = {
  params: z.object({
    id: z.string().min(1),
  }),
};

export const createMembershipSchema = {
  body: z.object({
    userId: z.string().min(1),
    orgId: z.string().min(1),
    role: z.enum(Object.values(ROLES)),
    title: z.string().optional(),
    department: z.string().optional(),
  }),
};

export const listUsersSchema = {
  query: z.object({
    role: z.enum(Object.values(ROLES)).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
};

export default { updateProfileSchema, userIdParamsSchema, createMembershipSchema, listUsersSchema };
