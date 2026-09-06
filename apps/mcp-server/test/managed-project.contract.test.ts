import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  createManagedProject,
  getManagedProject,
  startMcpAppServer,
  type McpAppServer,
} from '../src/index.js';

describe('Managed Project Streamable HTTP contract', () => {
  let dataDirectory: string | undefined;
  let server: McpAppServer | undefined;

  afterEach(async () => {
    await server?.close();
    if (dataDirectory) await rm(dataDirectory, { recursive: true });
  });

  it('creates a draft that can be read by its stable identity', async () => {
    dataDirectory = await mkdtemp(join(tmpdir(), 'mcpapp-project-'));
    server = await startMcpAppServer({
      port: 0,
      databasePath: join(dataDirectory, 'mcpapp.sqlite'),
    });

    const created = await createManagedProject(server.url);

    await expect(
      getManagedProject(server.url, created.project_id),
    ).resolves.toEqual(created);
  });

  it('returns a domain error when the Managed Project does not exist', async () => {
    dataDirectory = await mkdtemp(join(tmpdir(), 'mcpapp-project-'));
    server = await startMcpAppServer({
      port: 0,
      databasePath: join(dataDirectory, 'mcpapp.sqlite'),
    });

    await expect(
      getManagedProject(server.url, '00000000-0000-4000-8000-000000000000'),
    ).rejects.toThrow('PROJECT_NOT_FOUND: Managed Project not found');
  });

  it('reads the same draft after the Server restarts', async () => {
    dataDirectory = await mkdtemp(join(tmpdir(), 'mcpapp-project-'));
    const databasePath = join(dataDirectory, 'mcpapp.sqlite');
    server = await startMcpAppServer({ port: 0, databasePath });
    const created = await createManagedProject(server.url);

    await server.close();
    server = await startMcpAppServer({ port: 0, databasePath });

    await expect(
      getManagedProject(server.url, created.project_id),
    ).resolves.toEqual(created);
  });

  it('does not reuse a Managed Project identity', async () => {
    dataDirectory = await mkdtemp(join(tmpdir(), 'mcpapp-project-'));
    server = await startMcpAppServer({
      port: 0,
      databasePath: join(dataDirectory, 'mcpapp.sqlite'),
    });

    const first = await createManagedProject(server.url);
    const second = await createManagedProject(server.url);

    expect(second.project_id).not.toBe(first.project_id);
  });
});
