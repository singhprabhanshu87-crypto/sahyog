# Phase 1 — Foundation, Identity & the Audit Spine

**Goal:** every actor can log in, every action is already permanently recorded, and the access model works before a single feature exists.

**Why first:** the append-only event log and the ABAC layer are the two things that cannot be retrofitted. Bolting them on in phase 4 means rewriting every service written before it.

---

## Modules built

`config` · `common` · `auth` · `users` · `organizations` · `events` · `media` (basic)

## Frontend built

`app/router` · `app/guards` · `components/layout` · `components/ui` (shadcn init) · `features/auth` · `features/organizations` (onboarding only)

---

## Work breakdown

### 1.1 Project skeleton
- Monorepo or two folders (`server/`, `client/`) — either is fine, pick and don't revisit.
- ESM everywhere, `"type": "module"`. No TypeScript, JSDoc typedefs in `*.types.js`.
- `config/index.js` validates all env with Zod at boot and **crashes on missing keys**. Do this on day one; a service that fails at 2am inside a job instead of at startup will cost you a night.
- Two entry points from the same `src/`: `WORKER_ROLE=api` and `WORKER_ROLE=worker`. The worker does nothing yet, but the split exists.
- Docker Compose for local Mongo + Redis.

### 1.2 `common/` layer
- Error classes and the central error handler — every response shape decided now.
- `request-context` middleware: requestId, actor, correlationId attached to every request and propagated into jobs later.
- `validate` middleware wrapping Zod.
- `logger` (pino) with correlationId in every line.
- `state-machine.js` and `policy-engine.js` stubs — written in phase 4 and 1 respectively, but the files exist so nobody invents a parallel version.

### 1.3 `events` — build this properly, now
The spine. Every state change, comment, upload, assignment and decision becomes an immutable record.

- Schema: `actor`, `action`, `resourceType`, `resourceId`, `payload`, `rationale`, `timestamp`, `correlationId`.
- **Persist first, dispatch second.** A crashed subscriber must never lose the record.
- Event bus in `common/lib/event-bus.js`; each module declares emissions and subscriptions in its `x.events.js`.
- Query API: by resource, by actor, by time range, paginated.
- Naming convention fixed now: `resource.action`, past tense.

**Rule to enforce from this point:** no module ever writes a status-history field. Status is derived.

### 1.4 `auth`
- Multi-channel by design, single interface: OTP for citizens, email/password for institutional users, invite tokens for org members.
- **Email OTP only in this phase.** SMS needs DLT registration and won't be ready; the channel is an `integrations` adapter later.
- Access + refresh tokens, rotation, revocation.
- Emits `auth.logged_in`.

### 1.5 `users` + `organizations`
- A user holds different roles in different orgs — model `memberships` as its own collection, not an array on the user. This is the thing people get wrong and it's painful to undo.
- Org types: HEI, industry, startup, MSME, NGO, CSR, incubator, government department, ULB, PRI.
- Verification workflow: submitted → verified → active. Manual approval by PMU in this phase.
- District scope on the org — the ABAC layer depends on it.

### 1.6 ABAC layer
- `authorize` middleware consults `policy-engine`, which evaluates the resource module's `x.policy.js`.
- A rule is a predicate over `(actor, resource, action, context)`.
- The four rules from `ARCHITECTURE.md` §5.3 encoded now, even though the resources they guard don't exist yet.
- **Second half of authorization is projection:** every module gets `x.mapper.js` with `toPublic` / `toAssignee` / `toInternal`. The policy decides access; the mapper decides how much.

### 1.7 Frontend shell
- Vite + Tailwind + shadcn init. Copy in the base component set; these are yours to edit.
- `AppShell` with sidebar, topbar, role switcher.
- Route table with `RequireAuth`, `RequireRole`, `RequireOrgScope`.
- TanStack Query provider, api-client with auth header and error normalisation.
- `lib/permissions.js` mirrors backend rules **for hiding buttons only** — never for security.
- `AuditTrail.jsx` shared component: renders the event log for any resource. Built now because it's the visible proof the spine works.

---

## Definition of done

- [ ] Log in as citizen, HEI faculty, industry partner, district officer, PMU admin — each lands on a different shell
- [ ] Every login, org verification and profile edit appears in the event log with actor and timestamp
- [ ] A district officer's API call for another district returns 403, and the button isn't rendered either
- [ ] The same resource returns different field sets to public / assignee / internal callers
- [ ] Missing env var crashes the server at boot with a readable message
- [ ] `AuditTrail` renders a real event history in the UI

## Demo line

"Before we've built a single feature, every action in this system is already permanently attributable — and the same record answers an RTI."

---

## Explicitly out of scope

Submissions, AI, matching, workflow states, notifications, any queue work. The worker process exists and idles.

## Risks

| Risk | Mitigation |
|---|---|
| Team treats the event log as "logging" and adds status fields anyway | Code review rule: any `status` field that isn't derived is a blocker |
| Memberships modelled as an array on user | Fix in this phase or pay for it in phase 5 |
| shadcn components treated as a library, edited via wrappers | They're source. Edit `components/ui/` directly |