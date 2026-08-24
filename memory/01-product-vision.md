# Product Vision — USAFitness Landing Pages

> Source: user, 2026-06-26. This file describes where the product is **going**. For what exists today see `memory/02-current-state.md` — the gap between the two is large and deliberate.

## North Star

Every USAFitness store gets its own website that looks **visually distinct** from its sibling stores and ranks strongly in **local SEO** — built from a shared system of **templates** and **reusable sections**, not from bespoke work per store.

The product is the *system*, not any individual landing.

## The two axes of variation

1. **Template** — a store picks one. Templates differ in **two ways at once**:
   - *Visual*: colours, typography, imagery treatment, component styling.
   - *Landing style/structure*: the shape of the page itself (e.g. long-form vs. short, different hero treatment, different narrative order).
2. **Sections** — a store picks which ones it wants from a library. Sections are optional and composable, not a fixed list.

## How a store is configured (important — defines the architecture)

The choice is an **assisted commercial process, not self-serve**:

1. The operator prepares several proposals (templates + section combinations).
2. The operator shows them to the store owner.
3. The owner picks the style and the sections they want.
4. **The operator configures it** in the repo.

**Architectural consequence:** there is no need for an admin panel, database, authentication, or a no-code editor. Per-store configuration can stay in version-controlled files. This is a deliberate constraint, not a limitation to be fixed later.

## 12-month vision

- A catalogue of **multiple templates** (visual + structural variants), selectable per store.
- A **library of optional sections** that can be composed per store.
- A real **Products section** so a store can show the products it carries. _(Explicitly deferred: to be built when the section library work starts.)_
- SEO excellence as the through-line of every template and section — not a per-store afterthought.
- Onboarding a new store = pick template + pick sections + fill data + drop photos.

## The second anchor — paid local acquisition (future)

Source: user, 2026-06-26. The service is planned to rest on **two anchors**, not one:

1. **The web** — templates + sections + local SEO (everything above).
2. **Paid campaigns** — **Google SEM and Facebook/Meta Ads**, run by the operator on behalf of each store. Campaigns are **always geo-targeted to the audience near that physical store**. Stated intent: "conectarlo todo y hacerlas desde aquí."

### What this changes about the websites

The landings stop being *only* SEO destinations and become **paid-traffic destinations**. That promotes several things from optional to mandatory:

- **Conversion tracking is now a prerequisite, not a nice-to-have.** You cannot optimize ad spend without conversion events. The three primary actions (WhatsApp, call, directions) must fire measurable events per store.
- **Ad platform tags** (Google Ads conversion tag, Meta Pixel / Conversions API) must be added — and must sit behind the **existing Consent Mode v2 gate**, per store. The current GDPR consent implementation is the right foundation for this.
- **Landing quality becomes a cost lever.** Google Ads Quality Score and Meta's landing-page experience directly affect CPC. Speed, message match between ad and landing, and mobile UX stop being craft and start being budget.
- **Any broken CTA now burns money.** With organic traffic a broken WhatsApp button loses a lead; with paid traffic it loses a *paid* lead. See `memory/08-known-risks.md` — 4 of 5 stores currently point WhatsApp at a landline.
- The template/section system may need **landing variants per campaign or per audience**, not just per store.

### Resolved: destination is a management platform, but staged

**Decision (user, 2026-06-26): "vamos a ir por la B, pero esto se realizará en un futuro. Primero las secciones y las landings bien optimizadas."**

The end state is **Reading B** — this project eventually becomes a platform from which campaigns are *managed*, not merely measured. That will require authentication, a database and API integrations with Google Ads and Meta.

**Sequencing is explicit and must be respected:**

1. **Now** — section library + template system + landings properly optimized.
2. **Later** — measurement layer (conversion events, tags).
3. **Future** — campaign management platform (Reading B).

**What this changes about today's decisions:** the "no panel, no database, no auth" constraint is now understood as **staged, not permanent**. Do not build auth or a database now — but do not make choices that *preclude* them either. Concretely: keep per-store configuration (chosen template, chosen sections, tracking IDs) as **structured data** with an explicit shape, not as ad-hoc conditionals scattered through components. A well-shaped config file migrates to a database row later; logic buried in JSX does not.

**Still unknown about B:** which platforms, what the operator actually needs to see or do from the panel, whether store owners ever get read access. Not asked — deliberately deferred until stages 1 and 2 are done.

## 3-year vision

_Partially known:_ a two-anchor service — website system + local paid acquisition — for USAFitness stores. Scope and platform boundary still TBD.

## What we are NOT

- **Not a self-serve no-code builder.** The store owner chooses from proposals; they never touch a panel. (User, 2026-06-26.)
- **Not e-commerce.** No online sales, booking or payments — confirmed off the roadmap.
- **Not a multi-tenant SaaS.** No accounts, no auth, no per-tenant database.
- **Not per-store bespoke development.** Anything built for one store should become a template or a section.
- **Not a per-store product catalogue (for now).** `Products` and `Brands` are **shared across all stores** by design — USAFitness stores carry the same brands. (User, 2026-06-26.)

## Success metrics (North Star + inputs)

_TBD — not yet defined with the user. Candidate inputs, unconfirmed: local search ranking per store domain, contact conversions (WhatsApp / call / directions), time to launch a new store._

## Known gap vs. current state

Today the codebase has **one template with twelve fixed sections in a fixed order** (`src/pages/[...slug].astro`). Only content varies per store, plus four minor toggles (`social`, `galleryFeatured`, `heroText`, `googleSiteVerification`). Neither the template system nor the section library exists yet. Delivering this vision is **new construction**, not polish.
