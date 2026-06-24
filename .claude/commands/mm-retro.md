---
description: Run the weekly-retrospective workflow. Reviews the last 7 days, updates risk posture, checks drift between memory and code, clears flaky tests and stuck PRs, promotes lessons to global memory, and states the Top 3 priorities for next week.
---

# /mm-retro

Arguments: $ARGUMENTS (optional — "period:<YYYY-MM-DD..YYYY-MM-DD>" to override the default 7-day window)

Execute the workflow at `.claude/workflows/05-weekly-retrospective.md`.

Steps:

1. Default period: last 7 days ending today. Override with `$ARGUMENTS` if provided.
2. Phase 1 — Week in review:
   - Read `memory/11-session-summary.md` entries in the period.
   - Read `memory/07-decisions-log.md` entries in the period.
   - Run `git log --since="7 days ago" --oneline --all`.
   - Summarize shipped slices, decisions, bugs fixed, phase transitions.
3. Phase 2 — Risk posture:
   - Review every Open risk in `memory/08-known-risks.md`. Update statuses.
   - Add new risks emerged this week.
4. Phase 3 — Drift check:
   - `scripts/sync-skills.ps1 -Check` (or `.sh --check`).
   - `scripts/phase-gate-check.ps1`.
   - Verify `memory/06-feature-map.md` statuses match merged PRs.
   - Verify `memory/03-architecture.md` matches real code.
5. Phase 4 — Flaky tests + stuck things:
   - Flag flaky tests, stuck PRs (> 3 days), stale worktrees.
   - Recommend actions, do not silently skip.
6. Phase 5 — Lessons promotion:
   - Review all "Lessons learned" candidates from the period.
   - Apply the three-part test (project-agnostic, evidence-backed, actionable).
   - Draft entries and present to the user for approval before writing to `~/.mastermind/global/`.
7. Phase 6 — Top 3 priorities for next week:
   - Revisit `memory/02-current-state.md` "What is next", `memory/10-open-questions.md`, `memory/12-open-doubts-and-questions.md`.
   - Pick exactly 3. Not 5, not 7. Three.
8. Phase 7 — Append a retrospective entry to `memory/11-session-summary.md` using the append-mode convention (type: `weekly retrospective`, covers period).

Keep it tight: 20–40 minutes end-to-end. If the retro runs longer, the project is doing too many things at once.
