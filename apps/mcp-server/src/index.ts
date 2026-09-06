import { readFile } from 'node:fs/promises';
import { createServer, type Server as HttpServer } from 'node:http';
import { isIPv4 } from 'node:net';
import { join } from 'node:path';

import {
  managedProjectIdSchema,
  managedProjectNotFoundSchema,
  managedProjectSummarySchema,
  runtimeStatusSchema,
  type ManagedProjectId,
  type ManagedProjectSummary,
  type RuntimeStatus,
} from '@mcpapp/contracts';
import {
  Client,
  StreamableHTTPClientTransport,
} from '@modelcontextprotocol/client';
import {
  localhostHostValidation,
  localhostOriginValidation,
  toNodeHandler,
} from '@modelcontextprotocol/node';
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

import {
  openManagedProjectStore,
  type ManagedProjectStore,
} from './managed-project-store.js';

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 3100;
const MCP_PATH = '/mcp';
const CLIENT_TIMEOUT_MS = 1_000;

function isLoopbackAddress(host: string): boolean {
  return host === '127.0.0.1' || host === '::1';
}

export interface McpAppServerOptions {
  host?: string;
  port?: number;
  databasePath?: string;
}

export interface McpAppServer {
  readonly url: URL;
  close(): Promise<void>;
}

export type RuntimeStatusQuery =
  | { availability: 'available'; status: RuntimeStatus }
  | { availability: 'unavailable'; reason: string };

function createRuntimeServer(
  version: string,
  projects: ManagedProjectStore,
): McpServer {
  const server = new McpServer({ name: 'mcpapp', version });
  const status: RuntimeStatus = { readiness: 'ready', version };

  server.registerTool(
    'runtime_status',
    {
      title: 'McpApp runtime status',
      description: 'Read the readiness and version of the McpApp Server.',
      outputSchema: runtimeStatusSchema,
      annotations: { readOnlyHint: true },
    },
    () => ({
      content: [{ type: 'text', text: JSON.stringify(status) }],
      structuredContent: status,
    }),
  );

  server.registerTool(
    'create_managed_project',
    {
      title: 'Create Managed Project draft',
      description: 'Create and persist a minimal Managed Project draft.',
      outputSchema: managedProjectSummarySchema,
    },
    () => {
      const project = projects.create();
      return {
        content: [{ type: 'text', text: JSON.stringify(project) }],
        structuredContent: project,
      };
    },
  );

  server.registerTool(
    'get_managed_project',
    {
      title: 'Get Managed Project',
      description: 'Read a persisted Managed Project summary.',
      inputSchema: z.object({ project_id: managedProjectIdSchema }),
      outputSchema: managedProjectSummarySchema,
      annotations: { readOnlyHint: true },
    },
    ({ project_id }) => {
      const project = projects.get(project_id);
      if (!project) {
        const error = {
          code: 'PROJECT_NOT_FOUND' as const,
          message: 'Managed Project not found' as const,
          project_id,
        };
        return {
          isError: true,
          content: [{ type: 'text', text: JSON.stringify(error) }],
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(project) }],
        structuredContent: project,
      };
    },
  );

  return server;
}

async function packageVersion(): Promise<string> {
  const contents = await readFile(
    new URL('../package.json', import.meta.url),
    'utf8',
  );
  const parsed = JSON.parse(contents) as { version?: unknown };

  if (typeof parsed.version !== 'string' || parsed.version.length === 0) {
    throw new Error('McpApp Server package version is missing');
  }

  return parsed.version;
}

function listen(server: HttpServer, port: number, host: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const onError = (error: Error) => {
      server.off('listening', onListening);
      reject(error);
    };
    const onListening = () => {
      server.off('error', onError);
      resolve();
    };

    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, host);
  });
}

function closeHttpServer(server: HttpServer): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

export async function startMcpAppServer(
  options: McpAppServerOptions = {},
): Promise<McpAppServer> {
  const host = options.host ?? DEFAULT_HOST;
  const port = options.port ?? DEFAULT_PORT;
  const databasePath =
    options.databasePath ?? join(process.cwd(), '.data', 'mcpapp.sqlite');
  if (!isLoopbackAddress(host)) {
    if (isIPv4(host) && host.startsWith('127.')) {
      throw new Error('McpApp Server must bind to 127.0.0.1 or ::1');
    }
    throw new Error('McpApp Server must bind to a loopback address');
  }

  const version = await packageVersion();
  const projects = await openManagedProjectStore(databasePath);
  const handler = createMcpHandler(() =>
    createRuntimeServer(version, projects),
  );
  const handleMcpRequest = toNodeHandler(handler);
  const validateHost = localhostHostValidation();
  const validateOrigin = localhostOriginValidation();

  const httpServer = createServer(async (request, response) => {
    if (request.url !== MCP_PATH) {
      response.writeHead(404).end('Not found');
      return;
    }
    if (
      !validateHost(request, response) ||
      !validateOrigin(request, response)
    ) {
      return;
    }

    try {
      await handleMcpRequest(request, response);
    } catch {
      if (!response.headersSent) response.writeHead(500);
      response.end('McpApp Server request failed');
    }
  });

  await listen(httpServer, port, host);
  const address = httpServer.address();
  if (!address || typeof address === 'string') {
    await closeHttpServer(httpServer);
    throw new Error('McpApp Server did not bind a TCP address');
  }

  const urlHost = host === '::1' ? `[${host}]` : host;
  const url = new URL(`http://${urlHost}:${address.port}${MCP_PATH}`);
  let closed = false;

  return {
    url,
    async close() {
      if (closed) return;
      closed = true;
      await handler.close();
      await closeHttpServer(httpServer);
      projects.close();
    },
  };
}

async function callManagedProjectTool(
  url: URL,
  name: 'create_managed_project' | 'get_managed_project',
  arguments_: Record<string, unknown>,
): Promise<ManagedProjectSummary> {
  const client = new Client({
    name: 'mcpapp-managed-project-client',
    version: '0.0.0',
  });
  const transport = new StreamableHTTPClientTransport(url);

  try {
    await client.connect(transport, { timeout: CLIENT_TIMEOUT_MS });
    const result = await client.callTool(
      { name, arguments: arguments_ },
      { timeout: CLIENT_TIMEOUT_MS },
    );
    if (result.isError) {
      const content = result.content.find((item) => item.type === 'text');
      const error = managedProjectNotFoundSchema.parse(
        content?.type === 'text' ? JSON.parse(content.text) : undefined,
      );
      throw new Error(`${error.code}: ${error.message}`);
    }
    return managedProjectSummarySchema.parse(result.structuredContent);
  } finally {
    await client.close();
  }
}

export function createManagedProject(url: URL): Promise<ManagedProjectSummary> {
  return callManagedProjectTool(url, 'create_managed_project', {});
}

export function getManagedProject(
  url: URL,
  projectId: ManagedProjectId,
): Promise<ManagedProjectSummary> {
  return callManagedProjectTool(url, 'get_managed_project', {
    project_id: projectId,
  });
}

export async function queryRuntimeStatus(
  url: URL,
): Promise<RuntimeStatusQuery> {
  const client = new Client({
    name: 'mcpapp-runtime-client',
    version: '0.0.0',
  });
  const transport = new StreamableHTTPClientTransport(url);

  try {
    await client.connect(transport, { timeout: CLIENT_TIMEOUT_MS });
    const result = await client.callTool(
      { name: 'runtime_status', arguments: {} },
      { timeout: CLIENT_TIMEOUT_MS },
    );
    const status = runtimeStatusSchema.parse(result.structuredContent);
    return { availability: 'available', status };
  } catch (error) {
    const detail = error instanceof Error ? `: ${error.message}` : '';
    return {
      availability: 'unavailable',
      reason: `McpApp Server is unavailable${detail}`,
    };
  } finally {
    await client.close();
  }
}
