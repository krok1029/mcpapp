import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  workSessionSummarySchema,
  type ManagedProjectId,
} from '@mcpapp/contracts';
import {
  Client,
  StreamableHTTPClientTransport,
} from '@modelcontextprotocol/client';

import {
  createManagedProject,
  startMcpAppServer,
  type McpAppServer,
} from '../src/index.js';

describe('Work Session resumption across Streamable HTTP Clients', () => {
  let dataDirectory: string | undefined;
  let server: McpAppServer;
  let clients: Client[];

  beforeEach(async () => {
    clients = [];
    dataDirectory = await mkdtemp(join(tmpdir(), 'mcpapp-work-resume-'));
    server = await startMcpAppServer({
      port: 0,
      databasePath: join(dataDirectory, 'mcpapp.sqlite'),
    });
  });

  afterEach(async () => {
    try {
      await Promise.all(clients.map((client) => client.close()));
    } finally {
      try {
        await server?.close();
      } finally {
        if (dataDirectory) await rm(dataDirectory, { recursive: true });
      }
    }
  });

  async function connectClient(name: string, headers?: Record<string, string>) {
    const client = new Client({ name, version: '0.0.0' });
    clients.push(client);
    const transport = new StreamableHTTPClientTransport(server.url, {
      requestInit: { headers },
    });
    await client.connect(transport, { timeout: 1_000 });
    return { client, transport };
  }

  async function beginOrResume(client: Client, projectId: ManagedProjectId) {
    const result = await client.callTool(
      {
        name: 'begin_or_resume_work',
        arguments: { project_id: projectId },
      },
      { timeout: 1_000 },
    );
    expect(result.isError).not.toBe(true);
    return workSessionSummarySchema.parse(result.structuredContent);
  }

  it('resumes the same Open Work Session on repeated calls from one connected Client', async () => {
    // GIVEN: One connected Client has begun work on a Managed Project.
    const project = await createManagedProject(server.url);
    const { client } = await connectClient('local-host');
    const first = await beginOrResume(client, project.project_id);

    // WHEN: The same Client asks to resume work without disconnecting.
    const resumed = await beginOrResume(client, project.project_id);

    // THEN: It receives the original handle and the Work Session remains Open.
    expect(resumed).toEqual(first);
    expect(resumed.project_id).toBe(project.project_id);
    expect(resumed.status).toBe('open');
  });

  it('resumes the same Open Work Session after the Client reconnects over a new HTTP transport', async () => {
    // GIVEN: A Client has begun work and its HTTP transport has disconnected.
    const project = await createManagedProject(server.url);
    const { client, transport } = await connectClient('local-host', {
      Connection: 'close',
    });
    const first = await beginOrResume(client, project.project_id);
    await transport.close();
    await client.connect(new StreamableHTTPClientTransport(server.url), {
      timeout: 1_000,
    });

    // WHEN: The reconnected Client asks to resume work.
    const resumed = await beginOrResume(client, project.project_id);

    // THEN: Disconnecting the transport did not close or replace the Work Session.
    expect(resumed).toEqual(first);
  });

  it('shares the Open Work Session with a second local Client with different metadata', async () => {
    // GIVEN: One Host has begun work and remains connected.
    const project = await createManagedProject(server.url);
    const { client: host } = await connectClient('local-host');
    const first = await beginOrResume(host, project.project_id);
    const { client: consoleClient } = await connectClient('project-console');

    // WHEN: A second local Client asks to resume the same Managed Project.
    const resumed = await beginOrResume(consoleClient, project.project_id);

    // THEN: Different Client metadata does not create a separate Work Session.
    expect(resumed).toEqual(first);
  });

  it.each(['local-host', 'project-console'])(
    'keeps the Work Session Open when %s closes and a replacement Client connects',
    async (clientName) => {
      // GIVEN: The Host or Console Client has closed after beginning work.
      const project = await createManagedProject(server.url);
      const { client: original } = await connectClient(clientName);
      const first = await beginOrResume(original, project.project_id);
      await original.close();
      const { client: replacement } = await connectClient(clientName);

      // WHEN: A new Client instance resumes work after a conversation end or reload.
      const resumed = await beginOrResume(replacement, project.project_id);

      // THEN: Closing the original Client did not close the Work Session.
      expect(resumed).toEqual(first);
    },
  );

  it('keeps legacy HTTP session IDs separate from the Work Session handle', async () => {
    // GIVEN: A Client sends a legacy transport session ID while beginning work.
    const project = await createManagedProject(server.url);
    const headers = { 'Mcp-Session-Id': randomUUID() };
    const originalTransportId = headers['Mcp-Session-Id'];
    const { client } = await connectClient('legacy-local-host', headers);
    const first = await beginOrResume(client, project.project_id);
    headers['Mcp-Session-Id'] = randomUUID();

    // WHEN: The Client asks to resume with a different HTTP transport session ID.
    const resumed = await beginOrResume(client, project.project_id);

    // THEN: Transport IDs neither identify nor replace the authoritative Work Session.
    expect(resumed).toEqual(first);
    expect(resumed.work_session_id).not.toBe(originalTransportId);
    expect(resumed.work_session_id).not.toBe(headers['Mcp-Session-Id']);
  });
});
