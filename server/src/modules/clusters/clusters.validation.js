import { z } from 'zod';
import { CLUSTER_STATUS } from './clusters.constants.js';

export const listClustersSchema = {
  query: z.object({
    status: z.enum(Object.values(CLUSTER_STATUS)).optional(),
    districtCode: z.string().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
};

export const clusterIdParamsSchema = {
  params: z.object({ id: z.string().min(1) }),
};

export default { listClustersSchema, clusterIdParamsSchema };
