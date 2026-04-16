# Evaluation Calibration Guide (Skill-Evaluation)

## Goal

Reduce evaluator-to-evaluator variance and make reports more comparable over time.

## 1) Three-layer scoring protocol

1. **Core quality score (0-100)**
   - Six dimensions (task, correctness, robustness, safety, efficiency, usability)
2. **Trust overlay (-10 to +10)**
   - Platform/public signals (installs, source reputation, stars, audits, conformance)
3. **Release gate**
   - PASS / CONDITIONAL PASS / FAIL by threshold and blockers

## 2) Required evidence strength by severity

- **P0 / blocker**: at least 2 independent evidence points
  - example: run trace + reproducible input/output mismatch
- **P1**: at least 1 strong evidence point
- **P2**: observation acceptable with one trace note

If evidence is insufficient, mark as "uncertain" instead of confirmed.

## 3) Repeatability calibration

For each critical scenario:

- Run same case twice (A/B)
- If score drift > 1 or decision drift (PASS vs FAIL), mark robustness risk
- Use the lower-confidence interpretation for release gate

## 4) Cross-source calibration (recommended)

When data exists on skills ecosystems:

- Compare functional score with ecosystem trust signals.
- Do not let popularity override unresolved safety warnings.
- For low-popularity skills, avoid over-penalization if evidence quality is high.

## 4.2) Trust overlay collection calibration

Before assigning a trust modifier:

- use `references/trust-overlay-collection-guide.md`
- record which signals were directly observed vs unavailable
- avoid upgrading trust based on memory or general ecosystem familiarity

Calibration rules:

- If install/source/stars/audit are mostly unavailable, keep modifier near neutral.
- If security signal is negative or ambiguous, prefer the conservative interpretation.
- If platform signals are strong but trace quality is weak, do not let trust overlay dominate the release recommendation.
- If trust evidence completeness is low, mark that limitation explicitly in the report.

## 4.1) Dual-judge arbitration calibration

When trace-based checks and judge-based quality assessments disagree:

- Use `references/dual-judge-conflict-template.md` to record the conflict.
- If the positive side has weak evidence, do not let it upgrade the release interpretation.
- If the negative side is qualitative but reproducible, it may reduce quality scores without being reclassified as a procedural failure.
- When conflict remains unresolved, mark it `uncertain` and use the more conservative release interpretation.

## 5) Reviewer checklist (quick)

- [ ] Did I cite concrete evidence for each major finding?
- [ ] Did I separate confirmed issues from uncertain issues?
- [ ] Did I apply trust modifier transparently?
- [ ] Did I run repeatability checks on critical paths?
- [ ] Did I keep recommendation consistent with thresholds?
