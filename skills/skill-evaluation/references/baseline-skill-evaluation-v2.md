# Baseline v2: Evaluate `skill-evaluation`

## 1. Context

- Target skill: `skills/skill-evaluation/`
- Evaluation objective: baseline audit
- Scope tier: `deep`
- Date: 2026-04-16
- Evaluator: workspace self-audit
- Baseline reference: `baseline-skill-evaluation-v1.md`
- Standard case set:
  - `GEN-001`
  - `GEN-002`
  - `GEN-003`
  - `GEN-004`
  - `GEN-005`
  - `GEN-006`
- Custom extra cases (optional):
  - None

## 2. Score Matrix

| Dimension | Score (1-5) | Weight | Weighted Score | Evidence ID |
|-----------|-------------|--------|----------------|-------------|
| Task Completion | 4.0 | 25% | 20.0 | E-001 |
| Procedure/Tool Correctness | 4.0 | 20% | 16.0 | E-002 |
| Robustness & Consistency | 4.0 | 20% | 16.0 | E-003 |
| Safety & Policy Adherence | 4.0 | 15% | 12.0 | E-004 |
| Efficiency | 4.0 | 10% | 8.0 | E-005 |
| Usability & Maintainability | 4.0 | 10% | 8.0 | E-006 |
| **Core Total (0-100)** |  | 100% | **80.0** |  |

## 2.1 Platform Trust Overlay (skills.sh, optional)

| Signal | Observation | Score Impact | Evidence ID |
|--------|-------------|--------------|-------------|
| Install signal | Not available | 0 | E-007 |
| Source reputation | Local workspace skill, no external publisher signal | 0 | E-007 |
| GitHub stars | Not applicable for this local-only evaluation | 0 | E-007 |
| Security audits | No platform audit data provided | 0 | E-007 |
| Spec conformance | Frontmatter and self-contained references present | 0 | E-008 |
| **Trust Modifier (-10 to +10)** |  | **0** |  |
| **Final Total (0-100)** | `Core Total + Trust Modifier` | **80.0** |  |

## 2.2 Conformance Checklist

- [x] `SKILL.md` frontmatter contains `name` and `description`
- [x] Instructions define clear trigger/use boundaries
- [x] Skill is self-contained (or has explicit dependencies)
- [x] Supporting references/scripts are explicitly linked
- [ ] Risk/disclaimer notes are present when needed

## 3. Key Findings

### Strengths

- 输入门禁明确，缺少 target / objective / scope 时会先阻断。
- 六维评分、可信度修正和 release gate 已经成体系。
- 已补齐标准测试用例库，baseline 可以直接引用稳定 case ID。
- 已补齐 dual-judge 冲突裁决模板，证据不足和主观质量冲突都有标准记录方式。

### Defects / Risks

- trust overlay 仍缺少统一的数据采集动作细则。
- 自评基线仍然有递归偏差风险，后续最好补外部 skill 的交叉评测样例。

### Blockers

- Severity: None
- Description: No P0 blocker found
- Evidence: E-001 to E-006

## 4. Reliability Protocol Results

### Repeatability

- Input ID: `GEN-005`
- Run A result: Missing-input gate enforced before scoring
- Run B result: Missing-input gate enforced before scoring
- Drift conclusion: Gate behavior stable

### Perturbation

- Variant description: “使用 skill-evaluation 测评” vs “做 skill review”
- Result: Both map to the same evaluation workflow and output shape
- Impact on score: No material change

### Failure-path

- Fault type: Missing platform trust data / no skills.sh overlay
- Observed behavior: Core scoring continues, trust modifier stays neutral
- Recovery quality: Acceptable

## 5. Recommendation

- Release decision: `CONDITIONAL PASS`
- Reason: Core structure is solid and now better standardized, but trust-overlay collection guidance still needs to be operationalized before this can be treated as a low-variance release gate.

## 5.1 Dual-Judge Conflict Review

| Conflict ID | Case ID | Conflict Type | Final Arbitration | Score Impact | Uncertainty Note |
|-------------|---------|---------------|-------------------|--------------|------------------|
| CJ-001 | GEN-006 | `trace-clean / judge-negative` | `accept-judge-quality-defect` | `minor-downward` | Not a procedural error; maintainability concerns accepted with moderate confidence. |

Conflict detail:

- `trace_finding`: Structure is present and the workflow references supporting materials correctly.
- `judge_finding`: Earlier baseline wording left test-plan and conflict-resolution expectations too implicit for stable cross-evaluator use.
- `evidence_strength`: `medium`
- Arbitration rationale: This is treated as a quality and maintainability defect rather than a procedural failure, because the trace showed complete workflow coverage but the wording quality still risked evaluator drift.

## 6. Prioritized Fixes

- P0: None
- P1: Add trust-overlay data collection instructions
- P2: Add at least one non-self baseline using the new dual-judge review block
- P2: Add a self-evaluation caution note for recursive assessments

## 7. Evidence Appendix

| Evidence ID | Input / Trace Summary | Source Link or Path |
|-------------|------------------------|---------------------|
| E-001 | Mandatory input gate and required inputs | [SKILL.md](/Users/wangbinbin/Documents/workspace/stark-skills/skills/skill-evaluation/SKILL.md) |
| E-002 | Six-dimension scoring model and output requirements | [SKILL.md](/Users/wangbinbin/Documents/workspace/stark-skills/skills/skill-evaluation/SKILL.md) |
| E-003 | Reliability protocol, standard case library, and robustness expectations | [SKILL.md](/Users/wangbinbin/Documents/workspace/stark-skills/skills/skill-evaluation/SKILL.md), [test-case-catalog.md](/Users/wangbinbin/Documents/workspace/stark-skills/skills/skill-evaluation/references/test-case-catalog.md) |
| E-004 | Safety and trust-overlay boundary rules | [SKILL.md](/Users/wangbinbin/Documents/workspace/stark-skills/skills/skill-evaluation/SKILL.md) |
| E-005 | Usage guidance and scope descriptions | [USAGE.md](/Users/wangbinbin/Documents/workspace/stark-skills/skills/skill-evaluation/USAGE.md) |
| E-006 | Report template, calibration guide, and dual-judge conflict template support | [report-template.md](/Users/wangbinbin/Documents/workspace/stark-skills/skills/skill-evaluation/references/report-template.md), [evaluation-calibration-guide.md](/Users/wangbinbin/Documents/workspace/stark-skills/skills/skill-evaluation/references/evaluation-calibration-guide.md), [dual-judge-conflict-template.md](/Users/wangbinbin/Documents/workspace/stark-skills/skills/skill-evaluation/references/dual-judge-conflict-template.md) |
| E-007 | No external skills.sh trust data available for this local run | Local workspace evaluation context |
| E-008 | Frontmatter and reference structure conform to the expected pattern | [SKILL.md](/Users/wangbinbin/Documents/workspace/stark-skills/skills/skill-evaluation/SKILL.md) |

## 7.1 Standard Case Coverage

| Case ID | Description | Status | Evidence ID |
|---------|-------------|--------|-------------|
| GEN-001 | Core Happy Path | PASS | E-002 |
| GEN-002 | Mandatory Input Gate | PASS | E-001 |
| GEN-003 | Paraphrase / Perturbation | PASS | E-003 |
| GEN-004 | Failure-Path Recovery | PASS | E-004 |
| GEN-005 | Repeatability Stability | PASS | E-003 |
| GEN-006 | Maintainability / Readability Review | PASS WITH MINOR DEFECT | E-006 |

## 8. Delta vs v1

- Core Total: `76.0 -> 80.0`
- Final Decision: unchanged at `CONDITIONAL PASS`
- New standardization evidence:
  - standard case library added
  - dual-judge conflict review added
- Remaining gap:
  - trust-overlay operational guidance still not standardized enough
