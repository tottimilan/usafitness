#!/usr/bin/env bash
# sync-skills.sh — sync .cursor/skills/ (canonical) → .claude/skills/ (mirror)
#
# MASTERMIND 2.0 uses .cursor/skills/ as the single source of truth for Agent Skills.
# This script mirrors them to .claude/skills/ so Claude Code / Claude Desktop can
# discover them when working in this repo.
#
# Usage:
#   bash scripts/sync-skills.sh          # normal sync
#   bash scripts/sync-skills.sh --check  # dry-run; exit 1 if drift detected
#
# Idempotent:
#   - Unchanged files (by SHA-256) are skipped.
#   - Changed files are overwritten.
#   - Orphan files in the mirror are deleted.
#   - README.md and .gitkeep in the mirror are protected.

set -euo pipefail

CHECK_MODE=0
if [[ "${1:-}" == "--check" ]]; then
  CHECK_MODE=1
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
SRC="$REPO_ROOT/.cursor/skills"
DST="$REPO_ROOT/.claude/skills"

if [[ ! -d "$SRC" ]]; then
  echo "ERROR: source not found: $SRC" >&2
  exit 2
fi
if [[ ! -d "$DST" ]]; then
  echo "ERROR: destination not found: $DST" >&2
  exit 2
fi

# Pick a sha256 tool available on the platform
if command -v sha256sum >/dev/null 2>&1; then
  _hash() { sha256sum "$1" | awk '{print $1}'; }
elif command -v shasum >/dev/null 2>&1; then
  _hash() { shasum -a 256 "$1" | awk '{print $1}'; }
else
  echo "ERROR: need sha256sum or shasum in PATH" >&2
  exit 2
fi

is_protected() {
  local name
  name="$(basename "$1")"
  [[ "$name" == "README.md" || "$name" == ".gitkeep" ]]
}

# Collect source files (relative paths)
mapfile -t SRC_FILES < <(cd "$SRC" && find . -type f | sed 's|^\./||' | sort)
mapfile -t DST_FILES < <(cd "$DST" && find . -type f | sed 's|^\./||' | sort)

TO_COPY=()
TO_UPDATE=()
TO_DELETE=()
UNCHANGED=0

for rel in "${SRC_FILES[@]}"; do
  [[ -z "$rel" ]] && continue
  if is_protected "$rel"; then continue; fi
  if [[ ! -f "$DST/$rel" ]]; then
    TO_COPY+=("$rel")
    continue
  fi
  src_h="$(_hash "$SRC/$rel")"
  dst_h="$(_hash "$DST/$rel")"
  if [[ "$src_h" != "$dst_h" ]]; then
    TO_UPDATE+=("$rel")
  else
    UNCHANGED=$((UNCHANGED+1))
  fi
done

for rel in "${DST_FILES[@]}"; do
  [[ -z "$rel" ]] && continue
  if is_protected "$rel"; then continue; fi
  if [[ ! -f "$SRC/$rel" ]]; then
    TO_DELETE+=("$rel")
  fi
done

TOTAL=$(( ${#TO_COPY[@]} + ${#TO_UPDATE[@]} + ${#TO_DELETE[@]} ))

echo ""
echo "=== sync-skills ==="
echo "Source:      $SRC"
echo "Destination: $DST"
echo ""

if [[ ${#TO_COPY[@]} -gt 0 ]]; then
  echo "NEW (${#TO_COPY[@]}):"
  for f in "${TO_COPY[@]}"; do echo "  + $f"; done
fi
if [[ ${#TO_UPDATE[@]} -gt 0 ]]; then
  echo "CHANGED (${#TO_UPDATE[@]}):"
  for f in "${TO_UPDATE[@]}"; do echo "  ~ $f"; done
fi
if [[ ${#TO_DELETE[@]} -gt 0 ]]; then
  echo "ORPHANS to remove (${#TO_DELETE[@]}):"
  for f in "${TO_DELETE[@]}"; do echo "  - $f"; done
fi

echo ""
echo "Unchanged: $UNCHANGED"
echo "Total pending changes: $TOTAL"

if [[ $CHECK_MODE -eq 1 ]]; then
  if [[ $TOTAL -gt 0 ]]; then
    echo ""
    echo "DRIFT detected. Run 'bash scripts/sync-skills.sh' to sync."
    exit 1
  fi
  echo ""
  echo "OK: .claude/skills/ is in sync with .cursor/skills/."
  exit 0
fi

if [[ $TOTAL -eq 0 ]]; then
  echo ""
  echo "OK: everything already in sync. Nothing to do."
  exit 0
fi

# Apply changes
for rel in "${TO_COPY[@]}" "${TO_UPDATE[@]}"; do
  mkdir -p "$(dirname "$DST/$rel")"
  cp -f "$SRC/$rel" "$DST/$rel"
done

for rel in "${TO_DELETE[@]}"; do
  rm -f "$DST/$rel"
  dir="$(dirname "$DST/$rel")"
  if [[ -d "$dir" && -z "$(ls -A "$dir")" ]]; then
    rmdir "$dir"
  fi
done

echo ""
echo "DONE: synced $TOTAL file(s)."
exit 0
