# Phase 2 — Citizen Intake & the Job Pipeline

**Goal:** a citizen with no domain knowledge submits a problem in their own language, with photos and location, and walks away with a tracking ID. Behind it, the async pipeline that phases 3–5 all plug into.

**Design principle carried from `handoff.md` §3:** *never ask the citizen to classify.* Capture free text or voice, location, media. Derive everything else.

---

## Modules built

`submissions` · `media` (full) · `geo` · `language` · `taxonomy` · `jobs` (queue infrastructure)

## Frontend built

`features/submission` · `components/shared/LanguageSwitcher` · public tracking page

---

## Work breakdown

### 2.1 Queue infrastructure — build before the features that need it
- BullMQ + ioredis. One queue per stage, not one queue for everything: `intake`, `embedding`, `dedup`, `classification`, `matching`, `notifications`, `scheduled`.
- Worker process runs real jobs from this phase on.
- **Every job idempotent, keyed by resource ID** (`jobId: submission:${id}:transcribe`). BullMQ dedupes on `jobId`, so a retry after partial failure can't double-process.
- Retry + exponential backoff per queue, configured from env.
- `@bull-board/express` mounted at `/admin/queues` behind PMU role — genuinely useful when a judge asks what the pipeline is doing.
- Correlation ID propagates from the originating request into every downstream job.

### 2.2 `taxonomy`
- Thematic domains (education, agriculture, healthcare, water, environment, energy, urban development, accessibility, public administration, rural livelihoods).
- **Versioned from the start.** Reclassifying historical data must be traceable.
- Closure reason codes, capability vocabulary skeleton, TRL/SRL band definitions seeded here for later phases.
- `scripts/seed-taxonomy.js`.

### 2.3 `geo`
- Load Jharkhand district/block/panchayat GeoJSON into Mongo with a `2dsphere` index via `scripts/seed-boundaries.js`. **No external API** — resolution and centroid snapping work offline.
- Point → administrative unit resolution.
- **Centroid snapping for public views.** `PUBLIC_LOCATION_PRECISION=panchayat`. Exact geotags plus photos on a public dashboard expose the submitter; this is a privacy requirement, not a nicety.
- Radius queries — phase 3's dedup depends on this.

### 2.4 `media`
- Cloudinary upload, type/size validation, thumbnailing.
- **Signed, short-lived URLs.** Access checked against the parent resource's policy — never public-by-default.
- Strip EXIF GPS on upload; location comes from the explicit field, not silently from photo metadata.

### 2.5 `submissions`
- Free text or voice, media, location, optional contact.
- **Tracking ID issued synchronously**, before any async work. The citizen never waits on the pipeline.
- **Assisted submission:** a facilitator (CSC operator, panchayat functionary, NGO worker) submits on behalf of a citizen, with the originator recorded separately from the submitting actor.
- One consent question only: willing to be contacted as a community validator later.
- Emits `submission.created` → kicks the pipeline.
- Rate limited harder than other endpoints (`RATE_LIMIT_SUBMIT_MAX`).

### 2.6 `language`
- Provider interface with Bhashini primary, LLM/Whisper fallback, `disabled` mode that passes text through.
- Detect → transcribe (voice) → translate to canonical working language. Cache translations.
- **Low-confidence flag routes to human-assisted intake, not to a worse translation.** This is a designed feature, not a workaround — Khortha, Nagpuri and Kurmali coverage is genuinely uneven.
- Reverse translation for all citizen-facing output.

### 2.7 Citizen frontend — the part that must be simplest
- **Voice-first.** Text is the fallback, not the default.
- Big targets, minimal fields, no taxonomy dropdown anywhere.
- Media dropzone, map pin with GPS assist, locale switcher.
- Tracking ID card, readable back over voice.
- Public status page by tracking ID — plain language, no jargon, no internal state names.
- Assisted-submit toggle for facilitator accounts.

---

## Definition of done

- [ ] Citizen submits by voice in Hindi with a photo and gets a tracking ID in under 30 seconds
- [ ] Same flow works with text, and with a facilitator submitting on someone's behalf
- [ ] Transcription and translation run in the worker, never blocking the request
- [ ] Killing the worker mid-pipeline and restarting it resumes the job without duplication
- [ ] Public view shows a panchayat centroid, never the exact pin, and never the submitter
- [ ] Low-confidence translation lands in a human-assist queue instead of proceeding
- [ ] Tracking page reads in the submitter's language

## Demo line

"No dropdowns, no categories, no form fields. She says what's wrong, in her own language, and gets a number she can check."

---

## Explicitly out of scope

Categorisation, dedup, routing, any AI decisions. Submissions pile up unprocessed — that's phase 3's input.

## Risks

| Risk | Mitigation |
|---|---|
| Bhashini registration not through in time | Provider interface + LLM fallback + `disabled` mode; demo doesn't depend on it |
| Voice intake fails on venue wifi | Record locally, upload with retry; degrade to text with a visible notice |
| Someone adds a "category" dropdown to the citizen form because it makes phase 3 easier | Reject it. It's the single decision the intake design rests on |
| Boundary GeoJSON too heavy | Simplify geometries at seed time; only centroid + containment are needed |