# Known Risks — USAFitness Landing Pages

> Code-/repo-derived risks only (empirically visible). Strategic, market and monetization risks + the prioritized Top 10 are added by `/mm-audit` (Phase 6).

## Legend
- Impact: Low | Medium | High | Critical
- Likelihood: Low | Medium | High
- Status: Open | Mitigated | Accepted | Closed

## Technical risks
| # | Risk | Impact | Likelihood | Mitigation | Status |
|---|---|---|---|---|---|
| 0 | ~~Placeholder images block the 3 pending migrations~~ | Medium | **RESUELTO 2026-08-24** | Fotos reales recuperadas de los WordPress de cada tienda, convertidas a .webp y colocadas. 6 por tienda. Verificado en navegador: 0 imágenes rotas | Closed |
| 0b | ~~Alcobendas hero placeholder rompe el og:image en producción~~ | Medium | **RESUELTO 2026-08-24** | hero.webp generado desde su foto real; og:image verificado | Closed |
| 1 | No automated tests and no CI — a change to the shared template or `stores.json` can silently break one or all live stores | High | Medium | Build-check CI + smoke test per store route | Open |
| 2 | `stores.json` has no schema validation — a malformed/missing required field can break render for a store or the whole build | Medium | Medium | JSON schema / TS validation + build-time check | Open |
| 3 | No error monitoring / observability — prod errors (cf. past 500s, git `388d3df`) are invisible until a user reports them | Medium | Medium | Error tracking (e.g. Sentry) + uptime monitor | Open |
| 4 | Caret ranges on `astro`/adapter deps — minor bumps could break on redeploy | Low | Low | `package-lock.json` committed (mitigates if `npm ci`); verify Railway uses it | Open |

## Business / product risks
| # | Risk | Impact | Likelihood | Mitigation | Status |
|---|---|---|---|---|---|
| 1 | 4 of 5 stores lack legal `company` data → legal pages `noindex`, weaker SEO/trust for those domains | Medium | High | Collect & fill legal data per store | Open |
| 2 | **WhatsApp CTA points at a landline in 4 of 5 stores** (`whatsapp` == `phone`; only Vigo has a separate mobile). If those numbers are not registered on WhatsApp Business, one of the three primary conversion paths is dead | High | Medium | Confirm with each owner; replace with a real mobile | Open — awaiting owner confirmation |
| 3 | **Duplicated reviews across legally independent stores** — identical text and author reused across Villanueva/Marineda/Las Rosas; one copied review mentions a Sunday shift at a store that closes Sundays | Medium | High | Collect genuine per-store reviews; remove filler | Open |
| 4 | Google Maps embeds for Villanueva/Marineda/Las Rosas use hand-built `place_id` values that look synthetic — may not resolve to the real business listing | Medium | Medium | Replace with verified embeds from each Google Business Profile | Open |
| 5 | "Hasta 20% dto." is published in the `metaDescription` of all 5 stores — if the promotion lapses, it is an indexed promise the store cannot honour | Low | Medium | Review per store; make the claim data-driven or remove | Open |
| 6 | **Ad-spend exposure (future anchor):** paid campaigns are planned (Google SEM + Meta). Without conversion tracking on WhatsApp/call/directions, campaigns cannot be optimized and spend is unattributable. Combined with risk #2, paid clicks could land on a dead CTA | High | High | Ship conversion events per store **before** any campaign goes live | Open |
| 7 | Strategic / market risks not yet assessed | _TBD_ | _TBD_ | Run `/mm-audit` (Phase 6) | Open |

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
