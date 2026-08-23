# Phase 5 — Collaboration, Governance & Insight

**Goal:** a claimed challenge becomes a multidisciplinary project with real accountability, gated milestones, signed IP terms, community sign-off, and dashboards that don't lie.

**Governing principle from `handoff.md` §6.1:** there are two workflows, not one. The portal owns a strict, auditable state machine over the *challenge*. It offers a **deliberately shallow** board over the *project*. Over-instrument execution and the real work moves to WhatsApp, and your dashboards become beautiful fiction.

---

## Modules built

`teams` · `projects` · `milestones` · `agreements` · `disputes` · `validation` · `notifications` · `analytics` · `integrations`

## Frontend built

`features/teams` · `features/projects` · `features/milestones` · `features/industry` · `features/disputes` · `features/validation` · `features/analytics`

---

## Work breakdown

### 5.1 `teams` — multidisciplinary, singly accountable
A multidisciplinary team is a coordination liability unless exactly one person is answerable.

| Role | Constraint |
|---|---|
| Accountable institution | Exactly one |
| **Nodal PI** | Must be **faculty** — permanent, never a student |
| Co-mentors | From other departments; this is what makes it multidisciplinary |
| Student members | Cohort-based, transient by design |
| Industry mentor | Joins at a defined gate, not at t=0 |
| Community liaison | Named link back to the original submitter |

- Discipline-coverage view: does the team actually span the capabilities the brief requires?
- **Handover milestone** built into the lifecycle: student teams graduate, and a challenge scoped in July with a 3rd-year team hits a hard cliff in ~18 months. Documented artifact repository as a gate condition, cohort rollover with deliberate overlap, faculty-anchored PI.

### 5.2 `agreements` — before industry sees anything
The killer of academia-industry projects, and the problem statement mentions IP only as a dashboard metric.

- Signed at team formation, **blocking industry onboarding** until complete.
- Covers: background vs foreground IP, student authorship rights, community royalty-free right to use, partner-exit terms.
- Signature events in the audit log.

### 5.3 `projects` + `milestones`
- Multiple **solution tracks** may run under one challenge, competing or complementary.
- **Target TRL band declared at claim time.** A student capstone realistically reaches TRL 3–4; a startup partnership takes it to 6–7. Defining success before work starts prevents arguing about it after.
- **Pair TRL with a societal axis (SRL).** A behaviour-change or governance-process solution has no TRL. Without a societal axis the workflow structurally discriminates against the social-science half of "multidisciplinary" — which would quietly undercut the NEP framing this whole project rests on.
- **Evidence uploaded at gates, no activity tracking between gates.** Gate review, approval, band advance.
- Board is plain columns and cards. Not React Flow, not a Jira clone.

### 5.4 `validation`
- Community sign-off by the originating submitter or nominated validators.
- **Solution maturity ≠ problem resolution.** A challenge closes only when the community confirms the problem is addressed on the ground, not when a prototype exists. This is what stops the dashboard claiming victories that don't exist in the village.
- **Failure path is a policy decision still open** (`handoff.md` §10) — build both outcomes as configuration: return-to-pool or close-as-attempted.
- Terminal states always publish a reason.

### 5.5 `disputes`
Escalation ladder as explicit state transitions on the shared state machine: nodal PI → institutional committee → district committee → state PMU, each with a published timeline.

### 5.6 `notifications`
- Subscribes to events, renders per channel, respects language preference.
- **Fires on state change, not activity.**
- Citizen-facing messages in plain language via `language`, in their locale.
- Cluster status propagates: every duplicate reporter is notified on the parent's transitions.

### 5.7 `analytics` — with the correction that matters
Read-only projections over the event log. Volume, domain distribution, institutional participation, industry engagement, progress, patents, startups, district/sector splits. Materialised nightly via a repeatable job; never aggregate live.

**The mandatory correction:** complaint volume reflects propensity to complain, not incidence of problems. A district heat map of Jharkhand will light up Ranchi and Jamshedpur and leave Simdega and Khunti dark — and officials will read that as "fewer problems there."

Ship three things because of this:
- Per-capita / per-block **normalisation**
- An explicit **coverage** metric, separate and visually distinct from **volume**
- Outreach-gap flagging for under-represented blocks

This is a small amount of code and the most defensible slide in your deck.

### 5.8 `integrations`
Grievance-channel forwarding (live or stubbed), SMS adapter, incubator / State Evaluation Board handoff. One adapter file each behind a common interface; anything unconfigured degrades to a logged stub, never a crash.

---

## Definition of done

- [ ] A claimed challenge produces a team spanning three departments with one faculty PI
- [ ] Industry partner cannot access the project until the agreement is signed
- [ ] A milestone gate advances only with uploaded evidence, and the review is an event
- [ ] A social-science project progresses on SRL with no TRL score, without being penalised
- [ ] Community sign-off flips problem resolution independently of solution maturity
- [ ] A dispute escalates through the ladder with published timelines
- [ ] Every duplicate reporter is notified on the parent challenge's transitions, in their language
- [ ] Dashboard shows coverage alongside volume, and flags an under-reporting district
- [ ] Closing any challenge requires and publishes a reason code

## Demo line

"Three institutions, one accountable PI, IP signed before the startup joined — and the dashboard says 'solution ready, problem not yet resolved,' because the village hasn't confirmed it."

---

## Cross-cutting close-out

- End-to-end rehearsal: submission → triage → cluster → scope → route → claim → team → milestones → validation → close, on one seeded challenge.
- Verify the **entire journey renders from the event log alone**. If any status was stored rather than derived, this is where it surfaces.
- Seed 30–50 real Jharkhand institutions and a few hundred realistic submissions.
- Kill the worker mid-demo-rehearsal and confirm SLA timers and queued jobs resume.

## Risks

| Risk | Mitigation |
|---|---|
| Project board grows into a Jira clone | Scope discipline: gates are the contract, the board is convenience |
| Analytics built on live aggregation, demo crawls | Materialised snapshots via repeatable job from day one |
| SRL treated as optional and dropped for time | It's the NEP multidisciplinarity claim. Cut board features first |
| Validation blocked because the failure policy is undecided | Ship both paths as config; state the open decision openly in the pitch |
| Notification spam from activity-level events | Subscribe only to state-change events |