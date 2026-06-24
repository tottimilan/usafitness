<#
.SYNOPSIS
    Export memory/14-design-system.md into a portable DESIGN.md at the project root. DESIGN.md is the cross-tool standard format (9 sections) that Claude Design, Google Stitch, Cursor, v0, and Claude Code all read.

.DESCRIPTION
    memory/14 is the per-project source of truth inside MASTERMIND. DESIGN.md is its
    exported, portable twin in the format external tools expect. This script:

    1. Reads memory/14-design-system.md (stops if missing or still fully placeholder).
    2. Extracts: platform, tokens (colors, typography, spacing, motion),
       likes / anti-patterns, patterns, references, installed components.
    3. Scaffolds DESIGN.md at the project root with 9 canonical sections:
         1. Visual Theme & Atmosphere
         2. Color Palette & Roles
         3. Typography Rules
         4. Component Stylings
         5. Layout Principles
         6. Depth & Elevation
         7. Do's and Don'ts
         8. Responsive Behavior
         9. Agent Prompt Guide
    4. Backs up any existing DESIGN.md to .mastermind-backups/design-md-<ts>/ before overwriting.

    memory/14 stays canonical. Never edit DESIGN.md manually — changes get wiped on next
    export. Edit memory/14, then re-run this script.

.PARAMETER Apply
    Actually write DESIGN.md. Without -Apply, only prints what it would do (dry-run).

.PARAMETER Force
    Skip confirmation prompt. Only relevant with -Apply.

.EXAMPLE
    pwsh -File scripts/export-design-md.ps1
    # Dry-run: prints the first 30 lines of what DESIGN.md would contain.

.EXAMPLE
    pwsh -File scripts/export-design-md.ps1 -Apply
    # Writes DESIGN.md, backs up any existing version.
#>
[CmdletBinding()]
param(
    [switch]$Apply,
    [switch]$Force
)

$ErrorActionPreference = 'Stop'
$root = (Get-Location).Path
$mem14 = Join-Path $root 'memory\14-design-system.md'
$designMd = Join-Path $root 'DESIGN.md'

function Write-Section([string]$title) {
    Write-Host ""
    Write-Host "=== $title ===" -ForegroundColor Cyan
}

# --- Preconditions -----------------------------------------------------------
Write-Section "Preconditions"
if (-not (Test-Path $mem14)) {
    Write-Host "  BLOCKED: memory/14-design-system.md not found. Is this a MASTERMIND project?" -ForegroundColor Red
    exit 2
}
$m14 = Get-Content $mem14 -Raw
$placeholderCount = ([regex]::Matches($m14, '_TBD_')).Count
$totalFieldCount = 30  # approximate count of fields in the skeleton
$filledPct = [Math]::Round(100 * (1 - [Math]::Min(1.0, $placeholderCount / $totalFieldCount)))
Write-Host "  memory/14 found ($([int]((Get-Item $mem14).Length / 1024)) KB; ~$filledPct% filled, $placeholderCount placeholders remain)."

if ($filledPct -lt 30) {
    Write-Host ""
    Write-Host "  WARNING: memory/14 is mostly placeholders. The exported DESIGN.md will inherit that emptiness." -ForegroundColor Yellow
    Write-Host "  Recommended: fill at least Project identity + Tokens + Platform before exporting." -ForegroundColor Yellow
    Write-Host ""
    if ($Apply -and -not $Force) {
        $ans = Read-Host "Continue anyway? (type 'yes')"
        if ($ans -ne 'yes') { Write-Host "Aborted." -ForegroundColor Yellow; exit 1 }
    }
}

# --- Extract sections from memory/14 -----------------------------------------
function Get-Section {
    param([string]$Content, [string]$Header)
    # Match from "## Header" through the next "## " or EOF
    $pattern = "(?ms)^## \s*$([regex]::Escape($Header))\s*$.*?(?=^## |\Z)"
    $m = [regex]::Match($Content, $pattern)
    if ($m.Success) { return $m.Value.Trim() }
    return $null
}

$platformSection    = Get-Section -Content $m14 -Header 'Platform'
$identitySection    = Get-Section -Content $m14 -Header 'Project identity'
$tokensSection      = Get-Section -Content $m14 -Header 'Tokens'
$mobileSection      = Get-Section -Content $m14 -Header 'Mobile-specific (only fill if Platform = `mobile` or `cross`)'
$likesSection       = Get-Section -Content $m14 -Header 'What I like (visual preferences)'
$dislikesSection    = Get-Section -Content $m14 -Header "What I don't like (anti-patterns)"
$patternsSection    = Get-Section -Content $m14 -Header 'Patterns we use repeatedly'
$referencesSection  = Get-Section -Content $m14 -Header 'References / inspiration'
$installedSection   = Get-Section -Content $m14 -Header 'Installed components'

# Platform extraction
$platform = 'unspecified'
if ($m14 -match '(?im)^\s*-\s+\*\*Platform:\*\*\s+`?([a-z]+)`?') {
    $platform = $matches[1].ToLower()
}

$ts = Get-Date -Format 'yyyy-MM-dd HH:mm'
$projectName = 'Unnamed project'
if ($m14 -match '(?im)^\s*-\s+\*\*Name:\*\*\s+(.+)$') {
    $n = $matches[1].Trim()
    if ($n -and $n -ne '_TBD_') { $projectName = $n }
}

# --- Compose DESIGN.md -------------------------------------------------------
$designContent = @"
# DESIGN.md — $projectName

> **Exported from memory/14-design-system.md on $ts by scripts/export-design-md.ps1.**
> This file is the portable, cross-tool twin of MASTERMIND's per-project visual source
> of truth. Read by Claude Design, Google Stitch, Cursor, v0, Claude Code. DO NOT edit
> manually — it gets regenerated. Edit memory/14-design-system.md, then re-run the script.

**Platform:** ``$platform``

---

## 1. Visual Theme & Atmosphere

$(
if ($identitySection) { $identitySection -replace '## Project identity','' } else { '_TBD — fill memory/14 §Project identity._' }
)

---

## 2. Color Palette & Roles

$(
if ($tokensSection) {
    # Extract just Colors subsection
    $colorsMatch = [regex]::Match($tokensSection, '(?ms)^### Colors.*?(?=^### |\Z)')
    if ($colorsMatch.Success) { $colorsMatch.Value.Trim() } else { '_Colors subsection missing in memory/14 §Tokens._' }
} else { '_TBD — fill memory/14 §Tokens.Colors._' }
)

---

## 3. Typography Rules

$(
if ($tokensSection) {
    $typoMatch = [regex]::Match($tokensSection, '(?ms)^### Typography.*?(?=^### |\Z)')
    if ($typoMatch.Success) { $typoMatch.Value.Trim() } else { '_Typography subsection missing in memory/14 §Tokens._' }
} else { '_TBD — fill memory/14 §Tokens.Typography._' }
)

---

## 4. Component Stylings

Derived from:
- **Web track:** shadcn/ui components (copy-paste, Tailwind + Radix).
- **Mobile track:** react-native-reusables components (copy-paste, NativeWind + rn-primitives).

$(
if ($installedSection) { $installedSection -replace '## Installed components','' } else { '_No components installed yet. Run `npx shadcn@latest add <component>` and log additions in memory/14 §Installed components._' }
)

---

## 5. Layout Principles

$(
if ($tokensSection) {
    $spacingMatch = [regex]::Match($tokensSection, '(?ms)^### Spacing & geometry.*?(?=^### |\Z)')
    if ($spacingMatch.Success) { $spacingMatch.Value.Trim() } else { '_Spacing subsection missing._' }
} else { '_TBD._' }
)

$(
if ($patternsSection) { "`n$($patternsSection -replace '## Patterns we use repeatedly','### Reusable patterns')" } else { '' }
)

---

## 6. Depth & Elevation

$(
if ($tokensSection) {
    $motionMatch = [regex]::Match($tokensSection, '(?ms)^### Motion.*?(?=^### |\Z)')
    if ($motionMatch.Success) { $motionMatch.Value.Trim() } else { '_Motion subsection missing._' }
} else { '_TBD._' }
)

Shadow tokens and surface hierarchy: _TBD — describe shadow scale (sm / md / lg / xl) and when to use each._

---

## 7. Do's and Don'ts

$(
if ($likesSection) { $likesSection -replace '## What I like \(visual preferences\)','### Do''s' } else { '### Do''s' + "`n" + '_TBD._' }
)

$(
if ($dislikesSection) { $dislikesSection -replace "## What I don't like \(anti-patterns\)",'### Don''ts' } else { '### Don''ts' + "`n" + '_TBD._' }
)

---

## 8. Responsive Behavior

$(
if ($platform -eq 'mobile' -or $platform -eq 'cross') {
    if ($mobileSection) { $mobileSection -replace '## Mobile-specific.*$','### Mobile-specific' } else { '### Mobile-specific' + "`n" + '_TBD — fill memory/14 §Mobile-specific (safe-area, orientation, tab bar, touch targets)._' }
} else { '' }
)

$(
if ($platform -eq 'web' -or $platform -eq 'cross') {
    "### Web-specific`n`n- Breakpoints: Tailwind defaults (sm 640, md 768, lg 1024, xl 1280, 2xl 1536) unless memory/14 overrides.`n- Container widths: _TBD — pull from memory/14 §Tokens.Spacing._`n- Mobile-first by default (start with narrowest, adapt up)."
} else { '' }
)

---

## 9. Agent Prompt Guide

> Reusable prompts Claude / v0 / Stitch can embed when they need to stay on-brand.

### Base prompt (copy-paste into Claude Design / v0)

```
Stay strictly on-brand for $projectName.
Read DESIGN.md §1–8 before generating anything.
Platform: $platform.
Components must come from the Component Stylings table (§4). If a needed component isn't listed, add it explicitly to your plan — don't invent one silently.
Honor the Do's (§7) and never violate the Don'ts.
If you deviate from any section, call it out in a comment and explain why.
```

### Prompt extensions per task

- **New screen:** follow §5 Layout Principles and §8 Responsive Behavior.
- **New component:** place it in \`src/components/custom/\` with a reason noted in memory/14 §Custom components.
- **Token change:** STOP and ask the user to log a decision in memory/07-decisions-log.md + update memory/14 §Tokens before the code change.
- **Mobile screen:** wrap in SafeAreaView, use Expo Router, touch targets ≥ 44pt iOS / 48dp Android.

---

_Regenerated from memory/14-design-system.md. Edit memory/14, then run:_

\`\`\`
pwsh -File scripts/export-design-md.ps1 -Apply
\`\`\`

_last generated: $ts_
"@

# --- Plan --------------------------------------------------------------------
Write-Section "Plan"

$existingBytes = 0
if (Test-Path $designMd) { $existingBytes = (Get-Item $designMd).Length }

if ($existingBytes -eq 0) {
    Write-Host "  DESIGN.md does not exist yet -> will be CREATED."
} else {
    Write-Host "  DESIGN.md exists ($existingBytes bytes) -> will be BACKED UP then overwritten."
}
Write-Host "  Backup location (if applies): .mastermind-backups\design-md-$(Get-Date -Format 'yyyyMMdd-HHmmss')\DESIGN.md"
Write-Host ""
Write-Host "  Preview of exported content (first 25 lines):"
$designContent.Split("`n") | Select-Object -First 25 | ForEach-Object { Write-Host "    $_" }
Write-Host "    ..."
Write-Host ""

if (-not $Apply) {
    Write-Host "  DRY-RUN. Re-run with -Apply to write DESIGN.md." -ForegroundColor Yellow
    exit 1
}

# --- Backup + Write ----------------------------------------------------------
if ($existingBytes -gt 0) {
    $backupDir = Join-Path $root ".mastermind-backups\design-md-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
    Copy-Item -LiteralPath $designMd -Destination (Join-Path $backupDir 'DESIGN.md') -Force
    Write-Host "  Backed up existing DESIGN.md -> $backupDir\DESIGN.md"
}

Set-Content -LiteralPath $designMd -Value $designContent -Encoding UTF8

Write-Host ""
Write-Host "DONE" -ForegroundColor Green
Write-Host "  DESIGN.md written ($([int]((Get-Item $designMd).Length / 1024)) KB)"
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "  1. Commit DESIGN.md so other tools (and future you) can read it."
Write-Host "  2. Link DESIGN.md into Claude Design: claude.ai/design -> project -> Add assets -> upload DESIGN.md."
Write-Host "  3. Point Cursor / v0 / Stitch at this repo; they'll read DESIGN.md automatically."
Write-Host "  4. When memory/14 changes, re-run this script. DESIGN.md is regenerated."
Write-Host ""
exit 0
