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

## 3-year vision

_TBD — not yet discussed with the user._

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
