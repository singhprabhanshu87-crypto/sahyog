# Societal Innovation Collaboration Portal — Modular Architecture

Companion to `handoff.md`. That doc says **what** the system does; this one says **how the code is organised**. Every module here traces back to a feature decision in the handoff.

---

## 0. Stack & two conventions to settle first

| Layer | Choice |
|---|---|
| Frontend | React (Vite), Tailwind, shadcn/ui, React Flow |
| Backend | Node + Express, JavaScript |
| Database | MongoDB (Mongoose) |
| LLM | OpenRouter (OpenAI-compatible endpoints) |
| Structure | NestJS-style feature modules |

**Two things to lock before writing code:**

1. **File extension.** You mentioned `.service.ts` alongside `.controller.js`. Mixing is painful — Express + Mongoose + plain JS means no build step, and a half-TS codebase gets the cost of TS with none of the safety. **Recommendation: all `.js`, ESM, with JSDoc typedefs in `*.types.js` per module.** You get editor autocomplete and zero tooling. If you want real TS, convert everything, not just services. The structure below is identical either way.

2. **"Satc UI" = shadcn/ui.** Assuming that. Note it isn't a dependency — components are copied into `components/ui/` and owned by you. That matters for the tree below.

---

## 1. Backend conventions

### 1.1 The standard file set per module

Every module folder contains the same files. Uniformity is the whole point — anyone can open any module and know where things are.

| File | Responsibility | Rule |
|---|---|---|
| `x.module.js` | Assembles the router, wires dependencies, exports the mounted route | The only file `app.js` imports |
| `x.routes.js` | Route table: path → guard → validator → controller method | No logic, just wiring |
| `x.controller.js` | Parse request, call service, shape response | **Zero business logic.** No DB calls. |
| `x.service.js` | All business logic | **No `req`/`res` awareness.** Testable in isolation. |
| `x.schema.js` | Mongoose schema + model | Owned by exactly one module |
| `x.validation.js` | Zod schemas for body/params/query | Used by the validate middleware |
| `x.policy.js` | ABAC rules for this resource — who can read/write what, under which attributes | See §5.3 |
| `x.mapper.js` | Entity → DTO projections (`toPublic`, `toAssignee`, `toInternal`) | **PII redaction and location generalisation live here** |
| `x.events.js` | Event names this module emits + handlers it subscribes to | See §5.1 |
| `x.constants.js` | Enums, state names, thresholds | |
| `x.types.js` | JSDoc typedefs | |
| `__tests__/` | Service tests first, controller tests second | |

### 1.2 Layering rules (enforce these or the modularity is cosmetic)

- Controller → Service → Schema. Never skip, never reverse.
- **A module may only read its own collections.** Cross-module data comes from calling that module's service, never by importing its Mongoose model.
- Cross-module *reactions* go through the event bus, not direct calls. `submissions` does not call `notifications`; it emits `submission.created`.
- `common/` may not import from `modules/`. Ever.
- Circular imports between modules are a design bug — if A and B need each other, the shared part belongs in a third module or in `common/`.

---

## 2. Module map

Grouped by concern. 24 modules.

**Platform core**
`auth` · `users` · `organizations` · `media` · `events` · `notifications`

**Intake**
`submissions` · `clusters` · `geo` · `language`

**Intelligence**
`ai` · `classification` · `dedup` · `capability-profiles` · `matching`

**Workflow**
`challenges` · `workflow` · `claims` · `teams` · `projects` · `milestones`

**Governance**
`agreements` · `disputes` · `validation`

**Insight & integration**
`analytics` · `taxonomy` · `integrations` · `jobs`

---

## 3. Backend folder tree

```
server/
├── src/
│   ├── app.js                      # express app, mounts modules
│   ├── server.js                   # http listener, graceful shutdown
│   │
│   ├── config/
│   │   ├── index.js                # env loader + validation (fail fast)
│   │   ├── database.js             # mongoose connection
│   │   ├── openrouter.js           # model names, routing prefs, timeouts
│   │   └── constants.js            # global enums (roles, states, domains)
│   │
│   ├── common/
│   │   ├── middleware/
│   │   │   ├── authenticate.js     # verifies token → req.user
│   │   │   ├── authorize.js        # ABAC gate, consults module policy
│   │   │   ├── validate.js         # zod runner (body/params/query)
│   │   │   ├── rate-limit.js
│   │   │   ├── request-context.js  # requestId, actor, correlationId
│   │   │   └── error-handler.js
│   │   ├── errors/
│   │   │   ├── app-error.js        # base
│   │   │   └── http-errors.js      # NotFound, Forbidden, Conflict, ...
│   │   ├── lib/
│   │   │   ├── event-bus.js        # in-process emitter → event log
│   │   │   ├── state-machine.js    # generic guarded FSM runner
│   │   │   ├── policy-engine.js    # evaluates x.policy.js rules
│   │   │   ├── paginate.js
│   │   │   └── logger.js
│   │   └── utils/
│   │       ├── async-handler.js
│   │       ├── slugify.js
│   │       └── geo-utils.js        # haversine, centroid snapping
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── organizations/
│   │   ├── media/
│   │   ├── events/
│   │   ├── notifications/
│   │   ├── submissions/
│   │   ├── clusters/
│   │   ├── geo/
│   │   ├── language/
│   │   ├── ai/
│   │   ├── classification/
│   │   ├── dedup/
│   │   ├── capability-profiles/
│   │   ├── matching/
│   │   ├── challenges/
│   │   ├── workflow/
│   │   ├── claims/
│   │   ├── teams/
│   │   ├── projects/
│   │   ├── milestones/
│   │   ├── agreements/
│   │   ├── disputes/
│   │   ├── validation/
│   │   ├── analytics/
│   │   ├── taxonomy/
│   │   ├── integrations/
│   │   └── jobs/
│   │
│   └── prompts/                    # versioned LLM prompts, not inline strings
│       ├── triage.prompt.js
│       ├── categorize.prompt.js
│       ├── scope-draft.prompt.js
│       ├── capability-extract.prompt.js
│       └── summarize-cluster.prompt.js
│
├── scripts/
│   ├── seed-taxonomy.js
│   ├── seed-institutions.js        # AISHE/NIRF bootstrap for capability profiles
│   └── backfill-embeddings.js
└── package.json
```

Each module folder expands to the standard file set from §1.1. Example:

```
modules/challenges/
├── challenges.module.js
├── challenges.routes.js
├── challenges.controller.js
├── challenges.service.js
├── challenges.schema.js
├── challenges.validation.js
├── challenges.policy.js
├── challenges.mapper.js
├── challenges.events.js
├── challenges.constants.js
├── challenges.types.js
└── __tests__/challenges.service.test.js
```

---

## 4. Module specifications

### Platform core

**`auth`** — Login, token issue/refresh, session. Multi-channel: OTP for citizens (phone), email/password for institutional users, invite-token onboarding for org members.
Owns: `sessions`, `otps`. Emits: `auth.logged_in`.

**`users`** — Person records, role assignments, org membership. A user can hold different roles in different orgs.
Owns: `users`, `memberships`. Depends on: `organizations`.

**`organizations`** — HEIs, industry, startups, MSMEs, NGOs, CSR bodies, incubators, government departments, ULBs, PRIs. Onboarding, verification status, district scope.
Owns: `organizations`. Emits: `org.verified`.
Note: this is the *identity* of an institution. Its *expertise* lives in `capability-profiles` — deliberately separate, because one is administrative and one is derived and continuously updated.

**`media`** — Upload, storage, virus/type checks, thumbnailing, signed access URLs. Access is checked against the parent resource's policy, never public-by-default.
Owns: `media_assets`.

**`events`** — **The append-only event log. The spine of the whole system.** Every state change, comment, upload, assignment, and decision is an immutable record: `{ actor, action, resourceType, resourceId, payload, rationale, timestamp, correlationId }`.
Owns: `events`. Exposes: append, query-by-resource, replay.
Rule: **nothing else writes status history.** Current status is *derived* from this log. This is what delivers the audit trail, the transparency requirement, and RTI-answerability from §6.4c and §7 of the handoff.

**`notifications`** — Subscribes to events, renders templates per channel (SMS, email, in-app), respects language preference. Fires on **state change, not activity**.
Owns: `notifications`, `notification_prefs`. Depends on: `language`.

### Intake

**`submissions`** — Raw citizen reports. Text or voice, media, location, tracking ID issuance, assisted submission (facilitator submits on behalf of a citizen, originator recorded). Submitter consent flag for community-validator contact.
Owns: `submissions`. Emits: `submission.created`.
Mapper is important here: `toPublic` strips submitter identity and hands location to `geo` for generalisation.

**`clusters`** — Groups of deduplicated submissions. One cluster becomes at most one challenge. Holds the duplicate count that feeds prioritisation (handoff §5.2 — duplicate volume is a severity signal).
Owns: `clusters`. Depends on: `dedup`.

**`geo`** — District/block/panchayat resolution, centroid snapping for public views, radius queries for dedup.
Owns: `admin_boundaries`. Pure functions elsewhere.

**`language`** — Detection, transcription, translation to a canonical working language, and translation back for citizen-facing output. Holds the **low-confidence flag** that routes a submission to human-assisted intake instead of discarding it.
Owns: `translations` (cache). Depends on: `ai`, `integrations`.

### Intelligence

**`ai`** — **The single gateway to OpenRouter.** No other module talks to the LLM directly.
Responsibilities: client wrapper, model selection per task, retries and timeouts, token accounting, response caching, structured-output parsing with schema validation, prompt version stamping on every call, and graceful degradation (if the LLM is down, work queues for human review rather than failing the request).
Owns: `ai_calls` (audit of every inference: prompt version, model, tokens, latency, output). Consumes `prompts/`.
Why it's isolated: every AI decision in this system is challengeable by a citizen or an institution. You need the receipt.

**`classification`** — Two jobs, both LLM-assisted:
1. **Triage** — grievance vs innovation-challenge. The gate from handoff §6.2.
2. **Categorisation** — hierarchical multi-label over the taxonomy domains.
Both return a confidence. **Below threshold → human review queue, not a guess.** Abstention is a first-class outcome.
Owns: `classifications`, `review_queue`. Depends on: `ai`, `taxonomy`.

**`dedup`** — Candidate generation (geo radius + time window as hard filters), embedding similarity, cluster attach or create. Human confirm for borderline scores.
Owns: `embeddings`, `dedup_decisions`. Depends on: `ai`, `geo`, `clusters`.

**`capability-profiles`** — Structured institutional capability: topics, methodologies, applications, facilities, capacity. Three-layer bootstrap from handoff §5.4: self-declaration → public-source enrichment → outcome-learned correction.
Owns: `capability_profiles`, `profile_revisions`. Emits: `profile.updated`.
**Records refusals and failures, not only successes** — that's the learning signal.

**`matching`** — The routing engine. Produces a ranked shortlist, then runs the constrained assignment: capacity limits, COI exclusion, fairness/max-min so elite institutions don't absorb everything, workload balance.
Owns: `match_runs`, `match_rationales`.
**Every result stores its rationale** — matched capabilities, capacity, prior record. Non-negotiable (handoff §7).

### Workflow

**`challenges`** — The scoped brief and the central entity. Holds the two separate status fields from handoff §6.6: **problem resolution** and **solution maturity**. Never conflate them.
Owns: `challenges`. Emits: `challenge.scoped`, `challenge.state_changed`, `challenge.closed`.

**`workflow`** — The state machine engine and its configuration: `Submitted → Triaged → Scoped → Claimed → In project → Validated → Closed`. Per state it holds **owner, SLA, exit criteria, visibility** (handoff §6.2). Guards transitions, records every transition to `events`, refuses illegal moves.
Owns: `state_definitions`, `sla_policies`.
This module is configuration-driven so a policy change (e.g. SLA length) is a data edit, not a deploy.

**`claims`** — Claim window, first-valid-claim exclusivity lock, inactivity timer, **auto-release back to the pool**. COI check at claim time.
Owns: `claims`. Emits: `claim.locked`, `claim.released`.
Auto-release matters more than auto-assign (handoff §6.4b).

**`teams`** — Multidisciplinary team composition with single accountability: one accountable institution, one **faculty** nodal PI, co-mentors from other departments, student members, industry mentor, community liaison. Cohort membership with rollover and the **handover milestone** hook (handoff §6.7).
Owns: `teams`, `team_members`.

**`projects`** — Solution tracks under a challenge. Several tracks may run in parallel. Target TRL/SRL band declared at claim time. Light board (columns, cards) for team-side execution — deliberately shallow, because the portal must not become surveillance (handoff §6.1).
Owns: `projects`, `board_items`.

**`milestones`** — Gate definitions along the TRL axis and the societal (SRL) axis, evidence upload at gates, gate review and approval. Evidence at gates, **not activity tracking between gates**.
Owns: `milestones`, `gate_reviews`, `deliverables`.

### Governance

**`agreements`** — IP and participation agreement, signed at team formation **before the industry partner sees anything**: background vs foreground IP, student authorship rights, community royalty-free use, partner-exit terms. Blocks industry onboarding until signed.
Owns: `agreements`, `signatures`.

**`disputes`** — The escalation ladder as explicit state transitions: nodal PI → institutional committee → district committee → state PMU, each with a published timeline.
Owns: `disputes`. Emits: `dispute.escalated`.

**`validation`** — Community sign-off. The originating submitter (or nominated liaison/validators) confirms the problem is actually addressed on the ground. Failure path is a **policy decision still open** (handoff §10) — build the module so both outcomes are configurable: return-to-pool or close-as-attempted.
Owns: `validations`.

### Insight & integration

**`analytics`** — Read-only projections over the event log. Volume, domain distribution, institutional participation, industry engagement, progress, outcomes, patents, startups, district/sector splits.
**Must ship the bias correction from handoff §8:** per-capita normalisation, an explicit *coverage* metric separate from *volume*, and block-level baselines. A raw district heat map will misread reporting propensity as problem incidence.
Owns: `analytics_snapshots` (materialised rollups; recompute on schedule, don't aggregate live).

**`taxonomy`** — Thematic domains, capability vocabulary, TRL/SRL band definitions, reason codes for closure. Versioned, because reclassifying historical data must be traceable.
Owns: `taxonomies`, `taxonomy_versions`.

**`integrations`** — Outbound adapters: grievance-channel forwarding, translation/ASR services, SMS gateway, incubator/State Evaluation Board handoff. One adapter file each, all behind a common interface so any can be stubbed in dev.
Owns: `integration_logs`.

**`jobs`** — Scheduled work: SLA escalation sweeps, claim auto-release, embedding backfill, analytics recompute, notification digests, stale-project detection.
Owns: `job_runs`. Every job is idempotent and emits events like any other actor.

---

## 5. Cross-cutting mechanics

### 5.1 Event bus

In-process emitter that **writes to the `events` collection first, then dispatches to subscribers.** Persist-then-dispatch, so a crashed handler never loses the record.

Naming: `resource.action` past tense — `submission.created`, `challenge.state_changed`, `claim.released`, `milestone.gate_passed`.

Each module declares emissions and subscriptions in its `x.events.js`, so the coupling graph is readable from the filesystem.

### 5.2 State machine

`common/lib/state-machine.js` is generic: it takes a state definition (from `workflow`), the current state, the proposed transition, and the actor, then checks guard → exit criteria → policy → SLA side effects, and appends to the event log. `challenges`, `claims`, `disputes`, and `milestones` all run on it. One implementation, four consumers.

### 5.3 Authorization (ABAC, not plain RBAC)

`authorize.js` middleware calls `policy-engine.js`, which evaluates the resource module's `x.policy.js`. A rule is a predicate over `(actor, resource, action, context)`:

- district officer → resource.district ∈ actor.districts
- HEI member → resource is assigned to actor.org **or** resource is in the open pool and actor.org is eligible
- industry member → resource.project ∈ actor.onboardedProjects **and** agreement signed
- COI declared between actor.org and resource → **deny**, regardless of role

Projection is the second half of authorization: the policy decides *access*, the `x.mapper.js` decides *how much*. Public view gets a generalised centroid and no submitter identity.

### 5.4 AI gateway discipline

- Prompts live in `prompts/`, versioned, never inline.
- Every call is logged with prompt version + model + output.
- Structured outputs are schema-validated; a parse failure is a queue-for-human event, not a retry loop.
- Confidence thresholds are configuration, tunable per task without deploy.
- **Every AI decision must be reversible by a human, and the reversal is itself an event.**

---

## 6. Three request flows (to sanity-check the module boundaries)

**Citizen submits**
`submissions.controller` → `submissions.service` → emits `submission.created` → `language` normalises → `dedup` finds candidates → `clusters` attaches or creates → `classification` runs triage → grievance? `integrations` forwards out. Challenge? `classification` categorises → `matching` precomputes shortlist → `notifications` sends tracking ID.

**HEI claims a challenge**
`claims.controller` → policy check (eligible + no COI) → `claims.service` takes exclusivity lock → `workflow` transitions challenge to Claimed → `teams` scaffolds a team shell → `agreements` created in pending state → events logged → `notifications` to shortlisted institutions that the claim window closed.

**Milestone gate**
`milestones.controller` → evidence via `media` → `milestones.service` opens gate review → reviewer approves → `workflow` advances TRL/SRL band → `challenges` recomputes **solution maturity** (not problem resolution) → `analytics` snapshot invalidated → `notifications` to citizen with plain-language status.

---

## 7. Frontend architecture

Feature-sliced. Components co-locate with the feature they serve; only genuinely shared things go up a level.

```
client/
├── src/
│   ├── main.jsx
│   ├── App.jsx                      # router + providers
│   │
│   ├── app/
│   │   ├── router.jsx               # route table, role-gated
│   │   ├── providers.jsx            # query client, auth, theme, i18n, toast
│   │   └── guards/
│   │       ├── RequireAuth.jsx
│   │       ├── RequireRole.jsx
│   │       └── RequireOrgScope.jsx
│   │
│   ├── components/
│   │   ├── ui/                      # shadcn/ui — generated, yours to edit
│   │   │   ├── button.jsx  card.jsx  dialog.jsx  form.jsx
│   │   │   ├── table.jsx   tabs.jsx  select.jsx  badge.jsx
│   │   │   ├── sheet.jsx   toast.jsx  command.jsx  skeleton.jsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── AppShell.jsx  Sidebar.jsx  Topbar.jsx  RoleSwitcher.jsx
│   │   └── shared/
│   │       ├── StateBadge.jsx        # one component, all workflow states
│   │       ├── SLAIndicator.jsx      # time remaining / breached
│   │       ├── TRLMeter.jsx          # dual axis: TRL + SRL
│   │       ├── EvidenceUploader.jsx
│   │       ├── ConfidenceChip.jsx    # AI confidence + "why" popover
│   │       ├── AuditTrail.jsx        # renders the event log
│   │       ├── EmptyState.jsx  DataTable.jsx  PageHeader.jsx
│   │       └── LanguageSwitcher.jsx
│   │
│   ├── features/
│   │   ├── submission/              # citizen-facing, deliberately minimal
│   │   │   ├── components/ VoiceRecorder  MediaDropzone  LocationPicker
│   │   │   │               TrackingIdCard  AssistedSubmitToggle
│   │   │   ├── hooks/ useSubmit  useVoiceCapture
│   │   │   ├── api/ submission.api.js
│   │   │   └── pages/ SubmitPage  TrackStatusPage
│   │   ├── triage/
│   │   │   ├── components/ TriageQueue  GrievanceVsChallengeCard
│   │   │   │               ClassificationReview  DuplicateMerger
│   │   │   └── pages/ TriageDashboard
│   │   ├── challenges/
│   │   │   ├── components/ ChallengeCard  ChallengeFilters  ScopedBriefEditor
│   │   │   │               ChallengeTimeline  MatchRationalePanel
│   │   │   └── pages/ ChallengePool  ChallengeDetail
│   │   ├── claims/
│   │   │   ├── components/ ClaimWindowTimer  ClaimButton  COIDeclaration
│   │   │   └── pages/ MyClaims
│   │   ├── teams/
│   │   │   ├── components/ TeamBuilder  RoleAssigner  MentorInvite
│   │   │   │               DisciplineCoverageChart  HandoverPanel
│   │   │   └── pages/ TeamDetail
│   │   ├── projects/
│   │   │   ├── components/ ProjectBoard  TrackSwitcher  TargetBandSelector
│   │   │   └── pages/ ProjectWorkspace
│   │   ├── milestones/
│   │   │   ├── components/ GateReviewPanel  DeliverableList  EvidenceViewer
│   │   │   └── pages/ MilestonesPage
│   │   ├── workflow/                # ← React Flow lives here
│   │   │   ├── components/
│   │   │   │   ├── WorkflowCanvas.jsx       # React Flow instance
│   │   │   │   ├── nodes/ StateNode  GateNode  DecisionNode  TerminalNode
│   │   │   │   ├── edges/ TransitionEdge  EscalationEdge
│   │   │   │   ├── WorkflowLegend.jsx
│   │   │   │   └── StateInspector.jsx       # side panel on node click
│   │   │   ├── hooks/ useWorkflowGraph  useLiveState
│   │   │   └── pages/ WorkflowDesigner  ChallengeJourney
│   │   ├── organizations/
│   │   │   ├── components/ OrgOnboarding  CapabilityProfileEditor
│   │   │   │               VerificationBadge  CapacityMeter
│   │   │   └── pages/ OrgProfile  InstitutionDirectory
│   │   ├── industry/
│   │   │   ├── components/ PartnerOnboarding  AgreementSigner  IPTermsForm
│   │   │   └── pages/ PartnerWorkspace
│   │   ├── disputes/
│   │   │   ├── components/ EscalationLadder  DisputeThread
│   │   │   └── pages/ DisputesPage
│   │   ├── validation/
│   │   │   ├── components/ CommunitySignOff  ImpactEvidence
│   │   │   └── pages/ ValidationPage
│   │   ├── analytics/
│   │   │   ├── components/ KPIStat  DomainDistribution  DistrictMap
│   │   │   │               CoverageVsVolume  ParticipationChart  FunnelChart
│   │   │   └── pages/ GovDashboard  InstitutionDashboard
│   │   └── auth/
│   │       ├── components/ OTPForm  OrgLoginForm  InviteAccept
│   │       └── pages/ LoginPage  OnboardingPage
│   │
│   ├── lib/
│   │   ├── api-client.js            # fetch wrapper, auth header, error normalise
│   │   ├── query-keys.js            # centralised TanStack Query keys
│   │   ├── permissions.js           # mirrors backend ABAC for UI gating only
│   │   ├── format.js                # dates, TRL labels, state labels
│   │   ├── cn.js                    # shadcn class merger
│   │   └── i18n/
│   │       ├── index.js
│   │       └── locales/ en  hi  (+ regional as coverage lands)
│   │
│   ├── hooks/                       # cross-feature only
│   │   ├── useAuth.js  useRole.js  useDebounce.js  useMediaQuery.js
│   │
│   ├── store/                       # minimal client state; server state = Query
│   │   ├── auth.store.js
│   │   └── ui.store.js
│   │
│   └── styles/ globals.css          # tailwind + shadcn CSS variables
└── tailwind.config.js
```

### 7.1 Frontend rules

- **Server state is TanStack Query, not global store.** Zustand holds auth session and UI state only. This avoids the classic mistake of mirroring the whole workflow into Redux.
- **`components/ui/` is shadcn output — treat as owned source.** Style overrides go here, not in feature components.
- **`lib/permissions.js` is for hiding buttons, never for security.** Every gate is re-checked server-side.
- **One feature = one folder = one API file.** A feature never imports another feature's internals; shared pieces move to `components/shared/`.
- Feature folders mirror backend module names wherever possible, so a change traces cleanly across the stack.

### 7.2 Where React Flow is used (and where it isn't)

**Use it for three things:**
1. **Workflow designer** (PMU/admin) — edit state definitions, SLAs, exit criteria as a graph. Reads/writes `workflow` module config.
2. **Challenge journey** — one challenge's actual path through the state machine, rendered live from the event log, with the current node highlighted and completed edges styled. This is the "transparent workflow anyone can see" requirement made literal.
3. **Team & assignment graph** — challenge → institutions → departments → members → industry partner. Makes multidisciplinary coverage visible at a glance.

**Don't use it for:** the project task board (use a plain column layout), analytics (use a chart library), or anything a table renders better. React Flow is for graphs, not for looking impressive.

---

## 8. Suggested build order

Each phase should be independently demoable.

| Phase | Modules | Demoable outcome |
|---|---|---|
| 1 | `config`, `common`, `auth`, `users`, `organizations`, `events` | Login as each role; every action already lands in the audit log |
| 2 | `submissions`, `media`, `geo`, `taxonomy` | Citizen submits with photo + location, gets a tracking ID |
| 3 | `ai`, `classification`, `dedup`, `clusters` | Auto-triage and categorisation with confidence + human review queue |
| 4 | `capability-profiles`, `matching` | Ranked institution shortlist **with rationale** — the research centrepiece |
| 5 | `workflow`, `challenges`, `claims` | Full lifecycle with SLA escalation and auto-release, visualised in React Flow |
| 6 | `teams`, `projects`, `milestones`, `agreements` | Multidisciplinary team, TRL/SRL gates, IP signed before industry entry |
| 7 | `validation`, `disputes`, `notifications`, `analytics` | Community sign-off, escalation ladder, bias-corrected dashboards |

**Build `events` in phase 1, not later.** Retrofitting an append-only log after the fact means rewriting every service. It is the one piece where getting the order wrong costs you the whole audit story.

---

## 9. Architecture decisions worth defending in a review

1. **Append-only event log as the source of truth for status.** Buys the audit trail, the transparency requirement, and RTI-answerability in one move.
2. **`ai` as a single gateway with per-call logging.** Every AI decision is challengeable; you keep the receipt, including prompt version.
3. **`capability-profiles` separate from `organizations`.** Identity is administrative and static; expertise is derived and continuously corrected by outcomes.
4. **Two status fields on a challenge.** Solution maturity ≠ problem resolution. Prevents the dashboard from claiming victories that don't exist on the ground.
5. **Configuration-driven state machine.** Policy changes (SLA lengths, exit criteria) are data edits, not deployments — which matters when a government department revises timelines.
6. **Deliberately shallow project board.** The portal governs; it does not surveil. Over-instrumenting execution is what drives real work off-platform.