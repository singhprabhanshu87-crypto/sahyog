# Societal Innovation Collaboration Portal — Context & Handoff

**Problem statement:** Jharkhand Societal Innovation Collaboration Portal — crowdsource societal challenges from citizens, route them to Higher Education Institutions (HEIs) and industry partners, and manage them to a deployable outcome.

**Status:** Research phase. This document captures design reasoning and feature decisions only. No tech stack, no schema, no implementation detail — those are downstream.

**Scope of this doc:** what the system must do, why, what is grounded in policy/prior art, and what is still undecided.

---

## 1. The core reframing

**This is not a grievance portal.**

The closest deployed Indian analogue is CPGRAMS, which already does auto-routing and categorisation by mapping last-mile Grievance Redressal Officers. But a grievance closes when *an official acts*. Our challenge closes when *an artifact is produced* — a prototype, a research project, a patent, a startup, credited student coursework.

That difference is the entire NEP 2020 grounding and it must be enforced structurally, not just stated in the pitch.

**Consequence:** the system needs an explicit triage gate that separates *redressal* items from *innovation* items and forwards the redressal ones to the existing state grievance channel. This is not in the PS. Without it, the HEI dashboard fills with maintenance tickets ("this handpump is broken") and universities disengage within a month.

**Prior art on the HEI side:** Unnat Bharat Abhiyan (Ministry of Education) already connects HEIs to rural communities to identify development challenges and evolve solutions — roughly 13,072 villages and 2,474 institutes as of the 2023 progress report. Its structural weakness is that matching is by **geography** (each HEI adopts ~5 nearby villages), not by **expertise**. Our contribution is replacing geographic adoption with capability-based routing.

---

## 2. Policy grounding (NEP 2020 + state context)

Do not gesture vaguely at the six NEP keywords. Anchor to these specific provisions:

| Hook | What it says | How we use it |
|---|---|---|
| Credit-bearing community work | NEP requires HEI curricula to include credit-based courses and projects in community engagement and service, environmental education, and value-based education | This is the **incentive engine**. A claimed challenge must generate a creditable student project with milestone evidence usable for NAAC/ARIIA. Participation stops being charity. |
| Three functions of HEIs | NEP frames HEI roles as education, research, **and service** — knowledge creation, innovation, problem-solving, constructive public engagement | The portal is infrastructure for the third function. |
| Innovation & industry linkage | NEP directs HEIs to set up start-up incubation centres, technology development centres, industry-academic linkages, interdisciplinary research | Industry module plugs into this, doesn't invent a parallel track. |
| NRF linkage | NRF-funded research to be recognised and implemented through close linkages with government agencies and industry | Positions validated solutions for onward funding. |

**Jharkhand-specific context:**
- 447 functional higher and technical education institutions in the state; GER 17.0 vs national 27.3 (AISHE 2021-22).
- 32 universities, of which 5 are Institutes of National Importance.
- Jharkhand Startup Policy 2023 gives HEIs endowments for incubation/innovation centres (up to ₹1 crore year one, up to ₹50 lakh annually for four more years) under a performance contract requiring the centre to mentor at least 20 startups a year, approved by the State Evaluation Board.
- **Implication:** a challenge that graduates into a startup should be traceable into that existing State Evaluation Board machinery. Do not build a parallel incubation apparatus.
- Ranchi University has sanctioned a tribal & regional languages centre covering Kurukh, Mundari, Ho, Kharia, Santali, Nagpuri, Kurmali, Khortha, Panchpargania — useful institutional partner and a map of our hardest language gaps.

---

## 3. Phase 1 — Citizen submission

**Principle: never ask the citizen to classify.**

Evidence: a World Bank design sprint on Indian grievance systems found the winning pattern was an assistant that interprets Indian languages and dialects and routes a phrase like "paani nahi aa raha" to the water department — *without* making the user pick from 18,000+ subcategories. Every taxonomy dropdown on the form is a dropout point and a mislabel source.

**Capture only:** free text or voice, location, media (photo/video/document). Derive everything else.

**Features**
- Voice-first intake. Text is the fallback, not the default.
- Multilingual by design. Bhashini already carries translation coverage for Ho, Santali, Magahi, Maithili among others; Adi-Vaani targets Santali, Bhili, Mundari, Gondi with speech recognition for languages that have relied on oral transmission.
- **Degraded-language handling:** Khortha, Nagpuri and Kurmali are heavily spoken in Jharkhand and poorly resourced. If translation confidence is low, do **not** discard — flag for human-assisted intake via a CSC or panchayat facilitator.
- Assisted submission channel: a facilitator (CSC operator, panchayat functionary, NGO worker) can submit on behalf of a citizen, with the citizen recorded as the originator.
- Every submission returns a tracking ID immediately, readable back over voice.
- Submitter is asked one thing only beyond the report itself: are they willing to be contacted as a community validator later.

---

## 4. Phase 2 — Access model

The PS says RBAC. What we actually need is **attribute-scoped** access, because the same role sees different things depending on district, assignment, and onboarding status.

**Actors:** citizens, community organisations, PRIs, Urban Local Bodies, government departments, HEIs (faculty + students), industry/startups/MSMEs, CSR organisations, research labs, incubators, state PMU.

**Scoping rules**
- A district officer sees their district.
- An HEI sees challenges assigned to it, **plus** the open pool it is eligible to claim from.
- An industry partner sees only projects it has been onboarded onto — and never raw citizen PII.
- The public sees the challenge and its status, not the submitter.

**Two things to build in explicitly**
1. **Location generalisation for public views.** Exact geotags plus photos on a public dashboard exposes the submitter. Snap to ward/panchayat centroid for anything below assignee-level roles.
2. **Conflict-of-interest as an access attribute**, not a policy note. Checked at assignment time (see §6).

---

## 5. Phase 3 — The intelligence layer

This is where the actual research contribution is. Four named problems — naming them gives us literature to cite instead of hand-waving.

### 5.1 Categorisation (hierarchical multi-label)

The ten thematic domains are **not** mutually exclusive. A school-water-sanitation problem is three domains.

Realistic ceiling: NLP-based complaint categorisation in the CPGRAMS context has been reported around 85–90% accuracy. Treat that as the ceiling, not the target.

**Therefore abstention matters more than accuracy.** Below a confidence threshold, the item goes to a human reviewer rather than being routed wrongly. A misrouted challenge sitting with an unqualified institution for two months is worse than a queued one.

### 5.2 Deduplication

Near-duplicate detection with a spatiotemporal constraint.

Text alone will not do it — in comparable duplicate-report work, most top-10 similarity scores fall below 0.5 (Recall@10 ≈ 0.61); duplicates are linguistically subtle. Geo-proximity and time-window must act as hard filters. That's what makes civic dedup tractable where pure text dedup isn't.

**Duplicate volume is a signal, not just noise.** Research on resident crowdsourcing uses the rate of duplicate reports about the same incident to infer reporting behaviour without external ground truth. Twelve people reporting the same borewell failure is a **severity/priority input**, and should feed prioritisation.

### 5.3 Routing — this is the Reviewer Assignment Problem

**The single most valuable framing in this project.** Matching a problem statement to an institution with the right faculty expertise is formally the same problem as matching a paper to peer reviewers, with ~20 years of literature.

Canonical pipeline: build profiles on both sides, represent expertise from prior work, compute similarity (classically vector-space or LDA; modern systems use dense embeddings — ACL Rolling Review uses SPECTER-based affinity, cosine similarity between submission and reviewer-history embeddings, then MinMax matching).

**Similarity is not the assignment.** The assignment is constrained optimisation. A recent approach uses embeddings for proposal–reviewer relevance, then multi-objective integer linear programming optimising similarity and competency while preventing conflicts of interest, with a max-min strategy for fair treatment of less-advantaged proposals and workload balancing.

Mapped to us: institutional capacity limits, COI, and **fairness** — so IIT-ISM Dhanbad and BIT Mesra don't absorb 80% of challenges while state colleges get nothing. Fair-matching literature exists precisely because naive matching produces skewed workloads and reviewer sets lacking collective expertise.

**Critical refinement — capability ≠ topic.** Don't embed raw text on both sides. Extract structured capability profiles (topics / methodologies / applications), because dense embeddings collapse distinct competence dimensions into one scalar and hide structural mismatches — same topic, wrong methodology.

> A water problem may need civil engineering, IoT sensing, public health, or policy/social science. The **domain does not determine the discipline.** Intent routing must resolve "what capabilities does solving this require," not "what topic is this about." Those are different vector spaces, and conflating them is why naive category→department routing produces bad assignments.

Because "multidisciplinary" implies multiple institutions/departments per challenge, this is a **set-assignment** problem, not one-to-one.

### 5.4 Capability profile cold start — the real bottleneck

**The institutional capability data does not exist.** Reviewer assignment works because reviewers have publication histories. Most of Jharkhand's 447 HEIs have no machine-readable expertise profile and little research output to embed.

Layered bootstrap:
1. **Self-declaration at onboarding** — departments, faculty specialisations, labs, equipment, incubation facilities.
2. **Enrichment from public sources** — NIRF/NAAC/AISHE data, IIC membership, faculty publications where they exist.
3. **Learned correction from outcomes** — institutions that accepted and completed similar challenges get upweighted.

Step 3 is the actual research contribution and what makes the system improve rather than ossify. **Record refusals and failures, not only successes.**

---

## 6. Workflow management

### 6.1 There are two workflows, not one

- **Governance workflow** — state of the *challenge*. Owned by the state PMU. Publicly visible. SLA-bound. Small and strict.
- **Execution workflow** — the team's actual task board. Owned by the HEI. Private. Messy.

**If you force universities to run real project work inside the portal's state machine, they will do the work in WhatsApp and update the portal quarterly with fiction.** Dashboards will be beautiful and false.

So: the portal owns a strict auditable state machine over the challenge, and offers a *light* project board over the project — with **evidence upload at gates, not activity surveillance**.

### 6.2 The challenge state machine

```
Submitted → Triaged → Scoped → Claimed → In project → Validated → Closed
```

Every state must fix four things in its definition:

| Attribute | Meaning |
|---|---|
| **Owner** | Who is allowed to move it out of this state |
| **SLA** | How long before it escalates |
| **Exit criteria** | What evidence unlocks the next state |
| **Visibility** | Who sees what while it sits here |

**A state with no clock is a state where challenges die.** CPGRAMS is the proof the pattern works in Indian government at scale: redressal within 21 days with interim replies if longer, and automated escalation on non-processing.

**State-by-state notes**

- **Submitted** — tracking ID issued immediately. Public sees a generalised location.
- **Triaged** — the gate. Grievance vs challenge. AI proposes, human confirms below confidence threshold. Grievance-type items are forwarded to the state grievance channel with the citizen told where it went. Dedup happens here (cluster attach).
- **Scoped** — *not in the PS; must be added.* A citizen report is not a problem statement. A domain officer or the receiving HEI's nodal faculty converts "the water is bad in our block" into a scoped brief: constraints, current baseline, success criteria, ground-access owner. Without this state, teams spend two months rediscovering the problem, and you cannot compose a multidisciplinary team because you don't yet know which disciplines are needed. The brief is published openly.
- **Claimed** — exclusivity lock, single accountable owner (see §6.3, §6.4).
- **In project** — gated milestones (see §6.5).
- **Validated** — community sign-off, not just a working prototype.
- **Closed** — **reason always published**, whatever the outcome.

### 6.3 Team model — multidisciplinary but singly accountable

A multidisciplinary team is a coordination liability unless exactly one person is answerable.

| Role | Notes |
|---|---|
| **Accountable institution** | Exactly one |
| **Nodal PI** | Named **faculty** — permanent, not a student |
| Co-mentors | From other departments; this is what makes it multidisciplinary |
| Student members | Cohort-based, transient by design |
| Industry mentor | Joins at a defined gate, not at t=0 |
| **Community liaison** | Named link back to the original submitter |

**Collaboration is many-to-many; accountability is one-to-one.**

### 6.4 The four "conflicts" — four different mechanisms

The word "conflict" is doing four jobs. They do not share a solution.

**a) Conflict of interest.** A solving institution or its industry partner must not evaluate a challenge it is implicated in (a college evaluating a challenge about its own district's contractor; an MSME evaluating a challenge naming its sector). Declared at onboarding, re-checked at every assignment, **blocking**. Declining for COI must be a first-class, non-punitive action.

**b) Contention over the same challenge.** Two HEIs want it, or nobody does.
- Routed to top-N matched institutions.
- Open for a fixed **claim window**.
- First valid claim takes an **exclusivity lock**.
- **Auto-release on inactivity** returns it to the pool.

> Auto-release matters more than auto-assign. The universal failure mode in these portals is challenges parked forever by an institution that never started.

**c) Data-level conflict.** Two roles editing the same record. Make the workflow **append-only**: every action is an immutable event (state changed, milestone submitted, comment added, evidence uploaded) carrying actor, timestamp, and rationale. **Current status is derived from the event log, never edited in place.** This gives the audit trail and the transparency requirement for free, and means "who changed this and why" is always answerable — which is what an RTI will ask.

**d) IP and credit disputes.** The killer of academia-industry projects; the PS mentions IP only as a dashboard metric. The agreement is signed **at team formation, before the industry partner sees anything**:
- Background IP vs foreground IP
- Student authorship rights
- Whether the community gets a royalty-free right to use
- What happens on partner exit

NEP is explicit that academia-industry collaboration requires patent policy and compliance frameworks.

**Dispute escalation ladder** (an explicit state transition, with published timelines): nodal PI → institutional committee → district committee → state PMU.

### 6.5 Milestones — TRL as the shared vocabulary

A civil engineer, a social scientist and a startup founder describe "progress" differently. TRL gives one scale everyone already accepts: nine levels of technology maturity, assessed against programme concepts, technology requirements and demonstrated capabilities. Indian agencies already use it — BIRAC publishes TRL definitions covering proof of concept, prototype development, functional validation from models to real operational environments, and regulatory clearances toward market introduction.

**Two required adaptations:**

1. **Declare a target TRL band at Claimed.** A student capstone realistically reaches TRL 3–4; a startup partnership takes it to 6–7. Defining success *before* work starts prevents arguing about it after.
2. **Pair TRL with a societal axis.** TRL is criticised because uncritical use skews decisions toward higher-TRL, risk-averse projects and reduces innovation to a linear pipeline. A behaviour-change or governance-process solution has **no TRL**. Societal Readiness Level exists as a parallel scale for exactly this; Business Readiness Level likewise. Without a societal axis, the workflow structurally discriminates against the social-science half of "multidisciplinary."

Gate reviews at band boundaries. Evidence uploaded at the gate; no activity tracking between gates.

### 6.6 Status rollup — "what is the status of the parent?"

Status is not one field. The hierarchy:

```
Cluster (deduplicated citizen reports)
  └── Challenge (one scoped brief)
        └── Solution track(s)  ← may be several, competing or complementary
              └── Milestones
                    └── Deliverables / evidence
```

**Rule 1 — challenge status is not the max of its children.** If three institutions run three tracks and one hits TRL 6, the challenge is not "solved" — it is "solution available, not deployed."

> Keep **solution maturity** and **problem resolution** as two separate fields. A challenge closes only when the community confirms the problem is addressed on the ground, not when a prototype exists. This is what stops the dashboard claiming victories that don't exist in the village.

**Rule 2 — cluster status propagates downward, not upward.** Every duplicate reporter gets the parent challenge's status on their own tracking ID, automatically. That is what makes 200 people feel heard by one project.

### 6.7 Continuity — the risk nobody plans for

Student teams graduate. A challenge scoped in July with a 3rd-year team hits a hard cliff in ~18 months.

- **Handover milestone** built into the state machine.
- Documented artifact repository as a gate condition.
- Cohort rollover with deliberate overlap.
- Accountable PI is faculty (permanent), never a student (transient).

Without this, the archive fills with 60%-complete projects nobody can restart — the pattern that has limited UBA's cumulative impact despite its reach.

---

## 7. Transparency & communication

- **Public challenge page** per challenge: scoped brief, current state, assigned institution, milestone history, closure reason. No submitter PII, generalised location.
- **Plain-language status timeline** for the citizen, readable on their tracking ID, in their language.
- **Immutable audit trail** from the append-only event log.
- **Explainable assignment.** When an institution is assigned, the portal must show *why*: matched capabilities, capacity, prior record. Black-box routing in a government workflow produces appeals you cannot answer — citizens already file RTIs asking how auto-routing engines are trained and how misrouting is corrected. **Log the match rationale per assignment from day one.**
- **Notifications on state change**, not on activity. Every terminal state triggers a published reason.

---

## 8. Dashboards & analytics

Everything is derived from the event log. What the PS asks for: challenge volume, domain-wise distribution, institutional participation, industry engagement, project progress, measurable social outcomes, patents, startups created, district/sector breakdowns.

**One mandatory correction:**

> **Under-reporting bias will corrupt the dashboards.** The 311 literature is consistent that complaint volume reflects propensity to complain, not incidence of problems — disparities arise from differing trust in government and differing expectations about whether government will respond, and this translates directly into downstream disparities in how quickly incidents get addressed.

A district-wise heat map of Jharkhand will light up Ranchi and Jamshedpur and leave Simdega and Khunti dark. Officials will read that as "fewer problems there."

**Mitigations:** a normalisation layer (submissions per capita, per-block baselines), an explicit "coverage" metric distinct from "volume", and active outreach quotas rather than purely demand-driven routing.

---

## 9. PS coverage check

| PS expected component | Covered by | Status |
|---|---|---|
| Citizen engagement module | §3, Submitted state | ✓ |
| AI problem management (categorise, prioritise, dedupe, route) | §5, Triaged state | ✓ |
| University collaboration module | §6.2 Claimed, §6.3 team model | ✓ |
| Industry partnership module | Industry joins at a defined milestone gate, not t=0 | ✓ |
| Project lifecycle management | §6.5 TRL gates, §6.4d IP, evidence at gates | ✓ |
| Visual analytics dashboard | §8 (derived from event log) | ✓ |
| Notification & communication | §7, state-change triggers | ✓ |

**Four things we add that the PS is silent on — flag these as the contribution:**
1. The **triage gate** (grievance vs challenge)
2. The **Scoped state**
3. **Auto-release on inactivity**
4. **Problem resolution vs solution maturity** as separate fields

---

## 10. Open decisions (not technical — need a policy call)

1. **What happens when validation fails?** Does the challenge return to the pool, or close as "attempted"? This is a departmental policy decision, not an engineering one.
2. **Who pays for the prototype** between Claimed and industry entry? This is the valley where student projects stall, and the PS does not address it.
3. **Grievance forwarding** — do we integrate with the existing state channel, or just tell the citizen where to go?
4. **Exclusivity window length** and inactivity threshold — needs to be calibrated to the academic calendar, not to a generic SLA.
5. **Target TRL band policy** — who sets it, and can it be revised mid-project?

---

## 11. Known risks

| Risk | Mitigation |
|---|---|
| Portal fills with grievances, HEIs disengage | Triage gate (§6.2) |
| Routing is only as good as capability data, which doesn't exist | Layered bootstrap + outcome learning (§5.4) |
| Elite institutions absorb all challenges | Fairness constraint in the assignment (§5.3) |
| Teams graduate mid-project | Handover milestone, faculty-anchored PI (§6.7) |
| Dashboards mistake reporting bias for problem distribution | Normalisation + coverage metric (§8) |
| Universities update the portal with fiction | Two-workflow split, evidence at gates (§6.1) |
| IP dispute kills the industry partnership | Agreement signed at team formation (§6.4d) |
| Black-box routing generates unanswerable appeals | Match rationale logged per assignment (§7) |

---

## 12. Next research steps (in decreasing value)

1. **Quantify the triage ratio.** Build a labelled set of real citizen submissions and measure how many are researchable challenges vs grievances. **This ratio determines whether the whole platform is viable** and should be answered before anything else.
2. **Capability profile design.** Routing quality is bounded by the profile, not by the model.
3. **Assignment formulation.** Choose between min-cost flow and ILP, driven by the need for *multi-institution teams per challenge* — which makes it a set-assignment problem.
4. Societal Readiness Level definitions adapted to the ten thematic domains.
5. Low-resource language coverage audit for Khortha, Nagpuri, Kurmali specifically.

---

## 13. Reference index

- **CPGRAMS** — auto-routing, categorisation, 21-day SLA, automated escalation, AI/ML routing explored via IGMS with IIT Kanpur. The SLA + escalation pattern is proven at scale in Indian government.
- **World Bank / CIVIC design sprint** — don't make citizens classify; interpret dialect, route intent.
- **Unnat Bharat Abhiyan** — HEI-community linkage precedent; geography-based matching is its structural limit.
- **NEP 2020** — credit-based community engagement projects; education/research/service; incubation and industry linkage; NRF.
- **Jharkhand Startup Policy 2023 / Industrial Policy 2021** — incubation endowments, State Evaluation Board, 32 universities.
- **Reviewer Assignment Problem literature** — profile-based matching, SPECTER affinity, ILP with COI + fairness + workload balancing, structured capability profiles (topics/methodologies/applications).
- **Duplicate detection literature** — semantic similarity limits, duplicate rate as signal.
- **311 / resident crowdsourcing literature** — socio-spatial reporting bias.
- **TRL** — NASA origin, 1–9 scale, BIRAC/DBT adoption in India; SRL and BRL as parallel axes; linear-pipeline critique.
- **Bhashini / Adi-Vaani** — multilingual and tribal-language coverage.