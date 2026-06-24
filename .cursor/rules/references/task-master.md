# `task-master-ai` activation contract

> Referenced on demand by `.cursor/rules/05-claude-mcp-integration.mdc`. Only relevant once you decide to activate task-master-ai in a project.

- **`task-master-ai` (eyaltoledano/claude-task-master)** — AI-driven task management MCP. Parses a PRD (e.g. `memory/00-project-brief.md` + `docs/product/`) into dependency-aware tasks, then drives the execution loop (`next_task`, `get_task`, `set_task_status`, `expand_task`, `update_subtask`, `parse_prd`).

**When to activate it in a project** (not one-time; per-project):
1. The project is leaving Definition and entering **MVP execution**.
2. The approved `implementation-planner` plan has **≥ 10 tasks** (or the plan explicitly declares fan-out to many slices).
3. `subagent-dispatcher` is about to take over plan execution and benefits from dependency-aware task state management.

Before those three conditions: not worth the extra ~5–21k tokens and extra moving part. Plan Mode + `subagent-dispatcher` walking the plan file directly is enough.

**How to install it for a project** (installer script handles everything):

```powershell
pwsh -File scripts/install-taskmaster.ps1                   # mode=core (7 tools, ~5k tokens)
pwsh -File scripts/install-taskmaster.ps1 -Mode standard    # 15 tools, ~10k tokens
pwsh -File scripts/install-taskmaster.ps1 -ClaudeCodeAuth   # no API key, uses Claude Code OAuth
```

```bash
bash scripts/install-taskmaster.sh
bash scripts/install-taskmaster.sh --mode standard
bash scripts/install-taskmaster.sh --claude-code-auth
```

The installer:
- Adds the `task-master-ai` entry to `.cursor/mcp.json` (idempotent — leaves existing entries alone).
- Creates `.taskmaster/docs/prd.md` with a template PRD if none exists.
- Appends `.taskmaster/runtime/` to `.gitignore`.
- Prints exact next-step commands.

**Integration contract with other skills:**
- `implementation-planner` emits a PRD-shaped document compatible with `parse-prd`.
- `subagent-dispatcher` uses `next_task` / `set_task_status` when task-master is active; otherwise walks the plan file.
- `feature-breakdown` slices can be parsed with `--append` to add tasks to an existing tasks.json.

**Tool loading modes:**
| Mode | Tools | Context cost | When |
|---|---|---|---|
| `core` | 7 | ~5k tokens | **Default**. Day-to-day dispatch loop. |
| `standard` | 15 | ~10k tokens | Complex projects that benefit from expansion/analysis tools. |
| `all` | 36 | ~21k tokens | Rare. Only when research and tags are used heavily. |

**Scope of `.taskmaster/` folder:** lives alongside `memory/` and `docs/`, not inside them. PRD and `tasks.json` are committed. `runtime/` and caches are gitignored.
