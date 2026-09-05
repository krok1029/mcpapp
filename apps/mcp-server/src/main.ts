import { startMcpAppServer } from './index.js';

async function main(): Promise<void> {
  try {
    const server = await startMcpAppServer();
    process.stdout.write(`McpApp Server ready at ${server.url.href}\n`);

    const shutdown = async () => {
      await server.close();
      process.exitCode = 0;
    };

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    process.stderr.write(`McpApp Server failed to start: ${reason}\n`);
    process.exitCode = 1;
  }
}

await main();
