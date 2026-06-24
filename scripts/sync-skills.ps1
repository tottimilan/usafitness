<#
.SYNOPSIS
    Syncs skills from .cursor/skills/ (canonical source) into .claude/skills/ (mirror).

.DESCRIPTION
    MASTERMIND 2.0 uses .cursor/skills/ as the single source of truth for Agent Skills.
    This script mirrors them to .claude/skills/ so Claude Code / Claude Desktop can
    discover them when working in this repo.

    The script is idempotent:
      - Files unchanged (by hash) are not copied.
      - Files that differ get overwritten in the mirror.
      - Files present in the mirror but missing in the source are deleted.
      - README.md at the mirror root is preserved.

.PARAMETER Check
    Dry-run mode. Prints what WOULD change, exits 0 if in sync, exits 1 if out of sync.
    Useful for pre-commit / CI checks.

.EXAMPLE
    pwsh -File scripts/sync-skills.ps1          # normal sync, writes to disk
    pwsh -File scripts/sync-skills.ps1 -Check   # dry-run, exit 1 if drift

.NOTES
    Canonical source:  .cursor/skills/
    Mirror destination: .claude/skills/
    Protected files in mirror (never deleted, never overwritten): README.md, .gitkeep
#>
[CmdletBinding()]
param(
    [switch]$Check
)

$ErrorActionPreference = 'Stop'

# Resolve paths relative to the repo root (parent of scripts/)
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$source   = Join-Path $repoRoot '.cursor\skills'
$dest     = Join-Path $repoRoot '.claude\skills'

if (-not (Test-Path $source)) {
    Write-Error "Source directory not found: $source"
    exit 2
}
if (-not (Test-Path $dest)) {
    Write-Error "Destination directory not found: $dest"
    exit 2
}

# Files we never touch in the mirror (they live only on the Claude side)
$protected = @('README.md', '.gitkeep')

function Get-RelativeSkillFiles {
    param([string]$Root)
    # Return files relative to $Root. Skip protected files.
    Get-ChildItem -Path $Root -Recurse -File | ForEach-Object {
        $rel = $_.FullName.Substring($Root.Length).TrimStart('\', '/')
        if ($protected -contains $_.Name) { return }
        [PSCustomObject]@{ Rel = $rel; Full = $_.FullName }
    }
}

function Get-FileHashSafe {
    param([string]$Path)
    if (-not (Test-Path $Path)) { return $null }
    return (Get-FileHash -Path $Path -Algorithm SHA256).Hash
}

$sourceFiles = @(Get-RelativeSkillFiles -Root $source)
$destFiles   = @(Get-RelativeSkillFiles -Root $dest)

$sourceIndex = @{}
$sourceFiles | ForEach-Object { $sourceIndex[$_.Rel] = $_.Full }

$destIndex = @{}
$destFiles | ForEach-Object { $destIndex[$_.Rel] = $_.Full }

$toCopy   = @()
$toUpdate = @()
$toDelete = @()
$unchanged = 0

# Files in source → check against dest
foreach ($rel in $sourceIndex.Keys) {
    $srcFull  = $sourceIndex[$rel]
    $destFull = Join-Path $dest $rel

    if (-not (Test-Path $destFull)) {
        $toCopy += $rel
        continue
    }

    $srcHash  = Get-FileHashSafe -Path $srcFull
    $destHash = Get-FileHashSafe -Path $destFull

    if ($srcHash -ne $destHash) {
        $toUpdate += $rel
    } else {
        $unchanged++
    }
}

# Files in dest but not in source → orphans
foreach ($rel in $destIndex.Keys) {
    if (-not $sourceIndex.ContainsKey($rel)) {
        $toDelete += $rel
    }
}

$totalChanges = $toCopy.Count + $toUpdate.Count + $toDelete.Count

# ---- Reporting ----
Write-Host ""
Write-Host "=== sync-skills ==="
Write-Host "Source:      $source"
Write-Host "Destination: $dest"
Write-Host ""

if ($toCopy.Count -gt 0) {
    Write-Host "NEW ($($toCopy.Count)):"
    $toCopy | ForEach-Object { Write-Host "  + $_" }
}
if ($toUpdate.Count -gt 0) {
    Write-Host "CHANGED ($($toUpdate.Count)):"
    $toUpdate | ForEach-Object { Write-Host "  ~ $_" }
}
if ($toDelete.Count -gt 0) {
    Write-Host "ORPHANS to remove ($($toDelete.Count)):"
    $toDelete | ForEach-Object { Write-Host "  - $_" }
}
Write-Host ""
Write-Host "Unchanged: $unchanged"
Write-Host "Total pending changes: $totalChanges"

# ---- Check mode → exit with drift status ----
if ($Check) {
    if ($totalChanges -gt 0) {
        Write-Host ""
        Write-Host "DRIFT detected. Run 'pwsh -File scripts/sync-skills.ps1' to sync." -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host ""
        Write-Host "OK: .claude/skills/ is in sync with .cursor/skills/." -ForegroundColor Green
        exit 0
    }
}

if ($totalChanges -eq 0) {
    Write-Host ""
    Write-Host "OK: everything already in sync. Nothing to do." -ForegroundColor Green
    exit 0
}

# ---- Apply changes ----
foreach ($rel in ($toCopy + $toUpdate)) {
    $srcFull  = $sourceIndex[$rel]
    $destFull = Join-Path $dest $rel
    $destDir  = Split-Path -Parent $destFull
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Force -Path $destDir | Out-Null
    }
    Copy-Item -Path $srcFull -Destination $destFull -Force
}

foreach ($rel in $toDelete) {
    $destFull = Join-Path $dest $rel
    Remove-Item -Path $destFull -Force
    # Remove the parent directory if it ended up empty (skill folder removed)
    $destDir = Split-Path -Parent $destFull
    if ((Test-Path $destDir) -and -not (Get-ChildItem -Path $destDir -Force)) {
        Remove-Item -Path $destDir -Force
    }
}

Write-Host ""
Write-Host "DONE: synced $totalChanges file(s)." -ForegroundColor Green
exit 0
