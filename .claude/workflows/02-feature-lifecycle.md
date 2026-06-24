---
name: feature-lifecycle
description: Take an approved epic from docs/features and drive it from "approved" to "merged, tested, reviewed, memory updated" in a single coordinated flow. Chains feature-breakdown, implementation-planner, approval-gatekeeper, subagent-dispatcher or parallel-executor, test-strategist, code-reviewer, security-review, and memory-updater.
triggers: ["ship feature", "implement epic", "feature lifecycle", "mm-ship", "work through epic"]
estimated_duration: "From hours to days depending on epic size"
applicable_phases: [MVP, Iteration]
---

# Workflow 02 — Feature Lifecycle

## Purpose

The canonical path for going from an approved epic to a merged, reviewed, and memory-tracked feature. This is the most-used workflow during MVP and Iteration phases, so it is designed to be resumable, parallelizable when independence allows, and gated by approval-gatekeeper at every risky step.

The workflow is **deterministic in structure** but **adaptive in execution**: it picks sequential vs parallel execution based on the breakdown, and picks `subagent-dispatcher` vs Cursor Plan Mode based on task count.

## Preconditions

- Phase is `MVP` or `Iteration` (not Discovery / Definition — those have different workflows).
- The epic exists at `docs/features/<epic>.md` and is approved.
- The PRD (`docs/product/prd.md`) references the epic.
- `memory/03-architecture.md` is current enough for the epic.
- If the epic touches auth / payments / schema: `approval-gatekeeper` policy is understood.

If any precondition fails, the workflow aborts and recommends the missing prior step.

## Phases

### Phase 1 — Breakdown (Coach → Executor)

- **Skill:** `feature-breakdown`
- **Mode:** Coach then Executor for the write
- **Input:** `docs/features/<epic>.md`
- **Steps:**
  1. Invoke `feature-breakdown` on the epic.
  2. The skill identifies seams, defines slices (≤ 5 days each, independent if possible), produces the dependency graph.
  3. Output: `docs/features/<epic>/breakdown.md`.
  4. Update `memory/06-feature-map.md` with the slice rows.
- **Exit criterion:** ≥ 1 slice marked "First to ship"; all slices satisfy the independence / observability / reversibility rules.

### Phase 1.5 — Prototype (Coach, optional but recommended for UI features)

- **Skill:** `prototype-designer` (or `/mm-design`).
- **Mode:** Coach (user drives Claude Design; skill orchestrates and captures).
- **Input:** the chosen slice + `memory/05-user-flows.md` + `memory/14-design-system.md`.
- **Steps:**
  1. Decide: does this slice have a visual component worth prototyping before coding? (Pure backend / data pipeline / CLI? Skip. UI / form / flow / dashboard? Do it.)
  2. Invoke `prototype-designer`. The skill composes a prompt for Claude Design using memory/14's tokens, likes, anti-patterns.
  3. You open `claude.ai/design`, link the repo (so Claude Design reads real shadcn install + components.json), iterate.
  4. Export handoff bundle → saved under `docs/design/prototypes/<feature>/`.
  5. Skill extracts decisions (new tokens, components to install, patterns) into `memory/14-design-system.md` with per-entry approval.
- **Output:** prototype bundle + updated memory/14.
- **Exit criterion:** the stakeholder / you can click through the prototype and it represents the intended feature behavior; memory/14 reflects any new decisions.

### Phase 2 — Plan (Executor)

- **Skill:** `implementation-planner` (once per slice).
- **Mode:** Executor.
- **Input:** a slice from the breakdown.
- **Steps:**
  1. Invoke `implementation-planner` on the first slice (or the currently chosen slice).
  2. The plan goes to `.cursor/plans/YYYY-MM-DD-<slug>.md` with bite-sized TDD steps and verification per step.
  3. Log the plan decision in `memory/07-decisions-log.md`.
  4. Invoke `research-first` for any external library / API the plan depends on.
- **Exit criterion:** plan self-review checklist passes; the plan has zero placeholders.

### Phase 3 — Approval (gate)

- **Skill:** `approval-gatekeeper`
- **Mode:** Auditor
- **Input:** the approved plan.
- **Steps:**
  1. Invoke `approval-gatekeeper` with the plan as the action.
  2. Classify: if Sensitive or High-impact, present the Approval Request and wait for user `approve` / `adjust` / `block`.
- **Exit criterion:** `AUTO_APPROVE` or user-written `approve` recorded; decision logged in `memory/07-decisions-log.md`.

### Phase 3.5 — Premortem (optional, Coach)

- **Skill:** `premortem`
- **Mode:** Coach
- **Trigger condition:** the plan touches **auth / payments / schema** OR estimated effort exceeds **2 days** OR the slice is the **last one before a public launch**.
- **Steps:**
  1. Suggest `/mm-premortem` to the user, citing which trigger condition fired. The user may accept or skip.
  2. On accept: run the premortem against the plan + breakdown.
  3. The synthesis (Most Likely Failure, Most Dangerous Failure, Hidden Assumption) feeds back into the Approval Request from Phase 3 as additional context — paste into the **Risks if approved** section.
  4. The Revised Plan items become amendments to `.cursor/plans/<file>.md` via a `## Amendment YYYY-MM-DD` section.
- **Exit criterion:** premortem skipped explicitly OR premortem run + amendments applied + user re-confirms approval.

### Phase 4 — Execute (dispatcher or parallel)

Choose one based on the breakdown:

**4a. Single workspace (sequential or with internal parallelism):**

- **Skill:** `subagent-dispatcher`
- **Mode:** Executor
- **Input:** the approved plan.
- **Steps:**
  1. Invoke `subagent-dispatcher` on the plan.
  2. Per task: dispatch implementer subagent → spec compliance review → code quality review → advance.
  3. At the end, dispatch a final reviewer over the whole branch.

**4b. Parallel across workspaces (multiple independent slices):**

- **Skill:** `parallel-executor`
- **Mode:** Executor
- **Input:** the breakdown with independence matrix.
- **Steps:**
  1. Invoke `parallel-executor` with the list of independent slices.
  2. The skill runs the independence analysis again, spawns worktrees via `scripts/worktree-spawn`, runs a `subagent-dispatcher` inside each, plans merge order, merges via PR with `code-reviewer` + `security-review` per PR.
  3. Cleanup via `scripts/worktree-cleanup`.

- **Exit criterion:** all tasks/slices reach `APPROVED` from their two-stage review; all branches merged or ready to merge.

### Phase 5 — Cross-track review (Auditor)

- **Skill:** `code-reviewer` over the combined diff (only needed if 4b was used).
- **Mode:** Auditor
- **Input:** the combined diff across merged branches against `origin/main`.
- **Steps:**
  1. Run `code-reviewer` on the combined diff.
  2. Check for emergent inconsistencies (naming, duplicated helpers, conflicting assumptions between parallel tracks).
  3. Fix or open follow-up tickets.
- **Exit criterion:** verdict `Ready to merge` or all emergent issues tracked.

### Phase 6 — Security review (if sensitive)

- **Skill:** `security-review`
- **Mode:** Auditor
- **Input:** the merged/about-to-merge branch.
- **Steps:** applies only if the feature touches auth, payments, data mutations, public API, webhooks, file uploads, or anything declared sensitive in `docs/features/<epic>/breakdown.md`.
- **Exit criterion:** verdict `Safe to merge` or a remediation plan is in place.

### Phase 7 — Merge and close

- **Skill:** _(shell + `memory-updater`)_
- **Mode:** Executor
- **Steps:**
  1. Merge the PR(s).
  2. For parallel tracks, run `scripts/worktree-cleanup.ps1` (or `.sh`).
  3. Invoke `memory-updater` to:
     - Append session summary (append mode).
     - Set the slice(s) in `memory/06-feature-map.md` status to `Shipped`.
     - Log the merge in `memory/07-decisions-log.md`.
     - Update `memory/09-testing-status.md` with the new tests registered.
     - Flag cross-project lesson candidates.
  4. If this was the last slice of the epic, the epic's status moves to `Shipped`.
- **Exit criterion:** `memory/06-feature-map.md` reflects the shipped status; all worktrees cleaned.

### Phase 8 — Optional next-slice pointer

- **Skill:** _(manual or /mm-next)_
- **Steps:**
  1. If more slices remain in the epic, propose the next one and loop back to Phase 2.
  2. If the epic is done, propose moving to the next epic (from `docs/product/prd.md`) or, if this epic was the MVP's last, hand off to `04-phase-gate-transition`.
- **Exit criterion:** clear next action named for the user.

## Artifacts produced

- `docs/features/<epic>/breakdown.md`
- `.cursor/plans/YYYY-MM-DD-<slug>.md` (one per slice)
- Git commits + PR(s) per slice
- Tests (unit/integration/E2E) per slice
- Updated `memory/06-feature-map.md`, `07-decisions-log.md`, `09-testing-status.md`, `11-session-summary.md`
- Optionally: entries in `~/.mastermind/global/lessons.md`

## Exit criteria (workflow complete)

- [ ] All slices `Shipped` in `memory/06-feature-map.md`.
- [ ] All PRs merged or tracked.
- [ ] Final cross-track review passed.
- [ ] `security-review` passed if applicable.
- [ ] Cleanup done (worktrees, branches, plans older than 30 days archivable).
- [ ] `memory-updater` ran.

## Invocation

> *"Run `.claude/workflows/02-feature-lifecycle.md` for epic `<epic-slug>`."*

Or:

> `/mm-ship <epic-slug>`

## Anti-patterns

- **NEVER:** Skip Phase 1 (breakdown) to "just start coding". Big features without breakdown fail in merge.
- **NEVER:** Let Phase 3 (approval-gatekeeper) be a rubber stamp. If the plan has risks, name them.
- **NEVER:** Run Phase 5 (cross-track review) only when you suspect a problem. Run it every time parallel execution was used.
- **NEVER:** Close the workflow before Phase 7 (memory-updater). A shipped feature that leaves no trace is an invisible win.
- **NEVER:** Start a new slice before the previous slice is fully merged and `memory/06-feature-map.md` is updated. Otherwise slices pile up.
