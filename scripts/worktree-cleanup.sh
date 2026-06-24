#!/usr/bin/env bash
# worktree-cleanup.sh — clean up worktrees spawned by worktree-spawn.sh.
#
# Modes:
#   (no args)      sweep: remove worktrees whose branch is fully merged to origin/main
#   --slug <name>  remove a single worktree (blocks on uncommitted unless --force)
#   --all          remove ALL spawned worktrees (not the main repo)
#   --force        ignore uncommitted changes
#   --dry-run      report only
#
# See .cursor/rules/07-subagent-orchestration.mdc.

set -euo pipefail

SLUG=""
ALL=0
FORCE=0
DRY=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --slug)    SLUG="$2"; shift 2 ;;
    --all)     ALL=1; shift ;;
    --force)   FORCE=1; shift ;;
    --dry-run) DRY=1; shift ;;
    -h|--help) sed -n '2,13p' "$0"; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 2 ;;
  esac
done

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
REPO_NAME="$( basename "$REPO_ROOT" )"
WORKTREES_ROOT="$( dirname "$REPO_ROOT" )/${REPO_NAME}-worktrees"

cd "$REPO_ROOT"
git fetch --quiet origin main || true

echo ""
echo "=== worktree-cleanup ==="
echo "Repo:           $REPO_ROOT"
echo "Worktrees root: $WORKTREES_ROOT"
if [[ -n "$SLUG" ]]; then
  echo "Mode: single ($SLUG)"
elif [[ $ALL -eq 1 ]]; then
  echo "Mode: all"
else
  echo "Mode: sweep merged"
fi
echo "DryRun=$DRY  Force=$FORCE"
echo ""

# Parse worktrees
mapfile -t WT_PATHS < <(git worktree list --porcelain | awk '/^worktree /{print $2}')
# skip the main one
MAIN_PATH=$(git rev-parse --show-toplevel)

is_branch_merged() {
  local branch="$1"
  [[ -z "$branch" ]] && return 1
  git merge-base --is-ancestor "$branch" origin/main >/dev/null 2>&1
}

has_uncommitted() {
  local p="$1"
  [[ -n "$(git -C "$p" status --porcelain 2>/dev/null)" ]]
}

branch_of() {
  git -C "$1" rev-parse --abbrev-ref HEAD 2>/dev/null || echo ""
}

remove_one() {
  local p="$1" b
  b="$(branch_of "$p")"
  if [[ $DRY -eq 1 ]]; then
    echo "[dry-run] would remove: $p  (branch $b)"
    return 0
  fi
  if [[ $FORCE -eq 0 ]] && has_uncommitted "$p"; then
    echo "SKIP (uncommitted changes): $p  (use --force to override)"
    return 0
  fi
  if [[ $FORCE -eq 1 ]]; then
    git worktree remove --force "$p"
  else
    git worktree remove "$p"
  fi
  [[ -n "$b" && "$b" != "HEAD" ]] && git branch -D "$b" >/dev/null 2>&1 || true
  echo "Removed: $p  (branch $b)"
}

count_removed=0
for p in "${WT_PATHS[@]}"; do
  [[ "$p" == "$MAIN_PATH" ]] && continue
  if [[ -n "$SLUG" ]]; then
    if [[ "$(basename "$p")" == "$SLUG" ]]; then
      remove_one "$p" && count_removed=$((count_removed+1))
    fi
  elif [[ $ALL -eq 1 ]]; then
    remove_one "$p" && count_removed=$((count_removed+1))
  else
    b="$(branch_of "$p")"
    if is_branch_merged "$b"; then
      remove_one "$p" && count_removed=$((count_removed+1))
    else
      echo "kept (unmerged): $p  [$b]"
    fi
  fi
done

echo ""
echo "Removed $count_removed worktree(s)."

git worktree prune -v || true

echo ""
echo "Remaining worktrees:"
git worktree list
