import { connectDatabase, disconnectDatabase } from './config/database.js';
import config from './config/index.js';
import { initEventsModule } from './modules/events/events.module.js';
import { initTaxonomyModule } from './modules/taxonomy/taxonomy.module.js';
import { initGeoModule } from './modules/geo/geo.module.js';
import { initJobsModule } from './modules/jobs/jobs.module.js';
import { createWorkers } from './modules/jobs/lib/processors.js';
import { closeQueues } from './modules/jobs/lib/queues.js';
import logger from './common/lib/logger.js';

async function startWorker() {
  initEventsModule();
  initTaxonomyModule();
  initGeoModule();
  initJobsModule();

  await connectDatabase();

  const { workers, connection } = createWorkers();

  logger.info(
    {
      queues: ['intake', 'embedding', 'dedup', 'classification'],
      role: config.WORKER_ROLE,
    },
    'Sahyog worker started',
  );

  const shutdown = async (signal) => {
    logger.info({ signal }, 'Shutting down worker');

    for (const worker of workers) {
      await worker.close();
    }

    connection.disconnect();
    await closeQueues();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startWorker().catch((err) => {
  logger.fatal({ err }, 'Failed to start worker');
  process.exit(1);
});
