# External Services & Environment Reference

Companion to `ARCHITECTURE.md`. Language decision locked: **complete JavaScript (ESM), no TypeScript**, JSDoc typedefs in `*.types.js` per module.

Two columns matter below: what you need for a **working demo**, and what you'd need for a **real deployment**. Don't buy the second one during a hackathon.

---

## 1. Services inventory

| # | Need | Recommended | Free tier? | Demo-critical? |
|---|---|---|---|---|
| 1 | Database | MongoDB Atlas | Yes (M0, 512MB) | **Yes** |
| 2 | Vector search | Atlas Vector Search | Yes (on M0) | **Yes** — dedup + matching |
| 3 | LLM inference | OpenRouter | Pay-as-you-go (you have it) | **Yes** |
| 4 | **Embeddings** | ⚠️ see §2 — *not* OpenRouter | Varies | **Yes** |
| 5 | Object storage | Cloudinary | Yes (25 credits/mo) | **Yes** — photos/video |
| 6 | Queue + jobs | **BullMQ + Redis** | Yes (see §3 for host choice) | **Yes** |
| 7 | Cache / rate limit | Same Redis instance | — | Yes |
| 8 | SMS / OTP | ⚠️ see §4 — DLT is a blocker | — | **No** — use email OTP |
| 9 | Email | Resend or Brevo | Yes (100/day, 300/day) | Yes |
| 10 | Speech-to-text | OpenAI Whisper direct, or Bhashini | Paid / free-with-registration | **Yes** — voice intake |
| 11 | Translation | Bhashini (ULCA), LLM fallback | Free w/ registration | Yes |
| 12 | Maps + boundaries | MapLibre + self-hosted GeoJSON | Free | Yes |
| 13 | Geocoding | Nominatim (OSM) or Mapbox | Free w/ usage policy | No |
| 14 | Backend hosting | Render / Railway / Fly.io | Yes | Yes |
| 15 | Frontend hosting | Vercel | Yes | Yes |
| 16 | Error monitoring | Sentry | Yes (5k events/mo) | No |
| 17 | Scheduled cron | node-cron in-process → platform cron | Free | Yes |

---

## 2. ⚠️ The embeddings gotcha — read this first

**OpenRouter is a chat-completions router. Its embeddings coverage is not something to build your dedup and matching pipeline on.** Both `dedup` and `matching` — the two research centrepieces — depend entirely on embeddings. If this breaks, the interesting half of the project breaks.

**Decision: in-house embeddings via Transformers.js.** ✅

`@xenova/transformers` runs a sentence-transformer model inside Node — no API, no cost, no rate limit, works offline when venue wifi dies mid-demo. Model loads once (~90MB), then ~10–40ms per embedding on CPU. Correct for your scale (thousands of submissions, not millions).

**Operational notes for the in-house path:**
- **Load the model once at worker boot, not per job.** First inference pulls weights from the HF CDN; cache them into the image or a mounted volume via `TRANSFORMERS_CACHE` so a cold deploy doesn't stall.
- **Run embedding only in the worker process**, never in the API process. The model holds RAM and inference blocks the event loop — this alone justifies the queue.
- **Pin the model name and dimension in env.** Changing the model invalidates every stored vector; treat it as a migration with a `scripts/backfill-embeddings.js` run, and version the field.
- Budget ~300–500MB RAM for the worker. Free hosting tiers with 512MB will be tight — give the worker its own service with more headroom than the API.
- For Indic text, evaluate a multilingual checkpoint against MiniLM on your real submissions before committing. Since `language` normalises to a canonical working language first, English-only embeddings are defensible — but measure it, don't assume it.

Fallbacks kept behind the same provider interface, if quality disappoints:

**b) OpenAI directly** — separate key from OpenRouter, `text-embedding-3-small` is cheap and excellent. Add `OPENAI_API_KEY` alongside `OPENROUTER_API_KEY`; the `ai` module already abstracts the provider, so this is a config switch.

**c) Jina / Voyage / Cohere** — all have generous free tiers and good multilingual models. Jina's multilingual model is worth a look given your language mix.

**d) A small Python sidecar** running `sentence-transformers` — best quality/control for Indic text, worst deployment complexity. Only if the language results from (a) disappoint.

**Design the `ai` module with a provider interface from day one** (`embed()` and `complete()` as separate provider slots) so you can swap without touching `dedup` or `matching`. That's the reason the module exists.

---

## 3. Queue: what actually needs one, and when

**Work that must not run inside the HTTP request:**

| Job | Trigger | Why async |
|---|---|---|
| Transcribe + translate submission | `submission.created` | Multi-second |
| Generate embedding | after normalisation | Multi-second |
| Dedup candidate search + cluster attach | after embedding | Depends on embedding |
| Triage + categorise (LLM) | after dedup | LLM latency, retryable |
| Compute match shortlist | `challenge.scoped` | Heavy, batchable |
| Notification fan-out | any state change | Third-party latency |
| **SLA escalation sweep** | cron, hourly | Scheduled |
| **Claim auto-release sweep** | cron, hourly | Scheduled |
| Analytics recompute | cron, nightly | Expensive aggregation |

Note the pipeline in rows 1–5 is a **chain**: each stage triggers the next by emitting an event. Don't write one giant handler.

### Setup: BullMQ + Redis ✅

**Queue topology** — one queue per stage, not one queue for everything. A stuck LLM call must never block notification delivery.

| Queue | Concurrency | Retries | Backoff |
|---|---|---|---|
| `intake` (transcribe + translate) | 3 | 3 | exponential, 5s |
| `embedding` | 2 | 3 | exponential, 2s |
| `dedup` | 3 | 2 | fixed, 5s |
| `classification` | 3 | 3 | exponential, 10s |
| `matching` | 2 | 2 | exponential, 10s |
| `notifications` | 10 | 5 | exponential, 30s |
| `scheduled` (SLA, auto-release, analytics) | 1 | 1 | — |

**Use BullMQ repeatable jobs for the cron work**, not `node-cron`. Repeatable jobs live in Redis, so they survive restarts and don't double-fire when you scale to two instances — which `node-cron` absolutely will.

**Run a separate worker process.** `npm run dev:api` and `npm run dev:worker`. The API must never process jobs: embedding inference blocks the event loop and would stall citizen submissions. In deployment that's two services from one repo, sharing `src/`.

**Every job must be idempotent.** Key jobs by resource ID (`jobId: submission:${id}:embed`) so a retry after a partial failure can't create a duplicate cluster or fire a duplicate notification. BullMQ dedupes on `jobId` automatically.

**Where to host Redis** — the one real decision:
- **Local dev:** Docker, one line, done.
- **Deployment:** Redis addon on **Render or Railway** alongside your API. Simplest, TCP native, no surprises.
- **Upstash:** works, but connect over the **TCP endpoint with ioredis**, not the serverless HTTP client — BullMQ needs blocking commands (`BRPOPLPUSH`), which the HTTP client doesn't do. On a per-command-billed free tier, blocking workers burn quota fast. Set `maxRetriesPerRequest: null` and raise the polling interval if you go this route.

**Also on Redis:** rate-limit store (`rate-limit-redis`) and the `ai` response cache, so those survive restarts too.

**Don't use raw `setTimeout` or in-memory arrays.** A restart loses queued work, and your SLA timers silently stop — which is the one mechanism the whole workflow story rests on.

---

## 4. ⚠️ SMS OTP in India — plan around it

Transactional SMS in India requires **DLT registration** (entity + header + template approval through a telecom operator portal). It takes days to weeks and generally needs a registered business entity. **You will not get this done for a hackathon.**

Options:
- **Email OTP for everyone** during demo. Cleanest.
- **Firebase Authentication phone sign-in** — handles the SMS side without your own DLT registration, generous free tier. Best if phone login is genuinely important to your citizen story.
- MSG91 / Twilio for production later — architecture already isolates this behind `integrations`, so it's an adapter swap.

Whichever you pick, keep `auth` unaware of the channel: it asks `integrations` to deliver a code.

---

## 5. Bhashini (ULCA) notes

Free and the right political answer for a Jharkhand government platform — Hindi plus tribal-language coverage is the whole point of your intake design. But: registration and API key provisioning take time, and coverage is uneven across Khortha, Nagpuri, and Kurmali specifically.

**Practical approach:** build the `language` module with two providers behind one interface — Bhashini primary, LLM/Whisper fallback — and a **confidence threshold that routes low-confidence input to human-assisted intake** rather than to a worse translation. That fallback path is a feature from `handoff.md` §3, not a workaround, so it should exist regardless of which provider is live on demo day.

---

## 6. Boundaries data (no service needed)

District/block/panchayat boundaries for `geo` come from a static GeoJSON file you ship with the repo, loaded into Mongo with a `2dsphere` index by `scripts/seed-boundaries.js`. Sources: data.gov.in, Survey of India, or GADM. **No API dependency**, which means district resolution and centroid snapping work offline.

---

## 7. Environment variables

Grouped by module. `config/index.js` validates all of these at boot with Zod and **fails fast** — a missing key should crash on startup, never at 2am inside a job.

```bash
# ─── Core ────────────────────────────────────────────────
NODE_ENV=development
PORT=5000
API_BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
LOG_LEVEL=debug

# ─── Database ────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/sicp
MONGODB_DB_NAME=sicp
MONGO_VECTOR_INDEX=submission_embeddings

# ─── Auth ────────────────────────────────────────────────
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10
BCRYPT_ROUNDS=10

# ─── AI: completions (OpenRouter) ────────────────────────
OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_APP_NAME=SICP-Jharkhand
OPENROUTER_SITE_URL=https://your-deploy-url

# model per task — never hardcode in prompts
AI_MODEL_TRIAGE=
AI_MODEL_CATEGORIZE=
AI_MODEL_SCOPE_DRAFT=
AI_MODEL_CAPABILITY_EXTRACT=
AI_MODEL_SUMMARIZE=

AI_REQUEST_TIMEOUT_MS=30000
AI_MAX_RETRIES=2
AI_CACHE_TTL_SECONDS=86400

# ─── AI: embeddings (separate provider — see §2) ─────────
EMBEDDING_PROVIDER=local          # locked: local (fallbacks kept behind same interface)
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
EMBEDDING_DIMENSIONS=384
EMBEDDING_MODEL_VERSION=v1        # bump on model change → triggers backfill
TRANSFORMERS_CACHE=./.cache/models
EMBEDDING_BATCH_SIZE=16
OPENAI_API_KEY=                   # fallback only
JINA_API_KEY=                     # fallback only

# ─── Confidence thresholds (tunable without deploy) ──────
TRIAGE_CONFIDENCE_THRESHOLD=0.75
CATEGORY_CONFIDENCE_THRESHOLD=0.70
DEDUP_SIMILARITY_THRESHOLD=0.82
DEDUP_RADIUS_METERS=500
DEDUP_TIME_WINDOW_DAYS=30
TRANSLATION_CONFIDENCE_THRESHOLD=0.60

# ─── Matching / routing ──────────────────────────────────
MATCH_SHORTLIST_SIZE=5
MATCH_FAIRNESS_WEIGHT=0.3
MATCH_CAPACITY_DEFAULT=5
CLAIM_WINDOW_HOURS=168            # 7 days
CLAIM_INACTIVITY_DAYS=45          # then auto-release

# ─── Media (Cloudinary) ──────────────────────────────────
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
MEDIA_MAX_SIZE_MB=25
MEDIA_ALLOWED_TYPES=image/jpeg,image/png,image/webp,video/mp4,application/pdf
MEDIA_SIGNED_URL_TTL_SECONDS=900

# ─── Queue / jobs ────────────────────────────────────────
REDIS_URL=redis://localhost:6379
REDIS_TLS=false                   # true for Upstash / managed TLS endpoints
BULLMQ_PREFIX=sicp
WORKER_ROLE=api                   # api | worker — api never processes jobs

QUEUE_CONCURRENCY_INTAKE=3
QUEUE_CONCURRENCY_EMBEDDING=2
QUEUE_CONCURRENCY_DEDUP=3
QUEUE_CONCURRENCY_CLASSIFICATION=3
QUEUE_CONCURRENCY_MATCHING=2
QUEUE_CONCURRENCY_NOTIFICATIONS=10

JOB_DEFAULT_ATTEMPTS=3
JOB_BACKOFF_MS=5000
JOB_REMOVE_ON_COMPLETE=1000       # keep last N for the dashboard
JOB_REMOVE_ON_FAIL=5000

# repeatable jobs (BullMQ, not node-cron)
CRON_SLA_SWEEP=0 * * * *
CRON_CLAIM_RELEASE=0 2 * * *
CRON_ANALYTICS_REBUILD=0 3 * * *

# ─── Cache (same Redis) ──────────────────────────────────
CACHE_PREFIX=sicp:cache
RATE_LIMIT_STORE=redis            # redis | memory

# ─── Language / speech ───────────────────────────────────
LANGUAGE_PROVIDER=bhashini        # bhashini | openai | disabled
BHASHINI_USER_ID=
BHASHINI_API_KEY=
BHASHINI_PIPELINE_ID=
BHASHINI_INFERENCE_URL=
DEFAULT_LOCALE=hi
SUPPORTED_LOCALES=en,hi,sat,ho,mun,kru

# ─── Notifications ───────────────────────────────────────
EMAIL_PROVIDER=resend
RESEND_API_KEY=
EMAIL_FROM=noreply@yourdomain.in
SMS_PROVIDER=disabled             # disabled | msg91 | twilio | firebase
MSG91_AUTH_KEY=
MSG91_SENDER_ID=
MSG91_TEMPLATE_ID=

# ─── Geo ─────────────────────────────────────────────────
BOUNDARY_DATA_PATH=./data/jharkhand-boundaries.geojson
PUBLIC_LOCATION_PRECISION=panchayat   # generalisation level for public views
GEOCODING_PROVIDER=nominatim
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org

# ─── Integrations ────────────────────────────────────────
GRIEVANCE_FORWARD_ENABLED=false
GRIEVANCE_FORWARD_URL=
GRIEVANCE_FORWARD_API_KEY=

# ─── Ops ─────────────────────────────────────────────────
SENTRY_DSN=
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
RATE_LIMIT_SUBMIT_MAX=5
CORS_ORIGINS=http://localhost:5173
```

### Frontend `.env` (Vite — everything here is public)

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_MAP_STYLE_URL=https://demotiles.maplibre.org/style.json
VITE_CLOUDINARY_CLOUD_NAME=
VITE_DEFAULT_LOCALE=hi
VITE_SENTRY_DSN=
VITE_ENABLE_VOICE_INPUT=true
VITE_ENABLE_WORKFLOW_DESIGNER=true
```

**Never put a secret behind `VITE_`.** It ships in the bundle.

---

## 8. Absolute minimum to get running today

```
MONGODB_URI            → Atlas free tier, 5 min
OPENROUTER_API_KEY     → you have it
JWT_ACCESS_SECRET      → openssl rand -hex 32
JWT_REFRESH_SECRET     → openssl rand -hex 32
CLOUDINARY_*           → free signup, 5 min
REDIS_URL              → docker run -p 6379:6379 redis:alpine
EMBEDDING_PROVIDER=local → no key needed
```

Run two processes: `WORKER_ROLE=api` and `WORKER_ROLE=worker`.

Everything else has a working default or a `disabled` mode. That's deliberate: **any service that isn't configured should degrade to a stub that logs and continues, never crash the app.** SMS off → email only. Bhashini off → LLM translation. Sentry off → console. This is what lets you demo on a laptop with no internet except the LLM call.

---

## 9. Key npm packages

**Backend:** `express` · `mongoose` · `zod` · `jsonwebtoken` · `bcrypt` · `bullmq` · `ioredis` · `cloudinary` · `multer` · `openai` (OpenRouter is OpenAI-compatible, use this client) · `@xenova/transformers` · `helmet` · `cors` · `express-rate-limit` · `rate-limit-redis` · `pino` · `pino-pretty` · `dotenv` · `date-fns` · `nanoid`

Optional: `@bull-board/express` — a drop-in queue dashboard at `/admin/queues`. Genuinely useful in a demo when someone asks what the AI pipeline is doing.

**Frontend:** `react` · `react-router-dom` · `@tanstack/react-query` · `zustand` · `reactflow` · `tailwindcss` · `class-variance-authority` · `clsx` · `tailwind-merge` · `lucide-react` · `react-hook-form` · `zod` · `@hookform/resolvers` · `recharts` · `maplibre-gl` · `react-map-gl` · `date-fns` · `sonner`

**Dev:** `nodemon` · `vitest` · `supertest` · `mongodb-memory-server` · `eslint` · `prettier`