---
name: skill-group
description: Create a Group Skill — a meta-skill that orchestrates multiple sub-skills with a shared context. Use when the user types "/skill-group skill-a, skill-b, ..." or wants to combine several skills into one workflow.
---

# Skill Group

A Group Skill composes multiple sub-skills into a single orchestrated workflow. All sub-skills share a common context object (Blackboard pattern) — each skill reads from and writes to it, so information flows naturally between steps.

---

## Trigger

**Syntax**:
```
/skill-group <skill-name-1>, <skill-name-2>[, <skill-name-3> ...]
```

**Examples**:
```
/skill-group google-news-seo, insight-pdf
/skill-group git-intelligence, insight-pdf
/skill-group google-news-seo, seo-review, insight-pdf
```

When this syntax is detected, immediately execute **Create Mode** below.

---

## Create Mode

Steps:
1. Resolve each skill name to its SKILL.md path: `skills/<skill-name>/SKILL.md`
2. **Check local availability**: for each skill, verify the SKILL.md file exists locally
   - If **missing**: mark it as `not installed`, record its install command (see Install Command Format below)
   - If **present**: read it in full
3. If any skills are `not installed`, output the install commands and stop:
   ```
   The following sub-skills are not installed locally. Run these commands first:

   npx skills add {{registry-url}} --skill {{skill-name}}
   ...
   ```
4. Once all skills are available, for each sub-skill identify:
   - **Inputs**: what context or preconditions it requires
   - **Outputs**: what key results or artifacts it produces
5. Infer execution order from input/output dependencies
6. Infer the shared `context` schema: union of all inputs and outputs as named fields
7. Generate a new `SKILL.md` using the **Group Skill Template** below
8. Save it to `skills/<group-name>/SKILL.md`

### Install Command Format

```
npx skills add <registry-url> --skill <skill-name>
```

The `registry-url` is the GitHub repo where the skill is published.
If not known, use the default registry: `https://github.com/wghust/stark-skills`

**Example**:
```
npx skills add https://github.com/wghust/stark-skills --skill google-news-seo
npx skills add https://github.com/wghust/stark-skills --skill insight-pdf
```

---

## Universal Orchestration Logic

> This block is copied verbatim into every generated Group Skill. It is the runtime engine — do not modify when copying.

### Step 0 — Initialize Shared Context

Load the `## Initial Context` block from this SKILL.md as the shared context object `context`.
Display it at the start so the current state is always visible.

### Step 1..N — Execute Sub-skills in Order

For each sub-skill listed in `## Sub-skills`:

1. Read that sub-skill's SKILL.md in full
2. Before executing, remind yourself of the current `context` state
3. Execute the sub-skill's instructions completely
4. After execution, update `context` with any new outputs produced (fields defined in `## Context Fields`)
5. Display the updated `context` before moving to the next sub-skill

> If a sub-skill fails: stop, report the failure, and display the current `context`. Do not continue to the next sub-skill.

### Step Final — Summary

Output the final `context` as the execution summary.

---

## Group Skill Template

Use this template when generating a new Group Skill (Mode A). Fill in all `{{placeholder}}` values.

```markdown
---
name: {{group-name}}
description: {{group-description}}
---

# {{Group Name}}

{{One-line description of what this group skill accomplishes.}}

---

## When to Use

{{trigger-description}}

---

## Dependencies

Install all sub-skills before running this group skill:

```bash
{{install-commands}}
```

---

## Universal Orchestration Logic

### Step 0 — Initialize Shared Context

Load the `## Initial Context` block from this SKILL.md as the shared context object `context`.
Display it at the start so the current state is always visible.

### Step 1..N — Execute Sub-skills in Order

For each sub-skill listed in `## Sub-skills`:

1. Read that sub-skill's SKILL.md in full
2. Before executing, remind yourself of the current `context` state
3. Execute the sub-skill's instructions completely
4. After execution, update `context` with any new outputs produced (fields defined in `## Context Fields`)
5. Display the updated `context` before moving to the next sub-skill

> If a sub-skill fails: stop, report the failure, and display the current `context`. Do not continue.

### Step Final — Summary

Output the final `context` as the execution summary.

---

## Sub-skills

{{ordered list, one per line, format: N. skill-name — brief role description}}

---

## Initial Context

```json
{{initial-context-json}}
```

---

## Context Fields

{{table: field | updated by | description}}
```

---

## How to Fill the Template (for AI generating a new Group Skill)

| Placeholder | How to derive it |
|---|---|
| `{{group-name}}` | Infer from the combined purpose of sub-skills; use lowercase-hyphenated format |
| `{{group-description}}` | One sentence summarizing the full workflow |
| `{{trigger-description}}` | When should a user invoke this group skill? |
| `{{install-commands}}` | One `npx skills add <registry-url> --skill <name>` line per sub-skill, in execution order |
| `{{ordered list}}` | Sort sub-skills so each one's inputs are satisfied by prior outputs |
| `{{initial-context-json}}` | Collect all input fields from all sub-skills; set initial values to `null` or `[]` |
| `{{context-fields-description}}` | For each field: which sub-skill writes it and what it represents |

**Rule**: The `## Universal Orchestration Logic` block must be copied verbatim — do not modify it.
