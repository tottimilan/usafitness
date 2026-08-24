<#
.SYNOPSIS
    Install the shadcn/ui ecosystem into a MASTERMIND project — platform-aware. Auto-detects whether the target project is web (Next.js / Vite / Remix / Astro) or mobile (Expo + React Native), and adapts: same `npx shadcn init` CLI, different templates and registry (shadcn/ui on web, react-native-reusables / RNR on mobile).

.DESCRIPTION
    Run this INSIDE a target project (one that was born from MASTERMIND or onboarded via
    scripts/onboard-existing-project). It:

    1. Verifies this is a MASTERMIND project (memory/ + .cursor/rules/ present).
    2. Verifies package.json exists.
    3. Detects platform (or respects -Platform):
         * `expo` dependency present       -> mobile track (RNR + NativeWind + Expo flow)
         * `next` / `vite` / `react` only  -> web track (shadcn/ui + Tailwind)
         * unclear                          -> prompt user (if interactive) or abort
    4. Runs `npx shadcn@latest init` (interactive unless -Defaults). The CLI auto-detects
       Expo and uses the RNR registry underneath; on web it uses the standard shadcn registry.
    5. Registers the shadcn MCP server in .cursor/mcp.json AND .mcp.json (Claude Code).
    6. On mobile, also ensures NativeWind + class-variance-authority + clsx + tailwind-merge
       are installed (if `shadcn init` did not add them).
    7. Runs `npx skills add shadcn/ui` to install the official project-aware Skill.
    8. Offers to copy `.cursor/templates/CLAUDE.md.mobile.md` into the project root if
       platform = mobile (only if the existing CLAUDE.md is empty or minimal).
    9. Prints next-step guidance tuned for the detected platform.

    Safe by design:
      - Dry-run by default; pass -Apply to execute.
      - Never modifies src/ or existing components.
      - Merges into existing .cursor/mcp.json rather than overwriting (preserves other MCP servers).
      - Skips step 4 if components.json already exists (idempotent).

.PARAMETER Platform
    auto (default) | web | mobile | cross
    - auto: read memory/14-design-system.md §Platform, fall back to package.json inspection
    - web: force web track (shadcn/ui + Tailwind)
    - mobile: force mobile track (RNR + NativeWind + Expo)
    - cross: run both tracks in sequence (web first, then mobile). Requires both `next` AND `expo` to exist, or appropriate subdirectories.

.PARAMETER Apply
    Actually run the install. Without -Apply it only prints what it would do.

.PARAMETER Defaults
    Pass --defaults to `shadcn init`, skipping its interactive prompts.

.PARAMETER SkipSkill
    Skip `npx skills add shadcn/ui`.

.PARAMETER SkipMobileClaudeMd
    Do not offer to copy the mobile CLAUDE.md template (mobile track only).

.EXAMPLE
    pwsh -File scripts/install-shadcn-mcp.ps1
    # Dry-run inside the current project, platform auto-detected.

.EXAMPLE
    pwsh -File scripts/install-shadcn-mcp.ps1 -Platform mobile -Apply -Defaults
    # Force mobile track (RNR + NativeWind + Expo), non-interactive, fastest path.

.EXAMPLE
    pwsh -File scripts/install-shadcn-mcp.ps1 -Platform web -Apply
    # Force web track, interactive (pick style / base color).
#>
[CmdletBinding()]
param(
    [ValidateSet('auto','web','mobile','cross')][string]$Platform = 'auto',
    [switch]$Apply,
    [switch]$Defaults,
    [switch]$SkipSkill,
    [switch]$SkipMobileClaudeMd
)

$ErrorActionPreference = 'Stop'

$root = (Get-Location).Path

function Write-Section([string]$title) {
    Write-Host ""
    Write-Host "=== $title ===" -ForegroundColor Cyan
}

# --- Preconditions -----------------------------------------------------------
Write-Section "Preconditions"

$issues = @()
if (-not (Test-Path (Join-Path $root 'package.json'))) { $issues += "package.json not found. This script is for JS/TS projects." }
if (-not (Test-Path (Join-Path $root 'memory'))) { $issues += "memory/ not found. Run /mm-bootstrap (new) or scripts/onboard-existing-project (existing) first." }
if (-not (Test-Path (Join-Path $root '.cursor\rules'))) { $issues += ".cursor/rules/ not found. MASTERMIND shell missing." }

$hasNode = Get-Command node -ErrorAction SilentlyContinue
if (-not $hasNode) { $issues += "Node.js not found in PATH." }

if ($issues.Count -gt 0) {
    Write-Host "BLOCKED:" -ForegroundColor Red
    $issues | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    exit 2
}
Write-Host "  OK: MASTERMIND project, package.json present, Node.js available."

# --- Platform detection ------------------------------------------------------
Write-Section "Platform detection"

$detected = 'unknown'
$hasExpo = $false; $hasNext = $false; $hasReact = $false; $hasTS = $false
try {
    $pkgJson = Get-Content (Join-Path $root 'package.json') -Raw | ConvertFrom-Json
    $deps = @{}
    if ($pkgJson.dependencies) { $pkgJson.dependencies.PSObject.Properties | ForEach-Object { $deps[$_.Name] = $_.Value } }
    if ($pkgJson.devDependencies) { $pkgJson.devDependencies.PSObject.Properties | ForEach-Object { $deps[$_.Name] = $_.Value } }
    $hasExpo  = $deps.ContainsKey('expo') -or $deps.ContainsKey('react-native')
    $hasNext  = $deps.ContainsKey('next')
    $hasReact = $deps.ContainsKey('react')
    $hasTS    = $deps.ContainsKey('typescript')
    Write-Host "  package.json signals:"
    Write-Host "    expo/react-native : $hasExpo"
    Write-Host "    next.js           : $hasNext"
    Write-Host "    react             : $hasReact"
    Write-Host "    typescript        : $hasTS"
} catch {
    Write-Host "  WARN: could not parse package.json ($($_.Exception.Message))" -ForegroundColor Yellow
}

# Read Platform field from memory/14 if present
$memory14 = Join-Path $root 'memory\14-design-system.md'
$platformFromMemory = $null
if (Test-Path $memory14) {
    $m14Content = Get-Content $memory14 -Raw
    if ($m14Content -match '(?im)^\s*-\s+\*\*Platform:\*\*\s+`?([a-z]+)`?') {
        $val = $matches[1].ToLower()
        if ($val -in @('web','mobile','cross')) {
            $platformFromMemory = $val
            Write-Host "  memory/14 Platform field : $val"
        }
    }
}

# Resolve final platform
$finalPlatform = $Platform
if ($finalPlatform -eq 'auto') {
    if ($platformFromMemory) {
        $finalPlatform = $platformFromMemory
        Write-Host "  -> resolved from memory/14: $finalPlatform" -ForegroundColor Green
    } elseif ($hasExpo -and $hasNext) {
        $finalPlatform = 'cross'
        Write-Host "  -> auto-detected: cross (both expo AND next present)" -ForegroundColor Green
    } elseif ($hasExpo) {
        $finalPlatform = 'mobile'
        Write-Host "  -> auto-detected: mobile (expo present)" -ForegroundColor Green
    } elseif ($hasNext -or $hasReact) {
        $finalPlatform = 'web'
        Write-Host "  -> auto-detected: web (next or react)" -ForegroundColor Green
    } else {
        Write-Host "  -> could not auto-detect platform. Re-run with -Platform <web|mobile|cross>." -ForegroundColor Red
        exit 2
    }
}
Write-Host "  Final platform: $finalPlatform"

# --- Plan --------------------------------------------------------------------
Write-Section "Plan"

$steps = @()
$hasComponentsJson = Test-Path (Join-Path $root 'components.json')

if ($hasComponentsJson) {
    Write-Host "  [SKIP] shadcn already initialized (components.json exists)."
} else {
    $initCmd = if ($Defaults) { "npx shadcn@latest init --defaults" } else { "npx shadcn@latest init" }
    if ($finalPlatform -in @('mobile','cross')) {
        $steps += "1. $initCmd  (Expo auto-detected; uses RNR registry under the hood)"
    } else {
        $steps += "1. $initCmd  (web track: standard shadcn/ui)"
    }
}

$cursorMcp = Join-Path $root '.cursor\mcp.json'
$claudeMcp = Join-Path $root '.mcp.json'
$cursorHasShadcn = $false; $claudeHasShadcn = $false
if (Test-Path $cursorMcp) {
    try { $c = Get-Content $cursorMcp -Raw | ConvertFrom-Json; if ($c.mcpServers.shadcn) { $cursorHasShadcn = $true } } catch {}
}
if (Test-Path $claudeMcp) {
    try { $c = Get-Content $claudeMcp -Raw | ConvertFrom-Json; if ($c.mcpServers.shadcn) { $claudeHasShadcn = $true } } catch {}
}
if ($cursorHasShadcn -and $claudeHasShadcn) {
    Write-Host "  [SKIP] shadcn MCP already registered in both .cursor/mcp.json and .mcp.json."
} else {
    $steps += "2. Register shadcn MCP server in .cursor/mcp.json (Cursor) + .mcp.json (Claude Code). Merge-safe."
}

if ($finalPlatform -in @('mobile','cross')) {
    $rnrDeps = @('nativewind','class-variance-authority','clsx','tailwind-merge','react-native-safe-area-context','react-native-reanimated','react-native-gesture-handler')
    $missingRnrDeps = @()
    foreach ($d in $rnrDeps) { if (-not $deps.ContainsKey($d)) { $missingRnrDeps += $d } }
    if ($missingRnrDeps.Count -gt 0) {
        $steps += "3. Install mobile deps: npx expo install $($missingRnrDeps -join ' ')"
    } else {
        Write-Host "  [SKIP] mobile deps already present (NativeWind, safe-area, Reanimated, Gesture Handler, CVA, clsx, tailwind-merge)."
    }
}

if (-not $SkipSkill) {
    $steps += "4. npx skills add shadcn/ui  (official project-aware Skill)"
} else {
    Write-Host "  [SKIP] official shadcn Skill (-SkipSkill given)."
}

$steps += "Optional: Add Code Intelligence MCP (tree-sitter/graph like jCodeMunch) to mcp.json for efficient code retrieval in audits/plans (see CLAUDE.md §Code Context Layer). Reduces full file reads dramatically."

if ($finalPlatform -in @('mobile','cross') -and -not $SkipMobileClaudeMd) {
    $projectClaude = Join-Path $root 'CLAUDE.md'
    $existingSize = if (Test-Path $projectClaude) { (Get-Item $projectClaude).Length } else { 0 }
    if ($existingSize -eq 0 -or $existingSize -lt 500) {
        $steps += "5. Offer to copy .cursor/templates/CLAUDE.md.mobile.md -> ./CLAUDE.md (existing CLAUDE.md is empty/minimal)"
    } else {
        Write-Host "  [SKIP] project already has a substantial CLAUDE.md ($existingSize bytes); not offering the mobile template. Review manually and merge if desired."
    }
}

if ($steps.Count -eq 0) {
    Write-Host "  Everything already installed. Nothing to do." -ForegroundColor Green
    exit 0
}

$steps | ForEach-Object { Write-Host "  $_" }

if (-not $Apply) {
    Write-Host ""
    Write-Host "DRY-RUN. Re-run with -Apply to execute." -ForegroundColor Yellow
    exit 1
}

# --- Execute -----------------------------------------------------------------
Write-Section "Executing"

if (-not $hasComponentsJson) {
    Write-Host "-> shadcn init (platform=$finalPlatform)..."
    $args = @('shadcn@latest','init')
    if ($Defaults) { $args += '--defaults' }
    & npx @args
    if ($LASTEXITCODE -ne 0) { Write-Host "shadcn init failed." -ForegroundColor Red; exit 1 }
}

# Register MCP (merge-safe)
function Add-ShadcnMcpServer([string]$Path) {
    $obj = [ordered]@{ mcpServers = [ordered]@{} }
    if (Test-Path $Path) {
        try {
            $raw = Get-Content $Path -Raw
            $existing = $raw | ConvertFrom-Json -AsHashtable
            if ($existing) {
                $obj = [ordered]@{}
                foreach ($k in $existing.Keys) { $obj[$k] = $existing[$k] }
                if (-not $obj.mcpServers) { $obj.mcpServers = [ordered]@{} }
            }
        } catch {
            Write-Host "  WARN: $Path exists but is not valid JSON; will write fresh." -ForegroundColor Yellow
            $obj = [ordered]@{ mcpServers = [ordered]@{} }
        }
    }
    if (-not $obj.mcpServers.shadcn) {
        $obj.mcpServers.shadcn = [ordered]@{
            command = 'npx'
            args = @('shadcn@latest','mcp')
        }
        $dir = Split-Path -Parent $Path
        if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
        ($obj | ConvertTo-Json -Depth 10) | Set-Content -LiteralPath $Path -Encoding UTF8
        Write-Host "  + $Path"
    } else {
        Write-Host "  [skip] shadcn already in $Path"
    }
}

Write-Host "-> Registering shadcn MCP..."
Add-ShadcnMcpServer -Path $cursorMcp
Add-ShadcnMcpServer -Path $claudeMcp

# Mobile: ensure deps
if ($finalPlatform -in @('mobile','cross')) {
    try {
        $pkgJsonLive = Get-Content (Join-Path $root 'package.json') -Raw | ConvertFrom-Json
        $liveDeps = @{}
        if ($pkgJsonLive.dependencies) { $pkgJsonLive.dependencies.PSObject.Properties | ForEach-Object { $liveDeps[$_.Name] = $_.Value } }
        if ($pkgJsonLive.devDependencies) { $pkgJsonLive.devDependencies.PSObject.Properties | ForEach-Object { $liveDeps[$_.Name] = $_.Value } }
        $rnrDeps = @('nativewind','class-variance-authority','clsx','tailwind-merge','react-native-safe-area-context','react-native-reanimated','react-native-gesture-handler')
        $missing = @()
        foreach ($d in $rnrDeps) { if (-not $liveDeps.ContainsKey($d)) { $missing += $d } }
        if ($missing.Count -gt 0) {
            Write-Host "-> Installing missing mobile deps: $($missing -join ', ')"
            & npx expo install @missing
            if ($LASTEXITCODE -ne 0) {
                Write-Host "  WARN: expo install failed; install manually: npx expo install $($missing -join ' ')" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "  WARN: could not re-inspect package.json after shadcn init; install mobile deps manually if missing." -ForegroundColor Yellow
    }
}

# Skill
if (-not $SkipSkill) {
    Write-Host "-> Installing official shadcn Skill..."
    & npx skills add shadcn/ui
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  WARN: `npx skills add shadcn/ui` failed. Install later by hand if needed." -ForegroundColor Yellow
    }
}

# Mobile CLAUDE.md
if ($finalPlatform -in @('mobile','cross') -and -not $SkipMobileClaudeMd) {
    $projectClaude = Join-Path $root 'CLAUDE.md'
    $existingSize = if (Test-Path $projectClaude) { (Get-Item $projectClaude).Length } else { 0 }
    if ($existingSize -eq 0 -or $existingSize -lt 500) {
        # Resolve template path via common ancestors. This script runs INSIDE target project,
        # so the MASTERMIND template sits somewhere else. Look up .cursor/templates/ both in
        # this project (copied via sync) and in any MASTERMIND template on common paths.
        $candidates = @(
            (Join-Path $root '.cursor\templates\CLAUDE.md.mobile.md')
        )
        $templateFound = $null
        foreach ($c in $candidates) {
            if (Test-Path $c) { $templateFound = $c; break }
        }
        if ($templateFound) {
            if ($existingSize -eq 0) {
                Copy-Item -LiteralPath $templateFound -Destination $projectClaude -Force
                Write-Host "  + CLAUDE.md (seeded from .cursor/templates/CLAUDE.md.mobile.md)" -ForegroundColor Green
            } else {
                $backupMobile = "$projectClaude.backup-mobile-template-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
                Copy-Item -LiteralPath $projectClaude -Destination $backupMobile
                Copy-Item -LiteralPath $templateFound -Destination $projectClaude -Force
                Write-Host "  ~ CLAUDE.md replaced with mobile template (backup at $backupMobile). Merge manually if needed." -ForegroundColor Yellow
            }
            Write-Host "    Edit CLAUDE.md to fill the [BRACKETED] values (project name, Expo SDK, orientations, etc.)."
        } else {
            Write-Host "  WARN: mobile CLAUDE.md template not found at .cursor/templates/CLAUDE.md.mobile.md. Run sync-from-template first to pull it." -ForegroundColor Yellow
        }
    }
}

# --- Done --------------------------------------------------------------------
Write-Section "Done"
Write-Host "  Platform : $finalPlatform" -ForegroundColor Green
Write-Host "  shadcn/ui installed, MCP registered, Skill installed." -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "  1. Reload Cursor / restart Claude Code so the MCP server attaches."
Write-Host "     Sanity: in Cursor settings -> shadcn MCP green dot. Claude Code: /mcp -> 'shadcn' Connected."
Write-Host "  2. Open memory/14-design-system.md. Fill Platform, Project identity, Tokens."
if ($finalPlatform -in @('mobile','cross')) {
    Write-Host "     Also fill the Mobile-specific section (safe-area, orientation, tab bar, platform differences)."
}
Write-Host "  3. Add baseline components via chat:"
if ($finalPlatform -in @('mobile','cross')) {
    Write-Host "     'Add button, card, input, dialog, tabs, and badge from shadcn (this is an Expo project).'"
    Write-Host "     The MCP picks the RNR registry automatically under the hood."
} else {
    Write-Host "     'Add button, card, input, dialog, and badge from shadcn.'"
}
Write-Host "  4. When you have a feature to prototype, run: /mm-design <feature-name>"
Write-Host "  5. Optional: export portable DESIGN.md once memory/14 is filled:"
Write-Host "     pwsh -File scripts/export-design-md.ps1"
Write-Host ""
exit 0
