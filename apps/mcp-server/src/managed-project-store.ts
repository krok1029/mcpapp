import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

import {
  managedProjectSummarySchema,
  type ManagedProjectId,
  type ManagedProjectSummary,
} from '@mcpapp/contracts';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-sqlite';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

const managedProjects = sqliteTable('managed_projects', {
  projectId: text('project_id').primaryKey(),
  status: text('status').notNull(),
});

export interface ManagedProjectStore {
  create(): ManagedProjectSummary;
  get(projectId: ManagedProjectId): ManagedProjectSummary | undefined;
  close(): void;
}

export async function openManagedProjectStore(
  databasePath: string,
): Promise<ManagedProjectStore> {
  await mkdir(dirname(databasePath), { recursive: true });
  const sqlite = new DatabaseSync(databasePath);
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS managed_projects (
      project_id TEXT PRIMARY KEY NOT NULL,
      status TEXT NOT NULL
    )
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
    close() {
      sqlite.close();
    },
  };
}
