import { z } from 'zod';
import { BOARD_ITEM_TYPES } from './projects.constants.js';

export const createProjectSchema = {
  body: z.object({
    challengeId: z.string().min(1),
    teamId: z.string().optional(),
    orgId: z.string().optional(),
    title: z.string().min(3).max(300),
    description: z.string().max(10000).optional(),
    trlTarget: z.number().int().min(1).max(9).optional(),
    srlTarget: z.number().int().min(1).max(9).optional(),
    claimId: z.string().optional(),
    boardItems: z.array(z.object({
      type: z.enum(Object.values(BOARD_ITEM_TYPES)).optional(),
      title: z.string().min(1),
      status: z.string().optional(),
    })).optional(),
  }),
};

export const projectIdParamsSchema = {
  params: z.object({ id: z.string().min(1) }),
};

export default { createProjectSchema, projectIdParamsSchema };
