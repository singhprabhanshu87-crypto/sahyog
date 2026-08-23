import { z } from 'zod';
import { SIGNER_ROLES } from './agreements.constants.js';

export const createAgreementSchema = {
  body: z.object({
    challengeId: z.string().min(1),
    projectId: z.string().optional(),
    teamId: z.string().optional(),
    ipTerms: z.object({
      ownership: z.string().optional(),
      commercialUse: z.boolean().optional(),
      attributionRequired: z.boolean().optional(),
      termsText: z.string().max(10000).optional(),
    }).optional(),
    requiredSigners: z.array(z.enum(Object.values(SIGNER_ROLES))).optional(),
    blocksIndustryUntilSigned: z.boolean().optional(),
  }),
};

export const agreementIdParamsSchema = {
  params: z.object({ id: z.string().min(1) }),
};

export const signAgreementSchema = {
  params: agreementIdParamsSchema.params,
  body: z.object({
    role: z.enum(Object.values(SIGNER_ROLES)),
    signatureRef: z.string().optional(),
  }),
};

export default { createAgreementSchema, agreementIdParamsSchema, signAgreementSchema };
