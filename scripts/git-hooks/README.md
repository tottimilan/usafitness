# Git hooks — MASTERMIND 2.0

Canonical source for Git client-side hooks. These are **not** auto-installed on clone (Git does not copy `.git/hooks/` across clones). Install them explicitly with:

```powershell
pwsh -File scripts/install-git-hooks.ps1
```

```bash
bash scripts/install-git-hooks.sh
```

The installer symlinks or copies each hook into `.git/hooks/` with execute permission.

## Hooks

| File | Trigger | Behavior |
|---|---|---|
| `pre-commit` | Before each commit | Runs `sync-skills --check` (blocks on drift) and a basic secret scan over the staged diff (blocks on AWS/Stripe/GitHub/etc. keys and on committed `.env*` files). |
| `pre-push` | Before each push | Blocks direct pushes to `main` / `master` (escape hatch: `MM_ALLOW_MAIN_PUSH=1`). Soft-warns if `phase-gate-check` reports gaps. |

## Escape hatches (environment variables)

| Variable | Effect |
|---|---|
| `MM_SKIP_PRECOMMIT=1` | Disable the pre-commit hook for the current shell. |
| `MM_SKIP_PREPUSH=1` | Disable the pre-push hook for the current shell. |
| `MM_ALLOW_MAIN_PUSH=1` | Allow a direct push to main/master (e.g. release engineer). |

You can also use Git's built-in `--no-verify` flag to skip hooks for a single command:

```bash
git commit --no-verify
git push --no-verify
```

## Platform notes

- The hooks are bash scripts. On Windows, Git for Windows provides bash; the hooks run through that shell.
- The hooks prefer **PowerShell** scripts when available (sync-skills.ps1, phase-gate-check.ps1) and fall back to bash.
- The secret scan uses `grep -E`. It is **not** a substitute for Gitleaks / Trufflehog / secret-scanning services. Treat it as a first-line check.

## Integration with CI

Server-side secret scanning (GitHub Advanced Security, Gitleaks in CI) is the real defense. These client-side hooks exist to **fail fast** during local workflow, not to be the last line.

## Uninstall

```powershell
Remove-Item .git/hooks/pre-commit
Remove-Item .git/hooks/pre-push
```

```bash
rm .git/hooks/pre-commit .git/hooks/pre-push
```

Or re-run `install-git-hooks` with `--uninstall`.
