---
description: Onboard an existing project (not born from MASTERMIND) into the system. Wraps workflow 06-onboard-existing-project. The script part (installing the shell) is run from the terminal BEFORE invoking this command; this command then orchestrates the in-IDE phases 5–8 (retroactive memory seed, strategic audit, phase confirmation, first retrospective).
---

# /mm-onboard

Arguments: $ARGUMENTS (optional — comma-separated hints, e.g. "phase:MVP", "skip-retro", "audit-focus:monetization")

Execute the workflow at `.claude/workflows/06-onboard-existing-project.md` for the current project.

Preconditions (you verify before proceeding):

1. The MASTERMIND shell is already installed here (`memory/`, `.cursor/rules/`, `.cursor/skills/`, `.claude/workflows/`, `.cursor/hooks/` all exist and are in sync). If not, STOP and direct the user to run `scripts/onboard-existing-project.ps1` (or `.sh`) first — that covers Phases 1–4 of the workflow.
2. `memory/02-current-state.md` has a concrete phase set (not the multi-option placeholder). If still placeholder, tell the user to pick one first (the script sets it, but if they ran it without `-Apply` / `-Phase` it may still be ambiguous).
3. There are no `.mastermind-proposal` files remaining in the repo. If there are, tell the user to resolve them before continuing (workflow Phase 3).

Then run the workflow's in-IDE phases (5 onward):

**Phase 5 — Retroactive memory seed**
1. Invoke the `retroactive-documenter` skill.
2. The skill reads code, git log, README, dependency files, tests.
3. It drafts content for the applicable `memory/` files and presents them one at a time for `approve`/`edit`/`skip`.
4. Writes only to approved files. Each write is a dedicated commit.
5. Flags what it could not infer from code (strategy, personas, monetization).

**Phase 6 — Strategic audit**
6. Invoke `/mm-audit` (wrapping `project-deep-audit`).
7. If `$ARGUMENTS` contains `audit-focus:<angle>`, pass it through as the audit's emphasized angle.
8. Produce the 12-angle artifacts and the Hard Truth.

**Phase 7 — Confirm phase**
9. Invoke `/mm-gate <current-phase>` so `phase-gate-reviewer` verifies the phase is actually correct now that the memory is populated.
10. If the skill recommends a different phase (e.g. what was set as MVP is actually Definition), surface this to the user and let them decide.

**Phase 8 — First retrospective (conditional)**
11. If the phase is `MVP`, `Iteration`, or `Launch`, and `$ARGUMENTS` does NOT contain `skip-retro`, invoke `/mm-retro` with period `since project inception` (or a user-specified period).
12. Run `/mm-learn` on any qualifying lesson candidates.

Closing: emit a **HIGH** Command Recommendation suggesting the natural next action for the confirmed phase (`/mm-ship` for MVP, continued `/mm-retro` for Iteration, etc.).

Never bypass the Question & Doubt Protocol during these phases — if memory content feels ambiguous or the audit surfaces a surprise, run `/mm-doubt` inline and wait for clarification before continuing.
