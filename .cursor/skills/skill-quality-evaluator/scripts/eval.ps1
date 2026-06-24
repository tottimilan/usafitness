<#
.SYNOPSIS
    Static-analysis quality evaluator for MASTERMIND skills.
.DESCRIPTION
    Evaluates a SKILL.md file against frontmatter validity, line-count budget,
    required sections, and anti-pattern detection. Returns a score (0-100) and
    a list of findings.
.PARAMETER Path
    Path to a skill directory (containing SKILL.md) or to a SKILL.md file.
.PARAMETER All
    Scan every skill under .cursor/skills/.
.PARAMETER Json
    Emit JSON output instead of human-readable.
.PARAMETER Strict
    Exit 1 if any finding has severity Critical (for CI gating).
#>
[CmdletBinding()]
param(
    [string]$Path,
    [switch]$All,
    [switch]$Json,
    [switch]$Strict
)

$ErrorActionPreference = 'Stop'

function Get-SkillFrontmatter {
    [CmdletBinding()]
    param([string]$SkillMdPath)

    $content = Get-Content -Path $SkillMdPath -Raw -Encoding UTF8
    $pattern = '(?s)\A---\s*\r?\n(.*?)\r?\n---\s*\r?\n'
    $match = [regex]::Match($content, $pattern)
    if (-not $match.Success) {
        return $null
    }
    $yamlText = $match.Groups[1].Value
    $result = [ordered]@{}
    foreach ($line in ($yamlText -split "`r?`n")) {
        if ($line -match '^([a-zA-Z_][\w-]*)\s*:\s*(.*)$') {
            $result[$matches[1]] = $matches[2].Trim()
        }
    }
    return [pscustomobject]$result
}

function Test-NameValid {
    [CmdletBinding()]
    param([string]$Name)
    if ([string]::IsNullOrWhiteSpace($Name)) { return $false }
    if ($Name.Length -gt 64) { return $false }
    if ($Name -cnotmatch '^[a-z0-9]+(-[a-z0-9]+)*$') { return $false }
    if ($Name -match '(anthropic|claude)') { return $false }
    return $true
}

function Test-DescriptionValid {
    [CmdletBinding()]
    param([string]$Description)
    if ([string]::IsNullOrWhiteSpace($Description)) { return $false }
    if ($Description.Length -lt 1 -or $Description.Length -gt 1024) { return $false }
    return $true
}

function Invoke-SkillEval {
    [CmdletBinding()]
    param([string]$SkillMdPath)

    $findings = @()
    $score = 100

    if (-not (Test-Path $SkillMdPath)) {
        $findings += [pscustomobject]@{ Severity='Critical'; Code='FILE_NOT_FOUND'; Message="Path does not exist: $SkillMdPath" }
        return [pscustomobject]@{ Path=$SkillMdPath; Score=0; Findings=$findings }
    }

    $frontmatter = Get-SkillFrontmatter -SkillMdPath $SkillMdPath
    if (-not $frontmatter) {
        $findings += [pscustomobject]@{ Severity='Critical'; Code='MISSING_FRONTMATTER'; Message='No YAML frontmatter found at top of file.' }
        $score -= 50
    } else {
        if (-not (Test-NameValid -Name $frontmatter.name)) {
            $findings += [pscustomobject]@{ Severity='Critical'; Code='INVALID_NAME'; Message="name must match ^[a-z0-9]+(-[a-z0-9]+)*$, max 64 chars, no 'anthropic'/'claude'. Got: '$($frontmatter.name)'" }
            $score -= 25
        }
        if (-not (Test-DescriptionValid -Description $frontmatter.description)) {
            $descLen = if ($null -eq $frontmatter.description) { 0 } else { $frontmatter.description.Length }
            $findings += [pscustomobject]@{ Severity='Critical'; Code='EMPTY_DESCRIPTION'; Message="description must be 1-1024 chars and non-empty. Length: $descLen" }
            $score -= 25
        }
    }

    # --- Body checks ---
    $allLines = Get-Content -Path $SkillMdPath -Encoding UTF8
    $bodyStartIdx = 0
    $dashCount = 0
    for ($i = 0; $i -lt $allLines.Count; $i++) {
        if ($allLines[$i] -match '^---\s*$') {
            $dashCount++
            if ($dashCount -eq 2) { $bodyStartIdx = $i + 1; break }
        }
    }
    $bodyLines = if ($bodyStartIdx -gt 0 -and $bodyStartIdx -lt $allLines.Count) {
        $allLines[$bodyStartIdx..($allLines.Count - 1)]
    } else {
        $allLines
    }
    $bodyLineCount = $bodyLines.Count

    if ($bodyLineCount -gt 500) {
        $findings += [pscustomobject]@{ Severity='Important'; Code='BLOATED_SKILL'; Message="Body is $bodyLineCount lines (soft cap 500). Split into references/, scripts/, or assets/." }
        $score -= 15
    }

    if ($frontmatter -and (Test-DescriptionValid -Description $frontmatter.description)) {
        $desc = $frontmatter.description.ToLower()
        $triggerHints = @('use when', 'use whenever', 'use before', 'use after', 'always', 'trigger', 'invoke')
        $hasTrigger = $false
        foreach ($hint in $triggerHints) {
            if ($desc.Contains($hint)) { $hasTrigger = $true; break }
        }
        if (-not $hasTrigger) {
            $findings += [pscustomobject]@{ Severity='Important'; Code='MISSING_TRIGGER'; Message="description should include a 'use when...' phrase or trigger keywords. Agents won't know when to fire this skill otherwise." }
            $score -= 15
        }
    }

    $requiredSections = @('Goal', 'When to use', 'Process', 'Anti-patterns')
    $sectionLines = @()
    foreach ($line in $bodyLines) {
        if ($line -match '^##\s+(.+?)\s*$') {
            $sectionLines += $matches[1].Trim()
        }
    }
    foreach ($req in $requiredSections) {
        $found = $false
        foreach ($sec in $sectionLines) {
            if ($sec -like "*$req*") { $found = $true; break }
        }
        if (-not $found) {
            $findings += [pscustomobject]@{ Severity='Important'; Code='MISSING_SECTION'; Message="Required H2 section '$req' not found." }
            $score -= 10
        }
    }

    return [pscustomobject]@{
        Path     = $SkillMdPath
        Score    = [Math]::Max(0, $score)
        Findings = $findings
    }
}

function Resolve-SkillMdPath {
    [CmdletBinding()]
    param([string]$InputPath)
    $resolved = Resolve-Path $InputPath -ErrorAction Stop
    if ((Get-Item $resolved).PSIsContainer) {
        return Join-Path $resolved 'SKILL.md'
    }
    return $resolved.Path
}

function Format-SkillEvalResult {
    [CmdletBinding()]
    param([pscustomobject]$Result, [switch]$AsJson)
    if ($AsJson) {
        return ($Result | ConvertTo-Json -Depth 5)
    }
    $out = "Skill: $($Result.Path)`nScore: $($Result.Score)/100`nFindings:"
    if ($Result.Findings.Count -eq 0) {
        $out += "`n  (none)"
    } else {
        foreach ($f in $Result.Findings) {
            $out += "`n  [$($f.Severity)] $($f.Code) - $($f.Message)"
        }
    }
    return $out
}

if (-not $Path -and -not $All) {
    Write-Output "Usage: pwsh -File eval.ps1 -Path <skill-dir-or-skill-md> [-Json] [-Strict]"
    Write-Output "       pwsh -File eval.ps1 -All [-Json] [-Strict]"
    exit 0
}

if ($All) {
    $skillsDir = Join-Path (Get-Location) (Join-Path '.cursor' 'skills')
    if (-not (Test-Path $skillsDir)) {
        Write-Error "Cannot find .cursor/skills/ from current directory: $(Get-Location). Run from repo root."
        exit 2
    }
    $allSkillMds = Get-ChildItem -Path $skillsDir -Recurse -Filter 'SKILL.md' -File | Where-Object {
        $_.FullName -notmatch '[\\/]references[\\/]fixtures[\\/]'
    }
    $results = @()
    foreach ($md in $allSkillMds) {
        $results += Invoke-SkillEval -SkillMdPath $md.FullName
    }
    $avg = if ($results.Count -gt 0) {
        [Math]::Round((($results | Measure-Object -Property Score -Average).Average), 1)
    } else { 0 }
    $worst = $results | Sort-Object Score | Select-Object -First 5 | ForEach-Object {
        [pscustomobject]@{ Path=$_.Path; Score=$_.Score; FindingCount=$_.Findings.Count }
    }
    $summary = [pscustomobject]@{
        SkillCount   = $results.Count
        AverageScore = $avg
        WorstSkills  = $worst
        Results      = $results
    }
    if ($Json) {
        $summary | ConvertTo-Json -Depth 6 | Write-Output
    } else {
        Write-Output "===== Skill Quality Report ====="
        Write-Output "Skills evaluated: $($summary.SkillCount)"
        Write-Output "Average score: $($summary.AverageScore)/100"
        Write-Output ""
        Write-Output "By skill (lowest first):"
        $repoRootPath = (Get-Location).Path + [System.IO.Path]::DirectorySeparatorChar
        foreach ($r in ($results | Sort-Object Score)) {
            $rel = $r.Path -replace [regex]::Escape($repoRootPath), ''
            Write-Output ("  {0,3}/100  {1,2} findings  {2}" -f $r.Score, $r.Findings.Count, $rel)
        }
    }
    if ($Strict) {
        $criticalCount = ($results | ForEach-Object { $_.Findings } | Where-Object { $_.Severity -eq 'Critical' }).Count
        if ($criticalCount -gt 0) { exit 1 }
    }
    exit 0
}

if ($Path) {
    $skillMd = Resolve-SkillMdPath -InputPath $Path
    $result = Invoke-SkillEval -SkillMdPath $skillMd
    Format-SkillEvalResult -Result $result -AsJson:$Json | Write-Output
    if ($Strict -and ($result.Findings | Where-Object { $_.Severity -eq 'Critical' }).Count -gt 0) {
        exit 1
    }
    exit 0
}
