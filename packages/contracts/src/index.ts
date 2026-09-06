import { z } from 'zod';

export const runtimeStatusSchema = z.object({
  readiness: z.literal('ready'),
  version: z.string().min(1),
});

export type RuntimeStatus = z.infer<typeof runtimeStatusSchema>;

export const managedProjectIdSchema = z.uuid().brand<'ManagedProjectId'>();

export type ManagedProjectId = z.infer<typeof managedProjectIdSchema>;

export const managedProjectSummarySchema = z.object({
  project_id: managedProjectIdSchema,
  status: z.literal('draft'),
});

export type ManagedProjectSummary = z.infer<typeof managedProjectSummarySchema>;

export const managedProjectNotFoundSchema = z.object({
  code: z.literal('PROJECT_NOT_FOUND'),
  message: z.literal('Managed Project not found'),
  project_id: managedProjectIdSchema,
});

export const workSessionIdSchema = z.uuid().brand<'WorkSessionId'>();

export type WorkSessionId = z.infer<typeof workSessionIdSchema>;

export const workSessionSummarySchema = z.object({
  work_session_id: workSessionIdSchema,
  project_id: managedProjectIdSchema,
  status: z.literal('open'),
});

export type WorkSessionSummary = z.infer<typeof workSessionSummarySchema>;
