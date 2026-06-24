#!/usr/bin/env bash
# render-phase-criteria.sh — render the memory/13 §Phase definitions table from
# phase-criteria.json (the single source of truth).
#
# Edit phase-criteria.json, then run this script. Never edit the generated table by hand.
#
# Usage:
#   bash scripts/render-phase-criteria.sh           # write the regenerated table
#   bash scripts/render-phase-criteria.sh --check   # do not write; exit 1 if out of sync
#
# Exit codes:
#   0 — rendered (or, with --check, already in sync)
#   1 — with --check: memory/13 is OUT OF SYNC (regenerate)
#   2 — error (source/target missing, malformed, or python3 unavailable)
#
# Dependency: python3 (used for dep-free JSON parsing + marker splicing).

set -euo pipefail

CHECK=0
if [[ "${1:-}" == "--check" ]]; then CHECK=1; fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
SOURCE_FILE="$REPO_ROOT/phase-criteria.json"
TARGET_FILE="$REPO_ROOT/memory/13-phase-history.md"

if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: python3 is required for this script." >&2
  exit 2
fi
if [[ ! -f "$SOURCE_FILE" ]]; then
  echo "ERROR: phase-criteria.json not found at repo root." >&2
  exit 2
fi
if [[ ! -f "$TARGET_FILE" ]]; then
  echo "ERROR: memory/13-phase-history.md not found." >&2
  exit 2
fi

CHECK="$CHECK" SOURCE_FILE="$SOURCE_FILE" TARGET_FILE="$TARGET_FILE" python3 - <<'PY'
import json, os, re, sys

check = os.environ["CHECK"] == "1"
source = os.environ["SOURCE_FILE"]
target = os.environ["TARGET_FILE"]

with open(source, encoding="utf-8") as f:
    data = json.load(f)

rows = ["| Phase | Purpose | Typical artifacts produced |", "|---|---|---|"]
for p in data["phases"]:
    name = f"**{p['name']}**"
    if p.get("optional"):
        name += " *(UI projects only)*"
    artifacts = ", ".join(p["typical_artifacts"])
    rows.append(f"| {name} | {p['purpose']} | {artifacts} |")
table = "\n".join(rows)

begin = "<!-- BEGIN generated:phase-definitions (source: phase-criteria.json — do not edit by hand) -->"
end = "<!-- END generated:phase-definitions -->"
new_block = f"{begin}\n{table}\n{end}"

with open(target, encoding="utf-8") as f:
    content = f.read()

pattern = re.compile(
    r"<!-- BEGIN generated:phase-definitions.*?-->.*?<!-- END generated:phase-definitions -->",
    re.S,
)
if not pattern.search(content):
    sys.stderr.write("ERROR: generation markers not found in memory/13-phase-history.md.\n")
    sys.exit(2)

updated = pattern.sub(lambda m: new_block, content, count=1)
in_sync = content.replace("\r\n", "\n") == updated.replace("\r\n", "\n")

if check:
    if in_sync:
        print("OK: memory/13 §Phase definitions is in sync with phase-criteria.json.")
        sys.exit(0)
    print("DRIFT: memory/13 §Phase definitions does NOT match phase-criteria.json. Run scripts/render-phase-criteria.sh.")
    sys.exit(1)

if in_sync:
    print("No change: memory/13 §Phase definitions already current.")
    sys.exit(0)

with open(target, "w", encoding="utf-8", newline="") as f:
    f.write(updated)
print(f"Rendered memory/13 §Phase definitions from phase-criteria.json ({len(data['phases'])} phases).")
sys.exit(0)
PY
