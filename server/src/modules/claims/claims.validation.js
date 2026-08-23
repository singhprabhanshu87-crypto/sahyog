import { z } from 'zod';
import { CLAIM_STATUS } from './claims.constants.js';

export const createClaimSchema = {
  body: z.object({
    challengeId: z.string().min(1),
    orgId: z.string().min(1).optional(),
  }),
};

export const claimIdParamsSchema = {
  params: z.object({ id: z.string().min(1) }),
};

export const listClaimsSchema = {
  query: z.object({
    challengeId: z.string().optional(),
    orgId: z.string().optional(),
    status: z.enum(Object.values(CLAIM_STATUS)).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
};

export const releaseClaimSchema = {
  params: claimIdParamsSchema.params,
  body: z.object({
    reason: z.string().max(2000).optional(),
  }),
};

export default { createClaimSchema, claimIdParamsSchema, listClaimsSchema, releaseClaimSchema };
