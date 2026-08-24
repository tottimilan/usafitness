---
name: implementation-planner
description: Converts an approved slice (from feature-breakdown) or a single well-scoped change into a concrete, bite-sized, test-first implementation plan with exact file paths, complete code snippets, specific commands, and verification steps. Use before touching code for any non-trivial change, whenever Cursor Plan Mode is triggered, when the user asks for a "plan", "steps", "how", "implementation", "TDD plan", "task list", or when handing off work between sessions. Produces .cursor/plans/YYYY-MM-DD-<slug>.md following the canonical plan format (TDD, DRY, YAGNI, frequent commits), saved to the plans folder and referenced from memory/07-decisions-log.md. Every step is ≤ 5 minutes of work, has exact file paths, and declares how it will be verified. Different from feature-breakdown: planner is the technical HOW-per-slice; breakdown is the functional WHAT-order across slices.
---

# Implementation Planner

## Goal

Turn an approved slice into a **plan an engineer with zero context and poor judgment could execute successfully**. Every step has an exact file path, a complete code snippet (never a placeholder), an exact command to run, and an expected output. Nothing is left to intuition.

This is the point where strategic clarity becomes tactical execution. A good plan here prevents the vast majority of "AI went off on a tangent" failures downstream.

Design principles, all mandatory:

- **TDD** — write the failing test first, see it fail, then write the minimal code to pass, then commit.
- **DRY** — one concept, one place. Duplication is not a pattern to be discovered later.
- **YAGNI** — if the slice does not need it, do not add it, even "for later".
- **Bite-sized steps** — 2–5 minutes each.
- **Frequent commits** — at every green test.
- **No placeholders** — `TODO`, `TBD`, or pseudo-code in a plan is a planning failure.

## When to use

**Always:**
- Before any non-trivial code change (auth, schema, payments, cross-cutting).
- For every slice approved by `feature-breakdown`.
- Whenever Cursor Plan Mode is invoked.
- For any change that touches more than two files.
- When the user says "plan", "steps", "how", "implementation", "break it down into tasks", "TDD plan".

**Trigger keywords:** "plan", "implementation plan", "steps", "tasks", "how do we", "TDD", "let's implement", "Plan Mode", "break into tasks".

**Do NOT use for:**
- Trivial one-file edits with no test implications (typo, copy change).
- Exploratory spikes that are going to be thrown away.
- Cases where the change is already planned in an existing, current plan file.

## Prerequisites

Read:

1. `CLAUDE.md`
2. `.cursor/rules/00-project-operating-system.mdc`
3. `.cursor/rules/01-karpathy-principles.mdc`
4. `.cursor/rules/02-tech-stack.mdc`
5. `.cursor/rules/03-testing-policy.mdc`
6. `.cursor/rules/04-safety-and-git.mdc`
7. `memory/02-current-state.md`
8. `memory/03-architecture.md`
9. `memory/04-data-model.md` (if the change touches data)
10. `memory/05-user-flows.md` (if the change touches a flow)
11. The slice file from `docs/features/<epic>/breakdown.md` (if the plan implements a slice).
12. Any relevant `docs/flows/<slug>.md`, `docs/adr/NNNN-*.md`, `docs/architecture/research/*.md`.

Run `research-first` for every third-party library call the plan will use. No plan should guess an API signature.

**Code exploration (token efficiency):**
- If a Code Intelligence MCP (tree-sitter based) is available in the project, use it for symbol, caller and dependency discovery before reading large amounts of source code.
- This is particularly valuable for Claude multi-agent planning to keep context focused and reduce token consumption.
- Only fall back to full file reads when the graph cannot provide the required detail.

## Process

### Step 1 — Confirm scope and success criteria

At the top of `.cursor/plans/YYYY-MM-DD-<slug>.md` write:

```markdown
# <Slice or Change Title> — Implementation Plan

**Date:** YYYY-MM-DD
**Branch:** feat/<slug>
**Author:** User + <Model>
**Status:** Draft | Approved | Executing | Done | Abandoned

## Goal
<One sentence: what this plan builds>

## Architecture
<2–3 sentences: which services, which entities, which flow>

## Tech Stack touched
<From .cursor/rules/02-tech-stack.mdc — list only what this plan touches>

## Success criteria (observable)
- [ ] …
- [ ] …
- [ ] …
```

If success criteria cannot be written as observable checkboxes (not "works well"), stop. Run `doubt-surfacer` until they can.

### Step 2 — Map the files

Before any tasks, list the files that will be created or modified, with a one-line purpose for each:

```markdown
## Files

| Action | Path | Purpose |
|---|---|---|
| Create | `src/auth/magic-link.ts` | Service that mints and validates magic-link tokens. |
| Modify | `src/api/auth/route.ts:12-45` | Add POST handler for magic-link request. |
| Test   | `tests/auth/magic-link.test.ts` | Unit tests for token minting and expiry. |
```

Decomposition decisions get locked here. If the list grows past ~8 files for a single plan, split the plan.

### Step 3 — Bite-sized tasks (TDD rhythm)

A "task" is a 2–5 minute unit. A "step" inside a task is one action. Typical task skeleton:

```markdown
## Task <N> — <name>

**Files touched:**
- Create: `<path>`
- Modify: `<path>:<line-range>`
- Test: `<path>`

### Steps
- [ ] Step <N.1> — Write the failing test.
  ```ts
  // complete test code, never a placeholder
  ```
  **Run:** `pnpm test tests/auth/magic-link.test.ts`
  **Expected:** FAIL with `<specific assertion message>`.

- [ ] Step <N.2> — Implement the minimal code to pass.
  ```ts
  // complete implementation, never a placeholder
  ```
  **Run:** `pnpm test tests/auth/magic-link.test.ts`
  **Expected:** PASS.

- [ ] Step <N.3> — Commit.
  **Run:** `git add src/auth/magic-link.ts tests/auth/magic-link.test.ts && git commit -m "feat(auth): add magic-link token minting"`
```

Rules:
- **Every step has a run command and an expected output.** If it does not, it is not verifiable.
- **Every code block is complete.** No `...`, no `<fill in>`, no `TODO`.
- **Types, names, and signatures must be consistent across tasks.** A function named `clearLayers()` in Task 3 and `clearFullLayers()` in Task 7 is a bug in the plan.
- **Commit after every green test.**
- **Refactor is its own step**, after green, never during red.

### Step 4 — Self-review

After writing the plan, review it before execution. This is a checklist the author runs, not a subagent dispatch:

1. **Success criteria coverage** — can every checkbox in "Success criteria" be traced to a task? List gaps.
2. **Placeholder scan** — `grep -E "TBD|TODO|<fill|placeholder" .cursor/plans/<file>`. Fix every hit.
3. **Type consistency** — signatures, property names, enum values identical across tasks.
4. **Error paths** — every happy-path task has a corresponding error-path task OR an explicit line saying "error path covered in Task M".
5. **Test first** — every implementation step has a failing test step before it.
6. **Size check** — if any task exceeds ~10 minutes of work, split it.
7. **Dependency check** — external libraries/APIs used are each backed by a `research-first` note.

### Step 5 — Execution handoff

At the bottom of the plan, offer the user an execution path:

```markdown
## Execution

**Option A - Subagent-driven (recommended for plans with 3+ tasks):**
Hand off to `subagent-dispatcher`. A fresh subagent is spawned per task with two-stage
review (spec compliance then code quality) before advancing.

**Option B - Parallel via worktrees (when tasks are fully independent):**
Hand off to `parallel-executor`. Independence analysis first, then worktrees spawned
via `scripts/worktree-spawn`, each running its own dispatcher.

**Option C - Inline execution (Cursor Plan Mode):**
Cursor executes the tasks in this session with checkpoints after each task.
Best for plans with 1-2 tasks or very constrained scope.

**Option D - Cloud agent / background run:**
Branch is created, tasks dispatched to a cloud agent, PR opened when all tasks
are green. Use when you want to disconnect and review asynchronously.

**Option E - Human execution:**
You run each task; the agent assists on demand.

Pick the option before starting. Halt execution between tasks on request.
```

### Step 5b - Hook into task-master-ai when installed

If `task-master-ai` MCP is active (System 2 Sub-phase 2.2), prefer the following:

1. Derive a PRD-compatible document from the plan and write it to `.taskmaster/docs/prd.md` (or append to the existing PRD with `--append`).
2. Ask the user to run `parse-prd` (via chat: *"Parse the PRD at .taskmaster/docs/prd.md"*) so task-master generates `.taskmaster/tasks.json` with dependencies.
3. Reference the generated task IDs in this plan for traceability (e.g. *"Plan task 3 = task-master task 12.3"*).
4. Hand off to `subagent-dispatcher` which can then use `next_task` / `set_task_status` as the driver instead of walking the plan file manually.

When task-master-ai is NOT installed, the plan is the source of truth and `subagent-dispatcher` walks it directly.

Installer: `scripts/install-taskmaster.ps1` (or `.sh`) adds the MCP entry and scaffolds `.taskmaster/docs/prd.md`.

### Step 6 — Save the plan

Save the file at `.cursor/plans/YYYY-MM-DD-<slug>.md`. Never overwrite a plan. If the plan needs changes mid-execution, append a `## Amendment YYYY-MM-DD` section with the reason and the changed tasks.

### Step 7 — Record the decision

Add to `memory/07-decisions-log.md`:

```markdown
### YYYY-MM-DD — Plan <slug> approved
- **Decision:** Execute plan `.cursor/plans/<filename>.md` against branch `feat/<slug>`.
- **Reason:** Implements Slice <N> of epic <name> (see `docs/features/<epic>/breakdown.md`).
- **Alternatives considered:** <e.g. "Implement in one PR" — rejected: too risky for review>
- **Consequences:** New code under `<paths>`, new tests under `<paths>`.
- **Files affected:** `.cursor/plans/<file>.md`.
```

### Step 8 — Invoke `memory-updater`

Persist:

- `.cursor/plans/YYYY-MM-DD-<slug>.md` saved.
- `memory/07-decisions-log.md` updated.
- `memory/02-current-state.md` updated (move slice to "In progress" only AFTER user picks an execution option).

### Step 9 — Closing

Summarize the plan, then emit a **HIGH** Command Recommendation (executing the plan is the natural next step):

```markdown
"Plan `.cursor/plans/<slug>.md` ready. <N> tasks, <~estimated minutes>. All steps have test + expected output.

---
**Next recommended command:** `/mm-ship <epic-slug>`
**Why:** the plan is the input to workflow 02; the dispatcher will walk each task with two-stage review.
**Go ahead:** type `go` and I'll proceed to `subagent-dispatcher` (or `parallel-executor` if slices are independent) as if you ran `/mm-ship`.
**Skip if:** you want to review the plan manually first, or execute inline via Cursor Plan Mode."
```

## Outputs

- `.cursor/plans/YYYY-MM-DD-<slug>.md` — the full implementation plan.
- Entry in `memory/07-decisions-log.md`.
- Updated `memory/02-current-state.md` after user approves execution.
- Optional compatibility note for `task-master-ai` MCP (System 2).

## Interactions with other skills

- **Runs after:** `feature-breakdown` (per slice), `research-first` (per external dependency), `flow-analyzer` (if the plan touches a critical flow), `architecture-mapper` (if structure changed).
- **Runs before:** `test-strategist` (for broader test coverage beyond the plan's TDD tests), `code-reviewer` (every plan execution is reviewed), `bug-investigator` (in case the plan's tests reveal bugs).
- **Hands execution to:** `subagent-dispatcher` (Option A, recommended ≥3 tasks) or `parallel-executor` (Option B, independent tasks) or Cursor Plan Mode (Option C, 1–2 tasks).
- **Invokes:** `research-first` for any un-verified dependency, `approval-gatekeeper` for sensitive tasks before execution, `memory-updater` at close.
- **Pairs with:** `test-strategist` — the plan enforces TDD at step level; `test-strategist` covers the strategic layer (pyramid, coverage across slices). With `task-master-ai` MCP installed, the plan is parsed into `.taskmaster/tasks.json` and the dispatcher uses `next_task` as the driver.

## Completion checklist

- [ ] Goal + Architecture + Success criteria written at the top.
- [ ] File map listed before tasks.
- [ ] Every task has ≤ 10 minutes of work and is split if larger.
- [ ] Every step has complete code (no placeholders), a run command, and an expected output.
- [ ] Failing test precedes implementation in every task.
- [ ] Commit happens at every green.
- [ ] Self-review pass done (coverage, placeholders, types, error paths, test-first, size, deps).
- [ ] Execution option offered (A/B/C).
- [ ] Decision logged in `memory/07-decisions-log.md`.
- [ ] `memory-updater` ran.

## Anti-patterns

- **Avoid:** Placeholders in code blocks (`// ... rest of implementation`, `TODO`, `<fill in>`). They are plan failures.
- **Avoid:** Steps without a run command and expected output. Un-verifiable steps cannot be "done".
- **Avoid:** Writing the implementation step before the failing test step.
- **Avoid:** Refactoring during a red step. Refactor is its own step after green.
- **Avoid:** A plan that touches > ~8 files. Split into multiple plans per slice.
- **Avoid:** Committing at the end of a long task. Frequent commits exist so rollbacks are cheap.
- **Avoid:** Overwriting an existing plan file. Amend with `## Amendment YYYY-MM-DD` instead.
- **Avoid:** Copying code from training data for a library when no `research-first` note exists. Verify first, plan second.
