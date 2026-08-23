# Sahyog — Jharkhand Societal Innovation Collaboration Portal

Full-stack platform for citizen challenge intake, AI triage, institution matching, and collaborative project lifecycle.

## Stack

- **Frontend:** React (Vite), Tailwind, Rakhat design system (`docs/design.md`)
- **Backend:** Node.js + Express, MongoDB, Redis, BullMQ
- **AI:** OpenRouter (completions), local embeddings stub

## Quick start (teammates)

**Requirements:** Node.js 20+, Docker Desktop (for MongoDB + Redis)

```bash
git clone <repo-url>
cd sahyog
npm run setup    # install deps, create .env, start Docker, seed DB
npm run dev      # API + worker + client together
```

Open http://localhost:5173 — login with `pmu@sahyog.demo` (OTP appears in the API terminal).

### Environment variables

Setup will prompt for API keys and write them to `server/.env`. Key variables:

| Variable | Required? | Purpose |
|----------|-----------|---------|
| `OPENROUTER_API_KEY` | For AI features | Triage, categorization, scope drafts, summaries |
| `AI_MODEL_TRIAGE` etc. | No (defaults set) | OpenRouter model IDs per task |
| `EMBEDDING_PROVIDER` | No (`local` default) | `local` \| `openai` \| `jina` for dedup/matching |
| `OPENAI_API_KEY` | If embeddings/language = openai | Embeddings or Whisper fallback |
| `CLOUDINARY_*` | No | Photo/video uploads (dev stub without) |

**Env files:** secrets live in `server/.env` (not committed). Client uses `client/.env` for public `VITE_*` vars only — copy from `client/.env.example`.

Full list: `server/.env.example`

### Script shortcuts

| Platform | Install | Run |
|----------|---------|-----|
| Any | `npm run setup` | `npm run dev` |
| Re-enter API keys | `npm run setup:env` | — |
| Windows | `.\scripts\setup.ps1` | `.\scripts\dev.ps1` |
| macOS/Linux | `./scripts/setup.sh` | `./scripts/dev.sh` |

---

## Manual setup (if needed)

### 1. Infrastructure

```bash
docker compose up -d
```

### 2. Server

```bash
cd server
npm install
cp .env.example .env   # or use existing .env
node scripts/seed-taxonomy.js
node scripts/seed-boundaries.js
node scripts/seed-institutions.js
node scripts/seed-demo.js
npm run dev:api        # terminal 1
npm run dev:worker     # terminal 2
```

### 3. Client

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

## Demo accounts (OTP login)

| Email | Role |
|-------|------|
| `pmu@sahyog.demo` | PMU Admin |
| `faculty@sahyog.demo` | HEI Faculty |
| `citizen@sahyog.demo` | Citizen |
| `district@sahyog.demo` | District Officer |

1. Go to `/login`
2. Enter email → **Send OTP**
3. Check server console for OTP code
4. Verify and sign in

## Public routes (no login)

- `/submit` — citizen problem report (no taxonomy dropdowns)
- `/track/:trackingId` — plain-language status

## API

- Health: `GET /health`
- API base: `http://localhost:5000/api`

## Architecture

See `docs/architecture.md`, `docs/phase1.md`–`phase5.md`, and `docs/handoff.md`.

## Design

UI follows the Rakhat design system in `docs/design.md` — Primary `#0052CC`, Inter typography, 240px sidebar, 4px spacing scale.
