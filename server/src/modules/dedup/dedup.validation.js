import { z } from 'zod';

export const dedupCheckSchema = {
  params: z.object({ submissionId: z.string().min(1) }),
};

export default { dedupCheckSchema };
