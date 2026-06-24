---
name: product-requirements
description: Turns a validated idea or audit into a concrete Product Requirements Document (PRD), broken down into epics, user stories, and acceptance criteria, prioritized with RICE. Use when starting the Definition phase of a project, when scoping an MVP, when moving from Discovery (docs/product/) to an executable plan, or when the user asks for a PRD, specs, requirements, epics, user stories, acceptance criteria, or MVP scope. Reads docs/product/ and docs/features/feature-inventory.md, produces docs/product/prd.md plus per-epic files under docs/features/, updates memory/06-feature-map.md with prioritized features, and finishes by inviting the user to confirm MVP scope before architecture-mapper or implementation-planner run. Runs doubt-surfacer first if the project lacks answers on target user, monetization, or non-negotiables.
---

# Product Requirements

## Goal

Convert a validated problem space into an **executable product specification**. The PRD must be detailed enough that an engineer with zero product context can read it and know exactly what to build, why, for whom, and when a feature is "done".

A PRD is not a wishlist; it is a **decision document**. It commits to a scope and prioritization that the team can ship against. Everything that is not in the PRD is explicitly out of scope.

## When to use

**Always:**
- Entering the Definition phase after `project-deep-audit`.
- Scoping an MVP for the first time.
- Reshaping scope after a pivot or major decision.
- Before `architecture-mapper` runs (architecture must serve a defined product, not the other way around).
- When the user asks for "PRD", "specs", "requirements", "epics", "user stories", "acceptance criteria", "MVP scope".

**Trigger keywords:** "PRD", "requirements", "specs", "epics", "user stories", "acceptance criteria", "MVP scope", "product spec", "what should we build first".

**Do NOT use for:**
- Still-fuzzy problems (run `project-deep-audit` first).
- Single-feature additions to a shipped product (use `feature-breakdown` instead).
- Pure technical changes with no user-facing outcome (use `implementation-planner`).

## Prerequisites

Run `doubt-surfacer` first **if any of these are unclear**: primary user, core job-to-be-done, monetization intent, top 3 non-negotiables, success metric.

Then read:

1. `CLAUDE.md`
2. `memory/00-project-brief.md`
3. `memory/01-product-vision.md`
4. `docs/product/executive-summary.md` (written by `project-deep-audit`)
5. `docs/product/personas.md`
6. `docs/product/scenarios-and-pivots.md`
7. `docs/features/feature-inventory.md`
8. `memory/06-feature-map.md` (current status if any)
9. `memory/10-open-questions.md` (strategic questions still open)

## Process

### Step 1 — Define the MVP boundary

Before any feature list, answer in writing (inside `docs/product/prd.md`):

1. **Primary user** — one persona. Not three.
2. **One job-to-be-done** — the single outcome the MVP must deliver.
3. **Success metric** — one North Star input the MVP will move within 8 weeks.
4. **Non-goals** — three things the MVP explicitly will NOT do.

If the user cannot commit to one of each, stop and rerun `doubt-surfacer`. Vague answers at this stage produce scope creep later.

### Step 2 — Draft epics

An epic is a cohesive slice of value (~1–4 weeks of work) that can be shipped and measured. Aim for 3–7 epics in an MVP. More than 7 means the MVP is not actually an MVP.

For each epic, write a one-page file at `docs/features/<epic-slug>.md` with this structure:

```markdown
# Epic: <Name>

## Problem
## User (persona + context)
## Desired outcome (metric-level, not feature-level)
## Scope (what is in)
## Out of scope (what is explicitly NOT in)
## Dependencies (other epics, infra, decisions)
## Risks & open questions
## User stories
```

### Step 3 — Write user stories with acceptance criteria

Inside each epic file, list user stories using this canonical format:

```markdown
## US-<epic>-<n> — <title>

**As a** <persona>
**I want** <capability>
**So that** <outcome>

### Acceptance criteria
- [ ] Given <precondition>, when <action>, then <observable result>.
- [ ] Given <precondition>, when <action>, then <observable result>.
- [ ] Edge case: …

### Out of scope for this story
- …

### Success signal
- <metric or event that shows it works in the wild>
```

Rules:
- Acceptance criteria are **observable**. "The user feels confident" is not a criterion. "A success toast appears and the new row is visible in the list within 500ms" is.
- Every story has at least one "Edge case" criterion. Happy paths alone are incomplete.
- Every story has a **Success signal** tied to the epic's outcome metric.

### Step 4 — Prioritize with RICE

For each story (and each epic, aggregated), fill a RICE score:

- **Reach** — how many users affected per time unit (concrete number or range).
- **Impact** — Massive (3) / High (2) / Medium (1) / Low (0.5) / Minimal (0.25).
- **Confidence** — % confidence in the numbers (e.g. 80%, 50%, 20%).
- **Effort** — engineer-weeks (estimate, not exact).

Score = (Reach × Impact × Confidence) / Effort.

Save the RICE table in `docs/product/prd.md` under a "Prioritization" section. Sort descending. The MVP is the **top N stories whose cumulative effort fits the 8–12 week budget**. Everything below the cut is the post-MVP backlog.

### Step 5 — Produce the consolidated PRD

Assemble `docs/product/prd.md` with this structure:

```markdown
# PRD — <Project Name>

**Date:** YYYY-MM-DD
**Status:** Draft | Approved | Superseded
**Authors:** User + <Model>

## 1. MVP Boundary
(from Step 1)

## 2. Personas (link to docs/product/personas.md)

## 3. Epics (with links to docs/features/<epic>.md)

## 4. User stories (indexed)

## 5. Prioritization (RICE table)

## 6. Success metrics
### North Star
### Input metrics (one per epic)

## 7. Non-goals

## 8. Risks tied to product decisions (link to memory/08-known-risks.md)

## 9. Open decisions
(Items where the PRD chose an option but the decision is reversible.)

## 10. Change log
- YYYY-MM-DD — Initial draft.
```

### Step 6 — Update `memory/06-feature-map.md`

Move every MVP story into `memory/06-feature-map.md` under the "MVP scope" table, with status `Planned` and priority from the RICE ranking. Move everything below the cut to "Post-MVP backlog".

### Step 7 — Surface dependencies for downstream skills

Before closing, list:

- **For `architecture-mapper`:** which epics drive architectural decisions (e.g. "multi-tenant requires X"). State them explicitly so the architecture is scoped to the MVP, not the 5-year vision.
- **For `flow-analyzer`:** which user stories need a formal user flow before implementation (anything marked "critical" or touching auth/payments/data mutations).
- **For `research-first`:** any external library, API, or service whose viability affects scope.

### Step 8 — Invoke `memory-updater`

Persist:

- `memory/06-feature-map.md` refreshed.
- `memory/07-decisions-log.md` entry: "PRD approved with MVP boundary X".
- `memory/10-open-questions.md` updated with strategic questions surfaced during the PRD.

### Step 9 — Closing invitation

Finish with the PRD summary, then emit a **MEDIUM** Command Recommendation:

```markdown
"PRD draft saved. The MVP is scoped to <N> stories, <estimated weeks>, targeting <success metric>.

---
**Possible next commands (pick one):**
a) `/mm-doubt "MVP boundary validation"` — if you want a Question Protocol pass before committing.
b) `/mm-plan <architecture>` — if you're ready to move to `architecture-mapper` for the technical side.
c) Nothing yet — if you want to iterate on the RICE scores or talk to users before committing.
**Which?** reply `a`, `b`, or `c`."
```

## Outputs

- `docs/product/prd.md` — main PRD.
- `docs/features/<epic-slug>.md` — one per epic, with user stories and acceptance criteria.
- Updated `memory/06-feature-map.md` with MVP and Post-MVP backlog.
- Updated `memory/07-decisions-log.md`, `memory/10-open-questions.md`.

## Interactions with other skills

- **Runs after:** `doubt-surfacer`, `project-deep-audit`.
- **Runs before:** `architecture-mapper`, `flow-analyzer`, `implementation-planner`.
- **Invokes:** `memory-updater` at close, `research-first` on demand for any library/API claim.
- **Pairs with:** `feature-breakdown` — once an epic is approved, `feature-breakdown` decomposes it into implementable chunks.

## Completion checklist

- [ ] MVP boundary written with one persona, one JTBD, one success metric, three non-goals.
- [ ] 3–7 epics defined (not more).
- [ ] Every story has Given/When/Then acceptance criteria including at least one edge case.
- [ ] Every story has a Success signal tied to an epic metric.
- [ ] RICE table completed and sorted; MVP cut-line defined.
- [ ] `docs/product/prd.md` assembled with the 10 canonical sections.
- [ ] `memory/06-feature-map.md` updated.
- [ ] Dependencies for downstream skills listed.
- [ ] `memory-updater` ran.

## Anti-patterns

- **Avoid:** Writing a PRD with 20 epics. That is a roadmap, not a PRD.
- **Avoid:** Acceptance criteria that describe feelings instead of observable behavior.
- **Avoid:** User stories without a Success signal. The story becomes un-measurable.
- **Avoid:** Copying feature names from the idea into stories without reformulating as a user outcome.
- **Avoid:** Padding scope with features that have no owner or no metric. They will be built and then abandoned.
- **Avoid:** Skipping Non-goals. Without non-goals, scope creep is guaranteed.
- **Avoid:** Committing to RICE numbers the user never validated. Mark low-confidence scores explicitly.
