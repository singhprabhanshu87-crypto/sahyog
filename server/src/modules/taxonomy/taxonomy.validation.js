import { z } from 'zod';

export const listDomainsSchema = {
  query: z.object({
    version: z.string().optional(),
  }),
};

export const getTaxonomySchema = {
  query: z.object({
    version: z.string().optional(),
  }),
};

export default { listDomainsSchema, getTaxonomySchema };
