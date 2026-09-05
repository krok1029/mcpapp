import { z } from 'zod';

export const runtimeStatusSchema = z.object({
  readiness: z.literal('ready'),
  version: z.string().min(1),
});

export type RuntimeStatus = z.infer<typeof runtimeStatusSchema>;
