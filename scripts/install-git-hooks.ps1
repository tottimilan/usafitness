<#
.SYNOPSIS
    Install (or uninstall) the MASTERMIND 2.0 git hooks from scripts/git-hooks/ into .git/hooks/.

.DESCRIPTION
    By default, installs pre-commit and pre-push hooks. Existing hooks are backed up to <hook>.backup-<timestamp>. Running again is idempotent (same file content will be detected and left alone).

.PARAMETER Uninstall
    Remove the hooks and restore the most recent backup if present.

.EXAMPLE
    pwsh -File scripts/install-git-hooks.ps1
    pwsh -File scripts/install-git-hooks.ps1 -Uninstall
#>
[CmdletBinding()]
param(
    [switch]$Uninstall
)

$ErrorActionPreference = 'Stop'
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$sourceDir = Join-Path $repoRoot 'scripts\git-hooks'
$targetDir = Join-Path $repoRoot '.git\hooks'

if (-not (Test-Path $targetDir)) {
    Write-Error "Not a git repository (no .git/hooks folder found). Run 'git init' first."
    exit 1
}
if (-not (Test-Path $sourceDir)) {
    Write-Error "Canonical hooks folder $sourceDir is missing."
    exit 1
}

$hooks = @('pre-commit', 'pre-push')
$ts = Get-Date -Format 'yyyyMMdd-HHmmss'

Write-Host ""
Write-Host "=== install-git-hooks ==="
Write-Host "Source: $sourceDir"
Write-Host "Target: $targetDir"
Write-Host "Mode:   $(if ($Uninstall) { 'UNINSTALL' } else { 'INSTALL' })"
Write-Host ""

foreach ($h in $hooks) {
    $src = Join-Path $sourceDir $h
    $dst = Join-Path $targetDir $h

    if ($Uninstall) {
        if (Test-Path $dst) {
            $backup = Get-ChildItem -Path $targetDir -Filter "$h.backup-*" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
            Remove-Item $dst -Force
            if ($backup) {
                Copy-Item $backup.FullName $dst -Force
                Write-Host "Uninstalled $h (restored backup: $($backup.Name))" -ForegroundColor Yellow
            } else {
                Write-Host "Uninstalled $h (no backup to restore)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "$h not installed. Skipping."
        }
        continue
    }

    if (-not (Test-Path $src)) {
        Write-Host "WARN: $src does not exist, skipping." -ForegroundColor Yellow
        continue
    }

    if (Test-Path $dst) {
        $currentHash = (Get-FileHash -Algorithm SHA256 $dst).Hash
        $sourceHash  = (Get-FileHash -Algorithm SHA256 $src).Hash
        if ($currentHash -eq $sourceHash) {
            Write-Host "$h is already up to date. Skipping."
            continue
        }
        $backup = Join-Path $targetDir "$h.backup-$ts"
        Copy-Item $dst $backup -Force
        Write-Host "Backed up existing $h to $(Split-Path -Leaf $backup)"
    }

    Copy-Item $src $dst -Force
    # Git for Windows honors the hook as-is; make sure it's readable.
    Write-Host "Installed $h"
}

Write-Host ""
Write-Host "DONE" -ForegroundColor Green
Write-Host ""
Write-Host "Usage:"
Write-Host "  Skip once:          git commit --no-verify"
Write-Host "  Disable temporarily: MM_SKIP_PRECOMMIT=1 / MM_SKIP_PREPUSH=1 in your shell"
Write-Host "  Allow main push:    MM_ALLOW_MAIN_PUSH=1 git push"
Write-Host ""
Write-Host "See scripts/git-hooks/README.md for full documentation."
exit 0
