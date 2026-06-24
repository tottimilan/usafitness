#!/usr/bin/env bash
# install-taskmaster.sh - add task-master-ai MCP server to .cursor/mcp.json
# and scaffold .taskmaster/. See .cursor/rules/05-claude-mcp-integration.mdc.
#
# Usage:
#   bash scripts/install-taskmaster.sh                        # mode=core, uses ANTHROPIC_API_KEY env
#   bash scripts/install-taskmaster.sh --mode standard
#   bash scripts/install-taskmaster.sh --claude-code-auth     # no API key (OAuth via Claude Code CLI)
#
# Requires: jq (for safe JSON editing). Install with: apt-get install jq / brew install jq

set -euo pipefail

MODE="core"
CLAUDE_CODE_AUTH=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)              MODE="${2:-core}"; shift 2 ;;
    --claude-code-auth)  CLAUDE_CODE_AUTH=1; shift ;;
    -h|--help)           sed -n '2,15p' "$0"; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 2 ;;
  esac
done

case "$MODE" in
  core|standard|all) ;;
  *) echo "ERROR: --mode must be core | standard | all" >&2; exit 2 ;;
esac

if ! command -v jq >/dev/null 2>&1; then
  echo "ERROR: jq is required. Install it:" >&2
  echo "  macOS:  brew install jq" >&2
  echo "  Ubuntu: sudo apt-get install jq" >&2
  exit 2
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
MCP="$REPO_ROOT/.cursor/mcp.json"
TM_DIR="$REPO_ROOT/.taskmaster"
PRD_DIR="$TM_DIR/docs"
PRD="$PRD_DIR/prd.md"

echo ""
echo "=== install-taskmaster ==="
echo "Repo:            $REPO_ROOT"
echo "Target mcp.json: $MCP"
echo "Mode:            $MODE"
if [[ $CLAUDE_CODE_AUTH -eq 1 ]]; then
  echo "Auth:            Claude Code OAuth (no API key)"
else
  echo "Auth:            Env var ANTHROPIC_API_KEY"
fi
echo ""

if [[ ! -f "$MCP" ]]; then
  echo "ERROR: .cursor/mcp.json not found. Run this inside a MASTERMIND 2.0 project." >&2
  exit 1
fi

# 1. Inject the task-master-ai entry if missing
HAS_TM=$(jq -r '.mcpServers["task-master-ai"] // empty' "$MCP")
if [[ -n "$HAS_TM" ]]; then
  echo "task-master-ai already configured in .cursor/mcp.json. Leaving as-is."
else
  TMP="$(mktemp)"
  if [[ $CLAUDE_CODE_AUTH -eq 1 ]]; then
    jq --arg mode "$MODE" '
      .mcpServers["task-master-ai"] = {
        command: "npx",
        args: ["-y", "task-master-ai"],
        env: { TASK_MASTER_TOOLS: $mode }
      }
    ' "$MCP" > "$TMP"
  else
    jq --arg mode "$MODE" '
      .mcpServers["task-master-ai"] = {
        command: "npx",
        args: ["-y", "task-master-ai"],
        env: {
          TASK_MASTER_TOOLS: $mode,
          ANTHROPIC_API_KEY: "${env:ANTHROPIC_API_KEY}"
        }
      }
    ' "$MCP" > "$TMP"
  fi
  mv "$TMP" "$MCP"
  echo "Added task-master-ai to .cursor/mcp.json (mode=$MODE)."
fi

# 2. Scaffold .taskmaster/
mkdir -p "$PRD_DIR"
if [[ ! -f "$PRD" ]]; then
  cat > "$PRD" <<'EOF'
# PRD - [PROJECT NAME]

> This is the source of truth for `task-master-ai`. Running `task-master parse-prd`
> decomposes this file into dependency-aware tasks under `.taskmaster/tasks.json`.

## Product overview
- Name:
- Problem it solves:
- Primary user:
- Value proposition:

## Scope (MVP)
- [ ] Feature 1: ...
- [ ] Feature 2: ...
- [ ] Feature 3: ...

## Out of scope
- ...

## Success metrics
- North Star:
- Input metrics (one per feature):

## Constraints
- Stack: ... (see `.cursor/rules/02-tech-stack.mdc`)
- Non-negotiables: see `memory/00-project-brief.md`.
- Testing policy: see `.cursor/rules/03-testing-policy.mdc`.
- Safety and git: see `.cursor/rules/04-safety-and-git.mdc`.

## Dependencies and sequencing hints
- Feature 1 depends on nothing.
- Feature 2 depends on Feature 1 for shared types.
- Feature 3 is independent and can ship in parallel.
EOF
  echo "Wrote sample PRD at $PRD"
else
  echo "Existing PRD preserved at $PRD"
fi

# 3. gitignore hint
GI="$REPO_ROOT/.gitignore"
if [[ -f "$GI" ]] && ! grep -q '^\.taskmaster/runtime' "$GI"; then
  {
    echo ""
    echo "# task-master-ai runtime (keep PRD + tasks.json, ignore caches)"
    echo ".taskmaster/runtime/"
  } >> "$GI"
  echo "Appended .taskmaster/runtime/ to .gitignore"
fi

echo ""
echo "=== NEXT STEPS ==="
echo ""
if [[ $CLAUDE_CODE_AUTH -eq 1 ]]; then
  echo "1. Ensure Claude Code CLI is installed and authenticated."
else
  echo "1. Ensure ANTHROPIC_API_KEY is exported (or sits in .env.local)."
fi
echo "2. Restart Cursor so it picks up the new MCP entry."
echo "3. Fill in .taskmaster/docs/prd.md with the real project PRD."
echo "4. In Cursor chat (or Claude Code):"
echo "     'Initialize task-master in this project.'"
echo "     'Parse the PRD at .taskmaster/docs/prd.md.'"
echo "     'What is the next task I should work on?'"
echo ""
echo "See also: .cursor/rules/05-claude-mcp-integration.mdc"
echo ""
