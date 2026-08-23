import { z } from 'zod';
import { ORG_TYPES, ORG_VERIFICATION_STATES } from '../../config/constants.js';

export const createOrgSchema = {
  body: z.object({
    name: z.string().min(2).max(200),
    type: z.enum(Object.values(ORG_TYPES)),
    description: z.string().max(2000).optional(),
    districtCodes: z.array(z.string()).optional().default([]),
    address: z
      .object({
        line1: z.string().optional(),
        district: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
      })
      .optional(),
    contact: z
      .object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
        website: z.string().url().optional(),
      })
      .optional(),
    registrationNumber: z.string().optional(),
  }),
};

export const updateOrgSchema = {
  params: z.object({ id: z.string().min(1) }),
  body: createOrgSchema.body.partial(),
};

export const orgIdParamsSchema = {
  params: z.object({ id: z.string().min(1) }),
};

export const listOrgsSchema = {
  query: z.object({
    type: z.enum(Object.values(ORG_TYPES)).optional(),
    verificationStatus: z.enum(Object.values(ORG_VERIFICATION_STATES)).optional(),
    districtCode: z.string().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
};

export const verifyOrgSchema = {
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    action: z.enum(['verify', 'reject', 'activate', 'suspend']),
    reason: z.string().optional(),
  }),
};

export default { createOrgSchema, updateOrgSchema, orgIdParamsSchema, listOrgsSchema, verifyOrgSchema };
