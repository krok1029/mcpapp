import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { managedProjectIdSchema } from '@mcpapp/contracts';

import {
  createManagedProject,
  getManagedProject,
  startMcpAppServer,
  type McpAppServer,
} from '../src/index.js';

describe('Managed Project Streamable HTTP contract', () => {
  let dataDirectory: string | undefined;
  let server: McpAppServer | undefined;

  async function startServer(databasePath?: string) {
    dataDirectory ??= await mkdtemp(join(tmpdir(), 'mcpapp-project-'));
    const resolvedDatabasePath =
      databasePath ?? join(dataDirectory, 'mcpapp.sqlite');
    server = await startMcpAppServer({
      port: 0,
      databasePath: resolvedDatabasePath,
    });
    return { databasePath: resolvedDatabasePath, server };
  }

  afterEach(async () => {
    await server?.close();
    if (dataDirectory) await rm(dataDirectory, { recursive: true });
  });

  it('creates a draft that can be read by its stable identity', async () => {
    const { server: runningServer } = await startServer();

    const created = await createManagedProject(runningServer.url);

    await expect(
      getManagedProject(runningServer.url, created.project_id),
    ).resolves.toEqual(created);
  });

  it('returns a domain error when the Managed Project does not exist', async () => {
    const { server: runningServer } = await startServer();
    const missingProjectId = managedProjectIdSchema.parse(
      '00000000-0000-4000-8000-000000000000',
    );

    await expect(
      getManagedProject(runningServer.url, missingProjectId),
    ).rejects.toThrow('PROJECT_NOT_FOUND: Managed Project not found');
  });

  it('reads the same draft after the Server restarts', async () => {
    const { databasePath, server: runningServer } = await startServer();
    const created = await createManagedProject(runningServer.url);

    await runningServer.close();
    const { server: restartedServer } = await startServer(databasePath);

    await expect(
      getManagedProject(restartedServer.url, created.project_id),
    ).resolves.toEqual(created);
  });

  it('does not reuse a Managed Project identity', async () => {
    const { server: runningServer } = await startServer();

    const first = await createManagedProject(runningServer.url);
    const second = await createManagedProject(runningServer.url);

    expect(second.project_id).not.toBe(first.project_id);
  });
});
