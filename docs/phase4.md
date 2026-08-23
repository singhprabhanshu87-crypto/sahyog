# Phase 4 — Intent Routing & the Challenge Lifecycle

**Goal:** a scoped challenge finds the institutions actually capable of solving it, one of them takes accountable ownership, and the whole path is visible and time-bound.

**This is the research centrepiece.** Everything before it was plumbing. Formally, matching a problem statement to an institution with the right faculty expertise is the **Reviewer Assignment Problem** — the same problem as assigning papers to peer reviewers, with two decades of literature behind it. Name it that way; it's what turns "AI routing" from a buzzword into a defensible method.

---

## Modules built

`capability-profiles` · `matching` · `challenges` · `workflow` · `claims`

## Frontend built

`features/challenges` · `features/claims` · `features/workflow` (React Flow) · `features/organizations` (profile editor)

---

## Work breakdown

### 4.1 `capability-profiles` — the real bottleneck
**The data does not exist.** Reviewer assignment works because reviewers have publication histories. Most of Jharkhand's 447 HEIs have no machine-readable expertise profile.

Three-layer bootstrap:
1. **Self-declaration at onboarding** — departments, faculty specialisations, labs, equipment, incubation facilities, capacity.
2. **Public-source enrichment** — NIRF/NAAC/AISHE data, IIC membership, faculty publications where they exist. `scripts/seed-institutions.js`.
3. **Outcome-learned correction** — institutions that accepted and completed similar challenges get upweighted.

**Structured profiles, not raw text embeddings.** Store capability along separate axes — topics, methodologies, applications. Dense embeddings collapse distinct competence dimensions into one scalar and hide structural mismatches (right topic, wrong methodology).

> A water problem may need civil engineering, IoT sensing, public health, or policy/social science. **The domain does not determine the discipline.** Routing must resolve "what capabilities does solving this require," not "what topic is this about." Those are different vector spaces, and conflating them is why naive category→department routing fails.

**Record refusals and failures, not just successes** — that's the learning signal that makes the system improve instead of ossify.

### 4.2 `matching`
Two stages, and they are not the same thing.

**Stage 1 — relevance.** Extract required capabilities from the scoped brief (LLM, via `ai`), embed both sides, score similarity per axis.

**Stage 2 — constrained assignment.** Similarity is *not* the assignment. Produce a ranked shortlist subject to:
- **Capacity** limits per institution
- **COI exclusion** — blocking, checked here and again at claim time
- **Fairness / max-min** — so IIT-ISM Dhanbad and BIT Mesra don't absorb 80% of challenges while state colleges get nothing
- **Workload balance** across the current open pool

Because "multidisciplinary" implies multiple institutions or departments per challenge, this is a **set-assignment** problem, not one-to-one. Start with a greedy fair-allocation heuristic; document that ILP or min-cost flow is the principled formulation.

**Every result stores its rationale** — matched capabilities, capacity, prior record. Non-negotiable: black-box routing in a government workflow generates appeals you can't answer.

### 4.3 `challenges`
- The scoped brief and the central entity.
- **The Scoped state is not in the problem statement and must be added.** A citizen report is not a problem statement. A domain officer or the receiving HEI's nodal faculty converts "the water is bad in our block" into constraints, current baseline, success criteria, ground-access owner. Without it, teams spend two months rediscovering the problem — and you can't compose a multidisciplinary team because you don't yet know which disciplines are required.
- LLM drafts the brief; a human owns and publishes it.
- **Two separate status fields:** `problemResolution` and `solutionMaturity`. Never conflate. A prototype existing is not a problem being fixed.
- The brief is published openly.

### 4.4 `workflow`
The state machine engine: `Submitted → Triaged → Scoped → Claimed → In project → Validated → Closed`.

Per state, four things fixed in configuration: **owner** (who can move it out), **SLA** (time before escalation), **exit criteria** (what evidence unlocks the next state), **visibility** (who sees what while it sits here).

- Guards transitions, refuses illegal moves, records every transition to `events`.
- **Configuration-driven**, so an SLA change is a data edit, not a deploy — which matters when a department revises timelines.
- SLA escalation as a BullMQ **repeatable job**, not `node-cron`. Repeatables live in Redis, survive restarts, and won't double-fire across two instances.
- Runs on the shared `common/lib/state-machine.js`, later reused by `claims`, `disputes`, `milestones`.

### 4.5 `claims`
- Routed to top-N matched institutions; open for a fixed **claim window**.
- First valid claim takes an **exclusivity lock**. COI re-checked at claim time.
- **Auto-release on inactivity** returns the challenge to the pool.

> Auto-release matters more than auto-assign. The universal failure mode in these portals is challenges parked forever by an institution that never started.

### 4.6 React Flow — where it earns its place
Three uses, and only three:
1. **Challenge journey** — one challenge's actual path through the state machine, rendered live from the event log, current node highlighted, completed edges styled. This makes "transparent workflow anyone can see" literal.
2. **Workflow designer** (PMU) — edit state definitions, SLAs and exit criteria as a graph.
3. Assignment graph — challenge → institutions → departments (phase 5 extends it to team members).

**Not** for the task board, not for analytics. React Flow is for graphs, not for looking impressive.

---

## Definition of done

- [ ] A scoped challenge produces a ranked shortlist of five institutions, each with a visible rationale
- [ ] Two challenges in the same domain but needing different disciplines route to different institutions
- [ ] Fairness constraint demonstrably prevents one institution absorbing everything
- [ ] A COI-declared institution never appears in a shortlist
- [ ] Claim window opens, first valid claim locks it, others see it as taken
- [ ] SLA breach escalates automatically; restarting the worker doesn't double-fire it
- [ ] Inactive claim auto-releases back to the pool
- [ ] Challenge journey renders live in React Flow from the event log alone
- [ ] An illegal state transition is refused with a readable reason

## Demo line

"Same domain, two problems, two different institutions — and here's exactly why each was chosen, including the ones we ruled out."

---

## Explicitly out of scope

Teams, milestones, IP, validation, analytics. A claimed challenge sits in `Claimed` waiting for phase 5.

## Risks

| Risk | Mitigation |
|---|---|
| No real institutional data to match against | Seed 30–50 real Jharkhand HEIs from public sources; a thin but honest profile beats a rich fake one |
| Matching degenerates to keyword overlap | Keep capability axes separate; show per-axis scores in the rationale panel |
| Scoped state skipped because it needs a human | It's the load-bearing state. Demo it with the LLM draft plus a human publish |
| ILP treated as required for the demo | Greedy fair allocation is fine and honest; document the principled formulation as future work |
| SLA timers stop silently on restart | BullMQ repeatables, verified by killing the worker during the demo rehearsal |