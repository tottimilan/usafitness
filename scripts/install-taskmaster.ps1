<#
.SYNOPSIS
    Install the task-master-ai MCP for this project. Adds the server to .cursor/mcp.json (merged if present), writes a sample PRD at .taskmaster/docs/prd.md if none exists, and prints next-step commands.

.DESCRIPTION
    task-master-ai is a task management MCP (eyaltoledano/claude-task-master) that parses a PRD into dependency-aware tasks and drives execution via get_tasks / next_task / set_task_status / expand_task / update_subtask / parse_prd. See .cursor/rules/05-claude-mcp-integration.mdc for the full integration contract.

    This installer is idempotent:
      - If the task-master-ai entry already exists in .cursor/mcp.json, it is left alone.
      - If .taskmaster/ exists, its files are preserved.
      - Passes the TASK_MASTER_TOOLS env var in "core" mode by default (7 tools, ~5k tokens).

.PARAMETER Mode
    task-master tool-loading mode. One of: core (default, 7 tools), standard (15 tools), all (36 tools).

.PARAMETER ClaudeCodeAuth
    If set, does NOT add an Anthropic API key env var. task-master will use the Claude Code CLI OAuth (no key needed).
    If not set, the installer leaves a placeholder for ANTHROPIC_API_KEY which must be filled in via environment or .env.local.

.EXAMPLE
    pwsh -File scripts/install-taskmaster.ps1
    pwsh -File scripts/install-taskmaster.ps1 -Mode standard
    pwsh -File scripts/install-taskmaster.ps1 -ClaudeCodeAuth
#>
[CmdletBinding()]
param(
    [ValidateSet('core','standard','all')]
    [string]$Mode = 'core',
    [switch]$ClaudeCodeAuth
)

$ErrorActionPreference = 'Stop'
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$cursorMcp = Join-Path $repoRoot '.cursor\mcp.json'
$taskmasterDir = Join-Path $repoRoot '.taskmaster'
$prdDir = Join-Path $taskmasterDir 'docs'
$prdPath = Join-Path $prdDir 'prd.md'

Write-Host ""
Write-Host "=== install-taskmaster ==="
Write-Host "Repo:            $repoRoot"
Write-Host "Target mcp.json: $cursorMcp"
Write-Host "Mode:            $Mode"
Write-Host "Auth:            $(if ($ClaudeCodeAuth) { 'Claude Code OAuth (no API key)' } else { 'Uses env var ANTHROPIC_API_KEY' })"
Write-Host ""

# -- 1. Ensure .cursor/mcp.json has the task-master-ai entry ----------------
if (-not (Test-Path $cursorMcp)) {
    Write-Error ".cursor/mcp.json not found. Run this inside a MASTERMIND 2.0 project."
    exit 1
}

$mcp = Get-Content $cursorMcp -Raw | ConvertFrom-Json

if (-not $mcp.mcpServers) {
    $mcp | Add-Member -NotePropertyName mcpServers -NotePropertyValue ([PSCustomObject]@{}) -Force
}

if ($mcp.mcpServers.PSObject.Properties.Name -contains 'task-master-ai') {
    Write-Host "task-master-ai already configured in .cursor/mcp.json. Leaving as-is." -ForegroundColor Yellow
} else {
    $env = [ordered]@{
        TASK_MASTER_TOOLS = $Mode
    }
    if (-not $ClaudeCodeAuth) {
        $env['ANTHROPIC_API_KEY'] = '${env:ANTHROPIC_API_KEY}'
    }

    $entry = [PSCustomObject]@{
        command = 'npx'
        args    = @('-y', 'task-master-ai')
        env     = [PSCustomObject]$env
    }

    $mcp.mcpServers | Add-Member -NotePropertyName 'task-master-ai' -NotePropertyValue $entry -Force

    ($mcp | ConvertTo-Json -Depth 10) | Set-Content -Path $cursorMcp -Encoding UTF8

    Write-Host "Added task-master-ai to .cursor/mcp.json (mode=$Mode)." -ForegroundColor Green
}

# -- 2. Create .taskmaster/ scaffold ----------------------------------------
if (-not (Test-Path $taskmasterDir)) {
    New-Item -ItemType Directory -Path $taskmasterDir | Out-Null
}
if (-not (Test-Path $prdDir)) {
    New-Item -ItemType Directory -Path $prdDir | Out-Null
}

if (-not (Test-Path $prdPath)) {
    @'
# PRD - [PROJECT NAME]

> This is the source of truth for `task-master-ai`. When you run `task-master parse-prd`, this file is decomposed into dependency-aware tasks under `.taskmaster/tasks.json`.

## Product overview
- Name:
- Problem it solves:
- Primary user:
- Value proposition:

## Scope (MVP)
- [ ] Feature 1: …
- [ ] Feature 2: …
- [ ] Feature 3: …

## Out of scope
- …

## Success metrics
- North Star:
- Input metrics (one per feature):

## Constraints
- Stack: … (see `.cursor/rules/02-tech-stack.mdc`)
- Non-negotiables: see `memory/00-project-brief.md`.
- Testing policy: see `.cursor/rules/03-testing-policy.mdc`.
- Safety and git: see `.cursor/rules/04-safety-and-git.mdc`.

## Dependencies and sequencing hints
- Feature 1 depends on nothing.
- Feature 2 depends on Feature 1 for shared types.
- Feature 3 is independent and can ship in parallel.
'@ | Set-Content -Path $prdPath -Encoding UTF8
    Write-Host "Wrote sample PRD at $prdPath" -ForegroundColor Green
} else {
    Write-Host "Existing PRD preserved at $prdPath"
}

# -- 3. Hint: add .taskmaster to .gitignore for runtime files ---------------
$gitignore = Join-Path $repoRoot '.gitignore'
if (Test-Path $gitignore) {
    $giContent = Get-Content $gitignore -Raw
    if ($giContent -notmatch '(?m)^\.taskmaster/runtime') {
        Add-Content -Path $gitignore -Value @'

# task-master-ai runtime (keep PRD + tasks.json, ignore caches)
.taskmaster/runtime/
'@
        Write-Host "Appended .taskmaster/runtime/ to .gitignore"
    }
}

# -- 4. Print next steps ----------------------------------------------------
Write-Host ""
Write-Host "=== NEXT STEPS ===" -ForegroundColor Green
Write-Host ""
if (-not $ClaudeCodeAuth) {
    Write-Host "1. Ensure ANTHROPIC_API_KEY is exported (or sits in .env.local) before launching Cursor."
} else {
    Write-Host "1. Make sure Claude Code CLI is installed and authenticated (task-master will use its OAuth)."
}
Write-Host "2. Restart Cursor so it picks up the new MCP entry."
Write-Host "3. Fill in .taskmaster/docs/prd.md with the real project PRD."
Write-Host "4. In Cursor chat (or Claude Code):"
Write-Host "     'Initialize task-master in this project.'"
Write-Host "     'Parse the PRD at .taskmaster/docs/prd.md.'"
Write-Host "     'What is the next task I should work on?'"
Write-Host ""
Write-Host "See also: .cursor/rules/05-claude-mcp-integration.mdc §Reserved for System 2"
Write-Host ""
exit 0
