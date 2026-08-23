import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import config from '../../../config/index.js';
import logger from '../../../common/lib/logger.js';
import { QUEUE_NAMES, JOB_NAMES } from '../jobs.constants.js';
import {
  enqueueEmbedding,
  enqueueDedup,
  enqueueClassification,
} from './queues.js';
import * as jobsService from '../jobs.service.js';
import * as submissionsService from '../../submissions/submissions.service.js';
import * as languageService from '../../language/language.service.js';
import * as aiService from '../../ai/ai.service.js';
import * as dedupService from '../../dedup/dedup.service.js';
import * as classificationService from '../../classification/classification.service.js';
import { CLUSTER_STATUS } from '../../clusters/clusters.constants.js';
import * as clustersService from '../../clusters/clusters.service.js';

function createRedisConnection() {
  return new IORedis(config.REDIS_URL, {
    maxRetriesPerRequest: null,
    ...(config.REDIS_TLS && { tls: {} }),
  });
}

async function processIntake(job) {
  const { submissionId } = job.data;
  logger.info({ submissionId, jobId: job.id }, 'Processing intake job');

  const submission = await submissionsService.findById(submissionId);
  let text = submission.text || '';
  let locale = submission.locale;
  let needsHumanAssist = false;

  if (submission.voiceMediaId && !text) {
    const transcribed = await languageService.transcribe(submission.voiceMediaId);
    text = transcribed.text || '';
    needsHumanAssist = transcribed.needsHumanAssist;
  }

  if (text) {
    const detected = await languageService.detect(text);
    locale = detected.locale || locale;

    const translated = await languageService.translate(text, {
      sourceLocale: locale,
      targetLocale: 'en',
    });
    needsHumanAssist = needsHumanAssist || translated.needsHumanAssist;

    await submissionsService.updateAfterIntake(submissionId, {
      textNormalized: translated.text || text,
      locale,
      needsHumanAssist,
    });
  } else {
    await submissionsService.updateAfterIntake(submissionId, {
      textNormalized: text,
      locale,
      needsHumanAssist,
    });
  }

  await jobsService.recordCompleted(job.id, { stage: 'intake', submissionId });
  await enqueueEmbedding(submissionId);

  return { stage: 'intake', submissionId };
}

async function processEmbedding(job) {
  const { submissionId } = job.data;
  logger.info({ submissionId, jobId: job.id }, 'Processing embedding job');

  const submission = await submissionsService.findById(submissionId);
  const text = submission.textNormalized || submission.text || '';

  const embeddingResult = await aiService.embedAndAudit(text, {
    resourceType: 'submission',
    resourceId: submissionId,
  });

  await submissionsService.updateAfterEmbedding(submissionId, {
    embedding: embeddingResult.vector,
    embeddingModelVersion: embeddingResult.modelVersion,
  });

  await jobsService.recordCompleted(job.id, {
    stage: 'embedding',
    submissionId,
    dimensions: embeddingResult.dimensions,
  });
  await enqueueDedup(submissionId);

  return { stage: 'embedding', submissionId };
}

async function processDedup(job) {
  const { submissionId } = job.data;
  logger.info({ submissionId, jobId: job.id }, 'Processing dedup job');

  const result = await dedupService.runDedup(submissionId);

  await jobsService.recordCompleted(job.id, {
    stage: 'dedup',
    submissionId,
    decision: result.decision?.decision,
    clusterId: result.clusterId?.toString?.(),
  });
  await enqueueClassification(submissionId);

  return { stage: 'dedup', submissionId, clusterId: result.clusterId };
}

async function processClassification(job) {
  const { submissionId } = job.data;
  logger.info({ submissionId, jobId: job.id }, 'Processing classification job');

  const result = await classificationService.runClassification(submissionId);

  const submission = await submissionsService.findById(submissionId);
  if (submission.clusterId) {
    await clustersService.propagateStatus(
      submission.clusterId.toString(),
      CLUSTER_STATUS.TRIAGED,
    );
  }

  await jobsService.recordCompleted(job.id, {
    stage: 'classification',
    submissionId,
    triageType: result.triage?.type,
    categoryCount: result.categories?.length,
  });

  return { stage: 'classification', submissionId, ...result };
}

const PROCESSOR_MAP = {
  [JOB_NAMES.INTAKE_PROCESS]: processIntake,
  [JOB_NAMES.EMBEDDING_GENERATE]: processEmbedding,
  [JOB_NAMES.DEDUP_CHECK]: processDedup,
  [JOB_NAMES.CLASSIFICATION_RUN]: processClassification,
};

export function createWorkers() {
  const connection = createRedisConnection();
  const workers = [];

  const queueConfigs = [
    { name: QUEUE_NAMES.INTAKE, concurrency: config.QUEUE_CONCURRENCY_INTAKE },
    { name: QUEUE_NAMES.EMBEDDING, concurrency: config.QUEUE_CONCURRENCY_EMBEDDING },
    { name: QUEUE_NAMES.DEDUP, concurrency: config.QUEUE_CONCURRENCY_DEDUP },
    { name: QUEUE_NAMES.CLASSIFICATION, concurrency: config.QUEUE_CONCURRENCY_CLASSIFICATION },
  ];

  for (const { name, concurrency } of queueConfigs) {
    const worker = new Worker(
      name,
      async (job) => {
        const processor = PROCESSOR_MAP[job.name];
        if (!processor) {
          logger.warn({ queue: name, jobName: job.name }, 'No processor for job');
          return { skipped: true };
        }

        try {
          return await processor(job);
        } catch (err) {
          await jobsService.recordFailed(job.id, err);
          throw err;
        }
      },
      {
        connection,
        prefix: config.BULLMQ_PREFIX,
        concurrency,
      },
    );

    worker.on('completed', (job) => {
      logger.info({ jobId: job.id, name: job.name, queue: name }, 'Job completed');
    });

    worker.on('failed', (job, err) => {
      logger.error({ jobId: job?.id, name: job?.name, queue: name, err }, 'Job failed');
    });

    workers.push(worker);
  }

  return { workers, connection };
}

export default { createWorkers, processIntake, processEmbedding, processDedup, processClassification };
