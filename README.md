# Sahyog — Jharkhand Societal Innovation Collaboration Portal

Full-stack platform for citizen challenge intake, AI triage, institution matching, and collaborative project lifecycle.

## Stack

- **Frontend:** React (Vite), Tailwind, Rakhat design system (`docs/design.md`)
- **Backend:** Node.js + Express, MongoDB, Redis, BullMQ
- **AI:** OpenRouter (completions), local embeddings stub

## Quick start (teammates)

**Requirements:** Node.js 20+ only. **No Docker** — uses cloud MongoDB Atlas + Upstash Redis from `server/.env`.

```bash
git clone <repo-url>
cd sahyog
# Get server/.env from the team (not in git) — Atlas + Upstash + OpenAI + Cloudinary
npm run setup    # install deps, verify .env, seed Atlas
npm run dev      # start API + worker + client
```

Open http://localhost:5173 — login with `pmu@sahyog.demo` (OTP in API terminal).

### `server/.env` (required, not committed)

| Variable | Source |
|----------|--------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `REDIS_URL` | Upstash Redis URL |
| `REDIS_TLS` | `true` for Upstash |
| `OPENAI_API_KEY` | OpenAI platform |
| `CLOUDINARY_*` | Cloudinary console |

Optional interactive fill: `npm run setup:env` (only if you need to re-enter keys).

**Client:** `client/.env` — public `VITE_*` vars only (`client/.env.example`).

Full reference: `server/.env.example`

### Script shortcuts

| Platform | Install | Run |
|----------|---------|-----|
| Any | `npm run setup` | `npm run dev` |
| Optional: re-enter API keys | `npm run setup:env` | — |
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
