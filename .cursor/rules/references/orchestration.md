# Orchestration — operational detail (worktrees, Docker, observability)

> Referenced on demand by `.cursor/rules/07-subagent-orchestration.mdc`. Load when actually running parallel/worktree work or wiring observability. The rule keeps the principles; this file keeps the procedure.

## Parallel execution with Git worktrees

Parallelize **branches**, not the same branch. Git enforces this; do not fight it.

### Mandatory conventions

1. **Location.** All worktrees in a sibling folder of the repo, not inside it:
   ```
   ../<repo>-worktrees/<slug>
   ```
   Add the folder to the global `.gitignore` if it would ever end up inside the repo.

2. **Branch naming.** Feature-based, never agent-based:
   - `feat/<slug>` · `fix/<slug>` · `chore/<slug>` · `refactor/<slug>` · `exp/<slug>`
   - `agent-3-session-tuesday` is forbidden.

3. **Base commit.** All parallel worktrees created from the same `main` commit. Reduces merge conflicts.

4. **Lifecycle ≤ 1 working day.** If a worktree survives longer, the task was too big — split.

5. **Max 3–4 concurrent local worktrees.** Disk and laptop CPU cannot usually sustain more.

6. **Task assignment by domain, not by file type.** Do not dispatch "Agent-backend + Agent-frontend + Agent-tests" in parallel for the same feature — they all need to touch related code. Better: dispatch by feature slice (Agent-auth, Agent-billing, Agent-notifications), each delivering end-to-end.

7. **Cleanup discipline.**
   - Prefer `git worktree remove <path>` over `rm -rf`.
   - Always run `git worktree prune` after a `rm -rf`.
   - Delete merged branches: `git branch -D feat/<slug>`.
   - Use `scripts/worktree-cleanup.ps1` (or `.sh`) to automate.

### Helper scripts (in this repo)

- `scripts/worktree-spawn.ps1` / `.sh` — create a worktree with naming convention + install deps + assign port offset by hash of slug.
- `scripts/worktree-cleanup.ps1` / `.sh` — remove merged worktrees and prune metadata.

### Editor integrations to know

- **Cursor 3.x:** `/worktree <slug>` command. `/best-of-n` runs multiple models in parallel worktrees.
- **Claude Code:** `claude --worktree <name>` flag. Subagents can declare `isolation: worktree` in their frontmatter to auto-provision a worktree.

## Runtime isolation — Docker policy

Git worktrees isolate **code**. They do not isolate **runtime** (ports, databases, caches, `.env`, Docker daemons, browser profiles).

### When runtime isolation is NOT needed (default)

- Pure code work: refactors, docs, unit tests without side effects, library-only features.
- Single-agent sessions.
- Worktrees that do not spin up local services.

No Docker. Worktrees alone are sufficient.

### When runtime isolation IS needed

- Two agents would both bind to the same port (e.g. Next.js on `localhost:3000`).
- Agents run migrations against the same local DB.
- Agents spin up Redis, queues, S3 emulators.
- Agents need different `.env` values (different feature flags, different API keys).

### Recommended pattern (only when needed)

- **Per-worktree port offsets** via `scripts/worktree-spawn.ps1` (hash-derived).
- **Docker Compose project per worktree**: `docker compose -p <worktree-slug> up`. Networks, volumes, and service names namespaced automatically.
- **Per-worktree `.env.<slug>`** (kept local, never committed; `.gitignore` covers `.env.*`).

Do NOT introduce Docker by default. Introduce it only when the concrete runtime problem appears.

### Beyond laptop scale

When > 4 concurrent agents are needed, move to:
- **Cursor Cloud Agents** (self-hosted or Cursor-hosted).
- **Claude Code SDK** running in CI (ephemeral VMs, fresh state).

Document the shift in `memory/07-decisions-log.md`.

## Observability — implementation

Use the helper `scripts/log-dispatch.ps1` (or `.sh`), which appends one JSON line per dispatch to `.mastermind/runtime/dispatch-log.jsonl` (gitignored). It is **best-effort**: if logging fails, the dispatch still proceeds (observability degrades gracefully, never blocks work). `subagent-dispatcher` emits one record per task; `parallel-executor` one per worktree dispatch. Example:

```powershell
pwsh -File scripts/log-dispatch.ps1 -Dispatcher subagent-dispatcher -Role implementer `
     -Model <model> -OutputStatus DONE -WallTimeMs <ms> -TokenCostEstimate <n> -InputText "<prompt>"
```

```bash
bash scripts/log-dispatch.sh --dispatcher subagent-dispatcher --role implementer \
     --model <model> --status DONE --wall-ms <ms> --tokens <n> --input-text "<prompt>"
```

This `dispatch-log.jsonl` is the raw trace that the `eval-harness` skill (when present) reads for a lightweight trace→eval view. When Claude Agent SDK hooks (`PreToolUse`, `PostToolUse`) are available, wire them into `.cursor/hooks/` or `.claude/hooks/` to emit these logs automatically.
