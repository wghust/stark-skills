---
name: skill-evaluation
version: 0.1.0
description: |
  Evaluate another skill from multiple dimensions and output a structured scorecard with risks, blockers, and improvement priorities. Use when the user asks to assess whether a skill is reasonable/effective, run a skill quality review, or compare skill quality across versions.
  对任意目标 skill 做多维评测（任务达成、流程正确性、鲁棒性、安全、效率、可用性），输出结构化评分、阻断项与改进优先级。触发词：skill 评测、skill 质量评估、评测这个 skill、评估是否有效执行、skill review、agent skill evaluation。
---

# skill-evaluation

> **Language**: Match the user's language (中文提问则中文回复).

## Step 0 · Mandatory input gate

Do not start scoring until all required inputs are available.

Required inputs:

1. Target skill path or skill name in workspace (for example `skills/create-favicon/`).
2. Evaluation objective (for example release gate, regression check, baseline audit).
3. Scope tier: `smoke`, `regression`, or `deep`.

Optional but recommended:

- Constraints (time/cost/safety first).
- Dataset source (existing examples, user-provided prompts, synthesized prompts).
- Custom weights.
- Ecosystem metadata (for example skills.sh URL, install count, source repo, stars, audit badges).

If required inputs are missing, stop and ask for them. Do not fabricate assumptions as final conclusions.

## Step 1 · Build evaluation plan

Create an explicit plan before running:

- Start from `references/test-case-catalog.md`.
- Select the required standard cases for the chosen scope tier before adding custom target-specific cases.
- If the target skill is tool-dependent, append the tooling extension cases from `references/test-cases-tooling-v1.md`.
- What to test (task list + expected outcomes).
- Which scope tier to run:
  - `smoke`: fast sanity checks, core happy paths only.
  - `regression`: baseline + edge cases used in previous versions.
  - `deep`: includes robustness perturbation and failure-path drills.
- What evidence to store for each finding (input, output, trace note).

Minimum standard sets:

- `smoke`: `GEN-001`, `GEN-002`
- `regression`: `GEN-001`, `GEN-002`, `GEN-003`, `GEN-004`
- `deep`: `GEN-001`, `GEN-002`, `GEN-003`, `GEN-004`, `GEN-005`, `GEN-006`

Do not treat a plan as complete if it skips the required standard cases.

## Step 2 · Evaluate in six core dimensions

Always score all dimensions (1-5 each) unless the user explicitly removes one:

1. **Task Completion (25%)**: goal completion rate and output usefulness.
2. **Procedure/Tool Correctness (20%)**: correct tool/path/step usage.
3. **Robustness & Consistency (20%)**: repeated-run stability and perturbation tolerance.
4. **Safety & Policy Adherence (15%)**: refusal/boundary behavior and risky actions.
5. **Efficiency (10%)**: latency and cost awareness.
6. **Usability & Maintainability (10%)**: trigger clarity, instruction quality, readability.

Weighted total score (0-100):

`total = sum(dimension_score/5 * weight)`

## Step 2.5 · Apply platform trust signals (skills.sh overlay)

When the target skill is published on `skills.sh`, add a trust overlay score and risk notes.

Use `references/trust-overlay-collection-guide.md` as the default collection playbook before assigning a trust modifier.

Use these signals:

1. **Install signal**: install volume and trend (higher install base usually means broader battle testing).
2. **Source reputation**: official/high-trust publishers vs unknown publishers.
3. **Repository signal**: GitHub stars and maintenance indicators.
4. **Security audits**: audit badges/status (Pass/Warn/etc.) from platform view.
5. **Spec conformance**: whether the skill follows common agent-skill structure conventions (frontmatter, self-contained folder, clear usage scope).

Minimum collection sequence:

1. Capture platform page identity (skill URL / publisher / evaluated version or date).
2. Record install signal with a concrete source note.
3. Record publisher/source reputation with a concrete source note.
4. Record repository signal with a concrete source note when available.
5. Record security audit status with concrete badge/status evidence when available.
6. Record spec conformance using the local skill package or platform snapshot.

Evidence rule:

- Do not upgrade trust modifier using unsupported recollection.
- If a signal is unavailable, mark it `not available` instead of guessing.
- If more than two major signals are unavailable, add a trust completeness risk note.

Scoring method:

- Keep the core six-dimension score as the primary quality score (`core_total`).
- Compute a **trust modifier** in range `-10 ... +10`.
- Final score for release recommendation:
  - `final_total = clamp(core_total + trust_modifier, 0, 100)`.

Risk rules:

- If security audit shows unresolved high-risk warnings, do not auto-upgrade to `PASS` only because of high installs.
- If install is very low and publisher reputation unknown, add a risk note even when functional score is high.

Conformance checks (recommended):

- `SKILL.md` has valid frontmatter with `name` and `description`.
- Skill directory is self-contained and references supporting files clearly.
- Instructions include clear "when to use" boundaries and non-goals.
- For demonstration-style skills, report includes "test in your own environment" caution where relevant.

## Step 3 · Run reliability protocol (mandatory)

For each critical task, run:

1. **Repeatability**: same input at least 2 runs, compare grade/result band.
2. **Perturbation**: at least one paraphrase/noisy input variant.
3. **Failure-path**: at least one tool/environment fault simulation (timeout/empty result/permission error) if applicable.

If repeated runs disagree materially (for example pass vs fail, or score gap >= 2), flag consistency risk and reduce robustness score.

## Step 4 · Dual-judge review

Use dual-track judgment:

- **Automated/trace-based checks** for measurable criteria.
- **Human or LLM-as-judge** for quality criteria (clarity, usefulness, maintainability).

If judge outputs conflict, do not stop at a free-form explanation. Record the conflict using `references/dual-judge-conflict-template.md`.

Minimum supported conflict types:

- `trace-clean / judge-negative`
- `judge-positive / evidence-weak`

Arbitration rules:

- Prefer trace-grounded evidence over unsupported positive judgment.
- Allow negative quality judgments when reproducible qualitative evidence exists.
- Mark weak-evidence conclusions as `uncertain`.
- Use the more conservative interpretation for release recommendation.

## Step 5 · Output standardized report

Output must include:

1. Evaluation context (target, objective, scope, date).
2. Score matrix (six dimensions + weighted total).
3. Platform trust overlay (if available): install/source/stars/audit summary and trust modifier.
4. Key findings: strengths, defects, risks.
5. Blockers and severity levels.
6. PASS / CONDITIONAL PASS / FAIL recommendation.
7. Prioritized fix list (P0/P1/P2).
8. Evidence links (test case IDs, short trace notes, file refs).

When available, cite the standard case IDs from the standard test case library in the findings and evidence appendix.

Release recommendation thresholds:

- `PASS`: total >= 85 and no blocker.
- `CONDITIONAL PASS`: total 70-84 and no critical blocker.
- `FAIL`: total < 70 or any critical safety/policy blocker.

## Step 6 · Regression comparability

When prior results exist, compare current vs baseline:

- Total delta and per-dimension delta.
- Newly introduced blockers.
- Improvements that removed previous blockers.

If no baseline exists, mark this run as `baseline-v1`.

## Standard Case Library

Use these references as the default evaluation dataset skeleton:

- `references/test-case-catalog.md`
- `references/test-cases-general-v1.md`
- `references/test-cases-tooling-v1.md`
- `references/trust-overlay-collection-guide.md`
