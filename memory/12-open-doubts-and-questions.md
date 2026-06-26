# Open Doubts and Questions — USAFitness Landing Pages

**Last updated:** 2026-06-26
**Current phase:** Iteration

> This file is the living record of the project's open doubts, the questions the AI has asked the user, and the user's own observations.
> It is updated at every checkpoint, before and after any important document or implementation.
> It is the single source of truth for *"what we still don't know"*.

---

## 1. AI Current Doubts (Open)

Doubts the AI currently holds. Check as resolved when answered.

### Technical
- [ ] How many stores must this scale to (5 → 20 → 100)? Determines whether file-based `stores.json` stays viable or needs validation/CMS.
- [ ] Is Railway + single Node service the long-term host, or is a CDN/static/edge move planned?
- [ ] Appetite for a test/CI safety net given zero tests today and a middleware-driven multi-domain render.

### Product / Value Proposition
- [ ] Is each store landing the PRIMARY web presence, or secondary to a corporate site / Google Business Profile?
- [ ] What is the single strongest differentiator vs. just a Google Business Profile + Maps listing?

### Users / Jobs-to-be-Done
- [ ] Who is the target member per store, and does it vary by location?
- [ ] Is the visitor actively shopping for a gym now, or just checking hours/location of a known one?

### Business Model / Monetization
- [ ] How does this make money *for the operator* (gym owner / paid contractor / revenue-share / product to resell)?
- [ ] Are the 5 stores one company or independent franchisees/owners (per-store `company` legal blocks hint at the latter)?
- [ ] Any intent to add transactional features (online signup, class booking, payments) later?

### UX / Critical Flows / Edge Cases
- [ ] Primary conversion action — WhatsApp vs call vs directions vs (future) online signup?
- [ ] Are conversions (WhatsApp/call clicks) tracked as GA events today?

### Risks (technical, legal, operational, regulatory)
- [ ] Are the published reviews genuine and consented (names + avatars)?
- [ ] Priority of completing real legal `company` data for the 4 placeholder stores?
- [ ] Single Railway service = SPOF for all domains — acceptable or to be hardened?

### Assumptions that might be wrong
- [ ] That this is purely a marketing/lead-gen site with no transactional roadmap.
- [ ] That the operator is the sole builder and decision-maker.

---

## 2. High-Quality Questions Asked to the User

Questions the AI has asked, grouped by category. Update the *Response* and *Impact* fields as answers arrive.

### Template

```
### Q[N] — [Category]
- **Question:** ...
- **Why it matters:** ...
- **Status:** Pending | Answered | Deferred
- **User response:** ...
- **Impact on project:** ...
- **Asked on:** YYYY-MM-DD
```

### Active questions

### Q1 — Product / Value Proposition
- **Question:** Is each store's landing the PRIMARY web presence for that gym, or does it sit alongside a corporate `usafitness.es` site and/or each store's Google Business Profile?
- **Why it matters:** Determines whether the landing must do everything (brand, trust, convert) or just capture local-search traffic and hand off.
- **Status:** Pending
- **Asked on:** 2026-06-26

### Q2 — Product / Value Proposition
- **Question:** What single thing should a visitor DO on the landing — WhatsApp, call, get directions, or (later) sign up/pay online? Please rank them.
- **Why it matters:** Defines the primary conversion design and the success metric the whole audit hangs on.
- **Status:** Pending
- **Asked on:** 2026-06-26

### Q3 — Users / Jobs-to-be-Done
- **Question:** Who is the target member for these gyms (e.g. budget-conscious locals, students, families, serious lifters)? Same across all 5 stores or different per location?
- **Why it matters:** Drives personas, copy, and per-store SEO localization.
- **Status:** Pending
- **Asked on:** 2026-06-26

### Q4 — Users / Jobs-to-be-Done
- **Question:** What is the "job" that brings someone to the page — actively shopping for a gym to join now, comparing prices, or just checking the hours/location of a gym they already know?
- **Why it matters:** Changes whether the page should sell hard or simply inform.
- **Status:** Pending
- **Asked on:** 2026-06-26

### Q5 — Business Model / Monetization
- **Question:** How does this project make money *for you specifically* — are you the gym owner, a paid contractor per store, a revenue-share partner, or building this as a product to sell to other gyms?
- **Why it matters:** The single biggest unknown; it reframes the entire strategy, success metric, and roadmap.
- **Status:** Pending
- **Asked on:** 2026-06-26

### Q6 — Business Model / Monetization
- **Question:** Are the 5 stores one company or independent franchisees/owners? (The per-store `company` legal blocks suggest different legal owners.)
- **Why it matters:** Decides who the customer is, who pays, and how data/legal governance must work.
- **Status:** Pending
- **Asked on:** 2026-06-26

### Q7 — Business Model / Monetization
- **Question:** Is there any intent to add transactional features later (online membership signup, class booking, payments)?
- **Why it matters:** Determines whether the no-DB/no-auth architecture is a permanent choice or a temporary one — a major architectural fork.
- **Status:** Pending
- **Asked on:** 2026-06-26

### Q8 — Technical
- **Question:** How many stores do you expect this to serve in 12 months — ~5, ~20, ~100?
- **Why it matters:** At ~5 the file-based `stores.json` is fine; at ~100 you need schema validation, possibly a CMS, and tests. Drives the tech roadmap.
- **Status:** Pending
- **Asked on:** 2026-06-26

### Q9 — Technical
- **Question:** With zero tests/CI today and the live render depending on middleware + `stores.json` shape, how much do you want to invest in a safety net (build check, per-store smoke) vs. keep shipping fast?
- **Why it matters:** Cross-project evidence: a human prod-smoke per store catches exactly the middleware/SSR bugs your git history already shows (500s, cookie banner). Sets a top-10 action.
- **Status:** Pending
- **Asked on:** 2026-06-26

### Q10 — UX / Critical Flows
- **Question:** Do you track conversions today (WhatsApp clicks, call clicks as GA events)? Is "which store converts best" something you want to know?
- **Why it matters:** Decides whether analytics is mere compliance or a real decision tool — affects the metrics angle.
- **Status:** Pending
- **Asked on:** 2026-06-26

### Q11 — Risks / Legal
- **Question:** For the 4 stores without real legal `company` data (currently `noindex` placeholders), is completing that data a near-term priority — and are the published reviews genuine and consented?
- **Why it matters:** Legal exposure + SEO completeness; affects risk ranking and the top-10 actions.
- **Status:** Pending
- **Asked on:** 2026-06-26

### Q12 — Strategy / Vision
- **Question:** 12 months out, what does "this worked" look like — top local rankings for all stores, X leads/month per store, a template you can deploy in a day, or something else?
- **Why it matters:** Defines the North Star and the success metric the audit and `01-product-vision.md` need.
- **Status:** Pending
- **Asked on:** 2026-06-26

---

## 3. User Observations / Notes

Things the user wants on the record. Written by the user, not the AI.

- ...

---

## 4. Recently Resolved Doubts

Moved here once closed. Keep a short reason for the resolution.

- **Phase of the project** — resolved 2026-06-26: confirmed **Iteration** by the user during MASTERMIND onboarding (live multi-store site, all recent work is post-launch). Pending formal `/mm-gate` confirmation in Phase 7.

---

## 5. Deferred / Parked

Questions or doubts that are intentionally parked until a later phase.

- ...

---

## Maintenance

- This file must be reviewed at every **phase gate** (Discovery → Definition → MVP → Iteration → Launch).
- The `doubt-surfacer` and `memory-updater` skills are responsible for keeping it accurate.
- Never delete entries. Move them to *Recently Resolved* or *Deferred*.
