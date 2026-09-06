import { z } from 'zod';

export const runtimeStatusSchema = z.object({
  readiness: z.literal('ready'),
  version: z.string().min(1),
});

export type RuntimeStatus = z.infer<typeof runtimeStatusSchema>;

export const managedProjectSummarySchema = z.object({
  project_id: z.uuid(),
  status: z.literal('draft'),
});

export type ManagedProjectSummary = z.infer<typeof managedProjectSummarySchema>;

export const managedProjectNotFoundSchema = z.object({
  code: z.literal('PROJECT_NOT_FOUND'),
  message: z.literal('Managed Project not found'),
  project_id: z.uuid(),
});
