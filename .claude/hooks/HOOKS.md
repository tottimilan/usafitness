# Claude Desktop Hooks

> **Extension point — Claude Desktop side.** This folder mirrors `.cursor/hooks/` for Claude Desktop events.
> Keep both sides consistent. The **canonical documentation** lives at [`.cursor/hooks/HOOKS.md`](../../.cursor/hooks/HOOKS.md); this file exists so Claude Desktop can discover its own hooks without cross-referencing.

---

## Scope

Hooks placed here run in response to Claude Desktop events (session start/end, MCP tool calls, user turns, etc.). For Cursor-specific hooks, use `.cursor/hooks/`. For git or CI hooks, use their native locations.

---

## Rules

All rules from [`.cursor/hooks/HOOKS.md`](../../.cursor/hooks/HOOKS.md) apply:

1. Introduce a hook only when the action has repeated ≥ 3 times, is deterministic, and cannot silently corrupt state.
2. Every hook has a kill switch.
3. Every hook is reviewed with `code-reviewer` (and `security-review` if sensitive) before first live run.
4. Every hook is logged in `memory/07-decisions-log.md`.
5. Never duplicate a hook between `.cursor/hooks/` and `.claude/hooks/` — pick the canonical side.

---

## Naming

Follow the same pattern as `.cursor/hooks/`: `<event>.<tool>.<ext>`.

## Currently active hooks (canonical copies live in .cursor/hooks/)

These are **agent-level behavioral hooks** — instruction files that MASTERMIND-aware agents read at the relevant lifecycle event. Same files in both places would cause drift; the canonical versions live in `.cursor/hooks/`. Claude Code / Claude Desktop should load them from there.

| Hook | Event | Purpose | File |
|---|---|---|---|
| `pre-task.doubt-surfacer` | Before a non-trivial user turn | Force the Question Protocol when keywords / phase / scope warrant it | [`../../.cursor/hooks/pre-task.doubt-surfacer.md`](../../.cursor/hooks/pre-task.doubt-surfacer.md) |
| `post-task.memory-updater` | After non-trivial task completion | Ensure memory-updater ran before closing the turn | [`../../.cursor/hooks/post-task.memory-updater.md`](../../.cursor/hooks/post-task.memory-updater.md) |
| `post-merge.docs-refresh` | After a merge to main | Propose refreshing docs that the merge made stale | [`../../.cursor/hooks/post-merge.docs-refresh.md`](../../.cursor/hooks/post-merge.docs-refresh.md) |
| `post-output.suggest-command` | End of any non-trivial turn | Emit a HIGH / MEDIUM / LOW recommendation for the next `/mm-*` command | [`../../.cursor/hooks/post-output.suggest-command.md`](../../.cursor/hooks/post-output.suggest-command.md) |

**Git client-side hooks** (pre-commit, pre-push) are a different class — they are shell scripts installed into `.git/hooks/`. Their canonical source is `scripts/git-hooks/`. Install with `scripts/install-git-hooks.ps1` (or `.sh`). See `scripts/git-hooks/README.md`.
