import { startMcpAppServer } from '../../src/index.js';

const databasePath = process.argv[2];
if (!databasePath) throw new Error('A temporary database path is required');

const server = await startMcpAppServer({ port: 0, databasePath });

process.once('SIGTERM', async () => {
  await server.close();
  process.disconnect();
});

process.send?.({ url: server.url.href });
