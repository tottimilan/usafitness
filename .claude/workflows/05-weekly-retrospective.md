---
name: weekly-retrospective
description: Weekly discipline to review what was done, what was learned, which risks moved, and which lessons should be promoted to cross-project memory. Keeps the project's memory alive and the cross-project memory files (`~/.mastermind/global/`) fed via `continuous-learner`. Recommended weekly during Iteration and Launch; optional during earlier phases.
triggers: ["weekly retro", "retrospective", "week in review", "what did I learn this week", "mm-retro"]
estimated_duration: "20-40 minutes"
applicable_phases: [MVP, Iteration, Launch]
---

# Workflow 05 — Weekly Retrospective

## Purpose

Projects that do not review themselves drift. This workflow is a **light, regular ceremony** that:

1. Summarizes the week's work and decisions.
2. Updates the risk posture.
3. Captures lessons as candidates for the cross-project global memory (`~/.mastermind/global/`; the Memory Graph MCP, when configured, is an optional mirror).
4. Identifies broken patterns (flaky tests, stuck PRs, drift between memory and code).
5. Surfaces the next priorities.

It is intentionally short. If a retrospective takes more than 40 minutes, the project is doing too many things at once.

## Preconditions

- Phase is `MVP`, `Iteration`, or `Launch` (during earlier phases the week's signal is usually low).
- At least one session has been logged in `memory/11-session-summary.md` during the last 7 days.

## Phases

### Phase 1 — What was done (Auditor)

**Code Intelligence note (Claude efficiency):** When reviewing code-heavy work (audits, plans), check if Code Intelligence MCP was used. If sessions show high token use from file reads, recommend adopting graph queries (jCodeMunch / code-review-graph style) for future weeks.

- **Skill:** _(reading only)_
- **Mode:** Auditor
- **Steps:**
  1. Open `memory/11-session-summary.md` — read all `## Latest session` and `## Previous sessions` entries from the last 7 days.
  2. Open `memory/07-decisions-log.md` — scan decisions from the last 7 days.
  3. Open git log: `git log --since="7 days ago" --oneline --all` (or the equivalent).
  4. List in chat: shipped slices, decisions taken, bugs fixed, phases crossed.
- **Exit criterion:** a one-page "Week in review" summary in chat.

### Phase 2 — Risk posture (Auditor)

- **Skill:** _(reading only)_
- **Mode:** Auditor
- **Steps:**
  1. Open `memory/08-known-risks.md`. For each Open risk: has it been mitigated, closed, accepted, or stayed put?
  2. Identify new risks that emerged this week from session summaries or post-mortems.
  3. Update `memory/08-known-risks.md` if needed (add new rows, update statuses, move closed to Archive).
- **Exit criterion:** `memory/08-known-risks.md` accurately reflects current state.

### Phase 3 — Drift check (Auditor)

- **Skill:** _(reading + script)_
- **Mode:** Auditor
- **Steps:**
  1. Run `scripts/sync-skills.ps1 -Check` (or `.sh --check`). Confirm no drift between canonical and mirror.
  2. Run `scripts/phase-gate-check.ps1`. Confirm artifacts expected for the current phase are present.
  3. Cross-check `memory/06-feature-map.md` against merged PRs from the week. Any feature marked "Shipped" that never reached main? Any "In progress" that actually shipped and wasn't updated?
  4. Cross-check `memory/03-architecture.md` against real code (new services? removed?).
- **Exit criterion:** any drift fixed in-place or logged as a follow-up task.

### Phase 3.5 — Harness re-audit (Coach) — only when the base model changed

- **Skill:** _(reading + judgment)_
- **Mode:** Coach
- **Trigger:** run this phase **only** if the project's default/base model changed since the last retrospective (e.g. a new Opus/GPT/Sonnet generation). Skip otherwise.
- **Rationale:** much of a harness (rules, skills, scaffolding) exists to compensate for what the previous model did *not* do reliably. A stronger base model can make some of that scaffolding redundant overhead — pure context tax with no benefit. The harness should shrink as the model grows.
- **Steps:**
  1. List the always-on rules and the most-loaded skills. For each, ask: *does the new base model already do this reliably without the instruction?* (e.g. it now writes tests by default, or no longer hallucinates APIs for common libs).
  2. Propose pruning **only** the redundant guidance — demote an always-on rule to on-demand, or trim a skill's hand-holding steps.
  3. **NEVER prune evaluators, safety, or the Question & Doubt Protocol.** Verifiers and guardrails stay regardless of model strength — a stronger model does not make a safety check redundant, it makes it cheaper to satisfy.
  4. Anything pruned is logged in `memory/07-decisions-log.md` with the model change as the reason, and is reversible.
- **Exit criterion:** redundant scaffolding identified and either pruned (with a decision-log entry) or consciously kept; evaluators/safety untouched.

### Phase 4 — Flaky tests and stuck things (Executor)

- **Skill:** _(scripts + `bug-investigator` if needed)_
- **Mode:** Executor
- **Steps:**
  1. Check CI history for flaky tests this week. A flaky test is broken — quarantine or fix now, not "later".
  2. Check open PRs older than 3 days. Either review-merge or close with reason.
  3. Check worktrees older than 1 day: run `scripts/worktree-cleanup.ps1` or investigate why they are alive.
- **Exit criterion:** zero flaky tests ignored, zero stuck PRs without an action, no stale worktrees.

### Phase 5 — Lessons candidate promotion (Coach)

- **Skill:** `continuous-learner` (invoke via `/mm-learn`).
- **Mode:** Coach
- **Steps:**
  1. List all "Lessons learned (candidates for cross-project memory)" entries from the week's session summaries.
  2. For each candidate, apply the three-part test from `.cursor/rules/05-claude-mcp-integration.mdc §Cross-project Memory Protocol`:
     - Is it **project-agnostic** (strip specific nouns)?
     - Is it **evidence-backed** (a concrete post-mortem or decision)?
     - Is it **actionable** (changes a future decision)?
  3. If all three yes → draft the entry and propose it to the user.
  4. On user approval, write to the appropriate file under `~/.mastermind/global/` (lessons / patterns / pitfalls / stacks / vendors), commit in the global repo.
- **Exit criterion:** candidates are either promoted, revised, or consciously skipped with reason.

### Phase 6 — Next week's priorities (Coach)

- **Skill:** _(no dedicated skill)_
- **Mode:** Coach
- **Steps:**
  1. Revisit `memory/02-current-state.md` "What is next".
  2. Revisit `memory/10-open-questions.md` for strategic questions that might block progress.
  3. Revisit `memory/12-open-doubts-and-questions.md` — any AI-asked question pending from last week?
  4. List the Top 3 priorities for next week. Keep it short: three, not seven.
- **Exit criterion:** `memory/02-current-state.md` "Top 3 next priorities" is up to date.

### Phase 7 — Session summary entry

- **Skill:** `memory-updater`
- **Mode:** Executor
- **Steps:**
  1. Append a dedicated retrospective entry to `memory/11-session-summary.md`:
     ```markdown
     ## Latest session
     **Date:** YYYY-MM-DD (retrospective)
     **Type:** weekly retrospective
     **Covers period:** YYYY-MM-DD to YYYY-MM-DD
     (use the canonical template for the rest)
     ```
  2. Log the retrospective in `memory/07-decisions-log.md` only if it produced a decision (e.g. "decided to drop feature X", "accepted risk Y").
- **Exit criterion:** retrospective logged, next-week priorities documented.

## Artifacts produced

- Updated `memory/08-known-risks.md`, `memory/11-session-summary.md`, `memory/02-current-state.md` "Top 3 next priorities".
- Optional: entries in `memory/07-decisions-log.md` (if retro produced decisions).
- Optional: promotions to `~/.mastermind/global/`.
- No code changes (retrospective is non-code).

## Exit criteria (workflow complete)

- [ ] Week in review summarized in chat.
- [ ] Risk posture current.
- [ ] No drift between memory and code (or follow-ups logged).
- [ ] No ignored flaky tests or stale worktrees.
- [ ] Lessons candidates reviewed (promoted / skipped).
- [ ] Top 3 priorities for next week stated.
- [ ] Retrospective entry appended to `memory/11-session-summary.md`.

## Invocation

> *"Run `.claude/workflows/05-weekly-retrospective.md` for the week ending YYYY-MM-DD."*

Or:

> `/mm-retro`

## Cadence

- **MVP phase:** optional. Weekly if velocity is low, otherwise bi-weekly.
- **Iteration phase:** **weekly recommended**. This is the phase where learning compounds.
- **Launch phase:** weekly for the first month, then bi-weekly.
- Skip a week only with a reason (vacation, incident week handled elsewhere).

## Anti-patterns

- **NEVER:** Turn the retrospective into a 2-hour meeting. Keep it tight — 40 minutes max.
- **NEVER:** Skip Phase 3 (drift check) because "everything feels fine". Drift is silent.
- **NEVER:** Promote a lesson that is really a complaint. Lessons are actionable, not emotional.
- **NEVER:** List > 3 priorities for next week. Picking three forces real prioritization.
- **NEVER:** Skip the retrospective during Iteration because "we are too busy shipping". That is exactly when memory drifts the most.
