import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

import {
  queryRuntimeStatus,
  startMcpAppServer,
  type McpAppServer,
} from '../src/index.js';

const SERVER_URL = new URL('http://127.0.0.1:3100/mcp');
const WORKSPACE_DIRECTORY = fileURLToPath(new URL('..', import.meta.url));

function runDevelopmentCommand(): ChildProcessWithoutNullStreams {
  return spawn('yarn', ['dev'], {
    cwd: WORKSPACE_DIRECTORY,
    env: { ...process.env, FORCE_COLOR: '0' },
  });
}

async function waitForOutput(
  process: ChildProcessWithoutNullStreams,
  expected: string,
): Promise<void> {
  let output = '';

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timed out waiting for output. Received: ${output}`));
    }, 5_000);
    const inspect = (chunk: Buffer) => {
      output += chunk.toString();
      if (!output.includes(expected)) return;

      clearTimeout(timeout);
      process.stdout.off('data', inspect);
      process.stderr.off('data', inspect);
      resolve();
    };

    process.stdout.on('data', inspect);
    process.stderr.on('data', inspect);
  });
}

describe('McpApp Server development command', () => {
  let process: ChildProcessWithoutNullStreams | undefined;
  let occupyingServer: McpAppServer | undefined;

  afterEach(async () => {
    if (process?.exitCode === null) process.kill('SIGTERM');
    await occupyingServer?.close();
  });

  it('starts a foreground server that shuts down cleanly', async () => {
    process = runDevelopmentCommand();
    await waitForOutput(process, 'McpApp Server ready at');

    await expect(queryRuntimeStatus(SERVER_URL)).resolves.toMatchObject({
      availability: 'available',
    });

    process.kill('SIGTERM');
    const [exitCode] = (await once(process, 'exit')) as [number | null];
    expect(exitCode).toBe(0);
  });

  it('exits non-zero with a clear reason when startup fails', async () => {
    occupyingServer = await startMcpAppServer({ port: 3100 });
    process = runDevelopmentCommand();
    await waitForOutput(process, 'McpApp Server failed to start:');

    const [exitCode] = (await once(process, 'exit')) as [number | null];
    expect(exitCode).toBe(1);
  });
});
