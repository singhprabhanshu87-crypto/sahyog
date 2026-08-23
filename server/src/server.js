import config from './config/index.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { createApp } from './app.js';
import logger from './common/lib/logger.js';

async function start() {
  await connectDatabase();

  const app = createApp();
  const server = app.listen(config.PORT, () => {
    logger.info(
      { port: config.PORT, env: config.NODE_ENV, role: config.WORKER_ROLE },
      'Sahyog API server started',
    );
  });

  const shutdown = async (signal) => {
    logger.info({ signal }, 'Shutting down API server');
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  logger.fatal({ err }, 'Failed to start API server');
  process.exit(1);
});
