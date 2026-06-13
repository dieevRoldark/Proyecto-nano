import { createServer } from 'node:http';
import { config } from './src/config/env.js';
import { logger } from './src/utils/logger.js';
import { ensureDatabase, testConnection, closePool } from './src/config/db.js';
import { handleRequest } from './src/router/index.js';

const server = createServer((req, res) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info('Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${Date.now() - start}ms`,
    });
  });

  handleRequest(req, res).catch((err) => {
    logger.error('Unhandled error in handleRequest', {
      message: err?.message,
      stack: err?.stack,
    });
    if (!res.writableEnded) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
    }
  });
});

server.timeout = 30000;
server.keepAliveTimeout = 5000;
server.headersTimeout = 6000;

async function start() {
  try {
    if (process.env.DB_AUTO_MIGRATE === 'true') {
      await ensureDatabase();
    }
    await testConnection();
  } catch (err) {
    logger.error('Failed to start database', { message: err?.message });
    process.exit(1);
  }

  server.listen(config.port, () => {
    logger.info(`Server listening on port ${config.port}`);
  });
}

let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info(`Received ${signal}, shutting down gracefully...`);

  const forceTimer = setTimeout(() => {
    logger.error('Forced shutdown after 10s timeout');
    process.exit(1);
  }, 10000);
  forceTimer.unref();

  server.close(async () => {
    try {
      await closePool();
    } catch (err) {
      logger.error('Error closing pool', { message: err?.message });
    }
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { message: err?.message, stack: err?.stack });
});
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: String(reason) });
});

start();
