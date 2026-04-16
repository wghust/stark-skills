# Baseline v2: Evaluate `find-skills` (skills.sh)

## 1. Context

- Target skill: `https://skills.sh/vercel-labs/skills/find-skills`
- Evaluation objective: baseline quality audit for high-usage ecosystem skill
- Scope tier: `deep`
- Date: 2026-04-16
- Evaluator: skill-evaluation (sample run, migrated to standardized baseline format)
- Baseline reference: `baseline-find-skills-v1.md`
- Standard case set:
  - `GEN-001`
  - `GEN-002`
  - `GEN-003`
  - `GEN-004`
  - `GEN-005`
  - `GEN-006`
- Custom extra cases (optional):
  - `TOOL-001`
  - `TOOL-002`
  - `TOOL-004`

## 2. Score Matrix

| Dimension | Score (1-5) | Weight | Weighted Score | Evidence ID |
|-----------|-------------|--------|----------------|-------------|
| Task Completion | 4.5 | 25% | 22.5 | E-001 |
| Procedure/Tool Correctness | 4.5 | 20% | 18.0 | E-002 |
| Robustness & Consistency | 4.0 | 20% | 16.0 | E-003 |
| Safety & Policy Adherence | 4.0 | 15% | 12.0 | E-004 |
| Efficiency | 4.5 | 10% | 9.0 | E-005 |
| Usability & Maintainability | 4.5 | 10% | 9.0 | E-006 |
| **Core Total (0-100)** |  | 100% | **86.5** |  |

## 2.1 Platform Trust Overlay (skills.sh)

| Signal | Observation | Score Impact | Evidence ID |
|--------|-------------|--------------|-------------|
| Install signal | Weekly installs: 960.9K, ecosystem usage very high | +3 | E-007 |
| Source reputation | Publisher: `vercel-labs/skills` | +2 | E-008 |
| GitHub stars | Repository stars: 13.7K | +2 | E-009 |
| Security audits | Multi-vendor badges include Pass and one Warn | -1 | E-010 |
| **Trust Modifier (-10 to +10)** |  | **+6** |  |
| **Final Total (0-100)** | `Core Total + Trust Modifier` | **92.5** |  |

## 2.2 Conformance Checklist

- [x] `SKILL.md` frontmatter contains `name` and `description`
- [x] Instructions define clear trigger/use boundaries
- [x] Skill is self-contained (or has explicit dependencies)
- [x] Supporting references/scripts are explicitly linked
- [x] Risk/disclaimer notes are present when needed

## 3. Key Findings

### Strengths

- 能将“用户不会做什么”转换为“推荐可安装 skill”，覆盖查找、安装、校验、更新完整流程。
- 明确质量筛选口径，包括安装量、来源信誉、stars 和安全审计信号。
- 生态采用度高，适合长期做高价值外部 benchmark。

### Defects / Risks

- 安全审计存在 Warn 信号，需要持续关注并在版本变化时复核。
- 对“无匹配结果”虽然有兜底，但未强制要求输出结构化搜索日志，回归比较仍有信息损失。

### Blockers

- Severity: None
- Description: No P0 blocker found
- Evidence: E-001 to E-006

## 4. Reliability Protocol Results

### Repeatability

- Input ID: `GEN-005`
- Run A result: Final 92.5 (`PASS`)
- Run B result: Final 92.0 (`PASS`)
- Drift conclusion: Release grading stable; score drift 0.5 is acceptable for an ecosystem benchmark.

### Perturbation

- Variant description: 用户描述从“找 skill”改写为“有没有可安装的能力扩展”
- Result: 仍能命中同一 skill discovery workflow
- Impact on score: No material change

### Failure-path

- Fault type: `npx skills find` 无匹配结果
- Observed behavior: 技能要求回退到“直接帮助 + 建议自建 skill”
- Recovery quality: Acceptable

## 5. Recommendation

- Release decision: `PASS`
- Reason: Core score 86.5 is already strong, and ecosystem trust signals lift the final total to 92.5 without hiding any P0/P1 blocker.

## 5.1 Dual-Judge Conflict Review

| Conflict ID | Case ID | Conflict Type | Final Arbitration | Score Impact | Uncertainty Note |
|-------------|---------|---------------|-------------------|--------------|------------------|
| CJ-001 | TOOL-004 | `trace-clean / judge-negative` | `accept-judge-quality-defect` | `minor-downward` | No hard workflow failure was observed, but fallback output shape remains under-specified for strict regression use. |

Conflict detail:

- `trace_finding`: Discovery, install, and update flow are clearly documented and operational.
- `judge_finding`: The fallback path for no-match scenarios lacks a stronger structured-output contract, which reduces comparability across evaluators.
- `evidence_strength`: `medium`
- Arbitration rationale: This is treated as a maintainability and observability defect rather than a procedure failure, because the recovery path exists and is functional.

## 6. Prioritized Fixes

- P1: 将安全审计 Warn 纳入定期复核清单，版本变更即复查。
- P2: 增加“无匹配结果”场景的结构化输出模板，提升回归一致性。
- P2: 在公开页面或 docs 中增加 fallback 示例，减少评测人对恢复质量的主观判断空间。

## 7. Evidence Appendix

| Evidence ID | Input / Trace Summary | Source Link or Path |
|-------------|------------------------|---------------------|
| E-001 | 功能目标与适用场景定义 | `skills.sh find-skills page` |
| E-002 | `npx skills find/add/check/update` 流程要求 | `skills.sh find-skills page` |
| E-003 | 重复评测与扰动结果 | 本文档第 4 节 |
| E-004 | 安全审计状态（含 Warn） | `skills.sh find-skills page` |
| E-005 | CLI 工作流效率与易执行性 | `skills.sh find-skills page` |
| E-006 | 触发词与推荐流程清晰度 | `skills.sh find-skills page` |
| E-007 | Weekly installs 960.9K | `skills.sh find-skills page` |
| E-008 | Publisher `vercel-labs/skills` | `skills.sh find-skills page` |
| E-009 | GitHub stars 13.7K | `skills.sh find-skills page` |
| E-010 | Security audits (Pass + Warn) | `skills.sh find-skills page` |

## 7.1 Standard Case Coverage

| Case ID | Description | Status | Evidence ID |
|---------|-------------|--------|-------------|
| GEN-001 | Core Happy Path | PASS | E-001 |
| GEN-002 | Mandatory Input Gate | PASS | E-002 |
| GEN-003 | Paraphrase / Perturbation | PASS | E-003 |
| GEN-004 | Failure-Path Recovery | PASS | E-004 |
| GEN-005 | Repeatability Stability | PASS | E-003 |
| GEN-006 | Maintainability / Readability Review | PASS WITH MINOR DEFECT | E-006 |
| TOOL-001 | Tool Selection Correctness | PASS | E-002 |
| TOOL-002 | External Dependency Handling | PASS | E-004 |
| TOOL-004 | Output Traceability | PASS WITH MINOR DEFECT | E-006 |

## 8. Delta vs v1

- Core Total: unchanged at `86.5`
- Final Decision: unchanged at `PASS`
- New standardization evidence:
  - standard case IDs mapped to both general and tooling scenarios
  - dual-judge conflict review added
- Remaining gap:
  - fallback traceability is still not standardized enough
