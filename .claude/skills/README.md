# .claude/skills/ — Mirror of .cursor/skills/

**Do not edit skills inside this folder directly.** They are generated from the canonical source at [`../../.cursor/skills/`](../../.cursor/skills/).

## Why this mirror exists

Cursor discovers project-scoped skills at `.cursor/skills/`. Claude Code / Claude Desktop discover project-scoped skills at `.claude/skills/`. Both follow the same [Agent Skills specification](https://agentskills.io/specification), so the file content is identical — only the path differs.

To avoid drift, we keep **one canonical source** (`.cursor/skills/`) and regenerate this mirror with a script.

## How to update skills

1. Edit the skill under `.cursor/skills/<skill-name>/SKILL.md`.
2. Run the sync script:
   - Windows / PowerShell: `pwsh -File scripts/sync-skills.ps1`
   - Unix / bash: `bash scripts/sync-skills.sh`
3. Commit both the source change and the mirror in the same commit.

## How to verify sync before committing

Dry-run mode reports drift without writing:

```powershell
pwsh -File scripts/sync-skills.ps1 -Check    # exits 1 if drifted, 0 if in sync
```

```bash
bash scripts/sync-skills.sh --check           # same, cross-platform
```

This is the command to wire into a pre-commit hook when you add one to `.cursor/hooks/`.

## What is protected (not overwritten, not deleted)

The sync script never touches:

- `README.md` (this file).
- `.gitkeep`.

Everything else in this folder is managed by the sync script.

## When Claude discovers these skills

- **Claude Code CLI** opens a repo and automatically lists skills under `.claude/skills/`.
- **Claude Desktop** (recent versions, with project-scoped skills enabled) discovers them the same way.
- **Claude.ai / web** — upload skills manually or install as plugins; this mirror does not auto-sync to the web product.

For the full list of skills and their interactions, see [`../../README.md`](../../README.md) §Skill Interaction Graph.
