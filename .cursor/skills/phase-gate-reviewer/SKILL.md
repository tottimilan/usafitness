---
name: phase-gate-reviewer
description: Validates whether a project is ready to transition from its current phase (Idea / Discovery / Definition / Prototype / MVP / Iteration / Launch) to the next. Use at the end of every phase, before starting work that belongs to the next phase, when the user asks "are we ready to advance", "phase gate", "can we move to Prototype / MVP / Launch / Iteration", or when memory/02-current-state.md shows all expected artifacts of a phase are produced. Reads the entry/exit criteria from the canonical phase-criteria.json (the memory/13-phase-history.md table is generated from it), verifies artifacts exist and are not stale, checks risks/open doubts/decisions, emits a BLOCK / PROCEED verdict with a gap list and recommended remediations, updates memory/13 and memory/02 only after user confirmation, and never advances the phase silently. Prototype is the only optional canonical phase — non-UI projects may skip Definition→MVP directly with `--skip-reason "no UI"`.
---

# Phase Gate Reviewer

## Goal

Make phase transitions **explicit and evidence-based**. A phase advances only when:

1. The artifacts expected of the current phase exist, are current, and reference each other consistently.
2. The entry criteria of the next phase are satisfied.
3. There are no open critical risks or unresolved doubts that the next phase cannot safely carry.
4. The user approves the transition in writing.

Without this discipline, projects drift into "MVP" while the PRD is half-written, or into "Launch" while security has open High findings. This skill exists to prevent that.

## When to use

**Always:**
- At the end of any phase where the user believes the work is done.
- Before starting skills that belong to the next phase (e.g. do not start `implementation-planner` if the project is still in Discovery — first gate to Definition).
- When `memory/02-current-state.md` shows the phase is in "What is next: <next phase>" but no formal transition has been logged.
- Periodically (e.g. weekly) during long phases, to confirm the project is still on track.

**Trigger keywords:** "phase gate", "are we ready to advance", "ready for MVP", "ready for launch", "move to next phase", "can we ship", "gate review".

**Do NOT use for:**
- Moving between phases inside a single session without any new artifacts produced. Nothing to gate.
- Intra-phase work (e.g. moving from "slice 1 done" to "slice 2" — that is `feature-breakdown` territory).
- Hot bug fixes in production — bugs follow the `bug-investigator` path regardless of phase.

## Prerequisites

Read, in this order:

1. `CLAUDE.md`
2. `memory/00-project-brief.md`
3. `memory/02-current-state.md` (current phase + state)
4. `memory/13-phase-history.md` (previous transitions + canonical phase definitions)
5. `memory/06-feature-map.md`
6. `memory/07-decisions-log.md`
7. `memory/08-known-risks.md`
8. `memory/09-testing-status.md`
9. `memory/12-open-doubts-and-questions.md`
10. `docs/product/prd.md` (when gating Definition → MVP or later)
11. `docs/security/security-risk-map.md` (when gating MVP → Iteration or Launch)

Abort the skill and raise a **doubt-surfacer** pass if `memory/02-current-state.md` does not clearly declare the current phase. You cannot gate what you cannot name.

## Process

### Step 1 — State the gate being reviewed

At the top of the output:

```markdown
## Phase Gate Review
**From:** <current phase>
**To:** <proposed next phase>
**Date:** YYYY-MM-DD
**Reviewer:** <Model>
```

If the proposed next phase is **not** the natural next step (e.g. skipping from Discovery directly to MVP), flag this explicitly and require a written justification.

### Step 2 — Load the canonical criteria

Read the criteria from **`phase-criteria.json`** at the repo root — this is the single source of truth for every phase's `purpose`, `entry_criteria`, `exit_criteria`, and `expected_artifact_paths`. The `memory/13-phase-history.md §Phase definitions` table is **generated** from this file (via `scripts/render-phase-criteria`), so use the JSON, not a hand-copied table. Do not invent new criteria; if the criteria need to change, edit `phase-criteria.json` and re-render, logging the change as a decision.

If a criterion needs nuance for this project (e.g. the project is a mobile app and some web-specific criteria do not apply), state the adaptation and justify in writing.

### Step 3 — Check exit criteria of the current phase

For the current phase, walk every expected artifact and verify:

- **Existence.** The file or entry is there.
- **Non-stale.** Last modified date is not older than the phase was entered.
- **Consistency.** The artifact references the correct decisions and data. For example: `docs/product/prd.md` must cite personas from `docs/product/personas.md`, not invent new ones.
- **Approved.** Artifacts that need user sign-off (PRD, architecture diagrams, ADRs) have a dated approval note.

Emit per artifact:

```markdown
### Artifact: <path>
- Status: [Missing] | [Stale] | [Inconsistent] | [Draft] | [Approved]
- Evidence: <specific observation>
- Gap: <what's missing, if any>
```

### Step 4 — Check entry criteria of the next phase

For the next phase, verify the preconditions in **`phase-criteria.json` → the target phase's `entry_criteria`** (authoritative). The examples below are illustrative summaries of that file — if they ever disagree with `phase-criteria.json`, the JSON wins:

- **Definition → Prototype:** (UI projects) PRD approved, MVP boundary set, `memory/14 §Platform` set to web/mobile/cross, `memory/14` identity + tokens sections filled, `memory/05-user-flows.md` populated, `memory/06-feature-map.md` with MVP slices identified, design system installed (`components.json` present), Claude Design access available.
- **Definition → MVP (direct skip):** For **non-UI projects only** (backend services, CLIs, libraries, SDKs). Invoke with `--skip-reason "no UI"` or equivalent justification. Record the skip in `memory/13-phase-history.md` and `memory/07-decisions-log.md`. Entry criteria otherwise same as Definition → MVP below.
- **Prototype → MVP:** `docs/design/mockups/final/` exists; `memory/14 §Changelog` has a recent "Design frozen at vN" entry (< 30 days old); stakeholder sign-off recorded in the frozen iteration's `feedback.md`; memory/14 has no open decisions on tokens / components / patterns; no open blockers in `memory/08-known-risks.md` that depend on design resolution.
- **Definition → MVP (direct skip) or Prototype → MVP:** PRD approved, MVP boundary set with one persona + one JTBD + one metric, architecture ADRs accepted, feature-map updated, testing strategy drafted.
- **MVP → Iteration:** All P0 features shipped, first user sessions logged, zero Critical/High security findings open, observability in place.
- **Iteration → Launch:** SLA/SLO defined, incident runbook exists, rollback tested, legal/compliance review passed for scope.

### Step 5 — Check risk and doubt posture

- **Critical risks** in `memory/08-known-risks.md` with status Open and no mitigation plan → **BLOCK**.
- **Pending questions** in `memory/12-open-doubts-and-questions.md` that block the next phase → **BLOCK** or **PROCEED WITH CAVEATS** (document).
- **Failing tests** reported in `memory/09-testing-status.md` touching mandatory coverage areas → **BLOCK**.

### Step 6 — Emit a verdict

Three verdicts only. No "maybe".

```markdown
## Verdict

**Status:** PROCEED | PROCEED WITH CAVEATS | BLOCK

**Reasoning:** <1–3 sentences>

**Blocking gaps (if BLOCK):**
- <gap> — **Remediation:** <concrete action, which skill to invoke>

**Caveats (if PROCEED WITH CAVEATS):**
- <caveat> — will be re-reviewed when <trigger>

**Approved next phase:** <name> (only on PROCEED or PROCEED WITH CAVEATS)
```

### Step 7 — Propose the transition entry (do NOT write yet)

Draft the entry that will go into `memory/13-phase-history.md §Transitions` using the canonical template. Present it to the user. Wait for explicit confirmation (*"confirm"*, *"approve"*, *"go"*). Do not write to memory without confirmation.

### Step 8 — Apply the transition (only after confirmation)

On user confirmation:
1. Append the transition entry to the top of `memory/13-phase-history.md §Transitions`.
2. Update `memory/13-phase-history.md §Current phase` block.
3. Update `memory/02-current-state.md` phase and "What is next".
4. Append to `memory/07-decisions-log.md` with a reference to the transition.
5. Invoke `memory-updater` to persist.

### Step 9 — Closing handoff

Based on the new phase, emit a **HIGH** Command Recommendation with a per-phase next step. The transition is decisive, so the next move is almost always clear.

**Entered Discovery** → HIGH on `/mm-audit`:
```markdown
**Next recommended command:** `/mm-audit` (or `/mm-doubt` first if the brief is still vague).
**Why:** Discovery work lives in the 12-angle audit; this phase expects the audit and its Hard Truth.
**Go ahead:** type `go` and I'll proceed to `project-deep-audit` as if you ran `/mm-audit`.
**Skip if:** you'd rather start with user interviews or research before the audit.
```

**Entered Definition** → HIGH on `/mm-plan`:
```markdown
**Next recommended command:** `/mm-plan <first-epic-slug>` (drives `product-requirements` → `architecture-mapper`).
**Why:** Definition locks the MVP scope; the PRD and architecture land now.
**Go ahead:** type `go` and I'll start with `product-requirements` on the first epic.
**Skip if:** you want to re-run `/mm-audit` with a specific angle before defining.
```

**Entered Prototype** (UI projects) → HIGH on `/mm-mockup create`:
```markdown
**Next recommended command:** `/mm-mockup create`.
**Why:** Prototype phase's working skill is `mockup-factory`; v1 is the starting point for the iterate-until-freeze loop. See workflow `07-full-app-prototyping.md`.
**Go ahead:** type `go` and I'll compose the first mockup prompt using memory/05 + memory/06 + memory/14.
**Skip if:** you want to do stakeholder scope alignment first (update memory/05 / memory/06) before kicking off v1.
```

**Skipped Prototype** (non-UI projects, Definition → MVP direct) → log the skip justification in memory/13 + memory/07, then HIGH on `/mm-ship` (see below).

**Entered MVP** → HIGH on `/mm-ship`:
```markdown
**Next recommended command:** `/mm-ship <first-epic-slug>`.
**Why:** MVP execution is the feature-lifecycle workflow; this phase expects shipped slices.
**Go ahead:** type `go` and I'll kick off workflow 02 on the first epic.
**Consider:** installing `task-master-ai` if the MVP plan has ≥ 10 tasks — run `pwsh -File scripts/install-taskmaster.ps1 -ClaudeCodeAuth`.
**Skip if:** you want to walk through `feature-breakdown` manually first for a specific epic.
```

**Entered Iteration** → HIGH on the rhythm setup:
```markdown
**Next recommended command:** `/mm-retro` (set the weekly cadence now).
**Why:** Iteration rewards the weekly discipline; the first retro sets the pattern.
**Go ahead:** type `go` and I'll walk workflow 05.
**Skip if:** you want to ship one more slice before the first retro.
```

**Entered Launch** → HIGH on security pass:
```markdown
**Next recommended command:** `/mm-review` with security focus (trigger `security-review`).
**Why:** Launch phase is the tightest gate on security; a targeted pass before public exposure is warranted.
**Go ahead:** type `go` and I'll run `code-reviewer` + `security-review` on the current branch/main.
**Skip if:** the security pass already happened in the previous PR cycle.
```

## Outputs

- In-chat verdict + verdict block.
- On PROCEED: updates to `memory/13-phase-history.md`, `memory/02-current-state.md`, `memory/07-decisions-log.md` (via `memory-updater`).
- On BLOCK: no writes; only the gap list.
- Optional: ADR under `docs/adr/XXXX-phase-gate-<slug>.md` for gates where the transition itself is a notable decision.

## Interactions with other skills

- **Invoked by:** user, `project-deep-audit` (at the end of Discovery), workflow `04-phase-gate-transition.md` (when available).
- **Invokes:** `memory-updater` at close (on PROCEED); `doubt-surfacer` if the current phase has loose ends before gating.
- **Pairs with:** `approval-gatekeeper` — phase gates are themselves changes that require explicit human approval.

## Completion checklist

- [ ] Current phase and proposed next phase named at the top.
- [ ] Every expected artifact of the current phase reviewed with explicit status.
- [ ] Every entry criterion of the next phase verified.
- [ ] Open Critical risks evaluated and either mitigated or blocking the gate.
- [ ] Pending open doubts evaluated.
- [ ] Verdict emitted (PROCEED / PROCEED WITH CAVEATS / BLOCK).
- [ ] Transition entry drafted and presented to the user before writing.
- [ ] On PROCEED: `memory/13`, `memory/02`, `memory/07` updated via `memory-updater`.
- [ ] Closing handoff recommends the next mode and skills.

## Anti-patterns

- **NEVER:** Advance the phase silently. Every transition is logged explicitly.
- **NEVER:** Mark artifacts "approved" on the basis of them existing. Existence ≠ approval.
- **NEVER:** Rubber-stamp the gate because the user is in a hurry. If there is a blocker, name it.
- **NEVER:** Skip Step 7 (presenting the draft entry) and write directly to `memory/13`. The user must confirm.
- **NEVER:** Gate a phase whose current-state is ambiguous. Run `doubt-surfacer` first.
- **NEVER:** Invent new criteria to gate a project. `phase-criteria.json` is the single source of truth (the `memory/13 §Phase definitions` table is generated from it); if criteria need updating, edit the JSON, re-render, and log a decision.
- **NEVER:** Force PROCEED on BLOCK by hand-waving the blockers. If blockers exist, the remediation path is to close them, not to reclassify them as "acceptable".
