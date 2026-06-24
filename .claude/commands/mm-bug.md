---
description: Run the bug-triage workflow for an incoming bug report. Enforces reproduce → isolate → diagnose → surgical fix with regression test. Never patches without a confirmed root cause.
---

# /mm-bug

Arguments: $ARGUMENTS (the bug description, ticket ID, failing test name, or a link to a report)

Execute the workflow at `.claude/workflows/03-bug-triage.md`.

Steps:

1. Take `$ARGUMENTS` as the bug identifier/description.
2. Phase 1 — Intake:
   - If `$ARGUMENTS` looks like a ticket ID or URL, ask the user for the full report if not already pasted.
   - Classify severity (Low / Medium / High / Critical).
3. Phase 2 — Invoke `bug-investigator` and follow its 4 internal phases (reproduce → isolate → diagnose → surgical fix). **No fix is proposed until the bug is reproduced locally or captured in a failing automated test.**
4. Phase 3 — If the fix touches sensitive areas, invoke `approval-gatekeeper`.
5. Phase 4 — Implementation: either a one-shot fix (single-file surgical) or `subagent-dispatcher` if the fix spans multiple files.
6. Phase 5 — `code-reviewer` always; `security-review` if the bug touched a trust boundary.
7. Phase 6 — Merge, finalize `docs/bugs/YYYY-MM-DD-<slug>.md` post-mortem, invoke `memory-updater`.
8. Phase 7 — Promote lesson to `~/.mastermind/global/` if it qualifies (project-agnostic + evidence + actionable).

If Phase 2 cannot reproduce the bug, stop and report. Do not try to "fix based on the description". Log the bug as `Unreproducible` in `memory/08-known-risks.md` with an evidence-gathering plan.

If investigation exceeds 1 day without a root cause, escalate: the bug is either bigger than a bug, or the codebase needs an architectural audit.
