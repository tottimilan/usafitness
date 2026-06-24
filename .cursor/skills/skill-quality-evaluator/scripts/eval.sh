#!/usr/bin/env bash
# eval.sh — static-analysis quality evaluator for MASTERMIND skills (bash parity of eval.ps1).
#
# Evaluates a SKILL.md against frontmatter validity, line-count budget, required
# sections, and anti-pattern detection. Returns a score (0-100) and findings.
#
# Usage:
#   bash eval.sh <skill-dir-or-SKILL.md> [--json] [--strict]
#   bash eval.sh --all [--json] [--strict]      # scan every skill under .cursor/skills/
#
# Exit codes:
#   0 — done (or no critical findings with --strict)
#   1 — with --strict: at least one Critical finding
#   2 — error (bad invocation / python3 missing)
#
# Dependency: python3 (kept dep-free otherwise). Mirrors eval.ps1 scoring exactly.

set -euo pipefail

if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: python3 is required for eval.sh." >&2
  exit 2
fi

PATH_ARG=""
ALL=0
JSON=0
STRICT=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --all|-All)   ALL=1; shift ;;
    --json|-Json) JSON=1; shift ;;
    --strict|-Strict) STRICT=1; shift ;;
    --path|-Path) PATH_ARG="${2:-}"; shift 2 ;;
    -h|--help) sed -n '2,18p' "$0"; exit 0 ;;
    *) PATH_ARG="$1"; shift ;;
  esac
done

if [[ "$ALL" -eq 0 && -z "$PATH_ARG" ]]; then
  echo "Usage: bash eval.sh <skill-dir-or-SKILL.md> [--json] [--strict]"
  echo "       bash eval.sh --all [--json] [--strict]"
  exit 0
fi

ALL="$ALL" JSON="$JSON" STRICT="$STRICT" PATH_ARG="$PATH_ARG" python3 - <<'PY'
import json, os, re, sys

ALL = os.environ["ALL"] == "1"
AS_JSON = os.environ["JSON"] == "1"
STRICT = os.environ["STRICT"] == "1"
path_arg = os.environ["PATH_ARG"]

def parse_frontmatter(text):
    m = re.match(r"\A---\s*\r?\n(.*?)\r?\n---\s*\r?\n", text, re.S)
    if not m:
        return None
    fm = {}
    for line in re.split(r"\r?\n", m.group(1)):
        mm = re.match(r"^([a-zA-Z_][\w-]*)\s*:\s*(.*)$", line)
        if mm:
            fm[mm.group(1)] = mm.group(2).strip()
    return fm

def name_valid(name):
    if not name:
        return False
    if len(name) > 64:
        return False
    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", name):
        return False
    if re.search(r"(anthropic|claude)", name):
        return False
    return True

def desc_valid(desc):
    return bool(desc) and 1 <= len(desc) <= 1024

def eval_skill(skill_md):
    findings = []
    score = 100
    if not os.path.isfile(skill_md):
        return {"Path": skill_md, "Score": 0,
                "Findings": [{"Severity": "Critical", "Code": "FILE_NOT_FOUND",
                              "Message": f"Path does not exist: {skill_md}"}]}
    with open(skill_md, encoding="utf-8") as f:
        text = f.read()
    fm = parse_frontmatter(text)
    if not fm:
        findings.append({"Severity": "Critical", "Code": "MISSING_FRONTMATTER",
                         "Message": "No YAML frontmatter found at top of file."})
        score -= 50
    else:
        if not name_valid(fm.get("name", "")):
            findings.append({"Severity": "Critical", "Code": "INVALID_NAME",
                             "Message": "name must match ^[a-z0-9]+(-[a-z0-9]+)*$, max 64 chars, "
                                        f"no 'anthropic'/'claude'. Got: '{fm.get('name','')}'"})
            score -= 25
        if not desc_valid(fm.get("description", "")):
            dlen = len(fm.get("description", "") or "")
            findings.append({"Severity": "Critical", "Code": "EMPTY_DESCRIPTION",
                             "Message": f"description must be 1-1024 chars and non-empty. Length: {dlen}"})
            score -= 25

    lines = text.split("\n")
    # body starts after the second '---'
    dash = 0
    body_start = 0
    for i, ln in enumerate(lines):
        if re.match(r"^---\s*$", ln):
            dash += 1
            if dash == 2:
                body_start = i + 1
                break
    body = lines[body_start:] if 0 < body_start < len(lines) else lines

    if len(body) > 500:
        findings.append({"Severity": "Important", "Code": "BLOATED_SKILL",
                         "Message": f"Body is {len(body)} lines (soft cap 500). Split into references/, scripts/, or assets/."})
        score -= 15

    if fm and desc_valid(fm.get("description", "")):
        desc = fm["description"].lower()
        hints = ["use when", "use whenever", "use before", "use after", "always", "trigger", "invoke"]
        if not any(h in desc for h in hints):
            findings.append({"Severity": "Important", "Code": "MISSING_TRIGGER",
                             "Message": "description should include a 'use when...' phrase or trigger keywords. "
                                        "Agents won't know when to fire this skill otherwise."})
            score -= 15

    sections = [re.match(r"^##\s+(.+?)\s*$", ln).group(1).strip()
                for ln in body if re.match(r"^##\s+(.+?)\s*$", ln)]
    for req in ["Goal", "When to use", "Process", "Anti-patterns"]:
        if not any(req in sec for sec in sections):
            findings.append({"Severity": "Important", "Code": "MISSING_SECTION",
                             "Message": f"Required H2 section '{req}' not found."})
            score -= 10

    return {"Path": skill_md, "Score": max(0, score), "Findings": findings}

def fmt(result):
    out = [f"Skill: {result['Path']}", f"Score: {result['Score']}/100", "Findings:"]
    if not result["Findings"]:
        out.append("  (none)")
    else:
        for fnd in result["Findings"]:
            out.append(f"  [{fnd['Severity']}] {fnd['Code']} - {fnd['Message']}")
    return "\n".join(out)

if ALL:
    skills_dir = os.path.join(os.getcwd(), ".cursor", "skills")
    if not os.path.isdir(skills_dir):
        sys.stderr.write(f"Cannot find .cursor/skills/ from {os.getcwd()}. Run from repo root.\n")
        sys.exit(2)
    results = []
    for root, _dirs, files in os.walk(skills_dir):
        norm = root.replace("\\", "/")
        if "/references/fixtures" in norm:
            continue
        if "SKILL.md" in files:
            results.append(eval_skill(os.path.join(root, "SKILL.md")))
    avg = round(sum(r["Score"] for r in results) / len(results), 1) if results else 0
    if AS_JSON:
        worst = sorted(results, key=lambda r: r["Score"])[:5]
        print(json.dumps({"SkillCount": len(results), "AverageScore": avg,
                          "WorstSkills": [{"Path": w["Path"], "Score": w["Score"],
                                           "FindingCount": len(w["Findings"])} for w in worst],
                          "Results": results}, indent=2))
    else:
        print("===== Skill Quality Report =====")
        print(f"Skills evaluated: {len(results)}")
        print(f"Average score: {avg}/100")
        print("")
        print("By skill (lowest first):")
        prefix = os.getcwd() + os.sep
        for r in sorted(results, key=lambda r: r["Score"]):
            rel = r["Path"].replace(prefix, "")
            print(f"  {r['Score']:>3}/100  {len(r['Findings']):>2} findings  {rel}")
    if STRICT and any(f["Severity"] == "Critical" for r in results for f in r["Findings"]):
        sys.exit(1)
    sys.exit(0)

# single path
p = path_arg
if os.path.isdir(p):
    p = os.path.join(p, "SKILL.md")
result = eval_skill(p)
if AS_JSON:
    print(json.dumps(result, indent=2))
else:
    print(fmt(result))
if STRICT and any(f["Severity"] == "Critical" for f in result["Findings"]):
    sys.exit(1)
sys.exit(0)
PY
