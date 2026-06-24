# Cursor Hooks

> Mixed folder: **agent-level behavioral hooks** (markdown instruction files loaded by MASTERMIND-aware agents) + reference docs for **git client-side hooks** (shell scripts installed from `scripts/git-hooks/` into `.git/hooks/`). Only add new hooks when a recurring action has been validated by use. Premature hooks are as harmful as premature abstraction.

---

## What a hook is

A **hook** is an automation that fires on a defined event — before a task, after a commit, on merge, on test failure. Cursor supports hook events; the exact invocation depends on the editor version (consult current Cursor docs before authoring).

This folder is the Cursor-side home for hooks. The Claude Desktop mirror lives at `.claude/hooks/`.

---

## Currently active hooks in this repo

| Hook | Event | File |
|---|---|---|
| **Pre-task — doubt-surfacer** | Before non-trivial user turns | [`pre-task.doubt-surfacer.md`](pre-task.doubt-surfacer.md) |
| **Post-task — memory-updater** | After task completion | [`post-task.memory-updater.md`](post-task.memory-updater.md) |
| **Post-merge — docs-refresh** | After merge to `main` | [`post-merge.docs-refresh.md`](post-merge.docs-refresh.md) |
| **Post-output — suggest-command** | End of any non-trivial turn | [`post-output.suggest-command.md`](post-output.suggest-command.md) |

Git client-side hooks (pre-commit, pre-push) live separately under `scripts/git-hooks/`. Install with `pwsh -File scripts/install-git-hooks.ps1` (or `.sh`).

## Reference: other common use cases

- **Post-test-failure (CI)** — auto-invoke `bug-investigator` with the failing test as input. Typically wired in a CI YAML, not here.
- **Pre-deploy** — block if `memory/09-testing-status.md` has unresolved Critical gaps. Best wired in the deploy pipeline.

---

## When to add a hook

Introduce a hook **only** when all three hold:

1. The action has been performed manually at least 3 times in a row.
2. The action is deterministic — same input produces the same output.
3. A hook failure cannot silently corrupt state; if it fails, the worst outcome is a blocked operation, not lost data.

If any of the three is uncertain, leave the action manual until you have more evidence.

---

## File naming convention

```
<event>.<tool>.<ext>
```

Examples:

- `pre-task.cursor.md` — instructions the agent reads before a task.
- `post-merge.github-actions.yml` — CI workflow that runs on merge.
- `pre-commit.husky.sh` — client-side git hook managed by Husky.

---

## Where hooks live

| Scope | Location |
|---|---|
| Cursor agent events | `.cursor/hooks/` (this folder) |
| Claude Desktop events | `.claude/hooks/` |
| Git client-side hooks | managed by Husky / lefthook / pre-commit (config at repo root) |
| CI events | `.github/workflows/` or equivalent |

Avoid duplicating the same hook in two places. Pick the canonical location and reference from the others.

---

## Change control

Every new hook must:

1. Be added with a dedicated decision entry in `memory/07-decisions-log.md` explaining the recurring action it automates.
2. Include an explicit **kill switch** — either an environment variable (`MASTERMIND_HOOK_<name>_ENABLED=false`) or a feature flag.
3. Be reviewed with the `code-reviewer` skill before its first live run.
4. Be reviewed with the `security-review` skill if the hook touches auth, secrets, deploys, or destructive operations.

---

## Anti-patterns

- **Avoid:** Populating this folder on day one of a project. You do not yet know what repeats.
- **Avoid:** Hooks without kill switches. A silent misbehaving hook is the worst kind of bug.
- **Avoid:** Hooks that silently modify memory or code without logging. Every hook run must leave a trace (log line, commit, status update).
- **Avoid:** One mega-hook that does five things. Split per event and per responsibility.
- **Avoid:** Skipping the `code-reviewer` pass on a new hook because "it's small". Hooks run automatically — a small mistake runs N times.
