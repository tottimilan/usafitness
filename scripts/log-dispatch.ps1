<#
.SYNOPSIS
    Append one subagent-dispatch record to the rule-07 observability log.

.DESCRIPTION
    Implements the §Observability contract of .cursor/rules/07-subagent-orchestration.mdc.
    Appends a single JSON line to .mastermind/runtime/dispatch-log.jsonl (gitignored).
    The log is best-effort: if it cannot be written, the dispatch still proceeds
    (observability degrades gracefully — never blocks work).

.PARAMETER Dispatcher  Who initiated the dispatch (skill/command/orchestrator).
.PARAMETER Role        implementer | spec-reviewer | code-quality-reviewer | research | other
.PARAMETER Model       Exact model name used.
.PARAMETER InputHash   Hash of the input prompt (caller-provided; or "" to auto-hash -InputText).
.PARAMETER OutputStatus DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED
.PARAMETER WallTimeMs  Wall-clock duration in milliseconds.
.PARAMETER TokenCostEstimate Estimated token cost (number).
.PARAMETER InputText   Optional raw prompt; if InputHash is empty, a SHA-256 is computed from this.

.EXAMPLE
    pwsh -File scripts/log-dispatch.ps1 -Dispatcher subagent-dispatcher -Role implementer `
         -Model claude-sonnet -OutputStatus DONE -WallTimeMs 42000 -TokenCostEstimate 18000 -InputText "..."
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Dispatcher,
    [Parameter(Mandatory)][ValidateSet('implementer','spec-reviewer','code-quality-reviewer','research','other')][string]$Role,
    [Parameter(Mandatory)][string]$Model,
    [ValidateSet('DONE','DONE_WITH_CONCERNS','NEEDS_CONTEXT','BLOCKED')][string]$OutputStatus = 'DONE',
    [string]$InputHash = '',
    [int]$WallTimeMs = 0,
    [double]$TokenCostEstimate = 0,
    [string]$InputText = ''
)

try {
    $repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
    $runtimeDir = Join-Path $repoRoot '.mastermind/runtime'
    if (-not (Test-Path $runtimeDir)) { New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null }
    $logFile = Join-Path $runtimeDir 'dispatch-log.jsonl'

    if (-not $InputHash -and $InputText) {
        $sha = [System.Security.Cryptography.SHA256]::Create()
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($InputText)
        $InputHash = ([System.BitConverter]::ToString($sha.ComputeHash($bytes)) -replace '-', '').ToLower().Substring(0, 16)
    }

    $record = [ordered]@{
        timestamp           = (Get-Date).ToUniversalTime().ToString('o')
        dispatcher          = $Dispatcher
        role                = $Role
        model               = $Model
        input_hash          = $InputHash
        output_status       = $OutputStatus
        wall_time_ms        = $WallTimeMs
        token_cost_estimate = $TokenCostEstimate
    }
    $line = ($record | ConvertTo-Json -Compress)
    Add-Content -Path $logFile -Value $line -Encoding UTF8
    Write-Host "dispatch logged -> .mastermind/runtime/dispatch-log.jsonl"
    exit 0
} catch {
    Write-Host "observability off (log-dispatch failed: $($_.Exception.Message)) — dispatch continues." -ForegroundColor Yellow
    exit 0
}
