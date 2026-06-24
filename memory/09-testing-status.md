# Testing Status — MASTERMIND TEMPLATE 2.0

> Tracks what is tested in the template itself (not in projects derived from it).

## Coverage snapshot

- **Unit:** None — the template has no application code to unit-test.
- **Integration:** None.
- **End-to-end:** None.
- **Smoke / static analysis:** **YES** — `skill-quality-evaluator` runs static lint over all skills (10 Pester tests, 6 anti-pattern detectors, baseline at `.cursor/plans/baselines/2026-05-03-skill-baseline.txt`).

## Test framework

- **Pester 5+** (PowerShell). Installed via `Install-Module Pester -Force -SkipPublisherCheck -Scope CurrentUser -MinimumVersion 5.0`.
- **Run all:** `Import-Module Pester -MinimumVersion 5.0; Invoke-Pester -Path .cursor/skills/skill-quality-evaluator/scripts/eval.Tests.ps1`.

## Gaps

- No tests for `scripts/sync-skills.ps1` (mirror sync) — relied on manual smoke + the `-Check` flag.
- No tests for `scripts/install-*.ps1` installers.
- No tests for git hooks under `scripts/git-hooks/`.

## Flaky tests

- None observed at 2026-05-03.

## Recent failures worth remembering

- **2026-05-03 — INVALID_NAME test failed initially.** Cause: PowerShell `-match` / `-notmatch` are case-insensitive by default; `BadName` passed the regex `^[a-z0-9]+(-[a-z0-9]+)*$`. Fix: switched to `-cnotmatch` (case-sensitive). Lesson: PowerShell case-sensitivity gotcha; always use `-c` variants when validating identifiers.
