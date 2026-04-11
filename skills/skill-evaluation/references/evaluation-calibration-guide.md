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

## 5) Reviewer checklist (quick)

- [ ] Did I cite concrete evidence for each major finding?
- [ ] Did I separate confirmed issues from uncertain issues?
- [ ] Did I apply trust modifier transparently?
- [ ] Did I run repeatability checks on critical paths?
- [ ] Did I keep recommendation consistent with thresholds?
