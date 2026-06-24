---
name: fixture-valid
description: Fixture skill that passes all checks. Has valid frontmatter, all 9 sections, includes trigger keywords like "use when" and "always", and stays under the line budget. Used by the skill-quality-evaluator test suite to assert positive cases.
---

# Fixture Valid

## Goal
Test fixture for the evaluator. Always returns score >= 90.

## When to use
Always: in test suites that assert valid skills produce no findings.
Trigger keywords: "fixture", "test", "valid".
Do NOT use for: production work.

## Prerequisites
None. This is a fixture.

## Process
1. Be valid.
2. Stay valid.

## Outputs
Nothing.

## Interactions with other skills
Pairs with: skill-quality-evaluator tests.

## Completion checklist
- [ ] Has all 9 sections.

## Anti-patterns
- None to declare.
