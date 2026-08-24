# Project Brief — USAFitness Landing Pages

> Landing-page service for USAFitness **sports-supplement retail stores** in Spain. One Astro template + per-store data → one SEO-optimized, legally-compliant site per store, each on its own domain. Sold as a **recurring monthly service** to each store owner.

## Product
- Name: USAFitness Landing Pages (package `usafitness-landings`)
- Type: Multi-tenant landing-page **service** (productized service, recurring revenue). Not SaaS — no self-serve app, no auth; the operator edits content in-repo.
- **Two distinct customers — do not conflate:**
  - **(a) Paying customer** = the owner of each store. Each store is a **legally independent company with its own CIF**; some owners run 2–3 stores but as separate entities. Pays a **monthly fee** for the service.
  - **(b) End visitor** = a person looking to buy sports-nutrition supplements near them — searching locally, checking the store, then going in person.
- Core problem: each independent store needs a professional, locally-ranked, GDPR-compliant web presence on its own domain, without paying for a bespoke site.
- What the stores actually sell (verbatim from `stores.json` metaDescription): "nutrición deportiva y suplementos — proteínas, creatinas, aminoácidos y **asesoramiento personalizado**. Hasta 20% dto."
- Physical footprint: **all 5 stores sit inside shopping centres** (C.C. El Zoco Villanueva, C.C. Marineda City A Coruña, C.C. Las Rosas Madrid, C.C. Carrefour Alcobendas, C.C. Gran Vía Vigo). Retail hours (10:00–22:00; some open Sundays).
- Unique value proposition (service side): add a store by editing one JSON object + dropping photos → a full localized, Schema.org-tagged, legally-compliant landing on that store's own domain. _Strategic differentiator vs. a plain Google Business Profile: TBD — /mm-audit._

## Business logic
- Revenue model: **recurring monthly fee per store**, paid by each independent store owner to the developer/operator of this repo. Amounts not recorded.
- User roles: Visitor (public, no auth). No authenticated app roles exist. Content edited in-repo by the operator.
- Core actions (visitor): view store landing → **contact via WhatsApp, call by phone, or get directions** (the three are equally primary, per owner). Read reviews, check schedule, view gallery, consult legal pages. **No online transactions — confirmed not on the roadmap.**
- Key integrations: Google Analytics 4 (+ Consent Mode v2), Google Maps embeds, Google Search Console (per-store verification), WhatsApp click-to-chat, Instagram (Vigo only so far).
- Non-negotiable constraints: GDPR opt-in consent; per-store legal accuracy (a store without real `company` data ships `noindex` rather than publishing wrong legal data). _Full list TBD — /mm-audit._

## Tech stack (actual)
- Frontend: Astro ^6.1.5 (SSR), pure HTML/CSS, ~0 client JS (except reviews tabs + cookie consent). TypeScript; path alias `@`→`/src`.
- Backend: Astro server output via `@astrojs/node` ^10.0.4 (standalone). `src/middleware.ts` maps domain→slug.
- Database: None. Content in `src/data/stores.json` (5 stores) + `src/data/legal.ts` (legal templates).
- Auth: None. Payments: None (by design — see above).
- Hosting: Railway (Node standalone, `node dist/server/entry.mjs`), one custom domain per store, auto-deploy on push to GitHub.
- Testing: None (no test files, no CI).
- Observability / Analytics: Google Analytics 4 with Consent Mode v2 (opt-in). No error monitoring / APM.

## Non-negotiables
- Legal accuracy per store: no real `company` data ⇒ legal pages go `noindex` instead of publishing incorrect data. Currently **only 1 of 5 stores (Vigo — NM10 SHOP S.L.) has real legal data**.
- GDPR-compliant opt-in analytics.
- _Others TBD — /mm-audit._

---

**Correction note (2026-06-26):** an earlier version of this file wrongly described USAFitness as a chain of **gyms**. That was an unverified inference from the brand name; the repo never said it. `src/data/stores.json` states plainly in every store that these are **tiendas de suplementación / nutrición deportiva** (supplement retail). Corrected after user pushback. Root cause: fields were extracted with `grep` instead of reading the file.
