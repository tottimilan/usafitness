# Known Risks — USAFitness Landing Pages

> Code-/repo-derived risks only (empirically visible). Strategic, market and monetization risks + the prioritized Top 10 are added by `/mm-audit` (Phase 6).

## Legend
- Impact: Low | Medium | High | Critical
- Likelihood: Low | Medium | High
- Status: Open | Mitigated | Accepted | Closed

## Technical risks
| # | Risk | Impact | Likelihood | Mitigation | Status |
|---|---|---|---|---|---|
| 1 | No automated tests and no CI — a change to the shared template or `stores.json` can silently break one or all live stores | High | Medium | Build-check CI + smoke test per store route | Open |
| 2 | `stores.json` has no schema validation — a malformed/missing required field can break render for a store or the whole build | Medium | Medium | JSON schema / TS validation + build-time check | Open |
| 3 | No error monitoring / observability — prod errors (cf. past 500s, git `388d3df`) are invisible until a user reports them | Medium | Medium | Error tracking (e.g. Sentry) + uptime monitor | Open |
| 4 | Caret ranges on `astro`/adapter deps — minor bumps could break on redeploy | Low | Low | `package-lock.json` committed (mitigates if `npm ci`); verify Railway uses it | Open |

## Business / product risks
| # | Risk | Impact | Likelihood | Mitigation | Status |
|---|---|---|---|---|---|
| 1 | 4 of 5 stores lack legal `company` data → legal pages `noindex`, weaker SEO/trust for those domains | Medium | High | Collect & fill legal data per store | Open |
| 2 | Strategic / market / monetization risks not yet assessed | _TBD_ | _TBD_ | Run `/mm-audit` (Phase 6) | Open |

## Legal / regulatory risks
| # | Risk | Impact | Likelihood | Mitigation | Status |
|---|---|---|---|---|---|
| 1 | Reuse of Google reviews + author names/avatars without explicit consent — image-rights / privacy nuance | Medium | Low | Confirm reviews are genuine & permitted; self-host avatars | Open |
| 2 | Hand-entered legal data (NIF, razón social) — wrong data on an aviso legal is a compliance risk (`noindex` guards the empty case, not the wrong-data case) | Medium | Low | Verify legal data before indexing each store | Open |
| 3 | GDPR consent correctness unverified — does GA truly suppress pre-consent? Is the cookie policy complete? | Medium | Low | `security-review` of the consent gating | Open |

## Operational risks
| # | Risk | Impact | Likelihood | Mitigation | Status |
|---|---|---|---|---|---|
| 1 | Single Railway service = single point of failure for all 5 store domains | High | Low | Monitoring + health checks; platform SLA | Open |
| 2 | No staging/preview — edit JSON → push → auto-deploy goes straight to all live stores | Medium | Medium | PR preview / staging env + build gate | Open |
| 3 | Bus factor = 1 (single contributor) | Medium | Medium | Documentation (this memory seed) + onboarding | Open |
