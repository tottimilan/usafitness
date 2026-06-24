#!/usr/bin/env bash
# install-shadcn-mcp.sh - install shadcn/ui ecosystem platform-aware.
# Auto-detects web (Next.js / Vite / React) vs mobile (Expo + React Native),
# and adapts: same `npx shadcn init` CLI, different registry under the hood
# (shadcn/ui standard on web, react-native-reusables on mobile).
#
# Usage (run from the target project's root):
#   bash scripts/install-shadcn-mcp.sh                                # dry-run, auto-detect
#   bash scripts/install-shadcn-mcp.sh --apply                        # interactive
#   bash scripts/install-shadcn-mcp.sh --apply --defaults             # non-interactive, fastest
#   bash scripts/install-shadcn-mcp.sh --platform mobile --apply      # force mobile track
#   bash scripts/install-shadcn-mcp.sh --platform web --apply         # force web track
#   bash scripts/install-shadcn-mcp.sh --apply --skip-skill           # skip 'npx skills add shadcn/ui'
#   bash scripts/install-shadcn-mcp.sh --apply --skip-mobile-claude-md
#
# Safe: merges into existing .cursor/mcp.json / .mcp.json; idempotent (skips
# shadcn init if components.json already exists).

set -euo pipefail

PLATFORM="auto"
APPLY=0
DEFAULTS=0
SKIP_SKILL=0
SKIP_MOBILE_CLAUDE_MD=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --platform)                PLATFORM="${2:-auto}"; shift 2 ;;
    --apply)                   APPLY=1; shift ;;
    --defaults)                DEFAULTS=1; shift ;;
    --skip-skill)              SKIP_SKILL=1; shift ;;
    --skip-mobile-claude-md)   SKIP_MOBILE_CLAUDE_MD=1; shift ;;
    -h|--help)                 sed -n '2,22p' "$0"; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 2 ;;
  esac
done

case "$PLATFORM" in
  auto|web|mobile|cross) ;;
  *) echo "ERROR: --platform must be one of: auto, web, mobile, cross." >&2; exit 2 ;;
esac

ROOT="$(pwd)"

section() { echo ""; echo "=== $1 ==="; }

section "Preconditions"
issues=()
[[ ! -f "$ROOT/package.json" ]] && issues+=("package.json not found. JS/TS project required.")
[[ ! -d "$ROOT/memory" ]] && issues+=("memory/ not found. Run /mm-bootstrap or scripts/onboard-existing-project first.")
[[ ! -d "$ROOT/.cursor/rules" ]] && issues+=(".cursor/rules/ not found. MASTERMIND shell missing.")
command -v node >/dev/null 2>&1 || issues+=("Node.js not found in PATH.")
if [[ ${#issues[@]} -gt 0 ]]; then
  echo "BLOCKED:"
  for i in "${issues[@]}"; do echo "  - $i"; done
  exit 2
fi
echo "  OK: MASTERMIND project, package.json present, Node.js available."

section "Platform detection"
HAS_EXPO=0; HAS_NEXT=0; HAS_REACT=0
if grep -qE '"(expo|react-native)"' "$ROOT/package.json"; then HAS_EXPO=1; fi
if grep -q '"next"' "$ROOT/package.json"; then HAS_NEXT=1; fi
if grep -q '"react"' "$ROOT/package.json"; then HAS_REACT=1; fi
echo "  package.json signals:"
echo "    expo/react-native : $HAS_EXPO"
echo "    next.js           : $HAS_NEXT"
echo "    react             : $HAS_REACT"

MEMORY_PLATFORM=""
MEM14="$ROOT/memory/14-design-system.md"
if [[ -f "$MEM14" ]]; then
  # Extract Platform field if present
  MEMORY_PLATFORM="$(grep -iE '^\s*-\s+\*\*Platform:\*\*\s+`?[a-z]+`?' "$MEM14" 2>/dev/null | sed -E 's/.*\*\*Platform:\*\*\s+`?([a-z]+)`?.*/\1/' | head -n1 | tr -d '[:space:]' | tr '[:upper:]' '[:lower:]')"
  [[ -n "$MEMORY_PLATFORM" ]] && echo "  memory/14 Platform field : $MEMORY_PLATFORM"
fi

FINAL_PLATFORM="$PLATFORM"
if [[ "$FINAL_PLATFORM" == "auto" ]]; then
  if [[ -n "$MEMORY_PLATFORM" && "$MEMORY_PLATFORM" =~ ^(web|mobile|cross)$ ]]; then
    FINAL_PLATFORM="$MEMORY_PLATFORM"
    echo "  -> resolved from memory/14: $FINAL_PLATFORM"
  elif [[ $HAS_EXPO -eq 1 && $HAS_NEXT -eq 1 ]]; then
    FINAL_PLATFORM="cross"
    echo "  -> auto-detected: cross (both expo AND next)"
  elif [[ $HAS_EXPO -eq 1 ]]; then
    FINAL_PLATFORM="mobile"
    echo "  -> auto-detected: mobile (expo present)"
  elif [[ $HAS_NEXT -eq 1 || $HAS_REACT -eq 1 ]]; then
    FINAL_PLATFORM="web"
    echo "  -> auto-detected: web"
  else
    echo "  -> could not auto-detect. Re-run with --platform <web|mobile|cross>." >&2
    exit 2
  fi
fi
echo "  Final platform: $FINAL_PLATFORM"

section "Plan"
steps=()
HAS_COMPONENTS_JSON=0
[[ -f "$ROOT/components.json" ]] && HAS_COMPONENTS_JSON=1

if [[ $HAS_COMPONENTS_JSON -eq 1 ]]; then
  echo "  [SKIP] shadcn already initialized (components.json exists)."
else
  INIT_CMD="npx shadcn@latest init"
  [[ $DEFAULTS -eq 1 ]] && INIT_CMD="$INIT_CMD --defaults"
  if [[ "$FINAL_PLATFORM" == "mobile" || "$FINAL_PLATFORM" == "cross" ]]; then
    steps+=("1. $INIT_CMD  (Expo auto-detected; uses RNR registry under the hood)")
  else
    steps+=("1. $INIT_CMD  (web track)")
  fi
fi

CURSOR_MCP="$ROOT/.cursor/mcp.json"
CLAUDE_MCP="$ROOT/.mcp.json"
has_shadcn_in() { [[ -f "$1" ]] && grep -q '"shadcn"' "$1" 2>/dev/null; }
CURSOR_HAS_SHADCN=0; CLAUDE_HAS_SHADCN=0
has_shadcn_in "$CURSOR_MCP" && CURSOR_HAS_SHADCN=1
has_shadcn_in "$CLAUDE_MCP" && CLAUDE_HAS_SHADCN=1
if [[ $CURSOR_HAS_SHADCN -eq 1 && $CLAUDE_HAS_SHADCN -eq 1 ]]; then
  echo "  [SKIP] shadcn MCP already in both .cursor/mcp.json and .mcp.json."
else
  steps+=("2. Register shadcn MCP in .cursor/mcp.json + .mcp.json (merge-safe).")
fi

MISSING_MOBILE_DEPS=()
if [[ "$FINAL_PLATFORM" == "mobile" || "$FINAL_PLATFORM" == "cross" ]]; then
  for d in nativewind class-variance-authority clsx tailwind-merge react-native-safe-area-context react-native-reanimated react-native-gesture-handler; do
    if ! grep -q "\"$d\"" "$ROOT/package.json"; then
      MISSING_MOBILE_DEPS+=("$d")
    fi
  done
  if [[ ${#MISSING_MOBILE_DEPS[@]} -gt 0 ]]; then
    steps+=("3. npx expo install ${MISSING_MOBILE_DEPS[*]}")
  else
    echo "  [SKIP] mobile deps all present."
  fi
fi

if [[ $SKIP_SKILL -eq 0 ]]; then
  steps+=("4. npx skills add shadcn/ui  (official project-aware Skill)")
else
  echo "  [SKIP] official shadcn Skill (--skip-skill)."
fi

MOBILE_CLAUDE_MD_NEEDED=0
if [[ ( "$FINAL_PLATFORM" == "mobile" || "$FINAL_PLATFORM" == "cross" ) && $SKIP_MOBILE_CLAUDE_MD -eq 0 ]]; then
  CLAUDE_FILE="$ROOT/CLAUDE.md"
  SIZE=0
  [[ -f "$CLAUDE_FILE" ]] && SIZE=$(wc -c < "$CLAUDE_FILE" | tr -d '[:space:]')
  if [[ $SIZE -eq 0 || $SIZE -lt 500 ]]; then
    steps+=("5. Seed ./CLAUDE.md from .cursor/templates/CLAUDE.md.mobile.md (existing is empty/minimal: $SIZE bytes)")
    MOBILE_CLAUDE_MD_NEEDED=1
  else
    echo "  [SKIP] existing CLAUDE.md is substantial ($SIZE bytes); not replacing. Review and merge manually."
  fi
fi

if [[ ${#steps[@]} -eq 0 ]]; then
  echo "  Everything already installed. Nothing to do."
  exit 0
fi
for s in "${steps[@]}"; do echo "  $s"; done

if [[ $APPLY -eq 0 ]]; then
  echo ""
  echo "DRY-RUN. Re-run with --apply."
  exit 1
fi

section "Executing"

if [[ $HAS_COMPONENTS_JSON -eq 0 ]]; then
  echo "-> shadcn init (platform=$FINAL_PLATFORM)..."
  if [[ $DEFAULTS -eq 1 ]]; then
    npx shadcn@latest init --defaults
  else
    npx shadcn@latest init
  fi
fi

# MCP registration (jq if available, else naive)
register_mcp() {
  local file="$1"
  if has_shadcn_in "$file"; then echo "  [skip] $file"; return; fi
  local dir; dir="$(dirname "$file")"
  mkdir -p "$dir"
  if [[ ! -f "$file" ]]; then
    cat > "$file" <<'JSON'
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
JSON
    echo "  + $file"
    return
  fi
  if command -v jq >/dev/null 2>&1; then
    local tmp; tmp="$(mktemp)"
    jq '.mcpServers = (.mcpServers // {}) | .mcpServers.shadcn = {"command":"npx","args":["shadcn@latest","mcp"]}' "$file" > "$tmp" && mv "$tmp" "$file"
    echo "  + $file (merged via jq)"
  else
    echo "  WARN: jq not found; add manually to $file:"
    echo '    "shadcn": { "command": "npx", "args": ["shadcn@latest", "mcp"] }'
  fi
}

echo "-> Registering shadcn MCP..."
register_mcp "$CURSOR_MCP"
register_mcp "$CLAUDE_MCP"

# Mobile deps
if [[ "$FINAL_PLATFORM" == "mobile" || "$FINAL_PLATFORM" == "cross" ]]; then
  # Re-detect after shadcn init (might have installed some)
  LIVE_MISSING=()
  for d in nativewind class-variance-authority clsx tailwind-merge react-native-safe-area-context react-native-reanimated react-native-gesture-handler; do
    if ! grep -q "\"$d\"" "$ROOT/package.json"; then
      LIVE_MISSING+=("$d")
    fi
  done
  if [[ ${#LIVE_MISSING[@]} -gt 0 ]]; then
    echo "-> Installing missing mobile deps: ${LIVE_MISSING[*]}"
    npx expo install "${LIVE_MISSING[@]}" || echo "  WARN: expo install failed; retry manually."
  fi
fi

# Skill
if [[ $SKIP_SKILL -eq 0 ]]; then
  echo "-> Installing official shadcn Skill..."
  npx skills add shadcn/ui || echo "  WARN: 'npx skills add shadcn/ui' failed. Install later."
fi

# Mobile CLAUDE.md seeding
if [[ $MOBILE_CLAUDE_MD_NEEDED -eq 1 ]]; then
  TEMPLATE="$ROOT/.cursor/templates/CLAUDE.md.mobile.md"
  CLAUDE_FILE="$ROOT/CLAUDE.md"
  if [[ -f "$TEMPLATE" ]]; then
    if [[ ! -f "$CLAUDE_FILE" || $(wc -c < "$CLAUDE_FILE" | tr -d '[:space:]') -eq 0 ]]; then
      cp -f "$TEMPLATE" "$CLAUDE_FILE"
      echo "  + CLAUDE.md (seeded from mobile template)"
    else
      BACKUP="$CLAUDE_FILE.backup-mobile-template-$(date +%Y%m%d-%H%M%S)"
      cp -f "$CLAUDE_FILE" "$BACKUP"
      cp -f "$TEMPLATE" "$CLAUDE_FILE"
      echo "  ~ CLAUDE.md replaced with mobile template (backup at $BACKUP)."
    fi
    echo "    Edit CLAUDE.md to fill the [BRACKETED] values."
  else
    echo "  WARN: mobile template not found at $TEMPLATE. Run sync-from-template first."
  fi
fi

section "Done"
echo "  Platform : $FINAL_PLATFORM"
echo "  shadcn/ui installed, MCP registered, Skill installed."
echo ""
echo "NEXT STEPS:"
echo "  1. Reload Cursor / restart Claude Code so the MCP attaches."
echo "     Sanity: Cursor -> shadcn MCP green dot. Claude Code: /mcp -> 'shadcn' Connected."
echo "  2. Open memory/14-design-system.md. Fill Platform, Project identity, Tokens."
if [[ "$FINAL_PLATFORM" == "mobile" || "$FINAL_PLATFORM" == "cross" ]]; then
  echo "     Also fill Mobile-specific (safe-area, orientation, tab bar, platform differences)."
fi
echo "  3. Add baseline components via chat:"
if [[ "$FINAL_PLATFORM" == "mobile" || "$FINAL_PLATFORM" == "cross" ]]; then
  echo "     'Add button, card, input, dialog, tabs, badge from shadcn (this is an Expo project).'"
else
  echo "     'Add button, card, input, dialog, badge from shadcn.'"
fi
echo "  4. When prototyping a feature: /mm-design <feature-name>"
echo "  5. Optional: export portable DESIGN.md once memory/14 is filled:"
echo "     bash scripts/export-design-md.sh"
echo ""
