# Baseline v1: Source Benchmark for `anthropics/skills`

## 1. Context

- Benchmark target: `https://github.com/anthropics/skills` (source-level benchmark, not a single skill)
- Evaluation objective: improve scoring validity of local `skill-evaluation` rubric
- Scope tier: `deep`
- Date: 2026-04-11
- Evaluator: skill-evaluation (calibration run)
- Baseline reference: none (`source-benchmark-v1`)

## 2. Score Matrix (calibration-oriented)

| Dimension | Score (1-5) | Weight | Weighted Score | Evidence ID |
|-----------|-------------|--------|----------------|-------------|
| Task Completion | 4.0 | 25% | 20.0 | E-001 |
| Procedure/Tool Correctness | 4.5 | 20% | 18.0 | E-002 |
| Robustness & Consistency | 4.0 | 20% | 16.0 | E-003 |
| Safety & Policy Adherence | 4.5 | 15% | 13.5 | E-004 |
| Efficiency | 4.0 | 10% | 8.0 | E-005 |
| Usability & Maintainability | 4.5 | 10% | 9.0 | E-006 |
| **Core Total (0-100)** |  | 100% | **84.5** |  |

## 2.1 Platform Trust Overlay

| Signal | Observation | Score Impact | Evidence ID |
|--------|-------------|--------------|-------------|
| Source reputation | Anthropic official public skills repo | +3 | E-007 |
| GitHub stars | ~115k stars, very high ecosystem trust | +3 | E-008 |
| Ecosystem maturity | Multi-skill sets, templates, spec folder | +2 | E-009 |
| Security/quality signal | Public repo quality visible, but still needs local validation | 0 | E-010 |
| **Trust Modifier (-10 to +10)** |  | **+8** |  |
| **Final Total (0-100)** | Core Total + Trust Modifier | **92.5** |  |

## 3. Key findings

### Strengths

- Provides a clean template (`name` + `description`) that is easy to verify and automate.
- Emphasizes self-contained skill folders and practical reuse patterns.
- Explicitly warns that demo implementations are not equal to guaranteed production behavior.

### Risks

- As a broad example repository, individual skill quality still varies; cannot assume uniform production readiness.
- Local environment differences can invalidate direct score transfer without execution traces.

### Blockers

- None.

## 4. Calibration value for local skill-evaluation

This benchmark suggests adding:

- Conformance checklist (frontmatter, boundaries, self-contained references)
- Deployment-risk clarity checks (demo vs production)
- Evidence-strength rules by severity

## 5. Recommendation

- Decision: `PASS` as a benchmark source for rubric calibration
- Follow-up: keep periodic refresh cadence when major repo/docs changes occur

## 6. Evidence Appendix

| Evidence ID | Input / Trace Summary | Source Link or Path |
|-------------|------------------------|---------------------|
| E-001 | Repository purpose and skills scope | `https://github.com/anthropics/skills` |
| E-002 | Template frontmatter pattern | `https://raw.githubusercontent.com/anthropics/skills/main/template/SKILL.md` |
| E-003 | Repeatable structure across folders | `https://github.com/anthropics/skills` |
| E-004 | Disclaimer and testing guidance | `https://raw.githubusercontent.com/anthropics/skills/main/README.md` |
| E-005 | Multi-surface usage docs (Claude Code/AI/API) | `https://raw.githubusercontent.com/anthropics/skills/main/README.md` |
| E-006 | Skill sets and organization consistency | `https://raw.githubusercontent.com/anthropics/skills/main/README.md` |
| E-007 | Official source identity | `https://github.com/anthropics/skills` |
| E-008 | Ecosystem popularity signal | `https://github.com/anthropics/skills` |
| E-009 | Presence of template/spec directories | `https://github.com/anthropics/skills` |
| E-010 | Local validation still required statement | `https://raw.githubusercontent.com/anthropics/skills/main/README.md` |
