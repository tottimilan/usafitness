<#
.SYNOPSIS
    Safely sync template files (skills, rules, workflows, commands, hooks, scripts, root docs) from a MASTERMIND 2.0 template into the CURRENT project, without touching project-specific content (memory/, docs/, .cursor/plans/, .taskmaster/, .env*, .git/).

.DESCRIPTION
    Use this when your project was cloned from a MASTERMIND template at some point in the past and the template has evolved since then. Run from the root of the target project, pointing -Template to the up-to-date template repo on disk.

    Defaults to DRY-RUN: nothing is written. Pass -Apply to actually write, with automatic backups grouped in .mastermind-backups/sync-YYYYMMDD-HHMMSS/ (relative paths preserved inside). The backup folder is auto-added to .gitignore so it never pollutes commits.

    What gets synced (whitelist):
      Root docs         : CLAUDE.md, AGENTS.md, README.md, OPERATING-GUIDE.md, COMMANDS.md, .gitignore, .env.example, phase-criteria.json
      Rules             : .cursor/rules/*.mdc, .cursor/rules/references/*
      Skills (canon)    : .cursor/skills/**
      Hooks (cursor)    : .cursor/hooks/*.md
      Claude kernel     : .claude/CLAUDE.md
      Skills (mirror)   : .claude/skills/**
      Hooks (claude)    : .claude/hooks/*.md
      Workflows         : .claude/workflows/**
      Commands          : .claude/commands/**
      Scripts           : scripts/*.ps1, scripts/*.sh, scripts/git-hooks/**

    What gets PROTECTED (never touched; even with -Apply -Force):
      memory/**, docs/**, .cursor/plans/**, .taskmaster/**, .env*, claude-side/mcp-config.json,
      claude-side/prompts/**, .git/**, node_modules/**, dist/**, .next/**, any custom file not in the whitelist.

    Opt-in exception for memory/: pass -IncludeNewMemoryFiles to CREATE memory/*.md skeletons
    that exist in the template but not in the project. Existing memory files are still
    protected and NEVER overwritten — the flag only adds new slots.

    Reports:
      + new        : file doesn't exist in the project and will be created
      ~ updated    : file exists and differs; will be backed up and overwritten
      = unchanged  : file exists and is identical; nothing to do
      p protected  : file is in the blacklist and will NEVER be touched
      ! conflict   : project has a file that is in the whitelist path but with content the script can't safely merge (rare)

    Exit codes:
      0 - OK (dry-run: nothing to do, or apply: success)
      1 - Drift detected in dry-run mode (changes would be applied if -Apply)
      2 - BLOCK: bad arguments, template not found, or running from inside the template itself

.PARAMETER Template
    (Required) Absolute path to the MASTERMIND 2.0 template repo on disk.

.PARAMETER Apply
    Switch. If set, actually writes changes. Default is dry-run.

.PARAMETER Force
    Switch. Skip the interactive confirmation prompt before writing. Only relevant with -Apply.

.PARAMETER IncludeMcpConfig
    Switch. By default `claude-side/mcp-config.json` is NOT synced (projects often customize it with real tokens/servers). Set this to force it.

.PARAMETER IncludeNewMemoryFiles
    Switch. By default `memory/` is fully protected (never touched) so the script can never overwrite your project's decisions, session summaries, etc. With this flag, memory/*.md files that exist in the template but NOT in the project are CREATED (skeleton only). Existing memory files are still untouched. Use when the template has added a new memory slot (e.g. memory/14-design-system.md was introduced after your project was cloned) and you want to opt into it.

.EXAMPLE
    pwsh -File scripts/sync-from-template.ps1 -Template "C:\Users\me\Desktop\MASTERMIND TEMPLATE 2.0"
    # Dry-run: shows what would change.

.EXAMPLE
    pwsh -File scripts/sync-from-template.ps1 -Template "C:\templates\mm2" -Apply
    # Applies changes, prompts for confirmation.

.EXAMPLE
    pwsh -File scripts/sync-from-template.ps1 -Template "C:\templates\mm2" -Apply -Force -IncludeMcpConfig
    # Applies everything including mcp-config.json, no prompt.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$Template,
    [switch]$Apply,
    [switch]$Force,
    [switch]$IncludeMcpConfig,
    [switch]$IncludeNewMemoryFiles
)

$ErrorActionPreference = 'Stop'

# Resolve absolute paths
try {
    $templateRoot = (Resolve-Path -LiteralPath $Template -ErrorAction Stop).Path
} catch {
    Write-Error "Template path not found: $Template"
    exit 2
}
$projectRoot = (Get-Location).Path

if ($templateRoot -eq $projectRoot) {
    Write-Error "Refusing to sync: current directory IS the template. Run this from the target project."
    exit 2
}

# Sanity check: is it really a MASTERMIND template?
$templateClaude = Join-Path $templateRoot 'CLAUDE.md'
if (-not (Test-Path $templateClaude)) {
    Write-Error "Template does not contain CLAUDE.md. Is -Template pointing at a MASTERMIND 2.0 repo?"
    exit 2
}
$claudeContent = Get-Content $templateClaude -Raw -ErrorAction SilentlyContinue
if ($claudeContent -notmatch 'MASTERMIND') {
    Write-Warning "Template's CLAUDE.md does not mention MASTERMIND. Continuing, but check -Template is correct."
}

Write-Host ""
Write-Host "=== sync-from-template ==="
Write-Host "Template:  $templateRoot"
Write-Host "Project:   $projectRoot"
Write-Host "Mode:      $(if ($Apply) { 'APPLY (will write + backup)' } else { 'DRY-RUN (read-only)' })"
if ($Apply -and $Force) { Write-Host "Force:     yes (no confirmation prompt)" }
if ($IncludeMcpConfig) { Write-Host "MCP cfg:   INCLUDED in sync" }
if ($IncludeNewMemoryFiles) { Write-Host "Memory:    new skeletons will be CREATED if missing (existing files still protected)" }
Write-Host ""

# Whitelist: glob patterns relative to repo root. Order matters only for reporting.
$whitelistGlobs = @(
    'CLAUDE.md',
    'AGENTS.md',
    'README.md',
    'OPERATING-GUIDE.md',
    'COMMANDS.md',
    '.gitignore',
    '.env.example',
    'phase-criteria.json',
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
    'scripts/git-hooks/README.md'
)

if ($IncludeMcpConfig) {
    $whitelistGlobs += 'claude-side/mcp-config.json'
}
if ($IncludeNewMemoryFiles) {
    $whitelistGlobs += 'memory/*.md'
}

# Blacklist: paths under the project that MUST NOT be touched, checked even if the whitelist
# accidentally matches them. Defense in depth.
$blacklistPrefixes = @(
    'memory/',
    'memory\',
    'docs/',
    'docs\',
    '.cursor/plans/',
    '.cursor/plans\',
    '.taskmaster/',
    '.taskmaster\',
    '.git/',
    '.git\',
    'node_modules/',
    'node_modules\',
    'dist/',
    'dist\',
    '.next/',
    '.next\',
    'claude-side/prompts/',
    'claude-side/prompts\'
)

$blacklistFilenames = @(
    '.env',
    '.env.local'
)

# Blacklist check. The -IncludeNewMemoryFiles exception is enforced in the
# main diff loop (below): memory/*.md bypasses this check during opt-in, and
# the main loop decides create-if-missing / skip-if-exists.
function Test-Blacklisted {
    param([string]$RelPath)
    $normalized = $RelPath -replace '\\', '/'
    foreach ($pre in $blacklistPrefixes) {
        $normPre = $pre -replace '\\', '/'
        if ($normalized.StartsWith($normPre)) { return $true }
    }
    $basename = Split-Path -Leaf $normalized
    if ($blacklistFilenames -contains $basename) { return $true }
    if ($basename -match '^\.env\.' -and $basename -ne '.env.example' -and $basename -ne '.env.sample') {
        return $true
    }
    if (-not $IncludeMcpConfig -and $normalized -eq 'claude-side/mcp-config.json') { return $true }
    return $false
}

# Enumerate files in the template that match any whitelist glob
# Handles recursive '**' globs correctly (PowerShell's Get-ChildItem does NOT support
# '**' as a bash-style globstar; it has to be expanded manually).
function Expand-Glob {
    param([string]$Root, [string]$Glob)
    $normGlob = $Glob -replace '/', '\'
    if ($normGlob -match '\\\*\*(\\|$)') {
        # Recursive pattern: everything before the first '**' is the base dir; recurse.
        $baseDir = ($normGlob -split '\\\*\*', 2)[0].TrimEnd('\')
        $fullBase = Join-Path $Root $baseDir
        if (Test-Path -LiteralPath $fullBase -PathType Container) {
            return Get-ChildItem -LiteralPath $fullBase -File -Recurse -ErrorAction SilentlyContinue
        }
        return @()
    }
    # Non-recursive: pass through to Get-ChildItem, which supports single '*' wildcards.
    $fullGlob = Join-Path $Root $normGlob
    return Get-ChildItem -Path $fullGlob -File -ErrorAction SilentlyContinue
}

function Get-TemplateWhitelistedFiles {
    $results = New-Object System.Collections.Generic.List[string]
    foreach ($glob in $whitelistGlobs) {
        $items = Expand-Glob -Root $templateRoot -Glob $glob
        foreach ($m in $items) {
            $rel = $m.FullName.Substring($templateRoot.Length).TrimStart('\', '/') -replace '\\', '/'
            $isMemoryOptIn = $IncludeNewMemoryFiles -and ($rel -match '^memory/[^/]+\.md$')
            if ($isMemoryOptIn -or (-not (Test-Blacklisted -RelPath $rel))) {
                [void]$results.Add($rel)
            }
        }
    }
    return $results | Sort-Object -Unique
}

function Get-FileHashSafe {
    param([string]$Path)
    if (-not (Test-Path $Path)) { return $null }
    return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash
}

# Main diff
$files = @(Get-TemplateWhitelistedFiles)

if ($files.Count -eq 0) {
    Write-Error "No files matched the whitelist in the template. Is -Template correct?"
    exit 2
}

$toCreate   = New-Object System.Collections.Generic.List[string]
$toUpdate   = New-Object System.Collections.Generic.List[string]
$unchanged  = 0
$protected  = New-Object System.Collections.Generic.List[string]

foreach ($rel in $files) {
    $src = Join-Path $templateRoot ($rel -replace '/', '\')
    $dst = Join-Path $projectRoot ($rel -replace '/', '\')

    # For memory/*.md under -IncludeNewMemoryFiles: bypass blacklist; allow CREATE only, never update.
    $isMemoryOptIn = $IncludeNewMemoryFiles -and ($rel -match '^memory/[^/]+\.md$')

    if (-not $isMemoryOptIn -and (Test-Blacklisted -RelPath $rel)) {
        [void]$protected.Add($rel)
        continue
    }

    if (-not (Test-Path $dst)) {
        [void]$toCreate.Add($rel)
    } else {
        if ($isMemoryOptIn) {
            # Existing memory file: protected, even with -IncludeNewMemoryFiles. We only create new skeletons.
            [void]$protected.Add($rel)
            continue
        }
        $srcHash = Get-FileHashSafe -Path $src
        $dstHash = Get-FileHashSafe -Path $dst
        if ($srcHash -eq $dstHash) {
            $unchanged++
        } else {
            [void]$toUpdate.Add($rel)
        }
    }
}

# ---- Report ----
Write-Host "Whitelisted in template: $($files.Count) file(s)"
Write-Host ""
if ($toCreate.Count -gt 0) {
    Write-Host "NEW ($($toCreate.Count)):" -ForegroundColor Green
    $toCreate | ForEach-Object { Write-Host "  + $_" }
    Write-Host ""
}
if ($toUpdate.Count -gt 0) {
    Write-Host "CHANGED ($($toUpdate.Count)):" -ForegroundColor Yellow
    $toUpdate | ForEach-Object { Write-Host "  ~ $_" }
    Write-Host ""
}
if ($protected.Count -gt 0) {
    Write-Host "PROTECTED ($($protected.Count)):"
    $protected | ForEach-Object { Write-Host "  p $_" }
    Write-Host ""
}
Write-Host "Unchanged: $unchanged"

$total = $toCreate.Count + $toUpdate.Count

if ($total -eq 0) {
    Write-Host ""
    Write-Host "OK: project is already in sync with the template. Nothing to do." -ForegroundColor Green
    exit 0
}

# ---- Dry-run exits here with code 1 if drift ----
if (-not $Apply) {
    Write-Host ""
    Write-Host "DRIFT DETECTED ($total files would change). Re-run with -Apply to sync." -ForegroundColor Yellow
    Write-Host "Reminder: before applying, close Cursor/Claude on this project and commit/push pending changes."
    exit 1
}

# ---- Apply mode ----
if (-not $Force) {
    Write-Host ""
    $confirm = Read-Host "Apply $total change(s) with automatic backups? (type 'yes' to proceed)"
    if ($confirm -ne 'yes') {
        Write-Host "Aborted by user." -ForegroundColor Yellow
        exit 1
    }
}

$ts = Get-Date -Format 'yyyyMMdd-HHmmss'
$backedUp = 0
$created  = 0
$updated  = 0

# Grouped backup folder (single location, preserves relative paths inside).
$backupRoot = Join-Path $projectRoot ".mastermind-backups\sync-$ts"

# Ensure .mastermind-backups/ is in .gitignore (idempotent).
$gitignorePath = Join-Path $projectRoot '.gitignore'
$gitignoreEntry = '.mastermind-backups/'
if (Test-Path $gitignorePath) {
    $existing = Get-Content $gitignorePath -Raw -ErrorAction SilentlyContinue
    if ($existing -notmatch '(?m)^\.mastermind-backups/?\s*$') {
        Add-Content -Path $gitignorePath -Value "`n# --- Backups created by scripts/sync-from-template; safe to delete after review. ---`n$gitignoreEntry"
        Write-Host "  Added '$gitignoreEntry' to .gitignore." -ForegroundColor DarkGray
    }
} else {
    Set-Content -Path $gitignorePath -Value "# --- Backups created by scripts/sync-from-template; safe to delete after review. ---`n$gitignoreEntry`n"
    Write-Host "  Created .gitignore with '$gitignoreEntry'." -ForegroundColor DarkGray
}

foreach ($rel in ($toCreate + $toUpdate)) {
    $src = Join-Path $templateRoot ($rel -replace '/', '\')
    $dst = Join-Path $projectRoot ($rel -replace '/', '\')
    $dstDir = Split-Path -Parent $dst
    if (-not (Test-Path $dstDir)) {
        New-Item -ItemType Directory -Force -Path $dstDir | Out-Null
    }
    if (Test-Path $dst) {
        # Mirror the relative path inside the backup folder.
        $backupPath = Join-Path $backupRoot ($rel -replace '/', '\')
        $backupDir = Split-Path -Parent $backupPath
        if (-not (Test-Path $backupDir)) {
            New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
        }
        Copy-Item -LiteralPath $dst -Destination $backupPath -Force
        $backedUp++
    }
    Copy-Item -LiteralPath $src -Destination $dst -Force
    if ($toCreate.Contains($rel)) { $created++ } else { $updated++ }
}

Write-Host ""
Write-Host "DONE" -ForegroundColor Green
Write-Host "  Created: $created"
Write-Host "  Updated: $updated"
if ($backedUp -gt 0) {
    Write-Host "  Backups: $backedUp files in .mastermind-backups\sync-$ts\" -ForegroundColor DarkGray
} else {
    Write-Host "  Backups: 0 (no files were overwritten)" -ForegroundColor DarkGray
}
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "  1. Run: git diff   (review the real changes; .mastermind-backups/ is gitignored)"
Write-Host "  2. If something looks wrong, restore from .mastermind-backups\sync-$ts\<same-relative-path>."
Write-Host "     Example: cp .mastermind-backups\sync-$ts\CLAUDE.md CLAUDE.md"
Write-Host "  3. Commit: git add . && git commit -m 'chore: sync from MASTERMIND template'"
Write-Host "  4. Reload Cursor window (Ctrl+Shift+P -> Developer: Reload Window)."
Write-Host "  5. Restart Claude Desktop / Claude Code fully."
Write-Host "  6. Sanity check: 'List the active hooks in this repo' -> expect the latest set."
Write-Host "  7. If phase-criteria.json is new here, your memory/13-phase-history.md (protected) may"
Write-Host "     predate the generated markers. Wrap its '## Phase definitions' table with"
Write-Host "     '<!-- BEGIN generated:phase-definitions ... -->' / '<!-- END ... -->' (keep your"
Write-Host "     transitions history), then run: pwsh -File scripts/render-phase-criteria.ps1"
Write-Host "  8. Run: pwsh -File scripts/template-audit.ps1   (expect PASS)."
Write-Host ""
Write-Host "When confident, clean up this session's backups:" -ForegroundColor DarkGray
Write-Host "  Remove-Item -Recurse -Force .mastermind-backups\sync-$ts" -ForegroundColor DarkGray
Write-Host "Or wipe all old backup sessions at once:" -ForegroundColor DarkGray
Write-Host "  Remove-Item -Recurse -Force .mastermind-backups" -ForegroundColor DarkGray
exit 0
