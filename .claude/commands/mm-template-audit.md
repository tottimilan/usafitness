---
description: Meta-audit of the MASTERMIND template itself. Verifies the template tells the truth about itself — declared component counts match reality, phase criteria have a single source, the skill mirror is in sync, and every command/skill is documented (no invisible capabilities). The "cobbler's shoes" guard against doc↔reality drift.
---

# /mm-template-audit

Arguments: $ARGUMENTS (optional — pass `deep` to also compare every SKILL.md byte-for-byte against its mirror)

Run the template self-audit. This is the meta-loop that keeps the template from drifting away from its own documentation (the structural disease the 2.1 release set out to cure).

## What it does

Invoke the script and report its findings verbatim:

```powershell
pwsh -File scripts/template-audit.ps1          # or: -Deep, -Json, -Check
```

```bash
bash scripts/template-audit.sh                 # or: --deep, --json, --check
```

The script GENERATES a component manifest (real counts of rules / skills / workflows / commands / memory) and CHECKS:

1. **Counts** — the `### 15.x <Component> (N)` headers in `OPERATING-GUIDE.md` match the real counts.
2. **Phase criteria single-source** — the `memory/13 §Phase definitions` table is in sync with `phase-criteria.json` (run `scripts/render-phase-criteria` to fix).
3. **Skill ↔ mirror sync** — `.cursor/skills/` and `.claude/skills/` have the same skill set (run `scripts/sync-skills` to fix; `--deep` also compares content).
4. **Visibility** — every `/mm-*` command appears in `COMMANDS.md` and `OPERATING-GUIDE.md`, and every skill is mentioned in `OPERATING-GUIDE.md` (catches the `premortem`-style "real but undiscoverable" gap).

## When to use

- Before any release / version bump of the template.
- In CI (the script exits non-zero on any Critical finding — `--check`).
- After adding or removing a rule, skill, workflow, command, or memory file.
- Periodically, as part of `/mm-retro`, to catch drift early.

## Output contract

- On PASS: confirm the template is self-consistent and report the manifest.
- On findings: list each finding with its code and the concrete fix, then recommend the remediation command (`scripts/sync-skills`, `scripts/render-phase-criteria`, or a doc edit). Do NOT auto-fix without surfacing the findings first.
