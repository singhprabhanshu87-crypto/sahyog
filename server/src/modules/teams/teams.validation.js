import { z } from 'zod';
import { TEAM_ROLES } from './teams.constants.js';

const memberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(Object.values(TEAM_ROLES)),
  orgId: z.string().optional(),
});

export const createTeamSchema = {
  body: z.object({
    challengeId: z.string().min(1),
    orgId: z.string().min(1).optional(),
    name: z.string().max(200).optional(),
    members: z.array(memberSchema).min(1),
  }),
};

export const teamIdParamsSchema = {
  params: z.object({ id: z.string().min(1) }),
};

export const patchMembersSchema = {
  params: teamIdParamsSchema.params,
  body: z.object({
    members: z.array(memberSchema).min(1),
  }),
};

export default { createTeamSchema, teamIdParamsSchema, patchMembersSchema };
