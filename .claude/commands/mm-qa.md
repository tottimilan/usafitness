---
description: Holistic health check ("QA") of the MASTERMIND system itself — is everything the right size, with no cruft, no overlap, no gaps, and still aligned with how the system should work? Composes the existing checks (no new logic) into one pass: structural drift (template-audit), per-skill lint (skill-quality-evaluator), an overlap/placeholder/context-budget sweep, and a harness re-audit reflection. Use before a release, periodically (e.g. monthly or inside /mm-retro), after adding/removing components, or when the user asks "is the system healthy / right-sized / has cruft / has gaps", "system QA", "mm-qa".
---

# /mm-qa — System self-QA (holistic health check)

Arguments: $ARGUMENTS (optional — `deep` to also run the deep skill-content mirror compare)

This is **not** new logic. It composes what the template already has into one "is MASTERMIND still healthy and right-sized?" pass. Run it, then report findings grouped by severity with concrete fixes. Do NOT auto-fix without surfacing findings first.

## Steps

### 1. Structural integrity (drift)
Run the meta-audit and report it verbatim:
```
pwsh -File scripts/template-audit.ps1        # or: bash scripts/template-audit.sh   (--deep with `deep` arg)
```
This covers: doc counts == real, phase-criteria single-source, skill↔mirror parity, command/skill visibility, README build-diary. Any Critical → fix path is `sync-skills` / `render-phase-criteria` / a doc edit.

### 2. Per-skill size & lint
```
pwsh -File .cursor/skills/skill-quality-evaluator/scripts/eval.ps1 -All    # or eval.sh --all
```
Flag any skill < 80 or > 500 lines, or with MISSING_TRIGGER / BLOATED_SKILL. These are the "morraña" signals at the skill level.

### 3. Overlap, placeholders & context budget (light sweep — reading + grep, no new tooling)
- **Overlap:** check the known >60%-overlap pairs and any new ones (e.g. `mockup-factory` ↔ `prototype-designer`, `memory/10-open-questions` ↔ `memory/12-open-doubts`). Report as "evaluate fusion / sharpen boundary", not auto-merge.
- **Empty placeholders / dead scaffolding:** list directories that are still just `.gitkeep` (e.g. `.claude/agents/`, `claude-side/prompts/`) — promise-without-delivery candidates.
- **Always-on context budget:** confirm only `00/01/04/06` rules are `alwaysApply: true`; sum their lines + `CLAUDE.md` + `AGENTS.md`. Flag if the always-on surface grew materially since last QA (target: lean; detail lives on-demand).

### 4. Harness re-audit reflection (Coach)
Apply the rule-07 / workflow-05 §"Harness re-audit" lens: for the always-on rules and most-loaded skills, ask *"does today's base model already do this reliably without the instruction?"* Propose pruning **only** redundant scaffolding. **NEVER** propose pruning safety, the Question & Doubt Protocol, or evaluators — those stay regardless of model strength.

## Output contract

Emit a single report:
- **Verdict:** Healthy / Healthy with findings / Needs attention.
- **Findings by severity** (Critical drift → Important size/overlap → Suggestion), each with the concrete remediation command or edit.
- **Right-sizing line:** always-on surface, largest skills, and any growth since last QA.
- Close with a **HIGH** command recommendation only if there is a clear single fix; otherwise list the remediation options. Do not auto-execute fixes.

## When to use
- Before tagging a release / version bump.
- Periodically (monthly, or as a step inside `/mm-retro`).
- After adding or removing any rule / skill / workflow / command.
- When the user asks whether the system is healthy, right-sized, or accumulating cruft.

## Do NOT use for
- Per-project QA (this audits the **template/system**, not the user's product code).
- A substitute for `/mm-template-audit` in CI (that one is the machine gate; `/mm-qa` is the human-facing holistic review that wraps it).
