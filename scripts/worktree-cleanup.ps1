<#
.SYNOPSIS
    Clean up worktrees spawned by worktree-spawn. Safe defaults: only removes worktrees whose branch is fully merged to origin/main. Handles stale metadata.

.DESCRIPTION
    Modes:
      - Default (no args): list all worktrees + their status; remove the ones fully merged to origin/main; prune metadata.
      - -Slug <name>: remove one specific worktree by slug, even if its branch is not merged (will abort if uncommitted changes unless --force).
      - -All: remove ALL spawned worktrees (not the repo's own). Aborts if any have uncommitted changes unless --force.
      - -DryRun: report only.

.EXAMPLE
    pwsh -File scripts/worktree-cleanup.ps1                # sweep merged
    pwsh -File scripts/worktree-cleanup.ps1 -DryRun        # show what would be done
    pwsh -File scripts/worktree-cleanup.ps1 -Slug auth-refactor
    pwsh -File scripts/worktree-cleanup.ps1 -Slug auth-refactor -Force
    pwsh -File scripts/worktree-cleanup.ps1 -All
#>
[CmdletBinding()]
param(
    [string]$Slug,
    [switch]$All,
    [switch]$Force,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$repoName = Split-Path -Leaf $repoRoot
$worktreesRoot = Join-Path (Split-Path -Parent $repoRoot) "$repoName-worktrees"

function Get-Worktrees {
    Push-Location $repoRoot
    try {
        $raw = git worktree list --porcelain
    } finally { Pop-Location }
    $entries = @()
    $cur = $null
    foreach ($line in ($raw -split "`r?`n")) {
        if ($line -match '^worktree ') {
            if ($cur) { $entries += $cur }
            $cur = [ordered]@{ worktree = ($line -replace '^worktree ', '').Trim(); branch = ''; sha = ''; locked = $false }
        } elseif ($line -match '^HEAD ') {
            if ($cur) { $cur.sha = ($line -replace '^HEAD ', '').Trim() }
        } elseif ($line -match '^branch ') {
            if ($cur) { $cur.branch = ($line -replace '^branch ', '').Trim() -replace '^refs/heads/', '' }
        } elseif ($line -match '^locked') {
            if ($cur) { $cur.locked = $true }
        } elseif ($line -match '^detached') {
            # no branch
        }
    }
    if ($cur) { $entries += $cur }
    return $entries
}

function Is-BranchMerged {
    param([string]$Branch)
    if (-not $Branch) { return $false }
    Push-Location $repoRoot
    try {
        git fetch --quiet origin main 2>&1 | Out-Null
        git merge-base --is-ancestor "$Branch" origin/main 2>&1 | Out-Null
        return $LASTEXITCODE -eq 0
    } finally { Pop-Location }
}

function Has-UncommittedChanges {
    param([string]$WorktreePath)
    Push-Location $WorktreePath
    try {
        $status = git status --porcelain
        return -not [string]::IsNullOrWhiteSpace($status)
    } finally { Pop-Location }
}

function Remove-OneWorktree {
    param([hashtable]$Entry, [switch]$ForceFlag)
    $path = $Entry.worktree
    $branch = $Entry.branch
    if ($DryRun) {
        Write-Host "[dry-run] would remove: $path  (branch $branch)" -ForegroundColor Yellow
        return
    }
    if (-not $ForceFlag -and (Has-UncommittedChanges -WorktreePath $path)) {
        Write-Host "SKIP (uncommitted changes): $path  (use -Force to override)" -ForegroundColor Yellow
        return
    }
    $args = @('worktree', 'remove', $path)
    if ($ForceFlag) { $args += '--force' }
    Push-Location $repoRoot
    try {
        git @args 2>&1 | Out-Host
    } finally { Pop-Location }
    if ($LASTEXITCODE -eq 0 -and $branch) {
        git branch -D $branch 2>&1 | Out-Null
        Write-Host "Removed: $path  (branch $branch deleted)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== worktree-cleanup ==="
Write-Host "Repo:           $repoRoot"
Write-Host "Worktrees root: $worktreesRoot"
Write-Host "Mode:           $(if ($Slug) { "single ($Slug)" } elseif ($All) { 'all' } else { 'sweep merged' })  DryRun=$($DryRun.IsPresent)  Force=$($Force.IsPresent)"
Write-Host ""

$entries = Get-Worktrees
# Exclude the main repo worktree from cleanup candidates
$candidates = $entries | Where-Object { (Resolve-Path $_.worktree -ErrorAction SilentlyContinue) -ne $repoRoot }

if ($Slug) {
    $target = $candidates | Where-Object { (Split-Path -Leaf $_.worktree) -eq $Slug }
    if (-not $target) {
        Write-Host "No worktree found for slug '$Slug'." -ForegroundColor Yellow
    } else {
        foreach ($e in $target) {
            Remove-OneWorktree -Entry $e -ForceFlag:$Force
        }
    }
}
elseif ($All) {
    if ($candidates.Count -eq 0) { Write-Host "No worktrees to remove." }
    foreach ($e in $candidates) {
        Remove-OneWorktree -Entry $e -ForceFlag:$Force
    }
}
else {
    # Sweep merged
    $removed = 0
    foreach ($e in $candidates) {
        if (Is-BranchMerged -Branch $e.branch) {
            Remove-OneWorktree -Entry $e -ForceFlag:$Force
            $removed++
        } else {
            Write-Host "kept (unmerged): $($e.worktree)  [$($e.branch)]"
        }
    }
    Write-Host ""
    Write-Host "Removed $removed merged worktree(s)."
}

Push-Location $repoRoot
try {
    git worktree prune --verbose 2>&1 | Out-Host
} finally { Pop-Location }

Write-Host ""
Write-Host "Remaining worktrees:"
Push-Location $repoRoot
try { git worktree list | Out-Host } finally { Pop-Location }
