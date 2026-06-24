#!/usr/bin/env bash
# template-audit.sh — meta-audit of the MASTERMIND template itself (bash parity of template-audit.ps1).
#
# Generates a component manifest (real counts) and checks the template against its own docs:
#   (a) Declared counts in OPERATING-GUIDE §15 headers == real counts.
#   (b) memory/13 §Phase definitions in sync with phase-criteria.json.
#   (c) .cursor/skills <-> .claude/skills name-set parity (content authority = sync-skills; --deep compares content).
#   (d) Every /mm-* command documented in COMMANDS.md + OPERATING-GUIDE.md; every skill mentioned in OPERATING-GUIDE.md.
#
# Usage:
#   bash scripts/template-audit.sh [--deep] [--json] [--check]
#
# Exit codes: 0 = consistent; 1 = at least one Critical finding.
# Dependency: python3.

set -euo pipefail

DEEP=0; JSON=0
for a in "$@"; do
  case "$a" in
    --deep) DEEP=1 ;;
    --json) JSON=1 ;;
    --check) : ;;  # exit code is the contract; same checks
  esac
done

if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: python3 is required for template-audit.sh." >&2
  exit 2
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

DEEP="$DEEP" JSON="$JSON" REPO_ROOT="$REPO_ROOT" python3 - <<'PY'
import json, os, re, sys

root = os.environ["REPO_ROOT"]
deep = os.environ["DEEP"] == "1"
as_json = os.environ["JSON"] == "1"

def rp(rel): return os.path.join(root, rel)

def list_dirs(rel):
    p = rp(rel)
    return sorted(d for d in os.listdir(p) if os.path.isdir(os.path.join(p, d))) if os.path.isdir(p) else []

def list_files(rel, pat):
    import fnmatch
    p = rp(rel)
    return sorted(f for f in os.listdir(p) if os.path.isfile(os.path.join(p, f)) and fnmatch.fnmatch(f, pat)) if os.path.isdir(p) else []

rules     = list_files(".cursor/rules", "*.mdc")
skills_cur = list_dirs(".cursor/skills")
skills_cla = list_dirs(".claude/skills")
workflows = [f for f in list_files(".claude/workflows", "*.md") if f != "README.md"]
commands  = list_files(".claude/commands", "mm-*.md")
memory    = list_files("memory", "*.md")

manifest = {"rules": len(rules), "skills": len(skills_cur),
            "workflows": len(workflows), "commands": len(commands), "memory": len(memory)}

findings = []
def add(sev, code, msg): findings.append({"Severity": sev, "Code": code, "Message": msg})

# (a) declared counts in OPERATING-GUIDE §15 headers
og_path = rp("OPERATING-GUIDE.md")
og = open(og_path, encoding="utf-8").read() if os.path.isfile(og_path) else ""
if og:
    decl = {"Skills": manifest["skills"], "Rules": manifest["rules"],
            "Workflows": manifest["workflows"], "Commands": manifest["commands"],
            "Memory files": manifest["memory"]}
    for label, real in decl.items():
        m = re.search(r"###\s+15\.\d+\s+" + re.escape(label) + r"\s+\((\d+)\)", og)
        if not m:
            add("Important", "COUNT_HEADER_MISSING", f"OPERATING-GUIDE §15 has no '{label} (N)' header to verify.")
        elif int(m.group(1)) != real:
            add("Critical", "COUNT_MISMATCH", f"OPERATING-GUIDE §15 declares {label} ({m.group(1)}) but real = {real}.")
else:
    add("Important", "DOC_MISSING", "OPERATING-GUIDE.md not found.")

# (b) phase criteria single-source
crit_path = rp("phase-criteria.json"); hist_path = rp("memory/13-phase-history.md")
if os.path.isfile(crit_path) and os.path.isfile(hist_path):
    data = json.load(open(crit_path, encoding="utf-8"))
    rows = ["| Phase | Purpose | Typical artifacts produced |", "|---|---|---|"]
    for p in data["phases"]:
        name = f"**{p['name']}**" + (" *(UI projects only)*" if p.get("optional") else "")
        rows.append(f"| {name} | {p['purpose']} | {', '.join(p['typical_artifacts'])} |")
    expected = "\n".join(rows)
    hist = open(hist_path, encoding="utf-8").read()
    bm = re.search(r"<!-- BEGIN generated:phase-definitions.*?-->\r?\n(.*?)\r?\n<!-- END generated:phase-definitions -->", hist, re.S)
    if not bm:
        add("Critical", "CRITERIA_MARKERS_MISSING", "memory/13 has no generated:phase-definitions markers.")
    elif bm.group(1).replace("\r\n", "\n").strip() != expected.replace("\r\n", "\n").strip():
        add("Critical", "CRITERIA_DRIFT", "memory/13 §Phase definitions out of sync with phase-criteria.json. Run scripts/render-phase-criteria.sh.")
else:
    add("Critical", "CRITERIA_SOURCE_MISSING", "phase-criteria.json or memory/13-phase-history.md missing.")

# (c) skill <-> mirror name-set parity
for n in [x for x in skills_cur if x not in skills_cla]:
    add("Critical", "MIRROR_MISSING", f"Skill '{n}' in .cursor/skills but not .claude/skills (run scripts/sync-skills).")
for n in [x for x in skills_cla if x not in skills_cur]:
    add("Critical", "MIRROR_EXTRA", f"Skill '{n}' in .claude/skills but not .cursor/skills (run scripts/sync-skills).")
if deep:
    for n in [x for x in skills_cur if x in skills_cla]:
        a = rp(f".cursor/skills/{n}/SKILL.md"); b = rp(f".claude/skills/{n}/SKILL.md")
        if os.path.isfile(a) and os.path.isfile(b):
            if open(a, encoding="utf-8").read().replace("\r\n", "\n") != open(b, encoding="utf-8").read().replace("\r\n", "\n"):
                add("Critical", "MIRROR_DRIFT", f"SKILL.md content differs for '{n}' (run scripts/sync-skills).")

# (d) visibility
commands_doc = open(rp("COMMANDS.md"), encoding="utf-8").read() if os.path.isfile(rp("COMMANDS.md")) else ""
for c in commands:
    name = os.path.splitext(c)[0]
    if name not in commands_doc:
        add("Critical", "CMD_INVISIBLE", f"Command '{name}' is not documented in COMMANDS.md.")
    if name not in og:
        add("Important", "CMD_INVISIBLE_OG", f"Command '{name}' is not mentioned in OPERATING-GUIDE.md.")
for n in skills_cur:
    if n not in og:
        add("Critical", "SKILL_INVISIBLE", f"Skill '{n}' is not mentioned anywhere in OPERATING-GUIDE.md.")

# (e) README count integrity + no build-diary (the 2.1.0 blind spot)
readme_path = rp("README.md")
if os.path.isfile(readme_path):
    readme = open(readme_path, encoding="utf-8").read()
    mwf = re.search(r"(\d+)\s+workflows", readme)
    if mwf and int(mwf.group(1)) != manifest["workflows"]:
        add("Critical", "README_COUNT_MISMATCH", f"README says {mwf.group(1)} workflows but real = {manifest['workflows']}.")
    mcmd = re.search(r"(\d+)\s+(?:slash )?commands", readme)
    if mcmd and int(mcmd.group(1)) != manifest["commands"]:
        add("Critical", "README_COUNT_MISMATCH", f"README says {mcmd.group(1)} commands but real = {manifest['commands']}.")
    for diary in ("Sub-phase", "complete map"):
        if diary in readme:
            add("Important", "README_BUILD_DIARY", f"README still contains build-diary text '{diary}' — prune it.")
else:
    add("Important", "DOC_MISSING", "README.md not found.")

# (f) phase-criteria single-source pointer present in OPERATING-GUIDE
if og and "phase-criteria.json" not in og:
    add("Critical", "CRITERIA_POINTER_MISSING", "OPERATING-GUIDE.md does not reference phase-criteria.json as the source of truth (§5 may have become a parallel source).")

# write manifest to runtime (gitignored)
try:
    rtd = rp(".mastermind/runtime")
    os.makedirs(rtd, exist_ok=True)
    json.dump(manifest, open(os.path.join(rtd, "component-manifest.json"), "w", encoding="utf-8"))
except Exception:
    pass

critical = [f for f in findings if f["Severity"] == "Critical"]
if as_json:
    print(json.dumps({"manifest": manifest, "findings": findings, "pass": len(critical) == 0}, indent=2))
else:
    print("")
    print("=== template-audit ===")
    print(f"Real counts: rules={manifest['rules']}  skills={manifest['skills']}  "
          f"workflows={manifest['workflows']}  commands={manifest['commands']}  memory={manifest['memory']}")
    print("")
    if not findings:
        print("PASS: template is self-consistent (counts, criteria, mirror, visibility).")
    else:
        print(f"Findings ({len(findings)}):")
        for f in findings:
            print(f"  [{f['Severity']}] {f['Code']} - {f['Message']}")

sys.exit(1 if critical else 0)
PY
