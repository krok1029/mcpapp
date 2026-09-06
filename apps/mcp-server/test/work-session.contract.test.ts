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

  async function startServer() {
    dataDirectory = await mkdtemp(join(tmpdir(), 'mcpapp-work-session-'));
    server = await startMcpAppServer({
      port: 0,
      databasePath: join(dataDirectory, 'mcpapp.sqlite'),
    });
    return server;
  }

  afterEach(async () => {
    await server?.close();
    if (dataDirectory) await rm(dataDirectory, { recursive: true });
  });

  it('begins an Open Work Session for an existing Managed Project', async () => {
    const runningServer = await startServer();
    const project = await createManagedProject(runningServer.url);

    const workSession = await beginOrResumeWork(
      runningServer.url,
      project.project_id,
    );

    expect(workSession).toEqual({
      work_session_id: expect.any(String),
      project_id: project.project_id,
      status: 'open',
    });
  });

  it('does not begin a Work Session for a missing Managed Project', async () => {
    const runningServer = await startServer();
    const missingProjectId = managedProjectIdSchema.parse(
      '00000000-0000-4000-8000-000000000000',
    );

    await expect(
      beginOrResumeWork(runningServer.url, missingProjectId),
    ).rejects.toThrow('PROJECT_NOT_FOUND: Managed Project not found');
  });

  it('does not create a second Open Work Session for the same Managed Project', async () => {
    const runningServer = await startServer();
    const project = await createManagedProject(runningServer.url);
    const first = await beginOrResumeWork(
      runningServer.url,
      project.project_id,
    );

    const resumed = await beginOrResumeWork(
      runningServer.url,
      project.project_id,
    );

    expect(resumed).toEqual(first);
  });
});
