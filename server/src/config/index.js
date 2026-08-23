import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  API_BASE_URL: z.string().url().default('http://localhost:5000'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  MONGODB_URI: z.string().min(1),
  MONGODB_DB_NAME: z.string().min(1).default('sahyog'),
  MONGO_VECTOR_INDEX: z.string().default('submission_embeddings'),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  OTP_LENGTH: z.coerce.number().int().min(4).max(8).default(6),
  OTP_EXPIRY_MINUTES: z.coerce.number().int().positive().default(10),
  BCRYPT_ROUNDS: z.coerce.number().int().min(8).max(14).default(10),

  OPENROUTER_API_KEY: z.string().optional().default(''),
  OPENROUTER_BASE_URL: z.string().url().default('https://openrouter.ai/api/v1'),
  OPENROUTER_APP_NAME: z.string().default('Sahyog-Jharkhand'),
  OPENROUTER_SITE_URL: z.string().default(''),

  AI_COMPLETION_PROVIDER: z.enum(['openai', 'openrouter']).default('openai'),
  OPENAI_BASE_URL: z.string().url().default('https://api.openai.com/v1'),

  AI_MODEL_TRIAGE: z.string().optional().default('gpt-4o-mini'),
  AI_MODEL_CATEGORIZE: z.string().optional().default('gpt-4o-mini'),
  AI_MODEL_SCOPE_DRAFT: z.string().optional().default('gpt-4o-mini'),
  AI_MODEL_CAPABILITY_EXTRACT: z.string().optional().default('gpt-4o-mini'),
  AI_MODEL_SUMMARIZE: z.string().optional().default('gpt-4o-mini'),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  AI_MAX_RETRIES: z.coerce.number().int().min(0).default(2),
  AI_CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(86400),

  EMBEDDING_PROVIDER: z.enum(['local', 'openai', 'jina']).default('local'),
  EMBEDDING_MODEL: z.string().default('Xenova/all-MiniLM-L6-v2'),
  EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().default(384),
  EMBEDDING_MODEL_VERSION: z.string().default('v1'),
  TRANSFORMERS_CACHE: z.string().default('./.cache/models'),
  EMBEDDING_BATCH_SIZE: z.coerce.number().int().positive().default(16),
  OPENAI_API_KEY: z.string().optional().default(''),
  JINA_API_KEY: z.string().optional().default(''),

  TRIAGE_CONFIDENCE_THRESHOLD: z.coerce.number().min(0).max(1).default(0.75),
  CATEGORY_CONFIDENCE_THRESHOLD: z.coerce.number().min(0).max(1).default(0.7),
  DEDUP_SIMILARITY_THRESHOLD: z.coerce.number().min(0).max(1).default(0.82),
  DEDUP_RADIUS_METERS: z.coerce.number().int().positive().default(500),
  DEDUP_TIME_WINDOW_DAYS: z.coerce.number().int().positive().default(30),
  TRANSLATION_CONFIDENCE_THRESHOLD: z.coerce.number().min(0).max(1).default(0.6),

  MATCH_SHORTLIST_SIZE: z.coerce.number().int().positive().default(5),
  MATCH_FAIRNESS_WEIGHT: z.coerce.number().min(0).max(1).default(0.3),
  MATCH_CAPACITY_DEFAULT: z.coerce.number().int().positive().default(5),
  CLAIM_WINDOW_HOURS: z.coerce.number().int().positive().default(168),
  CLAIM_INACTIVITY_DAYS: z.coerce.number().int().positive().default(45),

  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  CLOUDINARY_URL: z.string().optional().default(''),
  MEDIA_MAX_SIZE_MB: z.coerce.number().int().positive().default(25),
  MEDIA_ALLOWED_TYPES: z.string().default('image/jpeg,image/png,image/webp,video/mp4,application/pdf'),
  MEDIA_SIGNED_URL_TTL_SECONDS: z.coerce.number().int().positive().default(900),

  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),
  REDIS_TLS: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
  BULLMQ_PREFIX: z.string().default('sahyog'),
  WORKER_ROLE: z.enum(['api', 'worker']).default('api'),

  QUEUE_CONCURRENCY_INTAKE: z.coerce.number().int().positive().default(3),
  QUEUE_CONCURRENCY_EMBEDDING: z.coerce.number().int().positive().default(2),
  QUEUE_CONCURRENCY_DEDUP: z.coerce.number().int().positive().default(3),
  QUEUE_CONCURRENCY_CLASSIFICATION: z.coerce.number().int().positive().default(3),
  QUEUE_CONCURRENCY_MATCHING: z.coerce.number().int().positive().default(2),
  QUEUE_CONCURRENCY_NOTIFICATIONS: z.coerce.number().int().positive().default(10),

  JOB_DEFAULT_ATTEMPTS: z.coerce.number().int().positive().default(3),
  JOB_BACKOFF_MS: z.coerce.number().int().positive().default(5000),
  JOB_REMOVE_ON_COMPLETE: z.coerce.number().int().positive().default(1000),
  JOB_REMOVE_ON_FAIL: z.coerce.number().int().positive().default(5000),

  CRON_SLA_SWEEP: z.string().default('0 * * * *'),
  CRON_CLAIM_RELEASE: z.string().default('0 2 * * *'),
  CRON_ANALYTICS_REBUILD: z.string().default('0 3 * * *'),

  CACHE_PREFIX: z.string().default('sahyog:cache'),
  RATE_LIMIT_STORE: z.enum(['redis', 'memory']).default('memory'),

  LANGUAGE_PROVIDER: z.enum(['bhashini', 'openai', 'disabled']).default('disabled'),
  BHASHINI_USER_ID: z.string().optional().default(''),
  BHASHINI_API_KEY: z.string().optional().default(''),
  BHASHINI_PIPELINE_ID: z.string().optional().default(''),
  BHASHINI_INFERENCE_URL: z.string().optional().default(''),
  DEFAULT_LOCALE: z.string().default('hi'),
  SUPPORTED_LOCALES: z.string().default('en,hi,sat,ho,mun,kru'),

  EMAIL_PROVIDER: z.enum(['resend', 'disabled']).default('disabled'),
  RESEND_API_KEY: z.string().optional().default(''),
  EMAIL_FROM: z.string().default('noreply@yourdomain.in'),
  SMS_PROVIDER: z.enum(['disabled', 'msg91', 'twilio', 'firebase']).default('disabled'),
  MSG91_AUTH_KEY: z.string().optional().default(''),
  MSG91_SENDER_ID: z.string().optional().default(''),
  MSG91_TEMPLATE_ID: z.string().optional().default(''),

  BOUNDARY_DATA_PATH: z.string().default('./data/jharkhand-boundaries.geojson'),
  PUBLIC_LOCATION_PRECISION: z.enum(['district', 'block', 'panchayat']).default('panchayat'),
  GEOCODING_PROVIDER: z.enum(['nominatim', 'disabled']).default('nominatim'),
  NOMINATIM_BASE_URL: z.string().url().default('https://nominatim.openstreetmap.org'),

  GRIEVANCE_FORWARD_ENABLED: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
  GRIEVANCE_FORWARD_URL: z.string().optional().default(''),
  GRIEVANCE_FORWARD_API_KEY: z.string().optional().default(''),

  SENTRY_DSN: z.string().optional().default(''),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_SUBMIT_MAX: z.coerce.number().int().positive().default(5),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.issues
    .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  console.error('Invalid environment configuration:\n' + formatted);
  process.exit(1);
}

const env = parsed.data;

export const config = {
  ...env,
  corsOrigins: env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),
  mediaAllowedTypes: env.MEDIA_ALLOWED_TYPES.split(',').map((t) => t.trim()).filter(Boolean),
  supportedLocales: env.SUPPORTED_LOCALES.split(',').map((l) => l.trim()).filter(Boolean),
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',
  isApi: env.WORKER_ROLE === 'api',
  isWorker: env.WORKER_ROLE === 'worker',
};

export default config;
