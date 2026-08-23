import { z } from 'zod';
import { SUBMISSION_TYPES, SUBMISSION_CHANNELS } from './submissions.constants.js';

const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const createSubmissionSchema = {
  body: z.object({
    text: z.string().max(10000).optional(),
    voiceMediaId: z.string().optional(),
    mediaRefs: z.array(z.string()).optional().default([]),
    location: locationSchema.optional(),
    consentGiven: z.literal(true, {
      errorMap: () => ({ message: 'Consent must be explicitly given' }),
    }),
    submissionType: z.enum(Object.values(SUBMISSION_TYPES)).optional().default(SUBMISSION_TYPES.DIRECT),
    channel: z.enum(Object.values(SUBMISSION_CHANNELS)).optional().default(SUBMISSION_CHANNELS.WEB),
    originatorId: z.string().optional(),
    locale: z.string().optional(),
  }).refine((data) => data.text || data.voiceMediaId, {
    message: 'Either text or voiceMediaId is required',
  }),
};

export const trackingIdParamsSchema = {
  params: z.object({ trackingId: z.string().min(6) }),
};

export const listSubmissionsSchema = {
  query: z.object({
    status: z.string().optional(),
    districtCode: z.string().optional(),
    clusterId: z.string().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
};

export default { createSubmissionSchema, trackingIdParamsSchema, listSubmissionsSchema };
