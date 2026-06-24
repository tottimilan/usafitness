---
name: subagent-dispatcher
description: Executes an approved implementation plan (from implementation-planner) by dispatching a fresh specialized subagent per task, with two-stage review (spec compliance first, then code quality) between tasks. Use when an implementation plan has 3+ tasks, when tasks are mostly independent or clearly sequenced, when staying in the current session (no handoff to a parallel session), or when the user asks to "execute the plan", "run the tasks", "subagent-driven development". Follows the Anthropic-canonical orchestrator-plus-specialists pattern: controller curates context per task, subagents never see the controller's full history, model selection is role-based (cheap / standard / capable), and each implementer reports DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED. Complements parallel-executor (worktree-level isolation); subagent-dispatcher runs within a single workspace.
---

# Subagent Dispatcher

## Goal

Take an approved implementation plan and drive it to completion with **high quality and fast iteration** by dispatching a **fresh subagent per task**. The controller (this skill) stays strategic and keeps the global context; subagents are narrow, isolated, and specialized. After each task, two reviewers (spec compliance, then code quality) verify the work before advancing.

The skill is the operational arm of `.cursor/rules/07-subagent-orchestration.mdc`. It turns the rule's policy into an executable loop. Compared to a single-agent session executing the same plan, the dispatcher wins on:

- **Context hygiene** — each subagent gets exactly the context it needs, no leakage from prior tasks.
- **Quality gates per task** — issues surface immediately, not at the end.
- **Cost efficiency** — cheap models for mechanical tasks, powerful only for judgment.

## When to use

**Always:**
- Executing an `implementation-planner` plan with **≥ 3 tasks**.
- Tasks are mostly independent or clearly sequenced (dependencies declared in the plan).
- Staying in the current session (not handing off to a parallel async session).
- The user says: *"execute the plan"*, *"run the tasks"*, *"go through the plan"*, *"subagent-driven"*.

**Trigger keywords:** "execute plan", "run tasks", "subagent", "SDD", "subagent-driven development", "work the plan", "implement the plan".

**Do NOT use for:**
- Tasks that are tightly coupled with ambiguous shared state (stays in single-agent mode).
- Single-file, single-task changes (use `implementation-planner` + direct Executor mode).
- Work-in-progress exploration without an approved plan.
- Code review only (use `code-reviewer` directly).
- Bug investigation (use `bug-investigator`).

## Prerequisites

Read:

1. `CLAUDE.md`
2. `.cursor/rules/01-karpathy-principles.mdc` (Surgical Changes matter here)
3. `.cursor/rules/06-execution-modes.mdc` (this skill runs in Executor mode)
4. `.cursor/rules/07-subagent-orchestration.mdc` (the policy this skill enforces)
5. The plan being executed: `.cursor/plans/YYYY-MM-DD-<slug>.md`
6. `memory/02-current-state.md` (current phase)
7. Any `docs/flows/*.md` referenced by the plan
8. `memory/03-architecture.md` if tasks touch architectural boundaries

Confirm **all plan tasks have complete acceptance criteria and verification commands**. If the plan has placeholders, stop and return the plan to `implementation-planner` for repair. Do not try to fill gaps mid-execution.

## Process

### Step 1 — Controller pre-flight

Before dispatching anything, the controller (you, main session) must:

1. **Extract all task texts verbatim** from the plan. Do NOT make subagents re-read the plan file — the controller curates.
2. **Identify cross-task context** that every subagent needs (e.g. schema files, shared type definitions, naming conventions). Prepare it as a small context block.
3. **Create a TodoWrite** with one entry per task so progress is visible.
4. **Invoke `approval-gatekeeper`** if any task is sensitive (auth, payments, schema, destructive). Apply decisions at task level, not at plan level.

### Step 2 — Dispatch the implementer subagent

For the current task:

1. **Select model** based on task complexity (see §Model selection table below).
2. **Build the subagent prompt** with:
   - One-paragraph project context (from `memory/00-project-brief.md` + shared context).
   - The complete task text (from Step 1).
   - Acceptance criteria.
   - Verification commands and expected outputs.
   - Project conventions (TypeScript strict, naming, imports — from `.cursor/rules/02-tech-stack.mdc`).
   - **Explicit instruction:** *"Follow TDD. Self-review before returning. Report one of DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED."*
3. **Dispatch** with all tools the task needs (Read, Write, Edit, Bash, Grep as appropriate).
4. **Wait for the subagent to return** with a status.

### Step 3 — Handle the implementer status

| Status | Action |
|---|---|
| `DONE` | Proceed to Step 4 (spec compliance review). |
| `DONE_WITH_CONCERNS` | Read the concerns. If they affect correctness or scope, fix before review. If observational, proceed to review and note. |
| `NEEDS_CONTEXT` | Provide the missing context and re-dispatch the **same** subagent. |
| `BLOCKED` | Triage: more context? bigger model? split task? escalate to human? **Never** silently re-dispatch with no change. |

### Step 4 — Spec compliance review (first reviewer)

Dispatch a **fresh reviewer subagent** with:

- The task spec (acceptance criteria + scope).
- The git diff of the implementer's commit(s).
- Explicit instruction: *"Does the code exactly match the spec? Report missing requirements and scope creep. Do NOT evaluate code quality here."*

Possible outcomes:
- `SPEC_OK` → proceed to Step 5.
- `SPEC_GAPS` → implementer (same subagent as in Step 2) fixes; re-dispatch the spec reviewer; loop until `SPEC_OK`.

### Step 5 — Code quality review (second reviewer)

Dispatch a **fresh reviewer subagent** with:

- The task spec.
- The git diff.
- Explicit instruction: *"Evaluate code quality: naming, error handling, tests, architecture fit, over-engineering, Karpathy principles. Categorize findings Critical / Important / Suggestion. Verdict: Approved / Approved with fixes / Not approved."*

Possible outcomes:
- `APPROVED` → mark task complete, advance.
- `APPROVED_WITH_FIXES` / `NOT_APPROVED` → implementer fixes; re-dispatch the code quality reviewer; loop until `APPROVED`.

### Step 6 — Advance to the next task

- Mark the TodoWrite entry complete.
- **Log the dispatch (observability, rule 07 §Observability).** Emit one record per implementer dispatch via the helper — best-effort, never blocks:
  ```bash
  bash scripts/log-dispatch.sh --dispatcher subagent-dispatcher --role implementer \
       --model <model> --status <DONE|DONE_WITH_CONCERNS|NEEDS_CONTEXT|BLOCKED> \
       --wall-ms <ms> --tokens <estimate> --input-text "<curated prompt>"
  ```
  (PowerShell: `scripts/log-dispatch.ps1`.) Also log the spec-reviewer and code-quality-reviewer dispatches with the matching `--role`.
- Verify no dependency of the next task was invalidated (rare but it happens).
- Return to Step 2 for the next task.

If the next task has **hard dependencies** that parallelism would violate, stay sequential. If the next 2–N tasks are independent, consider handing off to `parallel-executor` which manages worktrees for true parallel runs.

### Step 7 — Final review (all tasks complete)

After the last task:

1. Dispatch a **final code reviewer subagent** over the entire implementation (all commits in the plan range).
2. Run `code-reviewer` skill on the branch for the holistic verdict.
3. If the plan produced a feature with user-facing effect, run `security-review` on sensitive surfaces.
4. Emit the **Handoff** block (per rule 06) proposing the next mode (typically Auditor for final review, or merge if all green).

### Step 8 — Persist and close

Invoke `memory-updater` to:

- Append to `memory/11-session-summary.md` (append mode).
- Log the dispatcher run as a decision entry in `memory/07-decisions-log.md`.
- Update `memory/09-testing-status.md` with new tests registered during the run.
- If a task surfaced a candidate cross-project lesson, flag it.

Then emit a **HIGH** Command Recommendation tied to the final review outcome:

```markdown
"Dispatcher run complete. <N> tasks executed, all reviews green. Final roll-up verdict: <status>.

---
**Next recommended command:** `/mm-review <branch>` (if not already run) or merge.
**Why:** the two-stage per-task reviews pass; a final branch-level review closes the loop before merge.
**Go ahead:** type `go` and I'll run `code-reviewer` on the full branch.
**Skip if:** the final reviewer subagent already issued Ready-to-merge — then merge directly."
```

## Model selection table

| Task complexity signal | Model tier |
|---|---|
| 1–2 files, clear spec, mechanical change | Fast cheap (Cursor Composer / Sonnet / equivalent) |
| Multi-file, integration concerns, pattern matching | Standard (Sonnet-class) |
| Architecture judgment, broad codebase reasoning, debugging | Most capable (Opus-class) |
| Reviewer (spec compliance) | Standard or most capable — catches errors the implementer missed |
| Reviewer (code quality) | Standard or most capable |
| Research fetcher + Context7 | Cheap |

Defaulting to the most capable model for every role is the #1 cost trap. Use the cheapest that works.

## Implementer prompt skeleton (reference)

```markdown
You are an implementer subagent. You have no memory of prior tasks — the controller gives you all context you need.

## Project context (curated)
<one paragraph, derived from memory/00-project-brief.md and shared context>

## Conventions
<imports, naming, TS strict, etc. from .cursor/rules/02-tech-stack.mdc>

## Your task
<copy verbatim from the plan: task N text, files, steps, acceptance criteria, verification commands>

## Discipline
- Follow TDD: write the failing test first, see it fail, implement minimum code, see it pass, commit.
- Apply Karpathy principles: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven.
- No placeholders in code. No scope creep. Every changed line traces to the user request.

## Self-review before returning
- Did I implement exactly what the task says?
- Did I add anything not requested?
- Does every test run green?
- Did I commit after each green?

## Return status
Report one of: DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, BLOCKED.
For DONE_WITH_CONCERNS, list concerns. For NEEDS_CONTEXT, list exactly what's missing. For BLOCKED, describe the blocker.
```

## Reviewer prompt skeletons (reference)

**Spec reviewer:**

```markdown
You are a spec compliance reviewer. You do NOT evaluate code quality — only whether the code matches the spec.

## Task spec (verbatim)
<…>

## Git diff to review
<…>

## Output
- SPEC_OK  → code matches spec.
- SPEC_GAPS → list missing requirements; list any unrequested additions (scope creep).
```

**Code quality reviewer:**

```markdown
You are a code quality reviewer. Assume spec compliance has been verified separately.

## Task spec
<…>

## Git diff
<…>

## Review categories
- Code quality (naming, error handling, DRY, YAGNI).
- Architecture fit (conventions, module boundaries).
- Tests (real assertions, edge cases).
- Karpathy compliance (Surgical Changes: every line traces to the task).

## Output format
- Findings by severity (Critical / Important / Suggestion), each with file:line + why + fix.
- Strengths (at least 2).
- Verdict: APPROVED | APPROVED_WITH_FIXES | NOT_APPROVED.
```

## Integration with task-master-ai (when installed)

When `task-master-ai` MCP is active (System 2 Sub-phase 2.2+), the dispatcher can:

- Pull the next task via `next_task` instead of iterating the local plan file.
- Call `set_task_status` on task transitions (`in-progress` before dispatch, `done` after both reviews green).
- Use `update_subtask` with progress notes after each review loop.
- Use `expand_task` if a dispatched task reveals it is actually multi-step (task-master breaks it further, the dispatcher resumes).

The handoff is explicit: if `task-master-ai` is available and the plan was parsed into `.taskmaster/tasks.json`, the dispatcher uses it as the source of truth. Otherwise, it reads `.cursor/plans/<file>.md` directly.

## Outputs

- Commits on the current branch (one per task minimum, more when TDD red/green cycles).
- Updated TodoWrite reflecting task-by-task progress.
- Final code review result in chat.
- `memory/11-session-summary.md` appended; `memory/07-decisions-log.md` entry for the dispatcher run; `memory/09-testing-status.md` refreshed.
- Handoff block proposing the next mode.

## Interactions with other skills

- **Invoked by:** `implementation-planner` (after user approves execution), user explicitly (*"dispatch the plan"*), workflow `02-feature-lifecycle` (when available).
- **Invokes:** `approval-gatekeeper` before dispatching sensitive tasks; `code-reviewer` + `security-review` at the final-review step; `memory-updater` at close. May invoke `bug-investigator` if a test fails for non-obvious reasons.
- **Pairs with:** `parallel-executor` — the dispatcher runs within one workspace; `parallel-executor` manages multiple workspaces (worktrees). Use both together when tasks fan out.
- **Pairs with:** `test-strategist` — tests each subagent runs must match the strategy's level and mock policy.

## Completion checklist

- [ ] Plan read; all tasks extracted verbatim.
- [ ] Shared context block prepared once, reused per task.
- [ ] TodoWrite created with one entry per task.
- [ ] Every dispatched implementer received curated context (no plan-file reads).
- [ ] Every task passed spec compliance review before code quality review.
- [ ] Every review loop closed before advancing to the next task.
- [ ] No BLOCKED status silently re-dispatched.
- [ ] Each dispatch logged via `scripts/log-dispatch` (rule 07 §Observability).
- [ ] Final code review over the full branch completed.
- [ ] `memory-updater` ran.
- [ ] Handoff block emitted.

## Anti-patterns

- **NEVER:** Let the subagent read the plan file. The controller extracts and delivers.
- **NEVER:** Run code quality review before spec compliance is green. Wrong order, wrong conclusions.
- **NEVER:** Default to the most capable model for every role.
- **NEVER:** Dispatch multiple implementer subagents in parallel within the same workspace (they will collide on files). Use `parallel-executor` with worktrees instead.
- **NEVER:** Start implementation on `main` without a feature branch. Create a branch first.
- **NEVER:** Advance to the next task with an open Critical/Important finding. Fix the loop first.
- **NEVER:** Treat `BLOCKED` as transient. Something needs to change before re-dispatch.
- **NEVER:** Skip the final review over the whole branch. Per-task review is necessary but not sufficient.
- **NEVER:** Forget to invoke `memory-updater` at the end. A dispatcher run with no trace erases its own value.
