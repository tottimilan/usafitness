<#
.SYNOPSIS
    Render the memory/13 §Phase definitions table from phase-criteria.json (the single source of truth).

.DESCRIPTION
    Reads phase-criteria.json and regenerates the table between the
    `<!-- BEGIN generated:phase-definitions -->` / `<!-- END generated:phase-definitions -->`
    markers in memory/13-phase-history.md.

    Edit phase-criteria.json, then run this script. Never edit the generated table by hand.

    Exit codes:
      0 = rendered (or, with -Check, already in sync)
      1 = with -Check: memory/13 is OUT OF SYNC with phase-criteria.json (regenerate)
      2 = error (source/target missing or malformed)

.PARAMETER Check
    Do not write. Compare the would-be output against the committed table and exit 1 on drift.
    Used by /mm-template-audit and CI.

.EXAMPLE
    pwsh -File scripts/render-phase-criteria.ps1
    pwsh -File scripts/render-phase-criteria.ps1 -Check
#>
[CmdletBinding()]
param(
    [switch]$Check
)

$ErrorActionPreference = 'Stop'

$repoRoot   = Resolve-Path (Join-Path $PSScriptRoot '..')
$sourceFile = Join-Path $repoRoot 'phase-criteria.json'
$targetFile = Join-Path $repoRoot 'memory\13-phase-history.md'

if (-not (Test-Path $sourceFile)) {
    Write-Host "ERROR: phase-criteria.json not found at repo root." -ForegroundColor Red
    exit 2
}
if (-not (Test-Path $targetFile)) {
    Write-Host "ERROR: memory/13-phase-history.md not found." -ForegroundColor Red
    exit 2
}

$data = Get-Content $sourceFile -Raw | ConvertFrom-Json

# Build the table from the JSON.
$rows = @()
$rows += '| Phase | Purpose | Typical artifacts produced |'
$rows += '|---|---|---|'
foreach ($p in $data.phases) {
    $name = "**$($p.name)**"
    if ($p.optional) { $name += ' *(UI projects only)*' }
    $artifacts = ($p.typical_artifacts -join ', ')
    $rows += "| $name | $($p.purpose) | $artifacts |"
}
$table = ($rows -join "`n")

$beginMarker = '<!-- BEGIN generated:phase-definitions (source: phase-criteria.json — do not edit by hand) -->'
$endMarker   = '<!-- END generated:phase-definitions -->'
$newBlock    = "$beginMarker`n$table`n$endMarker"

$content = Get-Content $targetFile -Raw
$pattern = '<!-- BEGIN generated:phase-definitions.*?-->.*?<!-- END generated:phase-definitions -->'
$rx = [regex]::new($pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)

if (-not $rx.IsMatch($content)) {
    Write-Host "ERROR: generation markers not found in memory/13-phase-history.md." -ForegroundColor Red
    exit 2
}

$updated = $rx.Replace($content, { param($m) $newBlock }, 1)

# Normalize CRLF so the comparison is line-ending agnostic.
$norm = { param($s) ($s -replace "`r`n", "`n") }
$isInSync = (& $norm $content) -eq (& $norm $updated)

if ($Check) {
    if ($isInSync) {
        Write-Host "OK: memory/13 §Phase definitions is in sync with phase-criteria.json." -ForegroundColor Green
        exit 0
    } else {
        Write-Host "DRIFT: memory/13 §Phase definitions does NOT match phase-criteria.json. Run scripts/render-phase-criteria.ps1." -ForegroundColor Yellow
        exit 1
    }
}

if ($isInSync) {
    Write-Host "No change: memory/13 §Phase definitions already current."
    exit 0
}

Set-Content -Path $targetFile -Value $updated -NoNewline
Write-Host "Rendered memory/13 §Phase definitions from phase-criteria.json ($($data.phases.Count) phases)." -ForegroundColor Green
exit 0
