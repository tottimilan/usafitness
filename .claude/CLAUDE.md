# CLAUDE.md — Claude Desktop view

This file is the Claude Desktop view of the kernel.
The **canonical** kernel lives at the repository root: [`../CLAUDE.md`](../CLAUDE.md).

When Claude Desktop reads this folder, it must:

1. Read `../CLAUDE.md` (the root kernel) as the source of truth.
2. Read the project memory at `../memory/` (the full memory bank is shared with Cursor).
3. Read `../AGENTS.md` for the non-Cursor agent contract.
4. Load any skills declared under `./skills/` (Claude-Desktop-only) **in addition to** those in `../.cursor/skills/`.
5. Load any agents declared under `./agents/` and any workflows under `./workflows/`.

## Why this mirror exists

Cursor reads from `.cursor/`. Claude Desktop reads from `.claude/`. The `memory/`, `docs/` and `CLAUDE.md` at the root are **shared** between both so the project has a single brain.

This file intentionally does **not** duplicate the kernel to avoid drift. If the root kernel changes, this file does not need to change.
