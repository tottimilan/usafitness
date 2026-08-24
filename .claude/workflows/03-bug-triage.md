---
name: bug-triage
description: Take an incoming bug report (from user, CI, or production monitor) from "something is broken" to "fixed, regression-tested, reviewed, memory updated, lesson captured". Chains bug-investigator, approval-gatekeeper, subagent-dispatcher (for the fix PR), test-strategist (for regression coverage), code-reviewer, security-review when applicable, and memory-updater.
triggers: ["bug", "broken", "fix this", "investigate", "flaky test", "CI failing", "production incident"]
estimated_duration: "30 minutes to several hours, depending on root cause complexity"
applicable_phases: [MVP, Iteration, Launch]
---

# Workflow 03 — Bug Triage

## Purpose

A disciplined path from bug report to shipped fix that refuses to ship patches without a reproduced root cause and a regression test. The workflow is short by design — bugs should be small surgical events, not multi-day sagas. If a bug balloons beyond ~1 day of investigation, this workflow raises a flag to escalate.

## Preconditions

- A bug is reported, reproducible (or provisionally reproducible with missing pieces), or a test is failing.
- Phase is `MVP`, `Iteration`, or `Launch`. Bugs in Discovery/Definition are rare; if one appears it usually means a spec issue and goes to a different workflow.
- The repo is in a state that allows branching (main is not mid-merge-chaos).

## Phases

### Phase 1 — Intake (Auditor → Coach)

- **Skill:** _(no dedicated skill yet; manual intake)_
- **Mode:** Auditor
- **Steps:**
  1. Capture the report verbatim: steps, expected, actual, environment, commit SHA, logs, user ID, timestamps.
  2. Classify severity (Low / Medium / High / Critical). Critical bugs may skip phases 3–4 (still reviewed after, never before).
  3. If Critical and in Launch phase, open an incident channel in whatever tool you use; record the incident ID.
- **Exit criterion:** report captured in a temporary scratch doc or directly in `docs/bugs/YYYY-MM-DD-<slug>.md` draft.

### Phase 2 — Investigation (Executor with strict discipline)

**Code Intelligence note (Claude efficiency):** During investigation and isolation, if a Code Intelligence MCP is configured, use graph queries first for symbols, call paths, and impact analysis instead of broad file reads or greps. This reduces tokens in code-heavy bug triage.

- **Skill:** `bug-investigator`
- **Mode:** Executor
- **Input:** the captured report.
- **Steps (the 4 bug-investigator phases):**
  1. **Reproduce** locally or capture in a failing automated test. **No fix proposed until reproduced.**
  2. **Isolate** to the smallest reproducible case. Binary search in git history if needed.
  3. **Diagnose** root cause and tag it: State / Timing / Dependency / Config / Assumption / Contract / Missing edge case.
  4. **Surgical fix** with **regression test first**. The test must fail on the broken commit and pass on the fix.
- **Exit criterion:** root cause identified and tagged; regression test exists and is red on broken commit, green after fix (locally).

### Phase 3 — Approval if sensitive

- **Skill:** `approval-gatekeeper`
- **Mode:** Auditor
- **Steps:** if the fix touches auth / payments / schema / prod deploy, gate it. For trivial bugs in non-sensitive areas, the workflow auto-approves.
- **Exit criterion:** decision logged.

### Phase 4 — Implementation and PR (Executor)

- **Skill:** `subagent-dispatcher` for plans with multiple files or `implementation-planner` + direct execution for one-file surgical fixes.
- **Mode:** Executor
- **Steps:**
  1. Feature branch: `fix/<slug>`.
  2. Commit: test first (red), then fix (green), then any follow-up cleanup.
  3. Open the PR with the post-mortem note referenced.
- **Exit criterion:** PR opened, tests green, post-mortem drafted.

### Phase 5 — Review

- **Skill:** `code-reviewer` always; `security-review` if the bug touches a trust boundary.
- **Mode:** Auditor
- **Steps:**
  1. `code-reviewer` walks the diff. Because this is a fix, it pays special attention to: no drive-by refactors, no scope creep, regression test asserts the bug (not just passes).
  2. `security-review` if sensitive.
- **Exit criterion:** verdict `Ready to merge` (or fixes applied and re-reviewed).

### Phase 6 — Merge and post-mortem

- **Skill:** _(shell + `memory-updater`)_
- **Mode:** Executor
- **Steps:**
  1. Merge. Squash commit message:
     ```
     fix(<scope>): <imperative summary>

     Root cause: <category> — <one-line>.
     Reproduces with test: <test path>.
     See docs/bugs/<date>-<slug>.md for post-mortem.
     ```
  2. Finalize `docs/bugs/YYYY-MM-DD-<slug>.md`: blast radius, post-fix checks, lessons learned.
  3. Invoke `memory-updater`:
     - Update `memory/09-testing-status.md` (regression test registered).
     - Update `memory/08-known-risks.md` if the bug revealed a systemic risk.
     - Append `memory/11-session-summary.md`.
     - Log the fix in `memory/07-decisions-log.md`.
     - If the bug lived inside a flow, update the error path section of `docs/flows/<slug>.md` with the newly discovered case.
     - Flag a cross-project lesson candidate if applicable (e.g. "RLS policies need auth + anon testing").
- **Exit criterion:** PR merged, post-mortem complete, memory updated.

### Phase 7 — Learning (optional but recommended)

- **Skill:** _(future `continuous-learner`, not yet built)_
- **Steps:**
  1. Review the post-mortem's "Lessons learned" section.
  2. If a lesson qualifies (project-agnostic + evidence + actionable), promote to `~/.mastermind/global/lessons.md` or `pitfalls.md`.
  3. Commit in the global memory repo.
- **Exit criterion:** lesson either promoted or explicitly noted as "not cross-project".

## Escalation (when the workflow hits a wall)

If any phase cannot finish:

- **Cannot reproduce (Phase 2):** do not proceed. Either gather more evidence from the reporter, add instrumentation behind a flag, or declare the bug `Unreproducible` in `memory/08-known-risks.md` with status `Open / Investigating`.
- **Fix keeps breaking tests for unrelated reasons:** pause, run `project-deep-audit` or at least `architecture-mapper` to check if the bug is a symptom of deeper rot.
- **Investigation > 1 day without root cause:** escalate. The bug is either bigger than a bug, or the codebase has drift that needs its own workflow.

## Artifacts produced

- Fix commit on `fix/<slug>` branch, squashed to main.
- Regression test at the level chosen by `test-strategist`.
- `docs/bugs/YYYY-MM-DD-<slug>.md` post-mortem.
- Updated `memory/09-testing-status.md`, `memory/08-known-risks.md` (if applicable), `memory/07-decisions-log.md`, `memory/11-session-summary.md`.
- Updated flow doc(s) in `docs/flows/` if the bug lived inside a flow.
- Optional lesson promotion to `~/.mastermind/global/`.

## Exit criteria (workflow complete)

- [ ] Bug reproduced.
- [ ] Root cause tagged.
- [ ] Regression test red-then-green demonstrated.
- [ ] PR merged.
- [ ] `code-reviewer` (and `security-review` if applicable) green.
- [ ] Post-mortem complete for non-trivial bugs.
- [ ] Memory updated.

## Invocation

> *"Run `.claude/workflows/03-bug-triage.md`. Bug: <short description + link to report>."*

Or:

> `/mm-bug <short description>`

## Anti-patterns

- **NEVER:** Propose a fix before reproducing the bug.
- **NEVER:** Ship a fix without a regression test that was red before the fix.
- **NEVER:** Do drive-by refactors in the fix PR.
- **NEVER:** Merge without the post-mortem for a bug that took > 2 hours.
- **NEVER:** Classify a flaky test as "acceptable". Flaky = broken.
- **NEVER:** Skip Phase 7 (learning) for bugs that are "obvious in retrospect". Those are exactly the ones that teach something cross-project.
