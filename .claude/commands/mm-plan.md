---
description: Run the implementation-planner skill for a specific slice or well-scoped change. Produces a bite-sized TDD plan saved under .cursor/plans/ with exact file paths, complete code snippets, and verification commands per step.
---

# /mm-plan

Arguments: $ARGUMENTS (the slice name, the task description, or a reference like "slice 3 of auth-mvp")

Execute `implementation-planner`:

1. Resolve `$ARGUMENTS` to a concrete slice:
   - If it names a slice in `docs/features/<epic>/breakdown.md`, use that slice's spec as input.
   - If it is a free-form description, treat it as the task to plan.
2. Load the prerequisites from `.cursor/skills/implementation-planner/SKILL.md` (CLAUDE.md, rules 00/01/02/03/04, relevant memory and docs).
3. Apply the Question & Doubt Protocol before writing the plan. No placeholders allowed in the final output.
4. Follow the 9 steps of the skill:
   - Scope + success criteria.
   - File map.
   - Bite-sized tasks with red-green-commit TDD rhythm.
   - Self-review pass (coverage, placeholders, types, error paths, test-first, size, deps).
   - Execution handoff block (5 options).
   - Compatibility note for `task-master-ai` when installed.
   - Save at `.cursor/plans/YYYY-MM-DD-<slug>.md`.
   - Log decision in `memory/07-decisions-log.md`.
   - Invoke `memory-updater`.
5. Close by asking the user to pick an execution option (A–E).

Prerequisites worth double-checking:
- If the plan will touch sensitive areas (auth, payments, schema), flag it so `approval-gatekeeper` runs at Step 3 of `02-feature-lifecycle` workflow later.
- If a library is used and no `research-first` note exists, invoke `research-first` mid-plan.
