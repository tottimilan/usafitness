---
description: Run the code-reviewer skill over the current branch or a specified diff. Always runs security-review in addition when the diff touches auth, payments, schema, data mutations, or public API. Returns a verdict (Ready / Ready with fixes / Not ready) by severity.
---

# /mm-review

Arguments: $ARGUMENTS (optional — a specific branch, PR number, or file range; default: current branch vs origin/main)

Execute review:

1. Determine the diff scope:
   - If `$ARGUMENTS` is a branch/PR → review that.
   - Otherwise → current branch vs `origin/main`.
2. Invoke `code-reviewer` with:
   - The plan under `.cursor/plans/` that this diff implements (if any).
   - Requirements from `docs/features/<epic>.md` if applicable.
   - The full diff, read line by line (not just filenames).
3. Walk the 11 review categories in order (plan compliance, scope discipline, correctness, tests, architecture fit, quality, performance, readability, simplicity, documentation, git hygiene).
4. Categorize findings strictly: Critical / Important / Suggestion. No invented middle levels.
5. Acknowledge 2–3 specific strengths.
6. Emit the verdict block.
7. **Trigger `security-review` in parallel** if the diff touches any of:
   - Files under `auth/`, `session/`, `token/`, `permissions/`, `rbac/`, `rls/`.
   - Payment / billing / webhook code.
   - Data mutations hard to undo (migrations, backfills, deletes).
   - Public API / public route handlers.
   - Third-party integrations or credentials.
   - File uploads.
   - Cryptographic code.
8. Combine both verdicts into a single final answer: Ready to merge / Ready with fixes / Not ready.
9. If cross-project lessons surfaced, flag them for promotion via `continuous-learner` or manual review.
10. Do NOT write code or fix the findings inline. The review finds; the author (or a subsequent `/mm-plan` + execution) fixes.

If the diff has no plan reference, that is itself a Critical process finding — flag it. Even a one-liner fix should trace to a reason.
