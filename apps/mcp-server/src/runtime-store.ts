import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

import {
  managedProjectSummarySchema,
  workSessionSummarySchema,
  workSessionResumeSchema,
  type ManagedProjectId,
  type ManagedProjectSummary,
  type WorkSessionResume,
} from '@mcpapp/contracts';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-sqlite';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { ZodError } from 'zod';

const managedProjects = sqliteTable('managed_projects', {
  projectId: text('project_id').primaryKey(),
  status: text('status').notNull(),
});

const workSessions = sqliteTable('work_sessions', {
  workSessionId: text('work_session_id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => managedProjects.projectId),
  status: text('status').notNull(),
});

const projectWorkflowState = sqliteTable('project_workflow_state', {
  projectId: text('project_id')
    .primaryKey()
    .references(() => managedProjects.projectId),
  workSessionId: text('work_session_id').references(
    () => workSessions.workSessionId,
  ),
  lastSuccessfulStep: text('last_successful_step'),
  pendingApprovalGates: text('pending_approval_gates').notNull(),
  evidenceMetadata: text('evidence_metadata').notNull(),
});

export class PersistedStateError extends Error {
  constructor() {
    super('Managed Project has incomplete or invalid persisted state');
    this.name = 'PersistedStateError';
  }
}

export interface RuntimeStore {
  createManagedProject(): ManagedProjectSummary;
  getManagedProject(
    projectId: ManagedProjectId,
  ): ManagedProjectSummary | undefined;
  beginOrResumeWork(projectId: ManagedProjectId): WorkSessionResume | undefined;
  close(): void;
}

function migrateWorkflowState(sqlite: DatabaseSync): void {
  const version = sqlite.prepare('PRAGMA user_version').get()?.user_version;
  if (version === 1) return;
  if (version !== 0) throw new Error('Unsupported McpApp database version');

  sqlite.exec('BEGIN');
  try {
    sqlite.exec(`
      CREATE TABLE project_workflow_state (
        project_id TEXT PRIMARY KEY NOT NULL REFERENCES managed_projects(project_id),
        work_session_id TEXT REFERENCES work_sessions(work_session_id),
        last_successful_step TEXT,
        pending_approval_gates TEXT NOT NULL,
        evidence_metadata TEXT NOT NULL
      );

      INSERT INTO project_workflow_state
        (project_id, work_session_id, last_successful_step, pending_approval_gates, evidence_metadata)
        SELECT project.project_id, session.work_session_id, NULL, '[]', '[]'
        FROM managed_projects AS project
        LEFT JOIN work_sessions AS session
          ON session.project_id = project.project_id AND session.status = 'open';

      PRAGMA user_version = 1;
    `);
    sqlite.exec('COMMIT');
  } catch (error) {
    sqlite.exec('ROLLBACK');
    throw error;
  }
}

export async function openRuntimeStore(
  databasePath: string,
): Promise<RuntimeStore> {
  await mkdir(dirname(databasePath), { recursive: true });
  const sqlite = new DatabaseSync(databasePath);
  sqlite.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS managed_projects (
      project_id TEXT PRIMARY KEY NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS work_sessions (
      work_session_id TEXT PRIMARY KEY NOT NULL,
      project_id TEXT NOT NULL REFERENCES managed_projects(project_id),
      status TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS work_sessions_one_open_per_project
      ON work_sessions(project_id)
      WHERE status = 'open';
  `);
  try {
    migrateWorkflowState(sqlite);
  } catch (error) {
    sqlite.close();
    throw error;
  }
  const database = drizzle({ client: sqlite });

  return {
    createManagedProject() {
      const project = managedProjectSummarySchema.parse({
        project_id: randomUUID(),
        status: 'draft',
      });
      return database.transaction((transaction) => {
        transaction
          .insert(managedProjects)
          .values({ projectId: project.project_id, status: project.status })
          .run();
        transaction
          .insert(projectWorkflowState)
          .values({
            projectId: project.project_id,
            workSessionId: null,
            lastSuccessfulStep: 'create_managed_project',
            pendingApprovalGates: '[]',
            evidenceMetadata: '[]',
          })
          .run();
        return project;
      });
    },
    getManagedProject(projectId) {
      const row = database
        .select()
        .from(managedProjects)
        .where(eq(managedProjects.projectId, projectId))
        .get();
      if (!row) return undefined;
      return managedProjectSummarySchema.parse({
        project_id: row.projectId,
        status: row.status,
      });
    },
    beginOrResumeWork(projectId) {
      try {
        return database.transaction((transaction) => {
          const project = transaction
            .select()
            .from(managedProjects)
            .where(eq(managedProjects.projectId, projectId))
            .get();
          if (!project) return undefined;

          const state = transaction
            .select()
            .from(projectWorkflowState)
            .where(eq(projectWorkflowState.projectId, projectId))
            .get();
          if (!state) throw new PersistedStateError();

          const sessions = transaction
            .select()
            .from(workSessions)
            .where(eq(workSessions.projectId, projectId))
            .all();
          if (
            sessions.length > 1 ||
            sessions.some((session) => session.status !== 'open')
          ) {
            throw new PersistedStateError();
          }
          const openWorkSession = sessions[0];
          if (
            state.workSessionId !== (openWorkSession?.workSessionId ?? null)
          ) {
            throw new PersistedStateError();
          }
          const workSession = openWorkSession
            ? workSessionSummarySchema.parse({
                work_session_id: openWorkSession.workSessionId,
                project_id: openWorkSession.projectId,
                status: openWorkSession.status,
              })
            : workSessionSummarySchema.parse({
                work_session_id: randomUUID(),
                project_id: projectId,
                status: 'open',
              });
          if (!openWorkSession) {
            transaction
              .insert(workSessions)
              .values({
                workSessionId: workSession.work_session_id,
                projectId: workSession.project_id,
                status: workSession.status,
              })
              .run();
            transaction
              .update(projectWorkflowState)
              .set({
                workSessionId: workSession.work_session_id,
                lastSuccessfulStep: 'begin_or_resume_work',
              })
              .where(eq(projectWorkflowState.projectId, projectId))
              .run();
          }
          return workSessionResumeSchema.parse({
            ...workSession,
            resume_context: {
              project_id: projectId,
              work_session_id: workSession.work_session_id,
              workflow_state: project.status,
              last_successful_step: openWorkSession
                ? state.lastSuccessfulStep
                : 'begin_or_resume_work',
              pending_approval_gates: JSON.parse(state.pendingApprovalGates),
              evidence_metadata: JSON.parse(state.evidenceMetadata),
            },
          });
        });
      } catch (error) {
        if (error instanceof SyntaxError || error instanceof ZodError) {
          throw new PersistedStateError();
        }
        throw error;
      }
    },
    close() {
      sqlite.close();
    },
  };
}
