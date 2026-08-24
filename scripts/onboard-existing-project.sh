#!/usr/bin/env bash
# onboard-existing-project.sh — bring an existing project (not born from MASTERMIND)
# into the MASTERMIND 2.0 system. Installs the template shell (rules, skills,
# workflows, commands, hooks, scripts, root docs, memory skeleton) without touching
# code, git history, or custom content.
#
# Usage (run from inside the target project):
#   bash scripts/onboard-existing-project.sh --template /path/to/mastermind-2.0
#   bash scripts/onboard-existing-project.sh --template /path/to/tpl --phase MVP --apply
#   bash scripts/onboard-existing-project.sh --template /path/to/tpl --phase Iteration --apply --force
#   bash scripts/onboard-existing-project.sh --template /path/to/tpl --phase MVP --apply --keep-existing-rules
#   bash scripts/onboard-existing-project.sh --template /path/to/tpl --phase MVP --apply --include-mcp-config
#
# Conflict handling: existing-and-different files get written as <file>.mastermind-proposal.
# Pre-existing .cursor/rules/ are relocated to .cursor/rules-backup-YYYYMMDD-HHMMSS/
# by default (use --keep-existing-rules to treat as conflicts instead).
#
# Exit codes:
#   0  done OK, or already in sync
#   1  drift/conflicts detected in dry-run, or user aborted
#   2  bad args / template missing / running inside template / missing deps

set -euo pipefail

TEMPLATE=""; PHASE=""; APPLY=0; FORCE=0; KEEP_RULES=0; INCLUDE_MCP=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --template)              TEMPLATE="${2:-}"; shift 2 ;;
    --phase)                 PHASE="${2:-}"; shift 2 ;;
    --apply)                 APPLY=1; shift ;;
    --force)                 FORCE=1; shift ;;
    --keep-existing-rules)   KEEP_RULES=1; shift ;;
    --include-mcp-config)    INCLUDE_MCP=1; shift ;;
    -h|--help)               sed -n '2,28p' "$0"; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 2 ;;
  esac
done

if [[ -z "$TEMPLATE" ]]; then echo "ERROR: --template <path> is required." >&2; exit 2; fi
if [[ ! -d "$TEMPLATE" ]]; then echo "ERROR: template not found: $TEMPLATE" >&2; exit 2; fi

TEMPLATE_ROOT="$( cd "$TEMPLATE" && pwd )"
PROJECT_ROOT="$( pwd )"

if [[ "$TEMPLATE_ROOT" == "$PROJECT_ROOT" ]]; then
  echo "ERROR: current directory IS the template. Run this from the target project." >&2
  exit 2
fi
if [[ ! -f "$TEMPLATE_ROOT/CLAUDE.md" ]]; then
  echo "ERROR: template has no CLAUDE.md. Is --template correct?" >&2
  exit 2
fi
if ! grep -q 'MASTERMIND' "$TEMPLATE_ROOT/CLAUDE.md"; then
  echo "WARN: template's CLAUDE.md does not mention MASTERMIND. Continuing."
fi
if [[ ! -d "$PROJECT_ROOT/.git" ]]; then
  echo "WARN: target is not a git repo. Onboarding proceeds but you lose git rollback."
fi
if [[ $APPLY -eq 1 && -z "$PHASE" ]]; then
  echo "ERROR: --phase is required with --apply. Choose: Idea, Discovery, Definition, Prototype, MVP, Iteration, Launch." >&2
  exit 2
fi
if [[ -n "$PHASE" ]]; then
  case "$PHASE" in
    Idea|Discovery|Definition|Prototype|MVP|Iteration|Launch) ;;
    *) echo "ERROR: invalid --phase. Must be one of: Idea, Discovery, Definition, Prototype, MVP, Iteration, Launch." >&2; exit 2 ;;
  esac
fi

if command -v sha256sum >/dev/null 2>&1; then _hash(){ sha256sum "$1" | awk '{print $1}'; };
elif command -v shasum >/dev/null 2>&1; then _hash(){ shasum -a 256 "$1" | awk '{print $1}'; };
else echo "ERROR: need sha256sum or shasum in PATH." >&2; exit 2; fi

TS="$(date +%Y%m%d-%H%M%S)"
TODAY="$(date +%Y-%m-%d)"

echo ""
echo "=== onboard-existing-project ==="
echo "Template: $TEMPLATE_ROOT"
echo "Project:  $PROJECT_ROOT"
if [[ $APPLY -eq 1 ]]; then echo "Mode:     APPLY"; else echo "Mode:     DRY-RUN"; fi
[[ -n "$PHASE" ]] && echo "Phase:    $PHASE"
if [[ $KEEP_RULES -eq 1 ]]; then echo "Rules:    KEEP existing as conflicts"; else echo "Rules:    RELOCATE existing to backup"; fi
echo ""

# ---- whitelist collection ----------------------------------------------------
collect_whitelist() {
  (
    cd "$TEMPLATE_ROOT"
    for f in CLAUDE.md AGENTS.md README.md OPERATING-GUIDE.md COMMANDS.md phase-criteria.json .gitignore .env.example; do
      [[ -f "$f" ]] && echo "$f"
    done
    find .cursor/rules -type f -name '*.mdc' 2>/dev/null
    find .cursor/skills -type f 2>/dev/null
    find .cursor/hooks -maxdepth 1 -type f -name '*.md' 2>/dev/null
    [[ -f ".claude/CLAUDE.md" ]] && echo ".claude/CLAUDE.md"
    find .claude/skills -type f 2>/dev/null
    find .claude/hooks -maxdepth 1 -type f -name '*.md' 2>/dev/null
    find .claude/workflows -type f 2>/dev/null
    find .claude/commands -type f 2>/dev/null
    find scripts -maxdepth 1 -type f \( -name '*.ps1' -o -name '*.sh' \) 2>/dev/null
    for f in scripts/git-hooks/pre-commit scripts/git-hooks/pre-push scripts/git-hooks/README.md; do
      [[ -f "$f" ]] && echo "$f"
    done
    find memory -maxdepth 1 -type f -name '*.md' 2>/dev/null
    [[ $INCLUDE_MCP -eq 1 && -f "claude-side/mcp-config.json" ]] && echo "claude-side/mcp-config.json"
  ) | sed 's|^\./||' | sort -u
}

is_blacklisted() {
  local p="$1"
  case "$p" in
    .git/*|node_modules/*|dist/*|.next/*|claude-side/prompts/*|.taskmaster/*|.cursor/plans/*|docs/*) return 0 ;;
  esac
  local base; base="$(basename "$p")"
  case "$base" in
    .env|.env.local) return 0 ;;
    .env.example|.env.sample) return 1 ;;
    .env.*) return 0 ;;
  esac
  [[ $INCLUDE_MCP -eq 0 && "$p" == "claude-side/mcp-config.json" ]] && return 0
  return 1
}

mapfile -t WHITELIST < <(collect_whitelist)
if [[ ${#WHITELIST[@]} -eq 0 ]]; then
  echo "ERROR: no whitelisted files in template." >&2
  exit 2
fi

TO_CREATE=(); TO_PROPOSAL=(); PROTECTED=(); UNCHANGED=0

for rel in "${WHITELIST[@]}"; do
  [[ -z "$rel" ]] && continue
  if is_blacklisted "$rel"; then PROTECTED+=("$rel"); continue; fi
  src="$TEMPLATE_ROOT/$rel"; dst="$PROJECT_ROOT/$rel"
  if [[ ! -f "$dst" ]]; then TO_CREATE+=("$rel")
  else
    s="$(_hash "$src")"; d="$(_hash "$dst")"
    if [[ "$s" == "$d" ]]; then UNCHANGED=$((UNCHANGED+1)); else TO_PROPOSAL+=("$rel"); fi
  fi
done

EXISTING_RULES_DIR="$PROJECT_ROOT/.cursor/rules"
HAS_EXISTING_RULES=0
if [[ -d "$EXISTING_RULES_DIR" ]]; then
  if [[ $(find "$EXISTING_RULES_DIR" -maxdepth 1 -type f | wc -l) -gt 0 ]]; then
    HAS_EXISTING_RULES=1
  fi
fi

# ---- stack detection ---------------------------------------------------------
detect_stack() {
  local pkg="$PROJECT_ROOT/package.json"
  local fw="" lang="" db="" pay="" host=""
  if [[ -f "$pkg" ]]; then
    local content; content="$(cat "$pkg")"
    # Framework detection priority: Expo > Next > Remix > Astro > Vite > React Native (sin Expo) > React > Vue > Svelte
    if echo "$content" | grep -q '"expo"'; then fw="Expo + React Native (mobile)"
    elif echo "$content" | grep -q '"next"'; then fw="Next.js"
    elif echo "$content" | grep -q '"@remix-run/react"\|"@remix-run/node"'; then fw="Remix"
    elif echo "$content" | grep -q '"astro"'; then fw="Astro"
    elif echo "$content" | grep -q '"vite"'; then fw="Vite"
    elif echo "$content" | grep -q '"react-native"'; then fw="React Native (sin Expo)"
    elif echo "$content" | grep -q '"react"'; then fw="React (sin metaframework)"
    elif echo "$content" | grep -q '"vue"'; then fw="Vue"
    elif echo "$content" | grep -q '"svelte"'; then fw="Svelte"; fi
    if echo "$content" | grep -q '"typescript"'; then lang="TypeScript (strict mode)"; else lang="JavaScript"; fi
    if echo "$content" | grep -q '"@supabase/supabase-js"'; then db="Supabase / Postgres"
    elif echo "$content" | grep -q '"@prisma/client"'; then db="Postgres + Prisma"
    elif echo "$content" | grep -q '"drizzle-orm"'; then db="Postgres + Drizzle"
    elif echo "$content" | grep -q '"mongoose"\|"mongodb"'; then db="MongoDB"; fi
    # Payments: RevenueCat (mobile IAP) takes priority over Stripe in mobile contexts
    if echo "$content" | grep -q '"react-native-purchases"'; then pay="RevenueCat (Apple IAP + Google Play Billing)"
    elif echo "$content" | grep -q '"stripe"\|"@stripe/stripe-js"'; then pay="Stripe"
    elif echo "$content" | grep -q '"@paddle/paddle-js"'; then pay="Paddle"; fi
    if [[ -f "$PROJECT_ROOT/vercel.json" ]]; then host="Vercel"
    elif [[ -f "$PROJECT_ROOT/eas.json" ]]; then host="EAS Build + App Store + Google Play"
    elif [[ -f "$PROJECT_ROOT/netlify.toml" ]]; then host="Netlify"
    elif [[ -f "$PROJECT_ROOT/wrangler.toml" ]]; then host="Cloudflare Workers/Pages"
    elif [[ -f "$PROJECT_ROOT/fly.toml" ]]; then host="Fly.io"
    elif [[ -f "$PROJECT_ROOT/railway.json" ]]; then host="Railway"; fi
  fi
  [[ -z "$fw" && -f "$PROJECT_ROOT/pyproject.toml" ]] && { fw="Python (pyproject.toml)"; lang="Python"; }
  [[ -z "$fw" && -f "$PROJECT_ROOT/Cargo.toml" ]] && { fw="Rust"; lang="Rust"; }
  echo "$fw|$lang|$db|$pay|$host"
}

IFS='|' read -r DET_FW DET_LANG DET_DB DET_PAY DET_HOST <<< "$(detect_stack)"

STACK_FILE_REL=".cursor/rules/02-tech-stack.mdc"
STACK_TARGET="$PROJECT_ROOT/$STACK_FILE_REL"
STACK_WILL_PREFILL=0
if [[ ! -f "$STACK_TARGET" && -n "${DET_FW}${DET_LANG}${DET_DB}${DET_PAY}${DET_HOST}" ]]; then STACK_WILL_PREFILL=1; fi

# ---- report ------------------------------------------------------------------
echo "Template files whitelisted: ${#WHITELIST[@]}"
echo ""
if [[ ${#TO_CREATE[@]} -gt 0 ]]; then
  echo "NEW (${#TO_CREATE[@]}) - will be created:"
  for f in "${TO_CREATE[@]}"; do echo "  + $f"; done; echo ""
fi
if [[ ${#TO_PROPOSAL[@]} -gt 0 ]]; then
  echo "CONFLICTS (${#TO_PROPOSAL[@]}) - will be written as <file>.mastermind-proposal:"
  for f in "${TO_PROPOSAL[@]}"; do echo "  ! $f"; done; echo ""
fi
if [[ $HAS_EXISTING_RULES -eq 1 && $KEEP_RULES -eq 0 ]]; then
  echo "PRE-EXISTING RULES in target .cursor/rules/ detected."
  echo "  Action: relocate to .cursor/rules-backup-$TS/ before installing MASTERMIND rules."
  echo ""
fi
if [[ -n "${DET_FW}${DET_LANG}${DET_DB}${DET_PAY}${DET_HOST}" ]]; then
  echo "STACK auto-detected:"
  [[ -n "$DET_FW" ]]   && echo "  framework: $DET_FW"
  [[ -n "$DET_LANG" ]] && echo "  language:  $DET_LANG"
  [[ -n "$DET_DB" ]]   && echo "  database:  $DET_DB"
  [[ -n "$DET_PAY" ]]  && echo "  payments:  $DET_PAY"
  [[ -n "$DET_HOST" ]] && echo "  hosting:   $DET_HOST"
  [[ $STACK_WILL_PREFILL -eq 1 ]] && echo "  Will pre-fill .cursor/rules/02-tech-stack.mdc."
  echo ""
fi
if [[ ${#PROTECTED[@]} -gt 0 ]]; then
  echo "PROTECTED (${#PROTECTED[@]}):"
  local_count=0
  for f in "${PROTECTED[@]}"; do
    echo "  p $f"
    local_count=$((local_count+1))
    [[ $local_count -ge 8 ]] && { echo "  ... and $((${#PROTECTED[@]} - local_count)) more."; break; }
  done
  echo ""
fi
echo "Unchanged: $UNCHANGED"

HAS_WORK=0
[[ ${#TO_CREATE[@]} -gt 0 || ${#TO_PROPOSAL[@]} -gt 0 ]] && HAS_WORK=1
[[ $HAS_EXISTING_RULES -eq 1 && $KEEP_RULES -eq 0 ]] && HAS_WORK=1

if [[ $HAS_WORK -eq 0 ]]; then
  echo ""
  echo "OK: project already has the full MASTERMIND shell. Nothing to install."
  exit 0
fi

if [[ $APPLY -eq 0 ]]; then
  echo ""
  echo "DRIFT DETECTED. Re-run with --apply --phase <phase> to install."
  echo "Before applying: close Cursor/Claude on this project and commit pending work."
  exit 1
fi

if [[ $FORCE -eq 0 ]]; then
  echo ""
  read -r -p "Apply: ${#TO_CREATE[@]} new, ${#TO_PROPOSAL[@]} proposals, relocate-rules=$((HAS_EXISTING_RULES && !KEEP_RULES)), phase=$PHASE. Proceed? (type 'yes') " ANS
  if [[ "$ANS" != "yes" ]]; then echo "Aborted by user."; exit 1; fi
fi

# ---- apply: relocate rules ---------------------------------------------------
if [[ $HAS_EXISTING_RULES -eq 1 && $KEEP_RULES -eq 0 ]]; then
  BACKUP_DIR="$PROJECT_ROOT/.cursor/rules-backup-$TS"
  mv "$EXISTING_RULES_DIR" "$BACKUP_DIR"
  mkdir -p "$EXISTING_RULES_DIR"
  echo "Relocated existing rules to .cursor/rules-backup-$TS/"
fi

# ---- render stack file if prefill ---------------------------------------------
render_stack_file() {
  local src="$TEMPLATE_ROOT/$STACK_FILE_REL"
  local out_fw="${DET_FW:-_TBD_}"
  local out_lang="${DET_LANG:-_TBD_}"
  local out_db="${DET_DB:-_TBD_}"
  local out_pay="${DET_PAY:-_TBD_}"
  local out_host="${DET_HOST:-_TBD_}"
  sed -E \
    -e "s/^- \*\*Framework:\*\* _TBD_$/- **Framework:** ${out_fw//\//\/}/" \
    -e "s/^- \*\*Language:\*\* _TBD_$/- **Language:** ${out_lang//\//\/}/" \
    -e "s/^- \*\*Database:\*\* _TBD_$/- **Database:** ${out_db//\//\/}/" \
    -e "s/^- \*\*Payments:\*\* _TBD_$/- **Payments:** ${out_pay//\//\/}/" \
    -e "s/^- \*\*Hosting:\*\* _TBD_$/- **Hosting:** ${out_host//\//\/}/" \
    "$src"
  echo ""
  echo "<!-- Auto-detected on $TS by onboard-existing-project. Review and adjust. -->"
}

CREATED=0; PROPOSALS=0
for rel in "${TO_CREATE[@]}"; do
  src="$TEMPLATE_ROOT/$rel"; dst="$PROJECT_ROOT/$rel"
  mkdir -p "$(dirname "$dst")"
  if [[ "$rel" == "$STACK_FILE_REL" && $STACK_WILL_PREFILL -eq 1 ]]; then
    render_stack_file > "$dst"
  else
    cp -f "$src" "$dst"
  fi
  CREATED=$((CREATED+1))
done
for rel in "${TO_PROPOSAL[@]}"; do
  src="$TEMPLATE_ROOT/$rel"; dst="$PROJECT_ROOT/$rel.mastermind-proposal"
  mkdir -p "$(dirname "$dst")"
  cp -f "$src" "$dst"
  PROPOSALS=$((PROPOSALS+1))
done

# ---- phase bootstrap ----------------------------------------------------------
STATE_FILE="$PROJECT_ROOT/memory/02-current-state.md"
HISTORY_FILE="$PROJECT_ROOT/memory/13-phase-history.md"
if [[ -f "$STATE_FILE" ]]; then
  sed -i.bak -E "s/^\*\*Phase:\*\* Idea \\| Discovery \\| Definition \\| Prototype \\| MVP \\| Iteration \\| Launch$/**Phase:** $PHASE/" "$STATE_FILE"
  rm -f "$STATE_FILE.bak"
fi
if [[ -f "$HISTORY_FILE" ]]; then
  sed -i.bak -E "s/^\*\*Phase:\*\* Idea \\| Discovery \\| Definition \\| Prototype \\| MVP \\| Iteration \\| Launch$/**Phase:** $PHASE/;s/^\*\*Since:\*\* YYYY-MM-DD$/**Since:** $TODAY/" "$HISTORY_FILE"
  rm -f "$HISTORY_FILE.bak"
  TMP="$(mktemp)"
  awk -v today="$TODAY" -v phase="$PHASE" '
    /_No transitions yet\./ {
      print
      print ""
      print "### " today " - Onboarded existing project into MASTERMIND at phase " phase
      print "- **Decided by:** User + <Model>"
      print "- **Trigger:** Existing codebase incorporated into MASTERMIND 2.0 via scripts/onboard-existing-project."
      print "- **Entry criteria met:**"
      print "  - [x] Code exists in the repo (phase >= Idea was already the case)."
      print "  - [x] MASTERMIND shell installed (rules, skills, workflows, commands, hooks, scripts, memory skeleton)."
      print "  - [ ] Retroactive documentation of memory/ is the next step (run retroactive-documenter skill or /mm-audit)."
      print "- **Artifacts promoted:** none yet; onboarding installs the shell, retroactive audit populates memory/."
      print "- **Confidence at entry:** Medium (phase picked during onboarding; confirm with /mm-gate after retroactive audit)."
      print "- **Expected duration in new phase:** depends on where the project actually is."
      print "- **Success metric for this phase:** to be set once memory/00-project-brief.md is filled."
      print "- **Link to gate review:** pending first /mm-gate run."
      next
    }
    { print }
  ' "$HISTORY_FILE" > "$TMP"
  mv "$TMP" "$HISTORY_FILE"
fi

echo ""
echo "DONE"
echo "  Created:    $CREATED"
echo "  Proposals:  $PROPOSALS"
echo "  Phase set:  $PHASE"
echo "  Timestamp:  $TS"
echo ""
echo "NEXT STEPS (order matters):"
echo "  1. git status && git diff"
echo "  2. Resolve any *.mastermind-proposal files (merge manually or delete)."
echo "  3. git add . && git commit -m 'chore: onboard existing project into MASTERMIND'"
echo "  4. Reload Cursor window and restart Claude Desktop/Code."
echo "  5. Run the onboarding workflow phases 3+ to populate memory/ (retroactive audit)."
echo "     Command: /mm-onboard  (or read .claude/workflows/06-onboard-existing-project.md)"
echo "  6. After memory/ is populated, run /mm-gate $PHASE to formally confirm the phase."
if [[ $HAS_EXISTING_RULES -eq 1 && $KEEP_RULES -eq 0 ]]; then
  echo ""
  echo "Your previous .cursor/rules/ are preserved at .cursor/rules-backup-$TS/"
  echo "Review them and, if any rule is still useful, merge it manually into the MASTERMIND rule files."
fi
echo ""
