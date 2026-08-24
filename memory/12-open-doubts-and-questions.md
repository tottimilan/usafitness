# Open Doubts and Questions — USAFitness Landing Pages

**Last updated:** 2026-06-26
**Current phase:** Iteration

> This file is the living record of the project's open doubts, the questions the AI has asked the user, and the user's own observations.
> It is updated at every checkpoint, before and after any important document or implementation.
> It is the single source of truth for *"what we still don't know"*.

---

## 0. Correction of record (2026-06-26)

The first pass of this file (and of `memory/00-project-brief.md`) described USAFitness as a chain of **gyms**. **That was wrong.** These are **tiendas de suplementación deportiva** — sports-nutrition supplement retail stores, all located inside shopping centres. The evidence was in `src/data/stores.json` all along (`"Tu tienda de suplementación en…"`, `"Proteínas, creatinas, aminoácidos"`). The error came from extracting fields with `grep` instead of reading the file, then inferring the sector from the brand name.

**Process lesson:** verify the product's identity from primary content before asking the user anything about users or market. Questions Q3/Q4 below were vague *and* already answerable from the repo — they should never have been asked.

---

## 1. AI Current Doubts (Open)

### Technical
- [ ] How many stores must this scale to (5 → 20 → 100)? Determines whether file-based `stores.json` stays viable or needs schema validation / CMS.
- [ ] Is Railway + single Node service the long-term host? All client domains depend on one service.
- [ ] Appetite for a test/CI safety net given zero tests and a paying-client site per domain.

### Product / Value Proposition
- [ ] Differentiator vs. what a store already gets free from a Google Business Profile — what does the own-domain landing add that GBP does not?
- [ ] Is the landing the store's primary web presence, or complementary to its Instagram / GBP?

### Users / Jobs-to-be-Done
- [x] ~~Who is the end visitor~~ — answered from code: someone searching for sports supplements near them, who values in-store personal advice (every review praises named staff) and discounts ("hasta 20% dto.").

### Business Model / Monetization
- [x] ~~How this makes money~~ — recurring **monthly fee per store**, paid by each store owner. (Q5)
- [x] ~~Store ownership structure~~ — **independent companies, each with its own CIF**; some owners hold 2–3 stores but as separate entities. (Q6)
- [x] ~~Transactional roadmap~~ — **no**. (Q7)
- [ ] Churn risk: what makes a store owner stop paying? (Not asked yet — belongs to the audit.)
- [ ] Is the service sold beyond USAFitness-branded stores, or only within this brand?

### UX / Critical Flows / Edge Cases
- [x] ~~Primary conversion action~~ — **all three equally**: WhatsApp, phone call, directions. (Q2)
- [ ] Are those three conversions tracked as GA4 events today? (Verifying in code.)

### Risks (technical, legal, operational, regulatory)
- [ ] **Duplicate reviews across stores** — identical review text + identical author names reused across Villanueva / Marineda / Las Rosas. Trust, SEO-duplication and possibly consent implications. Needs owner decision.
- [ ] 4 of 5 stores have no real legal `company` data → legal pages `noindex`. Priority?
- [ ] Single Railway service = SPOF for every paying client's domain simultaneously.

### Assumptions that might be wrong
- [ ] That the operator is the sole builder and decision-maker.
- [ ] That all 5 stores are current paying clients (some may be pilots/free).

---

## 2. High-Quality Questions Asked to the User

### Answered

### Q2 — UX / Conversion
- **Question:** What single thing should a visitor DO — WhatsApp, call, directions, or sign up online?
- **Status:** Answered (2026-06-26)
- **User response:** "las 3 que mencionas" — WhatsApp, phone and directions are all primary.
- **Impact:** No single hero CTA; the three contact paths must each be prominent and should each be measured.

### Q5 — Business Model
- **Question:** How does this make money for you specifically?
- **Status:** Answered (2026-06-26)
- **User response:** Each store pays a **monthly fee for the service**. Amounts deliberately not shared.
- **Impact:** This is a productized recurring service, not an internal marketing site. Reliability and per-client SEO results are the retention drivers. Reframes the whole risk model.

### Q6 — Business Model / Ownership
- **Question:** One company or independent franchisees?
- **Status:** Answered (2026-06-26)
- **User response:** **Totally independent companies**, each with its own CIF and legal entity; some owners have 2–3 stores, still independent.
- **Impact:** Confirms the per-store `company` legal design is required, not optional. Each store is a separate legal publisher and a separate paying account.

### Q7 — Business Model / Roadmap
- **Question:** Any intent to add transactional features (online signup, booking, payments)?
- **Status:** Answered (2026-06-26)
- **User response:** No.
- **Impact:** The no-DB / no-auth architecture is a permanent, correct choice — not tech debt. Rules out a whole class of "add e-commerce" recommendations.

### Withdrawn (bad questions — answerable from the repo)

### Q1, Q3, Q4 — Product / Users
- **Status:** Withdrawn 2026-06-26. Q1 was premised on the wrong sector (gyms). Q3 and Q4 were vague and the repo already answered them: the visitor is a sports-supplement buyer looking for a store near them; store content, reviews and schedules make the job-to-be-done clear.
- **Impact:** Process correction — investigate primary sources before asking the user.

### Still open (re-scoped, not yet re-asked)

### Q8 — Technical / Scale
- **Question:** How many stores in 12 months — ~5, ~20, ~100?
- **Why it matters:** At 5, `stores.json` is fine. At 100, unvalidated JSON editing on a paying-client system becomes the main operational risk.
- **Status:** Pending

### Q9 — Technical / Safety net
- **Question:** How much do you want to invest in a build check / per-store smoke test vs. keep shipping fast?
- **Why it matters:** Every client's live site depends on one shared template and one shared service. A broken deploy breaks all paying clients at once.
- **Status:** Pending

### Q10 — UX / Metrics
- **Question:** Do you track WhatsApp/call/directions clicks as GA4 events? Do you report results to the stores?
- **Why it matters:** For a paid monthly service, demonstrable results are the retention mechanism. Untracked conversions = no proof of value at renewal time.
- **Status:** Pending

### Q11 — Risk / Legal
- **Question:** Are the duplicated reviews across stores intentional placeholders, and is completing legal data for the 4 pending stores a near-term priority?
- **Why it matters:** Identical reviews with identical author names on three different companies' sites is a trust and compliance exposure for your clients, not just for you.
- **Status:** Pending

### Q12 — Strategy / Vision
- **Question:** 12 months out, what does "this worked" look like?
- **Why it matters:** Defines the North Star and success metric for `01-product-vision.md`.
- **Status:** Pending

---

## 3. User Observations / Notes

- 2026-06-26: "son tiendas de suplementación deportiva", not gyms. Stores are independent companies with their own CIF; some owners have 2–3 stores.
- 2026-06-26: prefers to be addressed in **Spanish**.
- 2026-06-26: expects the agent to **investigate the repo properly before asking**; vague questions whose answers are in the code are not acceptable.

---

## 4. Recently Resolved Doubts

- **Project phase** — resolved 2026-06-26: confirmed **Iteration** by the user. Pending formal `/mm-gate` confirmation in Phase 7.
- **Sector / what the business actually is** — resolved 2026-06-26: sports-supplement retail stores, not gyms. Source: `src/data/stores.json` + user correction.
- **Monetization, ownership structure, transactional roadmap, conversion priority** — resolved 2026-06-26 (Q5, Q6, Q7, Q2 above).

---

## 5. Deferred / Parked

- Pricing/amounts of the monthly fee — user explicitly declined to share; not needed for the audit.

---

## Maintenance

- This file must be reviewed at every **phase gate**.
- The `doubt-surfacer` and `memory-updater` skills are responsible for keeping it accurate.
- Never delete entries. Move them to *Recently Resolved* or *Deferred*.
