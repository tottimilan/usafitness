---
description: Run the phase-gate-transition workflow to advance the project from its current phase to the next. Wraps the dry-run check, the phase-gate-reviewer skill, user approval, memory promotion, and handoff to the next workflow.
---

# /mm-gate

Arguments: $ARGUMENTS (the target phase — one of: Discovery, Definition, Prototype, MVP, Iteration, Launch)

Execute the workflow at `.claude/workflows/04-phase-gate-transition.md`.

Steps:

1. Validate `$ARGUMENTS` is one of: `Discovery`, `Definition`, `Prototype`, `MVP`, `Iteration`, `Launch`. Otherwise ask.
2. Phase 1 — Dry-run: run `pwsh -File scripts/phase-gate-check.ps1 -NextPhase $ARGUMENTS` (or `.sh --next $ARGUMENTS`). Report PASS / GAPS / BLOCK.
3. Phase 2 — Remediate gaps if any:
   - Missing Discovery artifacts → `project-deep-audit` or `/mm-audit`.
   - Missing PRD → `product-requirements` or `/mm-plan`.
   - Missing architecture → `architecture-mapper`.
   - Missing testing strategy → `test-strategist`.
   - Missing security → `security-review`.
   - Open Critical risks → either fix via `/mm-bug` / remediation plan, or accept + log.
4. Phase 3 — Invoke `phase-gate-reviewer` skill with target `$ARGUMENTS`.
5. Phase 4 — Present the draft transition entry to the user and wait for explicit `approve` / `adjust` / `block`.
6. Phase 5 — On `approve`: skill writes to `memory/13-phase-history.md`, `memory/02-current-state.md`, `memory/07-decisions-log.md`.
7. Phase 6 — Optional: review cross-project lesson candidates from the outgoing phase and promote qualifying ones to `~/.mastermind/global/`.
8. Phase 7 — Handoff to the next natural workflow for the new phase:
   - Discovery → `/mm-audit` then `/mm-plan` for PRD.
   - Definition → `/mm-plan` per epic.
   - Prototype → `/mm-mockup create` (UI projects; non-UI projects skip to MVP with `--skip-reason "no UI"`).
   - MVP → `/mm-ship` per epic; optionally `scripts/install-taskmaster.ps1`.
   - Iteration → ongoing `/mm-ship` + `/mm-retro` weekly.
   - Launch → `/mm-review` security pass + `/mm-retro` weekly.

Do not advance the phase silently by editing `memory/02-current-state.md` manually. The workflow must run end-to-end.
