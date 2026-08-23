import { z } from 'zod';

export const forwardGrievanceSchema = {
  body: z.object({
    challengeId: z.string().min(1).optional(),
    disputeId: z.string().min(1).optional(),
    subject: z.string().min(3).max(300),
    description: z.string().min(10).max(10000),
    districtCode: z.string().optional(),
    contactPhone: z.string().optional(),
    contactEmail: z.string().email().optional(),
  }),
};

export default { forwardGrievanceSchema };
