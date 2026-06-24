#!/usr/bin/env bash
# log-dispatch.sh — append one subagent-dispatch record to the rule-07 observability log.
#
# Implements the §Observability contract of .cursor/rules/07-subagent-orchestration.mdc.
# Appends a single JSON line to .mastermind/runtime/dispatch-log.jsonl (gitignored).
# Best-effort: if it cannot write, the dispatch still proceeds (graceful degradation).
#
# Usage:
#   bash scripts/log-dispatch.sh \
#     --dispatcher subagent-dispatcher --role implementer --model claude-sonnet \
#     --status DONE --wall-ms 42000 --tokens 18000 [--input-hash <h> | --input-text "..."]
#
# Roles:   implementer | spec-reviewer | code-quality-reviewer | research | other
# Status:  DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED

set -euo pipefail

DISPATCHER="" ROLE="other" MODEL="" STATUS="DONE"
INPUT_HASH="" WALL_MS="0" TOKENS="0" INPUT_TEXT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dispatcher) DISPATCHER="${2:-}"; shift 2 ;;
    --role) ROLE="${2:-}"; shift 2 ;;
    --model) MODEL="${2:-}"; shift 2 ;;
    --status) STATUS="${2:-}"; shift 2 ;;
    --input-hash) INPUT_HASH="${2:-}"; shift 2 ;;
    --wall-ms) WALL_MS="${2:-}"; shift 2 ;;
    --tokens) TOKENS="${2:-}"; shift 2 ;;
    --input-text) INPUT_TEXT="${2:-}"; shift 2 ;;
    -h|--help) sed -n '2,16p' "$0"; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 0 ;;
  esac
done

{
  SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
  REPO_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
  RUNTIME_DIR="$REPO_ROOT/.mastermind/runtime"
  mkdir -p "$RUNTIME_DIR"
  LOG_FILE="$RUNTIME_DIR/dispatch-log.jsonl"

  if [[ -z "$INPUT_HASH" && -n "$INPUT_TEXT" ]]; then
    if command -v shasum >/dev/null 2>&1; then
      INPUT_HASH="$(printf '%s' "$INPUT_TEXT" | shasum -a 256 | cut -c1-16)"
    elif command -v sha256sum >/dev/null 2>&1; then
      INPUT_HASH="$(printf '%s' "$INPUT_TEXT" | sha256sum | cut -c1-16)"
    fi
  fi

  TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  if command -v python3 >/dev/null 2>&1; then
    DISPATCHER="$DISPATCHER" ROLE="$ROLE" MODEL="$MODEL" STATUS="$STATUS" \
    INPUT_HASH="$INPUT_HASH" WALL_MS="$WALL_MS" TOKENS="$TOKENS" TS="$TS" LOG_FILE="$LOG_FILE" \
    python3 - <<'PY'
import json, os
rec = {
    "timestamp": os.environ["TS"],
    "dispatcher": os.environ["DISPATCHER"],
    "role": os.environ["ROLE"],
    "model": os.environ["MODEL"],
    "input_hash": os.environ["INPUT_HASH"],
    "output_status": os.environ["STATUS"],
    "wall_time_ms": int(os.environ["WALL_MS"] or 0),
    "token_cost_estimate": float(os.environ["TOKENS"] or 0),
}
with open(os.environ["LOG_FILE"], "a", encoding="utf-8") as f:
    f.write(json.dumps(rec) + "\n")
PY
  else
    # Fallback without python3: hand-rolled JSON (values are simple/controlled).
    printf '{"timestamp":"%s","dispatcher":"%s","role":"%s","model":"%s","input_hash":"%s","output_status":"%s","wall_time_ms":%s,"token_cost_estimate":%s}\n' \
      "$TS" "$DISPATCHER" "$ROLE" "$MODEL" "$INPUT_HASH" "$STATUS" "${WALL_MS:-0}" "${TOKENS:-0}" >> "$LOG_FILE"
  fi
  echo "dispatch logged -> .mastermind/runtime/dispatch-log.jsonl"
} || echo "observability off (log-dispatch failed) — dispatch continues." >&2

exit 0
