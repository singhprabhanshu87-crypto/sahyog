import { z } from 'zod';

const axisEntrySchema = z.object({
  code: z.string().min(1),
  label: z.string().optional(),
  weight: z.number().min(0).max(1).optional(),
  source: z.enum(['self_declared', 'enriched', 'verified']).optional(),
});

export const orgIdParamsSchema = {
  params: z.object({ orgId: z.string().min(1) }),
};

export const upsertProfileSchema = {
  params: orgIdParamsSchema.params,
  body: z.object({
    axes: z
      .object({
        topics: z.array(axisEntrySchema).optional(),
        methodologies: z.array(axisEntrySchema).optional(),
        applications: z.array(axisEntrySchema).optional(),
        facilities: z.array(axisEntrySchema).optional(),
        capacity: z
          .object({
            maxConcurrentChallenges: z.number().int().min(0).optional(),
            currentLoad: z.number().int().min(0).optional(),
            notes: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    selfDeclaration: z
      .object({
        summary: z.string().max(5000).optional(),
        strengths: z.array(z.string()).optional(),
        limitations: z.array(z.string()).optional(),
      })
      .optional(),
    enrichment: z
      .object({
        extractedTopics: z.array(z.string()).optional(),
        inferredMethodologies: z.array(z.string()).optional(),
        confidence: z.number().min(0).max(1).optional(),
        modelVersion: z.string().optional(),
      })
      .optional(),
    coiFlags: z.array(z.string()).optional(),
  }),
};

export const patchProfileSchema = {
  params: orgIdParamsSchema.params,
  body: upsertProfileSchema.body.partial(),
};

export default { orgIdParamsSchema, upsertProfileSchema, patchProfileSchema };
