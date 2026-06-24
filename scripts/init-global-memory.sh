#!/usr/bin/env bash
# init-global-memory.sh — bootstrap the cross-project global memory at ~/.mastermind/global/.
#
# Idempotently creates lessons.md, patterns.md, pitfalls.md, stacks.md, vendors.md, README.md
# (consumed by the continuous-learner skill / rule 05) and git-inits the folder if needed.
# Running twice is safe (never clobbers existing files).
#
# Usage:
#   bash scripts/init-global-memory.sh [--path <dir>] [--no-git]

set -euo pipefail

TARGET="${HOME}/.mastermind/global"
NO_GIT=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --path) TARGET="${2:-}"; shift 2 ;;
    --no-git) NO_GIT=1; shift ;;
    -h|--help) sed -n '2,11p' "$0"; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 2 ;;
  esac
done

CREATED=()
if [[ ! -d "$TARGET" ]]; then
  mkdir -p "$TARGET"
  CREATED+=("$TARGET")
fi

write_if_absent() {
  local file="$TARGET/$1"
  local body="$2"
  if [[ ! -f "$file" ]]; then
    printf '%s' "$body" > "$file"
    CREATED+=("$file")
  fi
}

write_if_absent "lessons.md"  $'# Lessons (cross-project)\n\n> What worked or failed, with evidence and context. Project-agnostic, evidence-backed, actionable.\n'
write_if_absent "patterns.md" $'# Patterns (cross-project)\n\n> Reusable architectural / product / workflow patterns.\n'
write_if_absent "pitfalls.md" $'# Pitfalls (cross-project)\n\n> Anti-patterns observed repeatedly across projects.\n'
write_if_absent "stacks.md"   $'# Stacks (cross-project)\n\n> Stack choices taken across projects, with outcomes.\n'
write_if_absent "vendors.md"  $'# Vendors (cross-project)\n\n> Third-party providers used, with verdicts.\n'
write_if_absent "README.md"   $'# MASTERMIND — Cross-project global memory\n\n> Plain-Markdown source of truth, consulted by multiple projects. Never store secrets, client names, PII, or payment data here. Use neutral references.\n\nManaged by the `continuous-learner` skill (`/mm-learn`). See rule 05 §Cross-project Memory Protocol.\n'

if [[ "$NO_GIT" -eq 0 && ! -d "$TARGET/.git" ]]; then
  if command -v git >/dev/null 2>&1; then
    ( cd "$TARGET" && git init --quiet )
    CREATED+=("$TARGET/.git (git repo)")
  else
    echo "git not found on PATH; skipped 'git init'." >&2
  fi
fi

echo "Global memory ready at: $TARGET"
if [[ ${#CREATED[@]} -eq 0 ]]; then
  echo "Nothing to do — everything already present (idempotent)."
else
  echo "Created:"
  for c in "${CREATED[@]}"; do echo "  + $c"; done
fi
exit 0
