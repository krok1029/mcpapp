import { afterEach, describe, expect, it } from 'vitest';

import {
  queryRuntimeStatus,
  startMcpAppServer,
  type McpAppServer,
} from '../src/index.js';

describe('McpApp Server Streamable HTTP contract', () => {
  let server: McpAppServer | undefined;

  afterEach(async () => {
    await server?.close();
  });

  it('reports readiness while running and unavailable after shutdown', async () => {
    server = await startMcpAppServer({ port: 0 });

    await expect(queryRuntimeStatus(server.url)).resolves.toEqual({
      availability: 'available',
      status: {
        readiness: 'ready',
        version: '0.0.0',
      },
    });

    const stoppedUrl = server.url;
    await server.close();
    server = undefined;

    await expect(queryRuntimeStatus(stoppedUrl)).resolves.toMatchObject({
      availability: 'unavailable',
      reason: expect.stringContaining('McpApp Server is unavailable'),
    });
  });

  it('rejects a non-loopback bind address', async () => {
    await expect(
      startMcpAppServer({ host: '0.0.0.0', port: 0 }),
    ).rejects.toThrow('must bind to a loopback address');
  });

  it('rejects a loopback address unsupported by the request guards', async () => {
    await expect(
      startMcpAppServer({ host: '127.0.0.2', port: 0 }),
    ).rejects.toThrow('must bind to 127.0.0.1 or ::1');
  });
});
