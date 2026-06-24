---
name: skill-quality-evaluator
description: Static analysis lint for MASTERMIND skills. Evaluates SKILL.md files against the canonical 9-section template, validates YAML frontmatter (name, description), enforces line-count budget (<=500), and detects six anti-patterns (MISSING_FRONTMATTER, INVALID_NAME, EMPTY_DESCRIPTION, BLOATED_SKILL, MISSING_TRIGGER, MISSING_SECTION). Use when adding a new skill, refactoring an existing one, auditing the skill library, or before merging any PR that touches .cursor/skills/. Produces a per-skill score (0-100) and a list of findings. Runs as PowerShell CLI with no external dependencies. Trigger keywords "evaluate skill", "lint skill", "skill quality", "audit skills", "score skill".
---

# Skill Quality Evaluator

## Goal

Provide a deterministic, dependency-free, repeatable way to score the quality of any MASTERMIND skill. The evaluator answers: "Does this `SKILL.md` follow the conventions agreed in `skill-creator` and the agentskills.io spec?" — without invoking any LLM, without network access, without third-party tooling beyond PowerShell + Pester.

Adapted from the `PluginEval` framework of `wshobson/agents` (see `research/06-subagent-collections.md`). MASTERMIND-native v1 covers static analysis only. Semantic evaluation (LLM-judge layer) is a possible v2.

## When to use

**Always:**
- Before committing a new skill (`skill-creator` produces it → evaluator scores it).
- After refactoring an existing skill (length, sections, frontmatter all changed).
- During quarterly stocktakes of the skill library.
- Before promoting a skill into the canonical template (MASTERMIND release).

**Trigger keywords:** "evaluate skill", "lint skill", "skill quality", "audit skills", "score skill", "skill score", "skill linter".

**Do NOT use for:**
- Evaluating semantic correctness ("does this skill actually trigger when it should?"). That requires v2 with LLM-judge.
- Scoring rules, workflows, or commands (different artifacts, different schema).
- Replacing human review of the skill content. The evaluator is structural; the human is semantic.

## Prerequisites

- PowerShell 7+ (`pwsh`).
- Pester 5+ for running the test suite (`Install-Module Pester -Force -SkipPublisherCheck -Scope CurrentUser -MinimumVersion 5.0`). Not required to run the evaluator itself.
- Run from repo root for `-All` mode (the script looks for `.cursor/skills/` relative to current directory).

## Process

### Single skill

```powershell
pwsh -File .cursor/skills/skill-quality-evaluator/scripts/eval.ps1 `
     -Path .cursor/skills/<skill-name>
```

Or pointing to the `SKILL.md` directly:

```powershell
pwsh -File .cursor/skills/skill-quality-evaluator/scripts/eval.ps1 `
     -Path .cursor/skills/<skill-name>/SKILL.md
```

### Batch mode (all skills)

```powershell
pwsh -File .cursor/skills/skill-quality-evaluator/scripts/eval.ps1 -All
```

Emits a sorted report (lowest score first) plus average score across the library. Skips fixtures under `**/references/fixtures/**`.

### JSON output (for tooling)

Add `-Json` to either mode:

```powershell
pwsh -File .cursor/skills/skill-quality-evaluator/scripts/eval.ps1 -All -Json `
    | Set-Content reports/skill-quality-2026-05-03.json
```

### CI / strict mode

Add `-Strict` to make the script exit 1 if any Critical finding is present:

```powershell
pwsh -File .cursor/skills/skill-quality-evaluator/scripts/eval.ps1 -All -Strict
```

Use this if integrating into a pre-commit or CI hook (deferred for v1; see `research/06-subagent-collections.md`).

### Anti-patterns detected (v1)

| Code | Severity | Trigger | Penalty |
|---|---|---|---|
| `MISSING_FRONTMATTER` | Critical | No `---` YAML frontmatter at top of file | -50 |
| `INVALID_NAME` | Critical | name violates `^[a-z0-9]+(-[a-z0-9]+)*$`, exceeds 64 chars, or contains `anthropic`/`claude` | -25 |
| `EMPTY_DESCRIPTION` | Critical | description missing or out of 1-1024 chars range | -25 |
| `BLOATED_SKILL` | Important | Body >500 lines (excluding frontmatter) | -15 |
| `MISSING_TRIGGER` | Important | description has no "use when..." or trigger keyword phrase | -15 |
| `MISSING_SECTION` | Important | Required H2 section absent (Goal / When to use / Process / Anti-patterns) | -10 each |

See `references/anti-patterns.md` for examples and rationale per anti-pattern.

### Score interpretation

- **90-100** — Production quality. Ship.
- **75-89** — Acceptable, has Important findings. Schedule fixes.
- **0-74** — Critical findings. Block merge until addressed.

## Outputs

- **Stdout (default):** human-readable report with per-skill score and findings.
- **Stdout (`-Json`):** structured object with `Path`, `Score`, `Findings[]`. In `-All` mode also includes `SkillCount`, `AverageScore`, `WorstSkills[]`, `Results[]`.
- **Exit code:** 0 on success; 1 with `-Strict` if any Critical finding; 2 on usage error.
- **No file writes.** The evaluator never modifies skills — it only reports.

## Interactions with other skills

- **Invoked by:** `skill-creator` (after creating or editing any skill); maintainer during quarterly stocktakes; CI gate (deferred — see plan amendment).
- **Invokes:** none (pure analysis, no side effects).
- **Pairs with:** `code-reviewer` (skills are code-like artifacts — review semantically while evaluator checks structurally).

## Completion checklist

- [ ] Frontmatter present and parseable.
- [ ] All 9 MASTERMIND sections present.
- [ ] Body <=500 lines (or split into `references/` + `scripts/`).
- [ ] Pester suite passes (`Invoke-Pester .cursor/skills/skill-quality-evaluator/scripts/eval.Tests.ps1`).
- [ ] Self-evaluation score >= 90 (`pwsh -File scripts/eval.ps1 -Path .cursor/skills/skill-quality-evaluator`).

## Anti-patterns

- **Avoid:** Adding semantic evaluation (LLM-judge) to v1. That belongs in v2 to keep v1 deterministic.
- **Avoid:** Calibrating thresholds (line count, penalty) before observing real-world output for at least 4 weeks.
- **Avoid:** Wiring the evaluator into a pre-commit hook before false-positives are mapped. Trust in the hook system is fragile; do not contaminate.
- **Avoid:** Adding new anti-pattern codes without first observing the pattern at least 3 times across real skills. Heuristics tuned to one example overfit.
- **Avoid:** Writing fixtures that test multiple anti-patterns at once. One fixture, one anti-pattern.
