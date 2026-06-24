<#
.SYNOPSIS
    Dry-run phase gate verification. Reads memory/02-current-state.md and memory/13-phase-history.md, checks expected artifacts for the current phase, reports gaps.

.DESCRIPTION
    This script does NOT transition the phase. It emits a PASS / GAPS / BLOCK verdict so you can run the `phase-gate-reviewer` skill with confidence (or fix gaps first). It is safe to run at any time; it only reads.

    Exit codes:
      0 = PASS (all expected artifacts present)
      1 = GAPS (some expected artifacts missing or stale)
      2 = BLOCK (current phase cannot be determined, or canonical definitions missing)

.PARAMETER NextPhase
    Optional. If provided, the script also checks the entry criteria of the named next phase.
    Example: -NextPhase MVP

.EXAMPLE
    pwsh -File scripts/phase-gate-check.ps1
    pwsh -File scripts/phase-gate-check.ps1 -NextPhase MVP
#>
[CmdletBinding()]
param(
    [ValidateSet('Idea','Discovery','Definition','Prototype','MVP','Iteration','Launch')]
    [string]$NextPhase
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$stateFile    = Join-Path $repoRoot 'memory\02-current-state.md'
$historyFile  = Join-Path $repoRoot 'memory\13-phase-history.md'
$criteriaFile = Join-Path $repoRoot 'phase-criteria.json'

if (-not (Test-Path $stateFile)) {
    Write-Host "BLOCK: memory/02-current-state.md is missing. Cannot determine current phase." -ForegroundColor Red
    exit 2
}
if (-not (Test-Path $historyFile)) {
    Write-Host "BLOCK: memory/13-phase-history.md is missing. Cannot read canonical phase definitions." -ForegroundColor Red
    exit 2
}
if (-not (Test-Path $criteriaFile)) {
    Write-Host "BLOCK: phase-criteria.json is missing. Cannot read canonical phase criteria." -ForegroundColor Red
    exit 2
}

# Infer current phase from memory/02 (line containing "Phase: X" with a concrete value)
$stateContent = Get-Content $stateFile -Raw
$match = [regex]::Match($stateContent, '(?im)^\*\*Phase:\*\*\s+(Idea|Discovery|Definition|Prototype|MVP|Iteration|Launch)')
if (-not $match.Success) {
    # Try alternate form: **Phase:** Idea | Discovery | ...  (unresolved placeholder)
    Write-Host "BLOCK: Could not detect a concrete current phase in memory/02-current-state.md." -ForegroundColor Red
    Write-Host "       The file must contain a line like '**Phase:** MVP' with ONE phase name." -ForegroundColor Red
    exit 2
}
$currentPhase = $match.Groups[1].Value

Write-Host ""
Write-Host "=== phase-gate-check ==="
Write-Host "Repo:         $repoRoot"
Write-Host "Current phase: $currentPhase"
if ($NextPhase) { Write-Host "Checking against target: $NextPhase" }
Write-Host ""

# Canonical expected artifacts per phase — read from the single source of truth.
$criteria = Get-Content $criteriaFile -Raw | ConvertFrom-Json
$expectedArtifacts = @{}
foreach ($p in $criteria.phases) {
    $expectedArtifacts[$p.name] = @($p.expected_artifact_paths)
}

function Test-ArtifactFresh {
    param(
        [string]$Path,
        [string]$PhaseEnteredDate
    )
    if (-not (Test-Path $Path)) { return [PSCustomObject]@{ Status='Missing'; Detail='not found' } }
    $info = Get-Item $Path
    if ($info.PSIsContainer) {
        $items = Get-ChildItem $Path -File -Recurse -ErrorAction SilentlyContinue
        if ($items.Count -eq 0) { return [PSCustomObject]@{ Status='Empty'; Detail='directory exists but has no files' } }
        return [PSCustomObject]@{ Status='OK'; Detail="directory with $($items.Count) file(s)" }
    }
    if ((Get-Item $Path).Length -lt 40) {
        return [PSCustomObject]@{ Status='Stub'; Detail='file too small - likely placeholder' }
    }
    return [PSCustomObject]@{ Status='OK'; Detail="last modified $($info.LastWriteTime.ToString('yyyy-MM-dd'))" }
}

function Show-PhaseArtifacts {
    param([string]$Phase, [string]$Heading)
    $artifacts = $expectedArtifacts[$Phase]
    if (-not $artifacts) {
        Write-Host "No expected artifacts declared for phase $Phase." -ForegroundColor Yellow
        return @()
    }
    Write-Host $Heading
    $gaps = @()
    foreach ($rel in $artifacts) {
        $full = Join-Path $repoRoot $rel
        $res = Test-ArtifactFresh -Path $full
        $symbol = if ($res.Status -eq 'OK') { '  OK ' } else { ' GAP ' }
        Write-Host "$symbol $rel  ->  $($res.Status) ($($res.Detail))"
        if ($res.Status -ne 'OK') { $gaps += "$rel ($($res.Status))" }
    }
    return $gaps
}

Write-Host "Current phase exit criteria ($currentPhase) - expected artifacts:"
$currentGaps = Show-PhaseArtifacts -Phase $currentPhase -Heading ""
Write-Host ""

$nextGaps = @()
if ($NextPhase) {
    Write-Host "Next phase entry criteria ($NextPhase) - expected artifacts:"
    $nextGaps = Show-PhaseArtifacts -Phase $NextPhase -Heading ""
    Write-Host ""
}

$totalGaps = @($currentGaps) + @($nextGaps)
if ($totalGaps.Count -eq 0) {
    Write-Host "PASS: all expected artifacts are present. Safe to run phase-gate-reviewer skill." -ForegroundColor Green
    exit 0
} else {
    Write-Host "GAPS ($($totalGaps.Count)) - run phase-gate-reviewer skill to analyze and propose remediation." -ForegroundColor Yellow
    $totalGaps | ForEach-Object { Write-Host "  - $_" }
    exit 1
}
