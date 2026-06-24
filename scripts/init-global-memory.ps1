<#
.SYNOPSIS
    Bootstrap the cross-project global memory at ~/.mastermind/global/.

.DESCRIPTION
    Idempotently creates the cross-project memory files consumed by the
    `continuous-learner` skill and rule 05 §Cross-project Memory Protocol:
      lessons.md · patterns.md · pitfalls.md · stacks.md · vendors.md · README.md
    Initializes a git repo there if none exists. Running twice is safe (no clobber).

.PARAMETER Path
    Override the default location (~/.mastermind/global). Optional.

.PARAMETER NoGit
    Skip `git init`.

.EXAMPLE
    pwsh -File scripts/init-global-memory.ps1
#>
[CmdletBinding()]
param(
    [string]$Path,
    [switch]$NoGit
)

$ErrorActionPreference = 'Stop'

if (-not $Path) {
    $home = [Environment]::GetFolderPath('UserProfile')
    $Path = Join-Path $home '.mastermind/global'
}

$created = @()
if (-not (Test-Path $Path)) {
    New-Item -ItemType Directory -Force -Path $Path | Out-Null
    $created += $Path
}

$files = [ordered]@{
    'lessons.md'  = "# Lessons (cross-project)`n`n> What worked or failed, with evidence and context. Project-agnostic, evidence-backed, actionable.`n"
    'patterns.md' = "# Patterns (cross-project)`n`n> Reusable architectural / product / workflow patterns.`n"
    'pitfalls.md' = "# Pitfalls (cross-project)`n`n> Anti-patterns observed repeatedly across projects.`n"
    'stacks.md'   = "# Stacks (cross-project)`n`n> Stack choices taken across projects, with outcomes.`n"
    'vendors.md'  = "# Vendors (cross-project)`n`n> Third-party providers used, with verdicts.`n"
    'README.md'   = "# MASTERMIND — Cross-project global memory`n`n> Plain-Markdown source of truth, consulted by multiple projects. Never store secrets, client names, PII, or payment data here. Use neutral references.`n`nManaged by the ``continuous-learner`` skill (``/mm-learn``). See rule 05 §Cross-project Memory Protocol.`n"
}

foreach ($name in $files.Keys) {
    $f = Join-Path $Path $name
    if (-not (Test-Path $f)) {
        Set-Content -Path $f -Value $files[$name] -NoNewline -Encoding UTF8
        $created += $f
    }
}

if (-not $NoGit) {
    $gitDir = Join-Path $Path '.git'
    if (-not (Test-Path $gitDir)) {
        if (Get-Command git -ErrorAction SilentlyContinue) {
            Push-Location $Path
            try {
                git init --quiet 2>$null | Out-Null
                $created += "$gitDir (git repo)"
            } finally { Pop-Location }
        } else {
            Write-Host "git not found on PATH; skipped 'git init'." -ForegroundColor Yellow
        }
    }
}

Write-Host "Global memory ready at: $Path" -ForegroundColor Green
if ($created.Count -eq 0) {
    Write-Host "Nothing to do — everything already present (idempotent)."
} else {
    Write-Host "Created:"
    $created | ForEach-Object { Write-Host "  + $_" }
}
exit 0
