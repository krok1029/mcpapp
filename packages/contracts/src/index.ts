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

export const approvalGateSchema = z.enum([
  'spec',
  'repository_creation',
  'ticket',
  'commit',
  'change',
  'pr_publication',
]);

export const evidenceMetadataSummarySchema = z.object({
  evidence_id: z.uuid().brand<'EvidenceId'>(),
  summary: z.string().min(1),
});

export const resumeContextSchema = z.object({
  project_id: managedProjectIdSchema,
  work_session_id: workSessionIdSchema,
  workflow_state: z.literal('draft'),
  last_successful_step: z.string().min(1).nullable(),
  pending_approval_gates: z.array(approvalGateSchema),
  evidence_metadata: z.array(evidenceMetadataSummarySchema),
});

export type ResumeContext = z.infer<typeof resumeContextSchema>;

export const workSessionResumeSchema = workSessionSummarySchema.extend({
  resume_context: resumeContextSchema,
});

export type WorkSessionResume = z.infer<typeof workSessionResumeSchema>;

export const persistedStateInvalidSchema = z.object({
  code: z.literal('PERSISTED_STATE_INVALID'),
  message: z.literal(
    'Managed Project has incomplete or invalid persisted state',
  ),
  project_id: managedProjectIdSchema,
  recovery_action: z.literal(
    'Stop work and inspect or restore the project data from a verified backup before retrying.',
  ),
});

export const projectToolErrorSchema = z.union([
  managedProjectNotFoundSchema,
  persistedStateInvalidSchema,
]);
