# Project Brief — USAFitness Landing Pages

> Multi-store landing-page generator for USAFitness gyms in Spain. One Astro template + per-store data → one SEO-optimized, legally-compliant site per store, each served on its own domain.

## Product
- Name: USAFitness Landing Pages (package `usafitness-landings`)
- Type: Multi-tenant marketing website / landing-page generator (content site, not SaaS)
- Target user: Prospective gym members searching for a USAFitness location in their town; secondarily the operator who onboards new stores. _Personas TBD — /mm-audit._
- Core problem: Each USAFitness store needs a professional, locally-SEO-ranked, GDPR-compliant web presence without building a bespoke site per location.
- Unique value proposition: Add a store by editing one JSON object + dropping photos → the system generates a full localized, Schema.org-tagged, legally-compliant landing on the store's own domain. _Strategic differentiator TBD — /mm-audit._

## Business logic
- Revenue model: _TBD (strategic). Code suggests indirect — drive gym leads via WhatsApp/phone + local SEO. Confirm in /mm-audit._
- User roles: Visitor (public, no auth). Content is edited in-repo by the owner/developer. No authenticated app roles exist in code.
- Core actions: Visitor → view store landing → contact via WhatsApp/phone, view map/location, read reviews & schedule, consult legal pages. No on-site transactions.
- Key integrations: Google Analytics 4 (+ Consent Mode v2), Google Maps embeds, Google Search Console (per-store verification), WhatsApp click-to-chat, social links (Instagram/Facebook/TikTok/YouTube).
- Non-negotiable constraints: _TBD (strategic). Code-visible: GDPR opt-in consent + per-store legal accuracy. Confirm full list in /mm-audit._

## Tech stack (actual)
- Frontend: Astro ^6.1.5 (SSR), pure HTML/CSS, ~0 client JS (except reviews tabs + cookie consent). TypeScript; path alias `@`→`/src`.
- Backend: Astro server output via `@astrojs/node` ^10.0.4 (standalone). `src/middleware.ts` maps domain→slug.
- Database: None. Content in `src/data/stores.json` (5 stores) + `src/data/legal.ts` (legal templates).
- Auth: None.
- Payments: None.
- Hosting: Railway (Node standalone, `node dist/server/entry.mjs`), one custom domain per store, auto-deploy on push to GitHub.
- Testing: None (no test files, no CI).
- Observability / Analytics: Google Analytics 4 with Consent Mode v2 (opt-in). No error monitoring / APM.

## Non-negotiables
- _TBD — strategic, to be set via /mm-audit. Code-visible candidate: GDPR-compliant opt-in analytics; stores without real legal data ship `noindex` rather than publishing wrong data._
