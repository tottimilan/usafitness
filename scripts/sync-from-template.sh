#!/usr/bin/env bash
# sync-from-template.sh — safely sync template files (skills, rules, workflows,
# commands, hooks, scripts, root docs) from a MASTERMIND 2.0 template into the
# CURRENT project, without touching project-specific content (memory/, docs/,
# .cursor/plans/, .taskmaster/, .env*, .git/).
#
# Defaults to DRY-RUN. Pass --apply to actually write, with automatic backups
# grouped in .mastermind-backups/sync-YYYYMMDD-HHMMSS/ (relative paths preserved).
# The backup folder is auto-added to .gitignore so it never pollutes commits.
#
# Usage:
#   bash scripts/sync-from-template.sh --template /path/to/mastermind-template
#   bash scripts/sync-from-template.sh --template /path/to/tpl --apply
#   bash scripts/sync-from-template.sh --template /path/to/tpl --apply --force
#   bash scripts/sync-from-template.sh --template /path/to/tpl --apply --include-mcp-config
#   bash scripts/sync-from-template.sh --template /path/to/tpl --apply --include-new-memory-files
#     (create memory/*.md skeletons that exist in template but not here; existing ones still protected)
#
# Exit codes:
#   0  OK (dry-run: in sync; apply: success)
#   1  drift detected in dry-run, or user aborted, or drift remains after apply
#   2  bad arguments, template not found, running inside template, or missing deps

set -euo pipefail

TEMPLATE=""
APPLY=0
FORCE=0
INCLUDE_MCP=0
INCLUDE_NEW_MEMORY=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --template)                 TEMPLATE="${2:-}"; shift 2 ;;
    --apply)                    APPLY=1; shift ;;
    --force)                    FORCE=1; shift ;;
    --include-mcp-config)       INCLUDE_MCP=1; shift ;;
    --include-new-memory-files) INCLUDE_NEW_MEMORY=1; shift ;;
    -h|--help)
      sed -n '2,17p' "$0"
      exit 0
      ;;
    *) echo "Unknown arg: $1" >&2; exit 2 ;;
  esac
done

if [[ -z "$TEMPLATE" ]]; then
  echo "ERROR: --template <path> is required." >&2
  exit 2
fi
if [[ ! -d "$TEMPLATE" ]]; then
  echo "ERROR: template path not found: $TEMPLATE" >&2
  exit 2
fi

# Resolve absolute paths
TEMPLATE_ROOT="$( cd "$TEMPLATE" && pwd )"
PROJECT_ROOT="$( pwd )"

if [[ "$TEMPLATE_ROOT" == "$PROJECT_ROOT" ]]; then
  echo "ERROR: current directory IS the template. Run this from the target project." >&2
  exit 2
fi

if [[ ! -f "$TEMPLATE_ROOT/CLAUDE.md" ]]; then
  echo "ERROR: template does not contain CLAUDE.md. Is --template pointing at a MASTERMIND 2.0 repo?" >&2
  exit 2
fi

if ! grep -q 'MASTERMIND' "$TEMPLATE_ROOT/CLAUDE.md"; then
  echo "WARN: template's CLAUDE.md does not mention MASTERMIND. Continuing."
fi

# Pick a sha256 tool
if command -v sha256sum >/dev/null 2>&1; then
  _hash() { sha256sum "$1" | awk '{print $1}'; }
elif command -v shasum >/dev/null 2>&1; then
  _hash() { shasum -a 256 "$1" | awk '{print $1}'; }
else
  echo "ERROR: need sha256sum or shasum in PATH." >&2
  exit 2
fi

echo ""
echo "=== sync-from-template ==="
echo "Template:  $TEMPLATE_ROOT"
echo "Project:   $PROJECT_ROOT"
if [[ $APPLY -eq 1 ]]; then
  echo "Mode:      APPLY (will write + backup)"
else
  echo "Mode:      DRY-RUN (read-only)"
fi
[[ $APPLY -eq 1 && $FORCE -eq 1 ]] && echo "Force:     yes (no confirmation prompt)"
[[ $INCLUDE_MCP -eq 1 ]] && echo "MCP cfg:   INCLUDED in sync"
[[ $INCLUDE_NEW_MEMORY -eq 1 ]] && echo "Memory:    new skeletons will be CREATED if missing (existing files still protected)"
echo ""

# Build whitelist of files relative to TEMPLATE_ROOT
collect_whitelist() {
  (
    cd "$TEMPLATE_ROOT"
    # Root docs
    for f in CLAUDE.md AGENTS.md README.md OPERATING-GUIDE.md COMMANDS.md .gitignore .env.example phase-criteria.json; do
      [[ -f "$f" ]] && echo "$f"
    done
    # Rules (.mdc) + on-demand references they point to
    find .cursor/rules -maxdepth 1 -type f -name '*.mdc' 2>/dev/null
    find .cursor/rules/references -type f -name '*.md' 2>/dev/null
    # Skills canonical
    find .cursor/skills -type f 2>/dev/null
    # Hooks cursor (only md)
    find .cursor/hooks -maxdepth 1 -type f -name '*.md' 2>/dev/null
    # Claude side
    [[ -f ".claude/CLAUDE.md" ]] && echo ".claude/CLAUDE.md"
    find .claude/skills -type f 2>/dev/null
    find .claude/hooks -maxdepth 1 -type f -name '*.md' 2>/dev/null
    find .claude/workflows -type f 2>/dev/null
    find .claude/commands -type f 2>/dev/null
    # Scripts
    find scripts -maxdepth 1 -type f \( -name '*.ps1' -o -name '*.sh' \) 2>/dev/null
    # Git hooks
    for f in scripts/git-hooks/pre-commit scripts/git-hooks/pre-push scripts/git-hooks/README.md; do
      [[ -f "$f" ]] && echo "$f"
    done
    # MCP config (optional)
    if [[ $INCLUDE_MCP -eq 1 && -f "claude-side/mcp-config.json" ]]; then
      echo "claude-side/mcp-config.json"
    fi
    # memory/*.md (opt-in; skip-if-exists is enforced in the main diff below)
    if [[ $INCLUDE_NEW_MEMORY -eq 1 ]]; then
      find memory -maxdepth 1 -type f -name '*.md' 2>/dev/null
    fi
  ) | sed 's|^\./||' | sort -u
}

# Blacklist check. The --include-new-memory-files exception is enforced in
# the main loop (below): memory/*.md bypasses this check during opt-in, and
# the main loop then decides create-if-missing / skip-if-exists.
is_blacklisted() {
  local p="$1"
  case "$p" in
    memory/*|docs/*|.cursor/plans/*|.taskmaster/*|.git/*|node_modules/*|dist/*|.next/*|claude-side/prompts/*)
      return 0 ;;
  esac
  # .env but not .env.example or .env.sample
  local base
  base="$(basename "$p")"
  case "$base" in
    .env|.env.local) return 0 ;;
    .env.example|.env.sample) return 1 ;;
    .env.*) return 0 ;;
  esac
  # mcp config unless --include-mcp-config
  if [[ $INCLUDE_MCP -eq 0 && "$p" == "claude-side/mcp-config.json" ]]; then
    return 0
  fi
  return 1
}

mapfile -t WHITELIST < <(collect_whitelist)

if [[ ${#WHITELIST[@]} -eq 0 ]]; then
  echo "ERROR: no files matched the whitelist in the template. Is --template correct?" >&2
  exit 2
fi

TO_CREATE=()
TO_UPDATE=()
UNCHANGED=0
PROTECTED=()

for rel in "${WHITELIST[@]}"; do
  [[ -z "$rel" ]] && continue
  is_memory_opt_in=0
  if [[ $INCLUDE_NEW_MEMORY -eq 1 && "$rel" =~ ^memory/[^/]+\.md$ ]]; then
    is_memory_opt_in=1
  fi
  # Blacklist check — except memory/*.md passes through when -IncludeNewMemoryFiles is on;
  # create-only / skip-if-exists is enforced right below.
  if [[ $is_memory_opt_in -eq 0 ]] && is_blacklisted "$rel"; then
    PROTECTED+=("$rel")
    continue
  fi
  src="$TEMPLATE_ROOT/$rel"
  dst="$PROJECT_ROOT/$rel"
  if [[ ! -f "$dst" ]]; then
    TO_CREATE+=("$rel")
  else
    if [[ $is_memory_opt_in -eq 1 ]]; then
      # Existing memory file: protected even with -IncludeNewMemoryFiles. Only new skeletons get created.
      PROTECTED+=("$rel")
      continue
    fi
    s="$(_hash "$src")"
    d="$(_hash "$dst")"
    if [[ "$s" == "$d" ]]; then
      UNCHANGED=$((UNCHANGED+1))
    else
      TO_UPDATE+=("$rel")
    fi
  fi
done

echo "Whitelisted in template: ${#WHITELIST[@]} file(s)"
echo ""

if [[ ${#TO_CREATE[@]} -gt 0 ]]; then
  echo "NEW (${#TO_CREATE[@]}):"
  for f in "${TO_CREATE[@]}"; do echo "  + $f"; done
  echo ""
fi
if [[ ${#TO_UPDATE[@]} -gt 0 ]]; then
  echo "CHANGED (${#TO_UPDATE[@]}):"
  for f in "${TO_UPDATE[@]}"; do echo "  ~ $f"; done
  echo ""
fi
if [[ ${#PROTECTED[@]} -gt 0 ]]; then
  echo "PROTECTED (${#PROTECTED[@]}):"
  for f in "${PROTECTED[@]}"; do echo "  p $f"; done
  echo ""
fi
echo "Unchanged: $UNCHANGED"

TOTAL=$(( ${#TO_CREATE[@]} + ${#TO_UPDATE[@]} ))

if [[ $TOTAL -eq 0 ]]; then
  echo ""
  echo "OK: project is already in sync with the template. Nothing to do."
  exit 0
fi

if [[ $APPLY -eq 0 ]]; then
  echo ""
  echo "DRIFT DETECTED ($TOTAL files would change). Re-run with --apply to sync."
  echo "Reminder: before applying, close Cursor/Claude on this project and commit/push pending changes."
  exit 1
fi

if [[ $FORCE -eq 0 ]]; then
  echo ""
  read -r -p "Apply $TOTAL change(s) with automatic backups? (type 'yes' to proceed) " CONFIRM
  if [[ "$CONFIRM" != "yes" ]]; then
    echo "Aborted by user."
    exit 1
  fi
fi

TS="$(date +%Y%m%d-%H%M%S)"
BACKED_UP=0
CREATED=0
UPDATED=0

# Grouped backup folder (single location, preserves relative paths inside).
BACKUP_ROOT="$PROJECT_ROOT/.mastermind-backups/sync-$TS"

# Ensure .mastermind-backups/ is in .gitignore (idempotent).
GITIGNORE="$PROJECT_ROOT/.gitignore"
if [[ -f "$GITIGNORE" ]]; then
  if ! grep -qxE '\.mastermind-backups/?' "$GITIGNORE"; then
    printf '\n# --- Backups created by scripts/sync-from-template; safe to delete after review. ---\n.mastermind-backups/\n' >> "$GITIGNORE"
    echo "  Added '.mastermind-backups/' to .gitignore."
  fi
else
  printf '# --- Backups created by scripts/sync-from-template; safe to delete after review. ---\n.mastermind-backups/\n' > "$GITIGNORE"
  echo "  Created .gitignore with '.mastermind-backups/'."
fi

apply_one() {
  local rel="$1"
  local src="$TEMPLATE_ROOT/$rel"
  local dst="$PROJECT_ROOT/$rel"
  mkdir -p "$(dirname "$dst")"
  if [[ -f "$dst" ]]; then
    local backup="$BACKUP_ROOT/$rel"
    mkdir -p "$(dirname "$backup")"
    cp -f "$dst" "$backup"
    BACKED_UP=$((BACKED_UP+1))
  fi
  cp -f "$src" "$dst"
}

for rel in "${TO_CREATE[@]}"; do apply_one "$rel"; CREATED=$((CREATED+1)); done
for rel in "${TO_UPDATE[@]}"; do apply_one "$rel"; UPDATED=$((UPDATED+1)); done

echo ""
echo "DONE"
echo "  Created: $CREATED"
echo "  Updated: $UPDATED"
if [[ $BACKED_UP -gt 0 ]]; then
  echo "  Backups: $BACKED_UP files in .mastermind-backups/sync-$TS/"
else
  echo "  Backups: 0 (no files were overwritten)"
fi
echo ""
echo "NEXT STEPS:"
echo "  1. Run: git diff   (review the real changes; .mastermind-backups/ is gitignored)"
echo "  2. If something looks wrong, restore from .mastermind-backups/sync-$TS/<same-relative-path>."
echo "     Example: cp .mastermind-backups/sync-$TS/CLAUDE.md CLAUDE.md"
echo "  3. Commit: git add . && git commit -m 'chore: sync from MASTERMIND template'"
echo "  4. Reload Cursor window or reopen."
echo "  5. Restart Claude Desktop / Claude Code fully."
echo "  6. Sanity check: ask 'List the active hooks in this repo' -> expect the latest set."
echo "  7. If phase-criteria.json is new here, your memory/13-phase-history.md (protected) may"
echo "     predate the generated markers. Wrap its '## Phase definitions' table with"
echo "     '<!-- BEGIN generated:phase-definitions ... -->' / '<!-- END ... -->' (keep your"
echo "     transitions history), then run: bash scripts/render-phase-criteria.sh"
echo "  8. Run: bash scripts/template-audit.sh   (expect PASS)."
echo ""
echo "When confident, clean up this session's backups:"
echo "  rm -rf .mastermind-backups/sync-$TS"
echo "Or wipe all old backup sessions at once:"
echo "  rm -rf .mastermind-backups"
