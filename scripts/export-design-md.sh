#!/usr/bin/env bash
# export-design-md.sh - export memory/14-design-system.md into a portable DESIGN.md
# at the project root. DESIGN.md is the cross-tool standard (9 sections) read by
# Claude Design, Google Stitch, Cursor, v0, Claude Code.
#
# memory/14 stays canonical; DESIGN.md is derived. Edit memory/14 and re-run.
#
# Usage:
#   bash scripts/export-design-md.sh                # dry-run (preview)
#   bash scripts/export-design-md.sh --apply        # write DESIGN.md (backs up existing)
#   bash scripts/export-design-md.sh --apply --force  # skip confirmation when memory/14 is mostly placeholder

set -euo pipefail

APPLY=0
FORCE=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply)  APPLY=1; shift ;;
    --force)  FORCE=1; shift ;;
    -h|--help) sed -n '2,13p' "$0"; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 2 ;;
  esac
done

ROOT="$(pwd)"
MEM14="$ROOT/memory/14-design-system.md"
DESIGN_MD="$ROOT/DESIGN.md"

section() { echo ""; echo "=== $1 ==="; }

section "Preconditions"
if [[ ! -f "$MEM14" ]]; then
  echo "  BLOCKED: memory/14-design-system.md not found. Is this a MASTERMIND project?" >&2
  exit 2
fi

PLACEHOLDERS=$(grep -c '_TBD_' "$MEM14" || true)
echo "  memory/14 found; $PLACEHOLDERS _TBD_ placeholders remain."

if [[ $PLACEHOLDERS -gt 20 ]]; then
  echo ""
  echo "  WARNING: memory/14 is mostly placeholders. The exported DESIGN.md inherits that emptiness."
  echo "  Recommended: fill Project identity + Tokens + Platform before exporting."
  echo ""
  if [[ $APPLY -eq 1 && $FORCE -eq 0 ]]; then
    read -r -p "Continue anyway? (type 'yes') " ANS
    if [[ "$ANS" != "yes" ]]; then
      echo "Aborted."
      exit 1
    fi
  fi
fi

# Extract platform
PLATFORM="unspecified"
if grep -qE '^\s*-\s+\*\*Platform:\*\*\s+`?[a-z]+`?' "$MEM14"; then
  PLATFORM=$(grep -iE '^\s*-\s+\*\*Platform:\*\*\s+`?[a-z]+`?' "$MEM14" | sed -E 's/.*\*\*Platform:\*\*\s+`?([a-z]+)`?.*/\1/' | head -n1 | tr -d '[:space:]' | tr '[:upper:]' '[:lower:]')
fi

# Extract project name
PROJECT_NAME="Unnamed project"
if grep -qE '^\s*-\s+\*\*Name:\*\*\s+.+$' "$MEM14"; then
  N=$(grep -iE '^\s*-\s+\*\*Name:\*\*' "$MEM14" | head -n1 | sed -E 's/.*\*\*Name:\*\*\s+(.+)$/\1/' | sed 's/ *$//')
  if [[ -n "$N" && "$N" != "_TBD_" ]]; then
    PROJECT_NAME="$N"
  fi
fi

TS_HUMAN="$(date '+%Y-%m-%d %H:%M')"
TS_FILE="$(date +%Y%m%d-%H%M%S)"

# Extract section helper: everything from "## Header" until next "## "
extract_section() {
  local header="$1"
  local file="$2"
  awk -v h="## $header" '
    $0 == h { inside = 1; print; next }
    inside && /^## / { exit }
    inside { print }
  ' "$file"
}

IDENTITY="$(extract_section 'Project identity' "$MEM14" | sed '/^## /d')"
TOKENS_ALL="$(extract_section 'Tokens' "$MEM14" | sed '/^## /d')"
MOBILE="$(extract_section 'Mobile-specific (only fill if Platform = `mobile` or `cross`)' "$MEM14" | sed '/^## /d')"
LIKES="$(extract_section 'What I like (visual preferences)' "$MEM14" | sed '/^## /d')"
DISLIKES="$(extract_section "What I don't like (anti-patterns)" "$MEM14" | sed '/^## /d')"
PATTERNS="$(extract_section 'Patterns we use repeatedly' "$MEM14" | sed '/^## /d')"
INSTALLED="$(extract_section 'Installed components' "$MEM14" | sed '/^## /d')"

# Extract subsections of Tokens
extract_subsection() {
  local header="$1"
  local content="$2"
  awk -v h="### $header" '
    $0 == h { inside = 1; print; next }
    inside && /^### / { exit }
    inside { print }
  ' <<< "$content"
}

COLORS="$(extract_subsection 'Colors' "$TOKENS_ALL")"
TYPO="$(extract_subsection 'Typography' "$TOKENS_ALL")"
SPACING="$(extract_subsection 'Spacing & geometry' "$TOKENS_ALL")"
MOTION="$(extract_subsection 'Motion' "$TOKENS_ALL")"

# Build DESIGN.md content
read -r -d '' DESIGN_CONTENT <<EOF || true
# DESIGN.md — $PROJECT_NAME

> **Exported from memory/14-design-system.md on $TS_HUMAN by scripts/export-design-md.sh.**
> Portable cross-tool twin of MASTERMIND's per-project visual source of truth. Read by
> Claude Design, Google Stitch, Cursor, v0, Claude Code. DO NOT edit manually — it gets
> regenerated. Edit memory/14-design-system.md, then re-run the script.

**Platform:** \`$PLATFORM\`

---

## 1. Visual Theme & Atmosphere

${IDENTITY:-_TBD — fill memory/14 §Project identity._}

---

## 2. Color Palette & Roles

${COLORS:-_TBD — fill memory/14 §Tokens.Colors._}

---

## 3. Typography Rules

${TYPO:-_TBD — fill memory/14 §Tokens.Typography._}

---

## 4. Component Stylings

Derived from:
- **Web track:** shadcn/ui components (copy-paste, Tailwind + Radix).
- **Mobile track:** react-native-reusables components (copy-paste, NativeWind + rn-primitives).

${INSTALLED:-_No components installed yet. Run \`npx shadcn@latest add <component>\` and log additions in memory/14 §Installed components._}

---

## 5. Layout Principles

${SPACING:-_TBD._}

$([ -n "$PATTERNS" ] && echo "### Reusable patterns"$'\n\n'"$PATTERNS" || echo "")

---

## 6. Depth & Elevation

${MOTION:-_TBD._}

Shadow tokens and surface hierarchy: _TBD — describe shadow scale (sm / md / lg / xl) and when to use each._

---

## 7. Do's and Don'ts

### Do's

${LIKES:-_TBD._}

### Don'ts

${DISLIKES:-_TBD._}

---

## 8. Responsive Behavior

$(if [[ "$PLATFORM" == "mobile" || "$PLATFORM" == "cross" ]]; then
  echo "### Mobile-specific"
  echo ""
  echo "${MOBILE:-_TBD — fill memory/14 §Mobile-specific (safe-area, orientation, tab bar, touch targets)._}"
  echo ""
fi)

$(if [[ "$PLATFORM" == "web" || "$PLATFORM" == "cross" ]]; then
cat <<WEB
### Web-specific

- Breakpoints: Tailwind defaults (sm 640, md 768, lg 1024, xl 1280, 2xl 1536) unless memory/14 overrides.
- Container widths: _TBD — pull from memory/14 §Tokens.Spacing._
- Mobile-first by default (start with narrowest, adapt up).
WEB
fi)

---

## 9. Agent Prompt Guide

> Reusable prompts Claude / v0 / Stitch can embed when they need to stay on-brand.

### Base prompt (copy-paste into Claude Design / v0)

\`\`\`
Stay strictly on-brand for $PROJECT_NAME.
Read DESIGN.md §1–8 before generating anything.
Platform: $PLATFORM.
Components must come from the Component Stylings table (§4). If a needed component isn't listed, add it explicitly to your plan — don't invent one silently.
Honor the Do's (§7) and never violate the Don'ts.
If you deviate from any section, call it out in a comment and explain why.
\`\`\`

### Prompt extensions per task

- **New screen:** follow §5 Layout Principles and §8 Responsive Behavior.
- **New component:** place it in \`src/components/custom/\` with a reason noted in memory/14 §Custom components.
- **Token change:** STOP and ask the user to log a decision in memory/07-decisions-log.md + update memory/14 §Tokens before the code change.
- **Mobile screen:** wrap in SafeAreaView, use Expo Router, touch targets ≥ 44pt iOS / 48dp Android.

---

_Regenerated from memory/14-design-system.md. Edit memory/14, then run:_

\`\`\`
bash scripts/export-design-md.sh --apply
\`\`\`

_last generated: $TS_HUMAN_
EOF

section "Plan"
EXISTING_BYTES=0
[[ -f "$DESIGN_MD" ]] && EXISTING_BYTES=$(wc -c < "$DESIGN_MD" | tr -d '[:space:]')

if [[ $EXISTING_BYTES -eq 0 ]]; then
  echo "  DESIGN.md does not exist yet -> will be CREATED."
else
  echo "  DESIGN.md exists ($EXISTING_BYTES bytes) -> will be BACKED UP then overwritten."
fi
echo "  Backup (if applies): .mastermind-backups/design-md-$TS_FILE/DESIGN.md"
echo ""
echo "  Preview of exported content (first 25 lines):"
echo "$DESIGN_CONTENT" | head -n 25 | sed 's/^/    /'
echo "    ..."
echo ""

if [[ $APPLY -eq 0 ]]; then
  echo "  DRY-RUN. Re-run with --apply."
  exit 1
fi

if [[ $EXISTING_BYTES -gt 0 ]]; then
  BACKUP_DIR="$ROOT/.mastermind-backups/design-md-$TS_FILE"
  mkdir -p "$BACKUP_DIR"
  cp -f "$DESIGN_MD" "$BACKUP_DIR/DESIGN.md"
  echo "  Backed up -> $BACKUP_DIR/DESIGN.md"
fi

printf '%s' "$DESIGN_CONTENT" > "$DESIGN_MD"

section "Done"
echo "  DESIGN.md written ($(wc -c < "$DESIGN_MD" | tr -d '[:space:]') bytes)"
echo ""
echo "NEXT STEPS:"
echo "  1. Commit DESIGN.md so other tools (and future you) can read it."
echo "  2. Link DESIGN.md into Claude Design: claude.ai/design -> project -> Add assets -> upload DESIGN.md."
echo "  3. Point Cursor / v0 / Stitch at this repo; they read DESIGN.md automatically."
echo "  4. When memory/14 changes, re-run this script. DESIGN.md regenerates."
echo ""
