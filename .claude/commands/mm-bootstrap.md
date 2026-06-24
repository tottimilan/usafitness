---
description: Run the new-project-bootstrap workflow. Use when you have just cloned MASTERMIND 2.0 for a new idea and want to go from empty template to Discovery-complete in one guided flow.
---

# /mm-bootstrap

Arguments: $ARGUMENTS (a one-sentence description of the idea, optional)

Execute the workflow at `.claude/workflows/01-new-project-bootstrap.md`.

Steps:

1. If `$ARGUMENTS` is non-empty, treat it as the rough idea to bootstrap around. Otherwise ask the user for one sentence describing the idea.
2. Read `CLAUDE.md`, `.cursor/rules/00`, `.cursor/rules/01`, `.cursor/rules/06`.
3. Check if `~/.mastermind/global/` exists; if so, read `lessons.md`, `pitfalls.md`, `patterns.md` and surface relevant items under "Cross-project signals".
4. Follow the 6 phases defined in the workflow:
   - Phase 1: Orientation (Coach).
   - Phase 2: Rough brief in `memory/00-project-brief.md`.
   - Phase 3: Run `doubt-surfacer` skill.
   - Phase 4: Run `project-deep-audit` skill.
   - Phase 5: Run `phase-gate-reviewer` skill with target `Discovery`.
   - Phase 6: Run `memory-updater` and emit the Handoff block.
5. Respect the Question & Doubt Protocol throughout — ask before writing final documents.
6. Exit when `scripts/phase-gate-check.ps1 -NextPhase Discovery` returns PASS and the phase has been advanced.
