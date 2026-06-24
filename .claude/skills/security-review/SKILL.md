---
name: security-review
description: Security-focused review of any change that touches authentication, authorization, input validation, secrets, payments, personal data, file uploads, public APIs, third-party integrations, or infrastructure. Use before merging any PR that modifies those surfaces, before shipping a new public endpoint, before enabling a new external integration, when the user asks for "security review", "threat model", "OWASP check", "auth review", "permissions check", "secrets audit", or before a release candidate goes to staging. Produces docs/security/review-<date>-<slug>.md with the threat model, findings by severity, and remediation plan; updates memory/08-known-risks.md for accepted risks; runs available security MCPs (Trail of Bits, static analyzers) when configured. Complements code-reviewer — this skill looks only at security; both run on sensitive changes.
---

# Security Review

## Goal

Find and classify security weaknesses **before users are exposed to them**. The skill examines the change through an attacker's lens: how would I abuse this endpoint, how would I escalate privileges, how would I exfiltrate data, how would I lock someone out, how would I make this expensive?

Findings are classified by severity and come with concrete remediations. Accepted risks are logged explicitly — never silently absorbed.

This skill is not a substitute for professional penetration testing before a public launch, SOC 2 audit, or other compliance milestone. It is the always-on, per-PR security pass.

## When to use

**Always:**
- Before merging any PR that touches: auth, session, token handling, permissions / RBAC / RLS, input validation at public boundaries, file uploads, payments, webhooks, personal data (PII / PHI), cryptographic code, third-party credentials, infra as code, CI secrets.
- Before shipping a new public endpoint or webhook consumer.
- Before enabling a new third-party integration.
- Before a release candidate leaves development for staging/prod.
- When the user asks: "security review", "threat model", "is this safe", "OWASP check", "auth review", "permissions check", "secrets audit".

**Trigger keywords:** "security", "security review", "threat model", "OWASP", "auth", "authorization", "permissions", "RBAC", "RLS", "secrets", "credentials", "vulnerability", "abuse case", "attack surface".

**Do NOT use for:**
- Pure UI-layout or copy changes with no data or auth impact.
- Internal refactors that are behavior-preserving and do not cross a trust boundary.
- General code quality (that is `code-reviewer`).

## Prerequisites

Read:

1. `CLAUDE.md`
2. `.cursor/rules/04-safety-and-git.mdc` (fixed safety rules)
3. `.cursor/rules/05-claude-mcp-integration.mdc` (MCPs available — Context7, security scanners)
4. `memory/03-architecture.md` (NFR security section; compliance scope)
5. `memory/04-data-model.md` (PII fields; data sensitivity)
6. `memory/08-known-risks.md` (pre-existing risks)
7. `docs/security/security-risk-map.md` (from `project-deep-audit`)
8. Relevant `docs/flows/<slug>.md` for auth / payment / data flows.
9. The diff, all of it. Security bugs hide in one line.

## Process

### Step 1 — Scope the review

At the top of `docs/security/review-YYYY-MM-DD-<slug>.md`:

```markdown
# Security Review — <slug>

**Date:** YYYY-MM-DD
**Reviewer:** User + <Model>
**Change:** <branch or PR>
**Trust boundaries touched:** <e.g. Public API, Admin-only API, Webhook, Internal service>
**Data sensitivity:** None | Low | Medium | High | Critical
**Compliance scope:** None | GDPR | SOC 2 | PCI-DSS | HIPAA
```

### Step 2 — Build (or update) the threat model

For the change, enumerate:

**Assets at risk.** User accounts, PII, payment data, internal admin capabilities, intellectual property, availability of the service, account balances, credits.

**Actors.** Unauthenticated visitor, authenticated standard user, authenticated user of another tenant, authenticated admin, ex-employee, internal attacker, automated scanner.

**Trust boundaries.** Every arrow in the architecture diagram that crosses a trust level (public ↔ private, tenant A ↔ tenant B, service ↔ DB, service ↔ third party).

**Abuse cases.** For each actor + asset pair, write one concrete abuse case:

```markdown
### Abuse case — <title>
- **Actor:** <role>
- **Target:** <asset>
- **Vector:** <how they try it>
- **Current control:** <what stops them today>
- **Gap:** <what is missing or weak>
```

A change without at least one credible abuse case has either been scoped too narrowly or is not actually sensitive.

### Step 3 — OWASP-informed checks (contextual, not a checklist dump)

Walk these categories and write findings **only when applicable**. Do not dump the entire OWASP Top 10 as filler.

1. **Broken access control** — can user A read/modify user B's data? Tenant A touch Tenant B? Standard user reach admin routes? Missing `@authorize` / RLS / row-level policies?
2. **Cryptographic failures** — plaintext secrets, weak algorithms, missing HTTPS, JWT `none` algorithm, insecure cookies, unsalted hashes, reused IVs.
3. **Injection** — SQL, NoSQL, OS command, ORM misuse, HTML/JS (XSS), template injection, LDAP, XPath.
4. **Insecure design** — flows that allow enumeration, timing attacks on auth, brute-force without rate limit, password reset leaking existence.
5. **Security misconfiguration** — permissive CORS, debug endpoints in prod, default credentials, verbose error messages with stack traces.
6. **Vulnerable and outdated components** — dependency versions; rely on `research-first` notes for current advisories; run `npm audit` / `pip audit` / equivalent.
7. **Identification and authentication failures** — session fixation, missing CSRF on state-changing endpoints, weak password / MFA policies, magic-link replay, token in URL.
8. **Software and data integrity** — unverified webhooks (missing signature check), unsigned release artifacts, CI without pinning third-party actions.
9. **Security logging and monitoring** — are auth failures logged? Rate-limit hits? Suspicious admin actions? Can an incident be reconstructed 30 days later?
10. **SSRF** — any call that accepts a URL and fetches it; internal metadata endpoints; file upload URLs.

For non-web contexts, add:

- **Data handling** — PII at rest, in logs, in error reports; backups encryption; export/delete flows (GDPR).
- **Payments** — PCI scope, webhook signature, idempotency on refunds, race conditions on credit updates.
- **File uploads** — type / size limits, content scanning, storage isolation, signed URLs expiry.
- **AI-specific** — prompt injection, untrusted model outputs consumed by downstream systems, training data exfiltration.

### Step 4 — Automated scans (when configured)

If MCPs or local scanners are available, run them and include the output summary (not the full log):

- **Trail of Bits Security skill** (`/plugin install`) — CodeQL + Semgrep rules.
- **`npm audit` / `pip audit` / `cargo audit`** — dependency CVEs.
- **Gitleaks / Trufflehog** — secrets in diff.
- **Dockerfile / IaC scanners** — Trivy, Checkov for infra as code.
- Framework-specific linters — eslint security plugins, Bandit (Python), Brakeman (Rails).

Record:

```markdown
### Automated scan results
- Tool: <name> (<version>)
- Ran on: <date>
- Findings:
  - [Severity] <file>:<line> — <issue>
  - …
- Unresolved after triage: <count>
```

Never trust a scan blindly. Triage every finding. False positives are the norm; dismiss them with a reason in writing.

### Step 5 — Findings with severity

Use four levels:

- **Critical** — actively exploitable by an unauthenticated or low-privilege user, data exfiltration, account takeover, payment bypass. **Blocks release.**
- **High** — exploitable under realistic conditions; significant blast radius. **Blocks release unless mitigated.**
- **Medium** — defense-in-depth missing; not directly exploitable but adjacent to one that is. **Schedule within the release.**
- **Low** — hardening, hygiene, future-proofing. **Track; schedule when convenient.**

Each finding:

```markdown
- **[Severity] <title>**
  - **Where:** <file:line or architectural component>
  - **What:** <specific weakness>
  - **Impact:** <what an attacker gains>
  - **Remediation:** <concrete change>
  - **Regression test:** <how we will verify it next time>
```

### Step 5b — Insecure defaults checklist + Rationalizations to Reject

Two artifacts adapted from Trail of Bits security skills (`insecure-defaults` + their security-skill authoring template).

#### Insecure defaults — scan every review for these

Patterns where the framework / language / library default is unsafe and a deliberate override is required:

- **Auth & sessions** — session cookies without `Secure` / `HttpOnly` / `SameSite=Lax`+; JWT with `alg: none` permitted; refresh tokens stored in localStorage; password reset tokens without expiry.
- **CORS** — `Access-Control-Allow-Origin: *` on any authenticated endpoint; `Access-Control-Allow-Credentials: true` paired with reflected origin.
- **CSRF** — state-changing endpoints without CSRF tokens or SameSite cookie protection.
- **Database** — connection strings with passwords in URL (vs env / secret manager); ORM defaults that disable prepared statements; soft-delete that leaves PII in disk forever.
- **HTTP client defaults** — `verify=False` / `rejectUnauthorized: false`; no timeout (unbounded hang); follow-redirects without scheme validation (HTTP→file://).
- **File handling** — temp files with default umask; uploads stored under web root; filename used as path without sanitization.
- **Logging** — request bodies / cookies / Authorization headers logged in full; PII written to stdout in production.
- **Secrets** — credentials checked into `.env.example`; CI secrets exposed to PR builds from forks; `.env` not in `.gitignore`.
- **Dev hooks left on** — debug routes (`/debug`, `/admin/dev`) reachable in production; `DEBUG=True` in framework; verbose stack traces returned to clients.
- **Crypto** — random number generation via `Math.random()` / `random.random()` for security-sensitive values; MD5 / SHA1 for passwords or token derivation; hardcoded IVs.
- **Container / deploy** — running as root; `latest` tag in production manifests; secrets baked into image layers.
- **Dependencies** — direct deps without lockfile pinning; transitive deps not audited; `npm install` instead of `npm ci` in CI.
- **Fail-open** — auth middleware that returns 200 on internal error; rate limit that opens on cache miss; feature flag that defaults to "enabled if check fails".

Each match in the diff is at least an Important finding. Multiple matches together are usually Critical (defense-in-depth has been bypassed).

#### Rationalizations to Reject

When a developer (or AI agent) tries to dismiss a security finding with one of these phrases, the reviewer must push back rather than accept:

| Rationalization | Reality |
|---|---|
| *"This endpoint is internal-only."* | Internal services get exposed accidentally; tunnels, port-forwards, and misconfigured ingresses happen. Defense in depth applies. |
| *"Only admins use it."* | Admin accounts get phished; insider threats exist; admin tooling is the highest-value target for an attacker. |
| *"We trust our users."* | Trust is not a security control. It's also not transitive (a trusted user's account can be compromised). |
| *"Nobody knows the URL."* | Security through obscurity is not security. URLs leak via referer headers, error pages, browser history, screen shares. |
| *"It's behind a firewall."* | Lateral movement is the norm in 2026. Once one machine is in, the firewall stops mattering. |
| *"The framework handles that."* | Maybe. Verify with the docs of the version you actually deploy. Versions matter. |
| *"We'll fix it in v2."* | v2 ships when it ships. The vulnerability ships now. Choose: fix or accept the risk in `memory/08-known-risks.md` with expiry. |
| *"Adding rate-limit / validation / encryption would slow things down."* | Quantify the slowdown. If the answer is hand-wavy, the trade-off has not been thought through. |
| *"This is just a prototype."* | Prototypes leak. Prototypes get deployed by mistake. Either keep it on a kill-switched route, or harden it. |
| *"It's the same as how X does it."* | X may also be vulnerable. Independent justification required. |

When the developer's response to a finding matches one of the above, document both (the finding, the rationalization) in the review verdict; the response template lives in this table.

Source: `insecure defaults` checklist adapted from [trailofbits/skills `insecure-defaults`](https://github.com/trailofbits/skills/tree/main/insecure-defaults); `Rationalizations to Reject` table adapted from Trail of Bits skill-authoring conventions (`trailofbits/skills/CLAUDE.md` §Security Skills). See `research/03-trail-of-bits-skills.md` for evaluation context.

### Step 6 — Accepted risks

Any Medium or Low risk the team decides not to fix now must be logged in `memory/08-known-risks.md` with:

- Risk description.
- Why it is accepted (cost, compensating control, probability).
- Expiry date for re-review.

No silent acceptance. Unlogged risk becomes next year's surprise incident.

### Step 7 — Compensating controls

For every risk that is not fully eliminated, list compensating controls already in place (rate limits, audit logs, monitoring alerts, feature flags that can shut the path off). A risk with no controls is unmitigated.

### Step 8 — Verdict

```markdown
## Verdict

**Status:** Safe to merge | Safe to merge with fixes | Not safe to merge

**Blocking findings (if any):**
- …

**Scheduled follow-ups:**
- …

**Compliance impact:** <none | affects GDPR log retention | adds PCI scope | etc.>
```

### Step 9 — Invoke `memory-updater`

Persist:

- `docs/security/review-<date>-<slug>.md` saved.
- `memory/08-known-risks.md` updated for accepted risks.
- `memory/07-decisions-log.md` if a non-obvious trade-off was made.
- `docs/security/security-risk-map.md` refreshed if the change alters the overall surface.
- Cross-project lesson candidate for recurring patterns.

### Step 10 — Closing

Deliver the verdict, then emit a Command Recommendation whose confidence depends on severity:

**If verdict = "Not safe to merge" (any Critical/High)** → **HIGH**:
```markdown
"Security review complete. Verdict: Not safe to merge. <C> Critical, <H> High.

---
**Next recommended command:** `/mm-plan security-remediation-<main-finding>`
**Why:** Critical/High findings block merge; plan the remediation before anything else.
**Go ahead:** type `go` and I'll proceed to `implementation-planner` scoped to the remediation.
**Skip if:** you prefer to open a dedicated incident track outside the feature branch."
```

**If verdict = "Safe to merge with fixes" (Medium findings, no Critical/High)** → **MEDIUM**:
```markdown
"Security review complete. Verdict: Safe with fixes. <M> Medium, <L> Low. Accepted risks logged: <K>.

---
**Possible next commands (pick one):**
a) `/mm-plan security-fix-pack` — close the Medium findings before merging.
b) Accept the risk and merge — if the findings are logged in `memory/08-known-risks.md` with expiry.
c) `/mm-review` after the fixes — if a re-scan is cheaper than risk acceptance.
**Which?** reply `a`, `b`, or `c`."
```

**If verdict = "Safe to merge" (clean)** → **HIGH**:
```markdown
"Security review complete. Verdict: Safe to merge. 0 Critical/High/Medium, <L> Low.

---
**Next recommended command:** merge the PR (no `/mm-*` needed).
**Why:** no open security blockers; Lows can live in the risk log with expiry.
**Skip if:** you want to address Lows as part of the same PR for hygiene."
```

## Outputs

- `docs/security/review-YYYY-MM-DD-<slug>.md` — scope, threat model, OWASP-informed findings, scan results, verdict.
- Updated `memory/08-known-risks.md` (accepted risks).
- Updated `memory/07-decisions-log.md` (non-obvious trade-offs).
- Refreshed `docs/security/security-risk-map.md` when surface changed.
- Optional cross-project lesson.

## Interactions with other skills

- **Runs after:** `implementation-planner` execution, `bug-investigator` fixes touching trust boundaries, `architecture-mapper` changes, `flow-analyzer` on sensitive flows.
- **Runs alongside:** `code-reviewer` on sensitive PRs — both are required, neither replaces the other.
- **Invokes:** `memory-updater` at close; `research-first` for new dependencies, for CVE triage, for any third-party whose security posture is unclear.
- **Pairs with:** `test-strategist` — every remediation ships with a regression test whose level matches the strategy (often integration or E2E for security).

## Completion checklist

- [ ] Scope block filled (trust boundaries, data sensitivity, compliance scope).
- [ ] Threat model with actors + assets + at least one abuse case.
- [ ] OWASP-informed checks applied contextually (not as a filler checklist).
- [ ] Automated scans run and triaged when tooling is available.
- [ ] Findings labeled with Critical / High / Medium / Low and a concrete remediation.
- [ ] Accepted risks logged in `memory/08-known-risks.md` with expiry.
- [ ] Compensating controls named for every non-fully-mitigated risk.
- [ ] Verdict given with blocking findings and scheduled follow-ups.
- [ ] `docs/security/security-risk-map.md` refreshed if surface changed.
- [ ] `memory-updater` ran.

## Anti-patterns

- **Avoid:** Dumping the full OWASP Top 10 as a checklist with each item marked "OK". Use categories contextually; a genuine finding is worth more than ten rubber-stamped ones.
- **Avoid:** Calling something "safe" because it uses HTTPS. Transport security is necessary, not sufficient.
- **Avoid:** Trusting automated scanner output without triage. False positives hide real positives.
- **Avoid:** Silently accepting Medium / Low risks. Log or fix — never in between.
- **Avoid:** A verdict "Safe to merge with fixes" and no list of fixes. Vague verdicts become merge-anyway.
- **Avoid:** Re-running the skill without reading the previous `docs/security/review-*.md`. Update the existing document instead of writing a new one for the same surface.
- **Avoid:** Leaving webhook signatures or idempotency keys as "TODO later". Either verify now or log the accepted risk with expiry.
- **Avoid:** Claiming a bug report is "not security" without checking if it leaks information through timing, error messages, or state.
