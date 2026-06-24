---
name: phase-gate-transition
description: Move the project from its current phase to the next (Idea → Discovery → Definition → Prototype → MVP → Iteration → Launch) with proper validation, explicit approval, and memory promotion. Wraps phase-gate-reviewer in a ceremony that ensures no silent transitions and that every gate leaves the project in a stronger state than before. Prototype is optional — UI-heavy projects go through it via workflow 07; non-UI projects skip Definition→MVP directly with justification.
triggers: ["phase gate", "advance phase", "ready for prototype", "ready for MVP", "ready for launch", "gate review", "mm-gate"]
estimated_duration: "30-60 minutes for the review itself; remediation may take longer"
applicable_phases: [Idea, Discovery, Definition, Prototype, MVP, Iteration]
---

# Workflow 04 — Phase Gate Transition

## Purpose

Formalize the moment when the project changes posture. Phases are strategic states — "what we are paying attention to" — and transitioning between them should be a conscious, evidence-based event, not a gradual drift. This workflow makes it a deterministic ceremony with a clear verdict.

## Preconditions

- The user believes the current phase is finished (or close to it).
- The target next phase is defined in `memory/13-phase-history.md §Phase definitions`.
- No Critical open bugs in `memory/08-known-risks.md` relevant to the current phase (soft block — can be waived with explicit rationale).

## Phases

### Phase 1 — Dry-run check (Auditor)

- **Skill:** _(script, no LLM required)_
- **Mode:** Auditor
- **Steps:**
  1. Run `pwsh -File scripts/phase-gate-check.ps1 -NextPhase <TARGET>` (or `.sh` equivalent).
  2. Read the output: PASS / GAPS / BLOCK.
  3. **For Definition→MVP and MVP→Launch transitions only:** before invoking `phase-gate-reviewer` in Phase 3, suggest `/mm-premortem` against the imminent transition (the MVP scope, or the launch plan). Other transitions skip this — the cost of being wrong is too low to justify the premortem cost.
- **Exit criterion:** clear picture of which artifacts are missing or stale.

### Phase 2 — Remediate gaps (Executor, conditional)

- **Skill:** depends on the gap:
  - Missing Discovery docs → run `project-deep-audit` to fill them.
  - Missing PRD → run `product-requirements`.
  - Missing architecture → run `architecture-mapper`.
  - Missing test strategy → run `test-strategist`.
  - Missing security → run `security-review`.
  - Open Critical risks → either mitigate via `implementation-planner` + fix workflow or accept and log.
- **Mode:** Executor during the fix.
- **Exit criterion:** `scripts/phase-gate-check.ps1 -NextPhase <TARGET>` now returns PASS (or explicit waivers are documented).

### Phase 3 — Formal gate review (Auditor)

- **Skill:** `phase-gate-reviewer`
- **Mode:** Auditor
- **Input:** everything the project has produced for the current phase.
- **Steps:**
  1. Invoke `phase-gate-reviewer` with the target phase.
  2. The skill walks exit criteria of current + entry criteria of next.
  3. It emits the draft transition entry and presents it to the user.
- **Exit criterion:** verdict PROCEED / PROCEED WITH CAVEATS / BLOCK issued with reasoning.

### Phase 4 — Approval (user confirmation)

- **Skill:** _(user decision + `approval-gatekeeper` for record)_
- **Mode:** Auditor
- **Steps:**
  1. Present the draft transition entry to the user.
  2. User responds `approve` / `adjust` / `block`.
  3. On `approve`: `approval-gatekeeper` logs the decision.
- **Exit criterion:** user written `approve` captured.

### Phase 5 — Apply the transition (Executor)

- **Skill:** `phase-gate-reviewer` (Step 8) + `memory-updater`
- **Mode:** Executor (writes only)
- **Steps:**
  1. Append the transition entry to `memory/13-phase-history.md §Transitions` (top of list).
  2. Update `memory/13-phase-history.md §Current phase`.
  3. Update `memory/02-current-state.md` with the new phase and "What is next".
  4. Append to `memory/07-decisions-log.md`.
  5. Optional: create `docs/adr/XXXX-phase-gate-<slug>.md` if the transition is a notable decision (e.g. skipping a phase, accepting major caveats).
- **Exit criterion:** current phase now reads as the new target in `memory/02-current-state.md`.

### Phase 6 — Roll-up to global memory (optional)

- **Skill:** _(future `continuous-learner`; manual for now)_
- **Steps:**
  1. Review the Lessons-learned candidates from the outgoing phase's `memory/11-session-summary.md` entries.
  2. Promote the ones that qualify (project-agnostic + evidence + actionable) to `~/.mastermind/global/lessons.md` (or `patterns.md` / `pitfalls.md`).
- **Exit criterion:** promotions committed in the global memory repo, or explicitly skipped with reason.

### Phase 7 — Handoff to the next workflow

Based on the new phase:

- → **Discovery:** handoff to `doubt-surfacer` → `project-deep-audit`. (If the project already completed these during Phase 2 remediation, it may be immediately ready for Definition.)
- → **Definition:** handoff to `product-requirements` → `architecture-mapper`.
- → **Prototype:** (UI projects) handoff to workflow `07-full-app-prototyping` → `/mm-mockup create`. Non-UI projects skip Prototype and go straight to MVP with `--skip-reason "no UI"`.
- → **MVP:** handoff to `02-feature-lifecycle` per epic. If coming from Prototype, `implementation-planner` reads `docs/design/mockups/final/` + memory/14. Possibly activate `task-master-ai` via `scripts/install-taskmaster.ps1` if plans will have ≥ 10 tasks.
- → **Iteration:** handoff to ongoing `02-feature-lifecycle` cycles; `05-weekly-retrospective` is now relevant.
- → **Launch:** handoff to `security-review` for a final pass; incident runbook check; `05-weekly-retrospective` frequency increases.

The handoff is stated explicitly in chat so the user does not have to guess what comes next.

## Artifacts produced

- New entry at the top of `memory/13-phase-history.md §Transitions`.
- Updated `memory/13-phase-history.md §Current phase`.
- Updated `memory/02-current-state.md`.
- New entry in `memory/07-decisions-log.md`.
- Optional ADR under `docs/adr/`.
- Optional promotions to `~/.mastermind/global/`.

## Exit criteria (workflow complete)

- [ ] `scripts/phase-gate-check.ps1` PASS against the target (or caveats documented).
- [ ] Verdict PROCEED or PROCEED WITH CAVEATS issued by `phase-gate-reviewer`.
- [ ] User written `approve` recorded.
- [ ] `memory/13` and `memory/02` updated consistently.
- [ ] Handoff to next workflow stated.

## Invocation

> *"Run `.claude/workflows/04-phase-gate-transition.md` to advance from `<current>` to `<target>`."*

Or:

> `/mm-gate <target-phase>`

## Anti-patterns

- **NEVER:** Advance the phase silently (by editing `memory/02-current-state.md` manually without running the workflow).
- **NEVER:** Waive Critical risks without a written rationale in `memory/08-known-risks.md`.
- **NEVER:** Skip Phase 1 (dry-run) and go straight to `phase-gate-reviewer`. The script catches trivial gaps cheaply.
- **NEVER:** Promote a lesson to global memory with project-specific nouns intact. Strip them first.
- **NEVER:** Close the workflow without Phase 7 (handoff). The next step must be explicit.
