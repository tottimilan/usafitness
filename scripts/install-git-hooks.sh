#!/usr/bin/env bash
# install-git-hooks.sh — install (or uninstall) MASTERMIND 2.0 git hooks.
#
# Usage:
#   bash scripts/install-git-hooks.sh             # install
#   bash scripts/install-git-hooks.sh --uninstall # remove, try to restore backup
#
# Idempotent: if the destination matches the source, nothing happens.
# Existing hooks are backed up as <hook>.backup-<timestamp> before overwrite.

set -euo pipefail

UNINSTALL=0
if [[ "${1:-}" == "--uninstall" ]]; then
  UNINSTALL=1
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
SRC_DIR="$REPO_ROOT/scripts/git-hooks"
DST_DIR="$REPO_ROOT/.git/hooks"

if [[ ! -d "$DST_DIR" ]]; then
  echo "ERROR: not a git repository (no .git/hooks). Run 'git init' first." >&2
  exit 1
fi
if [[ ! -d "$SRC_DIR" ]]; then
  echo "ERROR: canonical hooks folder $SRC_DIR is missing." >&2
  exit 1
fi

HOOKS=(pre-commit pre-push)
TS="$(date +%Y%m%d-%H%M%S)"

echo ""
echo "=== install-git-hooks ==="
echo "Source: $SRC_DIR"
echo "Target: $DST_DIR"
if [[ $UNINSTALL -eq 1 ]]; then
  echo "Mode:   UNINSTALL"
else
  echo "Mode:   INSTALL"
fi
echo ""

for h in "${HOOKS[@]}"; do
  src="$SRC_DIR/$h"
  dst="$DST_DIR/$h"

  if [[ $UNINSTALL -eq 1 ]]; then
    if [[ -f "$dst" ]]; then
      backup="$(ls -t "$DST_DIR/$h".backup-* 2>/dev/null | head -n1 || true)"
      rm -f "$dst"
      if [[ -n "$backup" && -f "$backup" ]]; then
        cp "$backup" "$dst"
        chmod +x "$dst"
        echo "Uninstalled $h (restored backup: $(basename "$backup"))"
      else
        echo "Uninstalled $h (no backup to restore)"
      fi
    else
      echo "$h not installed. Skipping."
    fi
    continue
  fi

  if [[ ! -f "$src" ]]; then
    echo "WARN: $src does not exist, skipping."
    continue
  fi

  if [[ -f "$dst" ]]; then
    if cmp -s "$src" "$dst"; then
      echo "$h is already up to date. Skipping."
      continue
    fi
    backup="$DST_DIR/$h.backup-$TS"
    cp "$dst" "$backup"
    echo "Backed up existing $h to $(basename "$backup")"
  fi

  cp "$src" "$dst"
  chmod +x "$dst"
  echo "Installed $h"
done

echo ""
echo "DONE"
echo ""
echo "Usage:"
echo "  Skip once:           git commit --no-verify"
echo "  Disable temporarily: MM_SKIP_PRECOMMIT=1 / MM_SKIP_PREPUSH=1 in your shell"
echo "  Allow main push:     MM_ALLOW_MAIN_PUSH=1 git push"
echo ""
echo "See scripts/git-hooks/README.md for full documentation."
