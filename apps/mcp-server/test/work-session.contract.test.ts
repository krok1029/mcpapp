import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { managedProjectIdSchema } from '@mcpapp/contracts';

import {
  beginOrResumeWork,
  createManagedProject,
  startMcpAppServer,
  type McpAppServer,
} from '../src/index.js';

describe('Work Session Streamable HTTP contract', () => {
  let dataDirectory: string | undefined;
  let server: McpAppServer | undefined;

  afterEach(async () => {
    await server?.close();
    if (dataDirectory) await rm(dataDirectory, { recursive: true });
  });

  it('begins an Open Work Session for an existing Managed Project', async () => {
    dataDirectory = await mkdtemp(join(tmpdir(), 'mcpapp-work-session-'));
    server = await startMcpAppServer({
      port: 0,
      databasePath: join(dataDirectory, 'mcpapp.sqlite'),
    });
    const project = await createManagedProject(server.url);

    const workSession = await beginOrResumeWork(server.url, project.project_id);

    expect(workSession).toEqual({
      work_session_id: expect.any(String),
      project_id: project.project_id,
      status: 'open',
    });
  });

  it('does not begin a Work Session for a missing Managed Project', async () => {
    dataDirectory = await mkdtemp(join(tmpdir(), 'mcpapp-work-session-'));
    server = await startMcpAppServer({
      port: 0,
      databasePath: join(dataDirectory, 'mcpapp.sqlite'),
    });
    const missingProjectId = managedProjectIdSchema.parse(
      '00000000-0000-4000-8000-000000000000',
    );

    await expect(
      beginOrResumeWork(server.url, missingProjectId),
    ).rejects.toThrow('PROJECT_NOT_FOUND: Managed Project not found');
  });

  it('does not create a second Open Work Session for the same Managed Project', async () => {
    dataDirectory = await mkdtemp(join(tmpdir(), 'mcpapp-work-session-'));
    server = await startMcpAppServer({
      port: 0,
      databasePath: join(dataDirectory, 'mcpapp.sqlite'),
    });
    const project = await createManagedProject(server.url);
    const first = await beginOrResumeWork(server.url, project.project_id);

    const resumed = await beginOrResumeWork(server.url, project.project_id);

    expect(resumed).toEqual(first);
  });
});
