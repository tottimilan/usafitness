<#
.SYNOPSIS
    Meta-audit of the MASTERMIND template itself — the "cobbler's shoes" guard.

.DESCRIPTION
    GENERATES a component manifest (real counts of rules / skills / workflows / commands / memory)
    and CHECKS the template against its own documentation:
      (a) Declared counts in OPERATING-GUIDE §15 headers == real counts.
      (b) Phase criteria single-source: memory/13 table is in sync with phase-criteria.json.
      (c) Skill ↔ mirror sync: .cursor/skills/ and .claude/skills/ match (names + SKILL.md content).
      (d) Visibility: every /mm-* command appears in COMMANDS.md AND OPERATING-GUIDE.md;
          every skill name appears in OPERATING-GUIDE.md (no invisible capabilities, e.g. premortem).

    Exit 0 when everything is consistent; exit 1 on any drift (with the offending detail).

.PARAMETER Check
    Same checks; intended for CI. Exit code is the contract.

.PARAMETER Json
    Emit the manifest + findings as JSON.

.EXAMPLE
    pwsh -File scripts/template-audit.ps1
    pwsh -File scripts/template-audit.ps1 -Check
#>
[CmdletBinding()]
param(
    [switch]$Check,
    [switch]$Json,
    [switch]$Deep
)

$ErrorActionPreference = 'Stop'
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
# NOTE: do NOT name this helper `RP` — `rp` is a built-in alias for Remove-ItemProperty
# and aliases outrank functions in PowerShell command resolution, so `RP <path>` would
# silently invoke Remove-ItemProperty and prompt for its mandatory -Name (hangs the shell).
function RepoPath([string]$rel) { Join-Path $repoRoot $rel }

# ---- Generate manifest (real counts) — use .NET FS calls (faster than cmdlets) ----
function Dirs($rel)  { [System.IO.Directory]::GetDirectories((RepoPath $rel)) }
function Files($rel, $pat) { [System.IO.Directory]::GetFiles((RepoPath $rel), $pat) }
function Leaf($p) { [System.IO.Path]::GetFileName($p) }

$rules     = @(Files '.cursor/rules' '*.mdc')
$skillsCur = @(Dirs '.cursor/skills')
$skillsCla = @(Dirs '.claude/skills')
$workflows = @(Files '.claude/workflows' '*.md' | Where-Object { (Leaf $_) -ne 'README.md' })
$commands  = @(Files '.claude/commands' 'mm-*.md')
$memory    = @(Files 'memory' '*.md')

$manifest = [ordered]@{
    rules     = $rules.Count
    skills    = $skillsCur.Count
    workflows = $workflows.Count
    commands  = $commands.Count
    memory    = $memory.Count
}

$findings = @()
function Add-Finding($severity, $code, $msg) {
    $script:findings += [pscustomobject]@{ Severity=$severity; Code=$code; Message=$msg }
}

# ---- (a) Declared counts in OPERATING-GUIDE §15 headers ----
$ogPath = RepoPath 'OPERATING-GUIDE.md'
if (Test-Path $ogPath) {
    $og = Get-Content $ogPath -Raw
    $declMap = @{
        'Skills'       = $manifest.skills
        'Rules'        = $manifest.rules
        'Workflows'    = $manifest.workflows
        'Commands'     = $manifest.commands
        'Memory files' = $manifest.memory
    }
    foreach ($label in $declMap.Keys) {
        $m = [regex]::Match($og, "###\s+15\.\d+\s+$([regex]::Escape($label))\s+\((\d+)\)")
        if (-not $m.Success) {
            Add-Finding 'Important' 'COUNT_HEADER_MISSING' "OPERATING-GUIDE §15 has no '$label (N)' header to verify."
        } elseif ([int]$m.Groups[1].Value -ne $declMap[$label]) {
            Add-Finding 'Critical' 'COUNT_MISMATCH' "OPERATING-GUIDE §15 declares $label ($($m.Groups[1].Value)) but real = $($declMap[$label])."
        }
    }
} else {
    Add-Finding 'Important' 'DOC_MISSING' 'OPERATING-GUIDE.md not found.'
}

# ---- (b) Phase criteria single-source (inline; no nested pwsh) ----
$criteriaFile = RepoPath 'phase-criteria.json'
$historyFile  = RepoPath 'memory/13-phase-history.md'
if ((Test-Path $criteriaFile) -and (Test-Path $historyFile)) {
    $data = Get-Content $criteriaFile -Raw | ConvertFrom-Json
    $rows = @('| Phase | Purpose | Typical artifacts produced |', '|---|---|---|')
    foreach ($p in $data.phases) {
        $name = "**$($p.name)**"
        if ($p.optional) { $name += ' *(UI projects only)*' }
        $rows += "| $name | $($p.purpose) | $(($p.typical_artifacts -join ', ')) |"
    }
    $expectedTable = ($rows -join "`n")
    $hist = Get-Content $historyFile -Raw
    $bm = [regex]::Match($hist, '(?s)<!-- BEGIN generated:phase-definitions.*?-->\r?\n(.*?)\r?\n<!-- END generated:phase-definitions -->')
    if (-not $bm.Success) {
        Add-Finding 'Critical' 'CRITERIA_MARKERS_MISSING' 'memory/13 has no generated:phase-definitions markers.'
    } elseif (($bm.Groups[1].Value -replace "`r`n", "`n").Trim() -ne ($expectedTable -replace "`r`n", "`n").Trim()) {
        Add-Finding 'Critical' 'CRITERIA_DRIFT' 'memory/13 §Phase definitions is out of sync with phase-criteria.json. Run scripts/render-phase-criteria.ps1.'
    }
} else {
    Add-Finding 'Critical' 'CRITERIA_SOURCE_MISSING' 'phase-criteria.json or memory/13-phase-history.md missing.'
}

# ---- (c) Skill <-> mirror sync (name-set parity; content authority is sync-skills) ----
$curNames = @($skillsCur | ForEach-Object { Leaf $_ }) | Sort-Object
$claNames = @($skillsCla | ForEach-Object { Leaf $_ }) | Sort-Object
foreach ($n in ($curNames | Where-Object { $_ -notin $claNames })) { Add-Finding 'Critical' 'MIRROR_MISSING' "Skill '$n' exists in .cursor/skills but not in .claude/skills (run scripts/sync-skills)." }
foreach ($n in ($claNames | Where-Object { $_ -notin $curNames })) { Add-Finding 'Critical' 'MIRROR_EXTRA'   "Skill '$n' exists in .claude/skills but not in .cursor/skills (run scripts/sync-skills)." }
# Deep (optional): per-file content compare. Off by default to keep the audit light; `sync-skills --check` is the content authority.
if ($Deep) {
    foreach ($n in ($curNames | Where-Object { $_ -in $claNames })) {
        $a = RepoPath ".cursor/skills/$n/SKILL.md"; $b = RepoPath ".claude/skills/$n/SKILL.md"
        if ((Test-Path $a) -and (Test-Path $b)) {
            if (([System.IO.File]::ReadAllText($a) -replace "`r`n","`n") -ne ([System.IO.File]::ReadAllText($b) -replace "`r`n","`n")) {
                Add-Finding 'Critical' 'MIRROR_DRIFT' "SKILL.md content differs between .cursor and .claude for '$n' (run scripts/sync-skills)."
            }
        }
    }
}

# ---- (d) Visibility ----
$commandsDoc = if (Test-Path (RepoPath 'COMMANDS.md')) { Get-Content (RepoPath 'COMMANDS.md') -Raw } else { '' }
$ogDoc = if (Test-Path $ogPath) { $og } else { '' }
foreach ($cmd in $commands) {
    $name = [System.IO.Path]::GetFileNameWithoutExtension($cmd)  # e.g. mm-premortem
    if ($commandsDoc -notmatch [regex]::Escape($name)) {
        Add-Finding 'Critical' 'CMD_INVISIBLE' "Command '$name' is not documented in COMMANDS.md."
    }
    if ($ogDoc -notmatch [regex]::Escape($name)) {
        Add-Finding 'Important' 'CMD_INVISIBLE_OG' "Command '$name' is not mentioned in OPERATING-GUIDE.md."
    }
}
foreach ($skName in $curNames) {
    if ($ogDoc -notmatch [regex]::Escape($skName)) {
        Add-Finding 'Critical' 'SKILL_INVISIBLE' "Skill '$skName' is not mentioned anywhere in OPERATING-GUIDE.md."
    }
}

# ---- (e) README count integrity + no build-diary (the 2.1.0 blind spot) ----
$readmePath = RepoPath 'README.md'
if (Test-Path $readmePath) {
    $readme = Get-Content $readmePath -Raw
    $wf = [regex]::Match($readme, '(\d+)\s+workflows')
    if ($wf.Success -and [int]$wf.Groups[1].Value -ne $manifest.workflows) {
        Add-Finding 'Critical' 'README_COUNT_MISMATCH' "README says $($wf.Groups[1].Value) workflows but real = $($manifest.workflows)."
    }
    $cmd = [regex]::Match($readme, '(\d+)\s+(?:slash )?commands')
    if ($cmd.Success -and [int]$cmd.Groups[1].Value -ne $manifest.commands) {
        Add-Finding 'Critical' 'README_COUNT_MISMATCH' "README says $($cmd.Groups[1].Value) commands but real = $($manifest.commands)."
    }
    foreach ($diary in @('Sub-phase', 'complete map')) {
        if ($readme -match [regex]::Escape($diary)) {
            Add-Finding 'Important' 'README_BUILD_DIARY' "README still contains build-diary text '$diary' — prune it."
        }
    }
} else {
    Add-Finding 'Important' 'DOC_MISSING' 'README.md not found.'
}

# ---- (f) phase-criteria single-source pointer present in OPERATING-GUIDE ----
if ($ogDoc -and ($ogDoc -notmatch 'phase-criteria\.json')) {
    Add-Finding 'Critical' 'CRITERIA_POINTER_MISSING' 'OPERATING-GUIDE.md does not reference phase-criteria.json as the source of truth (§5 may have become a parallel source).'
}

# ---- (g) Phase-model drift: onboarding scripts + memory placeholders vs phase-criteria.json ----
if (Test-Path $criteriaFile) {
    $phaseOrder = @((Get-Content $criteriaFile -Raw | ConvertFrom-Json).phase_order)
    if ($phaseOrder.Count -gt 0) {
        $placeholderLine = '**Phase:** ' + ($phaseOrder -join ' | ')
        $onboardTargets = @(
            @{ Rel = 'scripts/onboard-existing-project.ps1'; Pattern = ('\*\*Phase:\*\* ' + ($phaseOrder -join ' \| ')) },
            @{ Rel = 'scripts/onboard-existing-project.sh';  Pattern = ('\*\*Phase:\*\* ' + ($phaseOrder -join ' \\| ')) }
        )
        foreach ($t in $onboardTargets) {
            $sp = RepoPath $t.Rel
            if (-not (Test-Path $sp)) { continue }
            $sc = [System.IO.File]::ReadAllText($sp)
            foreach ($p in $phaseOrder) {
                if (-not $sc.Contains($p)) {
                    Add-Finding 'Critical' 'PHASE_LIST_DRIFT' "$($t.Rel) never mentions phase '$p' from phase-criteria.json phase_order (its phase validation/help is stale)."
                }
            }
            if (-not $sc.Contains($t.Pattern)) {
                Add-Finding 'Critical' 'PHASE_PATTERN_DRIFT' "$($t.Rel) placeholder-rewrite pattern does not match phase_order ('$placeholderLine') - the initial phase would silently not be written."
            }
        }
        foreach ($memRel in @('memory/02-current-state.md','memory/13-phase-history.md')) {
            $mp = RepoPath $memRel
            if (-not (Test-Path $mp)) { continue }
            # Only enforced while the file still holds the pipe-separated placeholder (i.e. in the pristine template).
            $phLine = @(Get-Content $mp | Where-Object { $_ -match '^\*\*Phase:\*\* .+\|' }) | Select-Object -First 1
            if ($phLine -and $phLine.Trim() -ne $placeholderLine) {
                Add-Finding 'Critical' 'PHASE_PLACEHOLDER_DRIFT' "$memRel placeholder ('$($phLine.Trim())') != phase_order-derived ('$placeholderLine') - the onboarding rewrite would never match."
            }
        }
    }
}

# ---- Write manifest to runtime (gitignored) ----
try {
    $runtimeDir = RepoPath '.mastermind/runtime'
    if (-not (Test-Path $runtimeDir)) { New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null }
    ($manifest | ConvertTo-Json) | Set-Content -Path (Join-Path $runtimeDir 'component-manifest.json') -Encoding UTF8
} catch { }

# ---- Report ----
$critical = @($findings | Where-Object { $_.Severity -eq 'Critical' })
if ($Json) {
    [pscustomobject]@{ manifest=$manifest; findings=$findings; pass=($critical.Count -eq 0) } | ConvertTo-Json -Depth 6 | Write-Output
} else {
    Write-Host ""
    Write-Host "=== template-audit ===" -ForegroundColor Cyan
    Write-Host "Real counts: rules=$($manifest.rules)  skills=$($manifest.skills)  workflows=$($manifest.workflows)  commands=$($manifest.commands)  memory=$($manifest.memory)"
    Write-Host ""
    if ($findings.Count -eq 0) {
        Write-Host "PASS: template is self-consistent (counts, criteria, mirror, visibility)." -ForegroundColor Green
    } else {
        Write-Host "Findings ($($findings.Count)):" -ForegroundColor Yellow
        foreach ($f in $findings) {
            $color = if ($f.Severity -eq 'Critical') { 'Red' } else { 'Yellow' }
            Write-Host "  [$($f.Severity)] $($f.Code) - $($f.Message)" -ForegroundColor $color
        }
    }
}

if ($critical.Count -gt 0) { exit 1 } else { exit 0 }
