import './ai-gateway.mjs';
import { createServer as createViteServer } from 'vite';

const viteServer = await createViteServer({
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});

await viteServer.listen();
viteServer.printUrls();

function shutdown() {
  viteServer.close().finally(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
