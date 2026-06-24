---
description: Run the feature-lifecycle workflow end-to-end for a specific epic — from breakdown to merge. Use when an epic is approved and ready to ship. Chains feature-breakdown, implementation-planner, approval-gatekeeper, subagent-dispatcher (or parallel-executor), code-reviewer, security-review, and memory-updater.
---

# /mm-ship

Arguments: $ARGUMENTS (the epic slug — e.g. "auth-mvp", "billing-v1")

Execute the workflow at `.claude/workflows/02-feature-lifecycle.md` for the epic `$ARGUMENTS`.

Steps:

1. Resolve the epic file at `docs/features/$ARGUMENTS.md`. If not found, ask the user to clarify or run `product-requirements` first.
2. Verify phase: must be `MVP` or `Iteration` per `memory/02-current-state.md`. Abort otherwise.
3. Follow the 7–8 phases of the workflow:
   - Phase 1: `feature-breakdown` on the epic.
   - Phase 2: `implementation-planner` for the first slice.
   - Phase 3: `approval-gatekeeper` on the plan.
   - Phase 4a: `subagent-dispatcher` **or** Phase 4b: `parallel-executor`, based on slice independence.
   - Phase 5: cross-track `code-reviewer` if 4b was used.
   - Phase 6: `security-review` if the feature touches trust boundaries.
   - Phase 7: merge + `memory-updater`.
   - Phase 8: loop back to the next slice or hand off to the next epic / phase.
4. If at any phase the exit criterion is not met, pause and remediate instead of advancing.
5. Close with `memory-updater` and emit the standard Handoff block naming the next action.

Default execution strategy: subagent-dispatcher (within one workspace) unless the breakdown marks ≥ 2 slices as fully independent, in which case parallel-executor is preferred. Always ask the user before spawning worktrees.
