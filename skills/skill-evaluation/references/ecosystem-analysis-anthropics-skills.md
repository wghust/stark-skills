# Ecosystem Analysis: `anthropics/skills`

## 1. Why this matters for skill-evaluation

`anthropics/skills` is a high-signal reference source for Agent Skills patterns (large adoption, mature examples).  
Using it as a benchmark helps `skill-evaluation` improve score validity and reduce subjectivity.

## 2. Observed high-value patterns

### 2.1 Minimal but strict structure

- Skills are folder-based and centered around `SKILL.md`.
- Frontmatter requires `name` and `description`.
- Skill directory is expected to be self-contained and reusable.

Implication for evaluation:

- Add a conformance checklist before deep scoring.
- Penalize missing or ambiguous frontmatter/trigger boundaries.

### 2.2 "Demonstration vs production" boundary awareness

- Repository explicitly highlights that example implementations may differ from production behavior.
- It recommends testing thoroughly in your own environment.

Implication for evaluation:

- Add a "deployment risk clarity" check:
  - Does the skill state what is guaranteed vs illustrative?
  - Are environmental assumptions explicit?

### 2.3 Multi-surface usability emphasis

- Same skill concepts are designed to work across Claude Code / Claude.ai / API contexts.

Implication for evaluation:

- Add portability checks:
  - Can instructions be executed across common agent environments?
  - Are environment-specific steps clearly isolated?

## 3. Suggested scoring refinements for this workspace

Use these as additional scoring hints under usability/maintainability and trust overlay:

1. **Spec conformance signal (0-2)**
   - 0: structure unclear or missing required frontmatter
   - 1: structurally valid but weak boundaries
   - 2: structurally clean with explicit trigger and non-goal
2. **Operational clarity signal (0-2)**
   - 0: no caveats/risk notes
   - 1: partial risk statements
   - 2: explicit boundaries and deployment caveats
3. **Portability signal (0-2)**
   - 0: single environment assumptions only
   - 1: partial multi-environment hints
   - 2: clear portability path and constraints

These can feed into either:

- trust modifier (small impact), or
- usability dimension rationale (primary impact).

## 4. Reporting recommendation

For high-impact skills, append a small "Conformance Checklist" in the report:

- Frontmatter valid (`name`, `description`)
- Clear "when to use" and non-goals
- Self-contained folder with explicit references
- Risk/disclaimer notes present where needed
- Environment assumptions stated

## 5. Sources

- `https://github.com/anthropics/skills`
- `https://raw.githubusercontent.com/anthropics/skills/main/README.md`
- `https://raw.githubusercontent.com/anthropics/skills/main/template/SKILL.md`
