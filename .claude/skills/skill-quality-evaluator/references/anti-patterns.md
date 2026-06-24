# Anti-patterns detected by skill-quality-evaluator (v1)

Each anti-pattern below has a code, a severity, a detection rule, an example of what triggers it, and how to fix.

---

## MISSING_FRONTMATTER (Critical, -50)

**Detection:** The SKILL.md file does not start with a YAML frontmatter block delimited by `---` lines.

**Why it matters:** Frontmatter is the only mechanism agents use to discover and decide whether to activate a skill. Without it, the skill is invisible.

**Trigger example:**

```markdown
# My Skill

## Goal
...
```

**Fix:** Add YAML frontmatter at the very top:

```markdown
---
name: my-skill
description: What it does and when to use it. Trigger keywords ...
---

# My Skill
```

---

## INVALID_NAME (Critical, -25)

**Detection:** The `name` field violates the agentskills.io spec rules:

- Must match `^[a-z0-9]+(-[a-z0-9]+)*$` (lowercase letters, digits, single hyphens).
- Maximum 64 characters.
- Must NOT contain the reserved tokens `anthropic` or `claude`.

**Trigger examples:**

- `name: My_Skill` — uppercase + underscore.
- `name: claude-helper` — contains `claude`.
- `name: -leading-hyphen` — leading hyphen.
- `name: this-name-is-way-too-long-and-will-exceed-the-sixty-four-char-limit` — too long.

**Fix:** Rename to a valid kebab-case identifier under 64 chars without `anthropic`/`claude`.

---

## EMPTY_DESCRIPTION (Critical, -25)

**Detection:** The `description` field is missing, empty, or longer than 1024 chars.

**Why it matters:** The description is the single most consequential field — it determines when the skill activates. An empty description makes the skill un-fireable; a too-long one wastes context.

**Trigger example:**

```yaml
---
name: my-skill
description:
---
```

**Fix:** Write 50-200 words that describe what + when, including 3-6 trigger keywords.

---

## BLOATED_SKILL (Important, -15)

**Detection:** The body of the SKILL.md (excluding frontmatter) exceeds 500 lines.

**Why it matters:** Skills are loaded into the agent's context. Bloated skills consume tokens disproportionately and reduce the agent's ability to keep relevant information in mind.

**Trigger example:** A SKILL.md with 800 lines of detailed examples inline.

**Fix:** Split content into:

- `references/<topic>.md` — detailed reference material loaded only when needed.
- `scripts/<name>.ps1` — executable code (the script runs, the script body never enters context).
- `assets/<name>` — templates and fixtures.

Keep the main SKILL.md under 300 lines (target) or 500 lines (hard cap).

---

## MISSING_TRIGGER (Important, -15)

**Detection:** The `description` does not contain any of: `use when`, `use whenever`, `use before`, `use after`, `always`, `trigger`, `invoke`.

**Why it matters:** Without an explicit "when to use" cue, the agent has to infer activation, which is unreliable. Agents over-trigger or under-trigger silent-spec skills.

**Trigger example:**

```yaml
description: This skill helps with various coding tasks in the codebase.
```

**Fix:** Rewrite with explicit trigger:

```yaml
description: Reviews code changes before merge. Use when the user asks for a review, after implementation-planner produces code, or before any merge to main. Trigger keywords review, audit, lgtm, ready to merge.
```

---

## MISSING_SECTION (Important, -10 each)

**Detection:** A required H2 section is absent. Required sections: `Goal`, `When to use`, `Process`, `Anti-patterns`.

**Why it matters:** The MASTERMIND 9-section template makes skills predictable and composable. Skills missing core sections produce inconsistent behavior across the library.

**Trigger example:** A SKILL.md with `## Goal` and `## When to use` but no `## Process` and no `## Anti-patterns`.

**Fix:** Add the missing sections. See `.cursor/skills/skill-creator/SKILL.md` Step 2 for the canonical 9-section layout.

---

## What v1 deliberately does NOT detect

- Semantic accuracy of triggering (does the skill actually fire when it should? — needs LLM-judge).
- Scope drift between description and process (description says X, process does Y).
- Code template quality inside skills (snippets that won't compile).
- Cross-references to non-existent files (ORPHAN_REFERENCE — possible v1.1).
- Skill-to-skill graph coherence (DEAD_CROSS_REF — possible v1.1).
- Multi-line YAML in frontmatter (`description: >` block scalars). v1 parses single-line `key: value` only.

These belong to v2 (LLM-judge) or to manual review.
