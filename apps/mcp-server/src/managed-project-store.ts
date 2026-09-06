import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

import {
  managedProjectSummarySchema,
  workSessionSummarySchema,
  type ManagedProjectId,
  type ManagedProjectSummary,
  type WorkSessionSummary,
} from '@mcpapp/contracts';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-sqlite';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

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

export interface ManagedProjectStore {
  create(): ManagedProjectSummary;
  get(projectId: ManagedProjectId): ManagedProjectSummary | undefined;
  createWorkSession(
    projectId: ManagedProjectId,
  ): WorkSessionSummary | undefined;
  close(): void;
}

export async function openManagedProjectStore(
  databasePath: string,
): Promise<ManagedProjectStore> {
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
  `);
  const database = drizzle({ client: sqlite });

  return {
    create() {
      const project = managedProjectSummarySchema.parse({
        project_id: randomUUID(),
        status: 'draft',
      });
      database
        .insert(managedProjects)
        .values({ projectId: project.project_id, status: project.status })
        .run();
      return project;
    },
    get(projectId) {
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
    createWorkSession(projectId) {
      const project = database
        .select({ projectId: managedProjects.projectId })
        .from(managedProjects)
        .where(eq(managedProjects.projectId, projectId))
        .get();
      if (!project) return undefined;

      const workSession = workSessionSummarySchema.parse({
        work_session_id: randomUUID(),
        project_id: projectId,
        status: 'open',
      });
      database
        .insert(workSessions)
        .values({
          workSessionId: workSession.work_session_id,
          projectId: workSession.project_id,
          status: workSession.status,
        })
        .run();
      return workSession;
    },
    close() {
      sqlite.close();
    },
  };
}
