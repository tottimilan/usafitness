<#
.SYNOPSIS
    Onboard an existing project (not born from MASTERMIND) into the MASTERMIND 2.0 system. Installs the template shell (rules, skills, workflows, commands, hooks, scripts, root docs) without touching the project's code, git history, or custom content.

.DESCRIPTION
    Designed for projects that already have code, commits, README, tests, and possibly CI,
    but no MASTERMIND structure. Safe by construction:

    - Dry-run by default; pass -Apply to write.
    - Conflict handling: if a target file already exists AND differs from the template,
      the template version is written next to it as <file>.mastermind-proposal. The
      original is never overwritten. You merge manually.
    - Pre-existing .cursor/rules/ in the target are RELOCATED (not deleted) to
      .cursor/rules-backup-YYYYMMDD-HHMMSS/ before installing MASTERMIND rules. Use
      -KeepExistingRules to disable and treat them as conflicts instead.
    - Stack auto-detection from lockfiles pre-fills .cursor/rules/02-tech-stack.mdc
      if the target does not already have one.
    - You pick the initial phase (Idea / Discovery / Definition / MVP / Iteration / Launch),
      and the script writes memory/02-current-state.md + memory/13-phase-history.md
      coherently.
    - Never touches src/, app/, tests/, lockfiles, .git/, node_modules/, dist/, .next/,
      .taskmaster/ (runtime), .env*, or any file outside the whitelist.

    Exit codes:
      0 - in-sync or apply succeeded
      1 - drift/conflicts detected in dry-run, user aborted, or proposals still pending
      2 - BLOCK (bad args, template missing, running inside the template, git repo missing)

.PARAMETER Template
    (Required) Absolute path to the MASTERMIND 2.0 template repo on disk.

.PARAMETER Phase
    (Required in -Apply; optional in dry-run) Initial phase for the project.
    One of: Idea, Discovery, Definition, MVP, Iteration, Launch.

.PARAMETER Apply
    Actually write changes.

.PARAMETER Force
    Skip the confirmation prompt (only relevant with -Apply).

.PARAMETER KeepExistingRules
    Do not relocate pre-existing .cursor/rules/ to a backup. Instead, treat them
    as conflicts and emit .mastermind-proposal files. Off by default.

.PARAMETER IncludeMcpConfig
    Include claude-side/mcp-config.json in the sync (off by default — projects
    may have customized it).

.EXAMPLE
    # Run from INSIDE the target project:
    pwsh -File scripts/onboard-existing-project.ps1 -Template "C:\path\to\MASTERMIND-2.0" -Phase MVP
    # Dry-run: shows what would be created, relocated, or emit as .mastermind-proposal.

.EXAMPLE
    pwsh -File scripts/onboard-existing-project.ps1 -Template "C:\path\to\template" -Phase MVP -Apply
    # Applies: writes MASTERMIND shell, relocates existing rules to backup, pre-fills stack.

.EXAMPLE
    pwsh -File scripts/onboard-existing-project.ps1 -Template "C:\path\to\template" -Phase Iteration -Apply -KeepExistingRules -Force
    # Keeps custom rules as .mastermind-proposal; skips prompt.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$Template,
    [ValidateSet('Idea','Discovery','Definition','MVP','Iteration','Launch')]
    [string]$Phase,
    [switch]$Apply,
    [switch]$Force,
    [switch]$KeepExistingRules,
    [switch]$IncludeMcpConfig
)

$ErrorActionPreference = 'Stop'

try {
    $templateRoot = (Resolve-Path -LiteralPath $Template -ErrorAction Stop).Path
} catch {
    Write-Error "Template path not found: $Template"
    exit 2
}

$projectRoot = (Get-Location).Path

if ($templateRoot -eq $projectRoot) {
    Write-Error "Refusing to onboard: current directory IS the template."
    exit 2
}
if (-not (Test-Path (Join-Path $templateRoot 'CLAUDE.md'))) {
    Write-Error "Template does not contain CLAUDE.md. Is -Template correct?"
    exit 2
}
$claudeContent = Get-Content (Join-Path $templateRoot 'CLAUDE.md') -Raw -ErrorAction SilentlyContinue
if ($claudeContent -notmatch 'MASTERMIND') {
    Write-Warning "Template's CLAUDE.md does not mention MASTERMIND. Continuing."
}
if (-not (Test-Path (Join-Path $projectRoot '.git'))) {
    Write-Warning "Target is not a git repository. Onboarding will still work, but you lose rollback via git reset."
}
if ($Apply -and [string]::IsNullOrWhiteSpace($Phase)) {
    Write-Error "-Phase is required when using -Apply. Choose: Idea, Discovery, Definition, MVP, Iteration, Launch."
    exit 2
}

$ts = Get-Date -Format 'yyyyMMdd-HHmmss'

Write-Host ""
Write-Host "=== onboard-existing-project ==="
Write-Host "Template: $templateRoot"
Write-Host "Project:  $projectRoot"
Write-Host "Mode:     $(if ($Apply) { 'APPLY (writes + .mastermind-proposal for conflicts)' } else { 'DRY-RUN (read-only)' })"
if ($Phase) { Write-Host "Phase:    $Phase (will be set)" }
Write-Host "Rules:    $(if ($KeepExistingRules) { 'KEEP existing as conflicts' } else { 'RELOCATE existing to backup' })"
Write-Host ""

# --- Whitelist (template side) --------------------------------------------------
$whitelistGlobs = @(
    'CLAUDE.md','AGENTS.md','README.md','OPERATING-GUIDE.md','COMMANDS.md',
    '.gitignore','.env.example','phase-criteria.json',
    '.cursor/rules/*.mdc',
    '.cursor/rules/references/*',
    '.cursor/skills/**/*',
    '.cursor/hooks/*.md',
    '.claude/CLAUDE.md',
    '.claude/skills/**/*',
    '.claude/hooks/*.md',
    '.claude/workflows/**/*',
    '.claude/commands/**/*',
    'scripts/*.ps1',
    'scripts/*.sh',
    'scripts/git-hooks/pre-commit',
    'scripts/git-hooks/pre-push',
    'scripts/git-hooks/README.md',
    'memory/*.md',
    'claude-side/mcp-config.json'
)

# --- Blacklist (defense in depth) -----------------------------------------------
$blacklistPrefixes = @('.git/','.git\','node_modules/','node_modules\','dist/','dist\','.next/','.next\','claude-side/prompts/','claude-side/prompts\','.taskmaster/','.taskmaster\','.cursor/plans/','.cursor/plans\','docs/','docs\')
$blacklistBasenames = @('.env','.env.local')

function Test-Blacklisted {
    param([string]$RelPath)
    $n = $RelPath -replace '\\', '/'
    foreach ($pre in $blacklistPrefixes) {
        $p = $pre -replace '\\','/'
        if ($n.StartsWith($p)) { return $true }
    }
    $b = Split-Path -Leaf $n
    if ($blacklistBasenames -contains $b) { return $true }
    if ($b -match '^\.env\.' -and $b -ne '.env.example' -and $b -ne '.env.sample') { return $true }
    if (-not $IncludeMcpConfig -and $n -eq 'claude-side/mcp-config.json') { return $true }
    return $false
}

# --- Enumerate whitelisted files in template -----------------------------------
function Expand-Glob {
    param([string]$Root, [string]$Glob)
    $normGlob = $Glob -replace '/', '\'
    if ($normGlob -match '\\\*\*(\\|$)') {
        # Recursive pattern: everything before '**' is the base dir; recurse.
        # PowerShell's Get-ChildItem does NOT support '**' as a globstar; we expand manually.
        $baseDir = ($normGlob -split '\\\*\*', 2)[0].TrimEnd('\')
        $fullBase = Join-Path $Root $baseDir
        if (Test-Path -LiteralPath $fullBase -PathType Container) {
            return Get-ChildItem -LiteralPath $fullBase -File -Recurse -ErrorAction SilentlyContinue
        }
        return @()
    }
    $fullGlob = Join-Path $Root $normGlob
    return Get-ChildItem -Path $fullGlob -File -ErrorAction SilentlyContinue
}

function Get-TemplateFiles {
    $list = New-Object System.Collections.Generic.List[string]
    foreach ($g in $whitelistGlobs) {
        $items = Expand-Glob -Root $templateRoot -Glob $g
        foreach ($i in $items) {
            $rel = $i.FullName.Substring($templateRoot.Length).TrimStart('\','/') -replace '\\','/'
            if (-not (Test-Blacklisted -RelPath $rel)) { [void]$list.Add($rel) }
        }
    }
    return $list | Sort-Object -Unique
}

function Get-FileHashSafe { param([string]$Path) if (-not (Test-Path $Path)) { return $null } return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash }

# --- Stack auto-detection -------------------------------------------------------
function Detect-Stack {
    $targetStackFile = Join-Path $projectRoot '.cursor\rules\02-tech-stack.mdc'
    $templateStackFile = Join-Path $templateRoot '.cursor\rules\02-tech-stack.mdc'
    if (-not (Test-Path $templateStackFile)) { return $null }

    $pkg = Join-Path $projectRoot 'package.json'
    $stack = @{ framework = $null; language = $null; db = $null; payments = $null; hosting = $null }
    if (Test-Path $pkg) {
        try {
            $json = Get-Content $pkg -Raw | ConvertFrom-Json
            $deps = @{}
            if ($json.dependencies) { $json.dependencies.PSObject.Properties | ForEach-Object { $deps[$_.Name] = $_.Value } }
            if ($json.devDependencies) { $json.devDependencies.PSObject.Properties | ForEach-Object { $deps[$_.Name] = $_.Value } }
            # Framework detection priority: Expo > Next.js > Remix > Astro > Vite > React Native (sin Expo) > React > Vue > Svelte
            if ($deps.ContainsKey('expo')) { $stack.framework = "Expo SDK $($deps['expo']) + React Native (mobile)" }
            elseif ($deps.ContainsKey('next')) { $stack.framework = "Next.js $($deps['next'])" }
            elseif ($deps.ContainsKey('@remix-run/react') -or $deps.ContainsKey('@remix-run/node')) { $stack.framework = "Remix" }
            elseif ($deps.ContainsKey('astro')) { $stack.framework = "Astro $($deps['astro'])" }
            elseif ($deps.ContainsKey('vite')) { $stack.framework = "Vite $($deps['vite'])" }
            elseif ($deps.ContainsKey('react-native')) { $stack.framework = "React Native $($deps['react-native']) (sin Expo)" }
            elseif ($deps.ContainsKey('react')) { $stack.framework = "React $($deps['react']) (sin metaframework)" }
            elseif ($deps.ContainsKey('vue')) { $stack.framework = "Vue $($deps['vue'])" }
            elseif ($deps.ContainsKey('svelte')) { $stack.framework = "Svelte $($deps['svelte'])" }
            if ($deps.ContainsKey('typescript')) { $stack.language = "TypeScript $($deps['typescript']) (strict mode)" } else { $stack.language = "JavaScript" }
            if ($deps.ContainsKey('@supabase/supabase-js')) { $stack.db = "Supabase / Postgres" }
            elseif ($deps.ContainsKey('@prisma/client')) { $stack.db = "Postgres + Prisma" }
            elseif ($deps.ContainsKey('drizzle-orm')) { $stack.db = "Postgres + Drizzle" }
            elseif ($deps.ContainsKey('mongoose') -or $deps.ContainsKey('mongodb')) { $stack.db = "MongoDB" }
            # Payments detection: RevenueCat (mobile IAP) takes priority over Stripe in mobile contexts
            if ($deps.ContainsKey('react-native-purchases')) { $stack.payments = "RevenueCat (Apple IAP + Google Play Billing)" }
            elseif ($deps.ContainsKey('stripe') -or $deps.ContainsKey('@stripe/stripe-js')) { $stack.payments = "Stripe" }
            elseif ($deps.ContainsKey('@paddle/paddle-js')) { $stack.payments = "Paddle" }
            if (Test-Path (Join-Path $projectRoot 'vercel.json')) { $stack.hosting = "Vercel" }
            elseif (Test-Path (Join-Path $projectRoot 'eas.json')) { $stack.hosting = "EAS Build + App Store + Google Play" }
            elseif (Test-Path (Join-Path $projectRoot 'netlify.toml')) { $stack.hosting = "Netlify" }
            elseif (Test-Path (Join-Path $projectRoot 'wrangler.toml')) { $stack.hosting = "Cloudflare Workers/Pages" }
            elseif (Test-Path (Join-Path $projectRoot 'fly.toml')) { $stack.hosting = "Fly.io" }
            elseif (Test-Path (Join-Path $projectRoot 'railway.json')) { $stack.hosting = "Railway" }
        } catch {}
    }
    if (-not $stack.framework -and (Test-Path (Join-Path $projectRoot 'pyproject.toml'))) { $stack.framework = "Python (pyproject.toml detected)"; $stack.language = "Python" }
    if (-not $stack.framework -and (Test-Path (Join-Path $projectRoot 'Cargo.toml'))) { $stack.framework = "Rust"; $stack.language = "Rust" }
    return $stack
}

function Render-TechStack {
    param([hashtable]$Stack)
    $src = Join-Path $templateRoot '.cursor\rules\02-tech-stack.mdc'
    $raw = Get-Content $src -Raw
    if (-not $Stack) { return $raw }
    $fw  = if ($Stack.framework)  { $Stack.framework }  else { '_TBD_' }
    $lang = if ($Stack.language)   { $Stack.language }   else { '_TBD_' }
    $db   = if ($Stack.db)         { $Stack.db }          else { '_TBD_' }
    $pay  = if ($Stack.payments)   { $Stack.payments }    else { '_TBD_' }
    $hostingVal = if ($Stack.hosting) { $Stack.hosting } else { '_TBD_' }
    $out = $raw -replace '(?m)^- \*\*Framework:\*\* _TBD_', "- **Framework:** $fw"
    $out = $out -replace '(?m)^- \*\*Language:\*\* _TBD_', "- **Language:** $lang"
    $out = $out -replace '(?m)^- \*\*Database:\*\* _TBD_', "- **Database:** $db"
    $out = $out -replace '(?m)^- \*\*Payments:\*\* _TBD_', "- **Payments:** $pay"
    $out = $out -replace '(?m)^- \*\*Hosting:\*\* _TBD_', "- **Hosting:** $hostingVal"
    $out += "`r`n`r`n<!-- Auto-detected on $ts by onboard-existing-project. Review and adjust. -->`r`n"
    return $out
}

# --- Plan the diff --------------------------------------------------------------
$files = @(Get-TemplateFiles)
if ($files.Count -eq 0) { Write-Error "No whitelisted files in template."; exit 2 }

$toCreate   = New-Object System.Collections.Generic.List[string]
$toProposal = New-Object System.Collections.Generic.List[string]
$unchanged  = 0
$protected  = New-Object System.Collections.Generic.List[string]

foreach ($rel in $files) {
    $src = Join-Path $templateRoot ($rel -replace '/','\')
    $dst = Join-Path $projectRoot ($rel -replace '/','\')
    if (Test-Blacklisted -RelPath $rel) { [void]$protected.Add($rel); continue }
    if (-not (Test-Path $dst)) {
        [void]$toCreate.Add($rel)
    } else {
        $sh = Get-FileHashSafe $src
        $dh = Get-FileHashSafe $dst
        if ($sh -eq $dh) { $unchanged++ } else { [void]$toProposal.Add($rel) }
    }
}

# Pre-existing rules in target
$existingRulesDir = Join-Path $projectRoot '.cursor\rules'
$hasExistingRules = (Test-Path $existingRulesDir) -and (Get-ChildItem -Path $existingRulesDir -File -ErrorAction SilentlyContinue).Count -gt 0

# Stack detection
$detectedStack = Detect-Stack
$stackFileRel = '.cursor/rules/02-tech-stack.mdc'
$stackTargetPath = Join-Path $projectRoot ($stackFileRel -replace '/','\')
$stackWillBePrefilled = $false
if ($detectedStack -and -not (Test-Path $stackTargetPath)) {
    $stackWillBePrefilled = $true
    if (-not $toCreate.Contains($stackFileRel)) {
        # already handled above if the file is in create list
    }
}

# --- Report --------------------------------------------------------------------
Write-Host "Template files whitelisted: $($files.Count)"
Write-Host ""
if ($toCreate.Count -gt 0) {
    Write-Host "NEW ($($toCreate.Count)) - will be created:" -ForegroundColor Green
    $toCreate | ForEach-Object { Write-Host "  + $_" }
    Write-Host ""
}
if ($toProposal.Count -gt 0) {
    Write-Host "CONFLICTS ($($toProposal.Count)) - will be written as <file>.mastermind-proposal:" -ForegroundColor Yellow
    $toProposal | ForEach-Object { Write-Host "  ! $_" }
    Write-Host ""
}
if ($hasExistingRules -and -not $KeepExistingRules) {
    Write-Host "PRE-EXISTING RULES in target .cursor/rules/ detected." -ForegroundColor Yellow
    Write-Host "  Action: relocate to .cursor/rules-backup-$ts/ before installing MASTERMIND rules."
    Write-Host ""
}
if ($detectedStack) {
    $parts = @()
    if ($detectedStack.framework) { $parts += "framework=$($detectedStack.framework)" }
    if ($detectedStack.language)   { $parts += "lang=$($detectedStack.language)" }
    if ($detectedStack.db)         { $parts += "db=$($detectedStack.db)" }
    if ($detectedStack.payments)   { $parts += "payments=$($detectedStack.payments)" }
    if ($detectedStack.hosting)    { $parts += "hosting=$($detectedStack.hosting)" }
    if ($parts.Count -gt 0) {
        Write-Host "STACK auto-detected: $($parts -join ', ')"
        if ($stackWillBePrefilled) { Write-Host "  Will pre-fill .cursor/rules/02-tech-stack.mdc." }
        Write-Host ""
    }
}
if ($protected.Count -gt 0) {
    Write-Host "PROTECTED ($($protected.Count)) - never touched (template contains these but they'd shadow project data):"
    $protected | Select-Object -First 8 | ForEach-Object { Write-Host "  p $_" }
    if ($protected.Count -gt 8) { Write-Host "  ... and $($protected.Count - 8) more." }
    Write-Host ""
}
Write-Host "Unchanged: $unchanged"

$hasWork = ($toCreate.Count + $toProposal.Count) -gt 0 -or ($hasExistingRules -and -not $KeepExistingRules)
if (-not $hasWork) {
    Write-Host ""
    Write-Host "OK: project already has the full MASTERMIND shell. Nothing to install." -ForegroundColor Green
    exit 0
}

# --- Dry-run exit --------------------------------------------------------------
if (-not $Apply) {
    Write-Host ""
    Write-Host "DRIFT DETECTED. Re-run with -Apply -Phase <phase> to install." -ForegroundColor Yellow
    Write-Host "Before applying: close Cursor/Claude on this project and commit pending work."
    exit 1
}

# --- Confirm -------------------------------------------------------------------
if (-not $Force) {
    Write-Host ""
    $summary = "Apply changes: $($toCreate.Count) new, $($toProposal.Count) proposals, rules-relocate=$(!$KeepExistingRules -and $hasExistingRules), phase=$Phase. Proceed? (type 'yes')"
    $answer = Read-Host $summary
    if ($answer -ne 'yes') { Write-Host "Aborted by user." -ForegroundColor Yellow; exit 1 }
}

# --- Apply: relocate existing rules if requested -------------------------------
if ($hasExistingRules -and -not $KeepExistingRules) {
    $backupDir = Join-Path $projectRoot ".cursor\rules-backup-$ts"
    Move-Item -Path $existingRulesDir -Destination $backupDir -Force
    New-Item -ItemType Directory -Force -Path $existingRulesDir | Out-Null
    Write-Host "Relocated existing rules to .cursor\rules-backup-$ts\" -ForegroundColor DarkYellow
}

# --- Apply: create + proposals -------------------------------------------------
$created = 0; $proposals = 0
foreach ($rel in $toCreate) {
    $src = Join-Path $templateRoot ($rel -replace '/','\')
    $dst = Join-Path $projectRoot ($rel -replace '/','\')
    $dstDir = Split-Path -Parent $dst
    if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Force -Path $dstDir | Out-Null }
    if ($rel -eq $stackFileRel -and $detectedStack) {
        (Render-TechStack -Stack $detectedStack) | Set-Content -LiteralPath $dst -Encoding UTF8
    } else {
        Copy-Item -LiteralPath $src -Destination $dst -Force
    }
    $created++
}
foreach ($rel in $toProposal) {
    $src = Join-Path $templateRoot ($rel -replace '/','\')
    $dst = Join-Path $projectRoot ($rel -replace '/','\')
    Copy-Item -LiteralPath $src -Destination "$dst.mastermind-proposal" -Force
    $proposals++
}

# --- Apply: phase bootstrap ---------------------------------------------------
$stateFile = Join-Path $projectRoot 'memory\02-current-state.md'
$historyFile = Join-Path $projectRoot 'memory\13-phase-history.md'
if (Test-Path $stateFile) {
    $stateContent = Get-Content $stateFile -Raw
    $stateContent = $stateContent -replace '(?m)^\*\*Phase:\*\* Idea \| Discovery \| Definition \| MVP \| Iteration \| Launch', "**Phase:** $Phase"
    Set-Content -LiteralPath $stateFile -Value $stateContent -Encoding UTF8
}
if (Test-Path $historyFile) {
    $today = Get-Date -Format 'yyyy-MM-dd'
    $historyContent = Get-Content $historyFile -Raw
    $historyContent = $historyContent -replace '(?m)^\*\*Phase:\*\* Idea \| Discovery \| Definition \| MVP \| Iteration \| Launch', "**Phase:** $Phase"
    $historyContent = $historyContent -replace '(?m)^\*\*Since:\*\* YYYY-MM-DD', "**Since:** $today"
    $entry = @"

### $today - Onboarded existing project into MASTERMIND at phase $Phase
- **Decided by:** User + <Model>
- **Trigger:** Existing codebase incorporated into MASTERMIND 2.0 via scripts/onboard-existing-project.
- **Entry criteria met:**
  - [x] Code exists in the repo (phase >= Idea was already the case).
  - [x] MASTERMIND shell installed (rules, skills, workflows, commands, hooks, scripts, memory skeleton).
  - [ ] Retroactive documentation of memory/ is the next step (run retroactive-documenter skill or /mm-audit on the codebase).
- **Artifacts promoted:** none yet; onboarding installs the shell, retroactive audit populates memory/.
- **Confidence at entry:** Medium (phase picked by user during onboarding; confirm with /mm-gate after retroactive audit).
- **Expected duration in new phase:** depends on where the project actually is.
- **Success metric for this phase:** to be set once memory/00-project-brief.md is filled.
- **Link to gate review:** pending first /mm-gate run.
"@
    # Insert entry after "### Entries" or after "_No transitions yet." depending on state
    if ($historyContent -match '_No transitions yet\. The project starts at `Idea` by default when the template is cloned\.') {
        $historyContent = $historyContent -replace '(_No transitions yet\..*?cloned\.)', ('$1' + [Environment]::NewLine + $entry)
    } else {
        $historyContent = $historyContent -replace '(## Transitions\s*\n\s*\> Newest first\. Each transition = one entry\. Use the template below\.)', ('$1' + [Environment]::NewLine + $entry)
    }
    Set-Content -LiteralPath $historyFile -Value $historyContent -Encoding UTF8
}

Write-Host ""
Write-Host "DONE" -ForegroundColor Green
Write-Host "  Created:    $created"
Write-Host "  Proposals:  $proposals  (<file>.mastermind-proposal)"
Write-Host "  Phase set:  $Phase"
Write-Host "  Timestamp:  $ts"
Write-Host ""
Write-Host "NEXT STEPS (order matters):" -ForegroundColor Cyan
Write-Host "  1. git status && git diff  (review installed shell)"
Write-Host "  2. If there are *.mastermind-proposal files, merge or delete each:"
Write-Host "     - Keep the project file and delete the .mastermind-proposal, OR"
Write-Host "     - Adopt the MASTERMIND version (rename proposal to overwrite the original)."
Write-Host "  3. git add . && git commit -m 'chore: onboard existing project into MASTERMIND'"
Write-Host "  4. Reload Cursor window and restart Claude Desktop/Code."
Write-Host "  5. Run the onboarding workflow to retroactively populate memory/:"
Write-Host "     In Cursor/Claude chat: 'Run workflow .claude/workflows/06-onboard-existing-project.md from phase 4 onward'"
Write-Host "     Or use the slash command /mm-onboard"
Write-Host "  6. After memory/ is populated, run /mm-gate $Phase to formally confirm the phase."
if ($hasExistingRules -and -not $KeepExistingRules) {
    Write-Host ""
    Write-Host "Your previous .cursor/rules/ are preserved at .cursor/rules-backup-$ts/"
    Write-Host "Review them and, if any rule is still useful, merge it manually into the MASTERMIND rule files."
}
Write-Host ""
exit 0
