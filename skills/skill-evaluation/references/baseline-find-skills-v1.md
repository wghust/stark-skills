# Baseline v1: Evaluate `find-skills` (skills.sh)

## 1. Context

- Target skill: `https://skills.sh/vercel-labs/skills/find-skills`
- Evaluation objective: baseline quality audit for high-usage ecosystem skill
- Scope tier: `deep`
- Date: 2026-04-11
- Evaluator: skill-evaluation (sample run)
- Baseline reference: none (`baseline-v1`)

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
| **Final Total (0-100)** | Core Total + Trust Modifier | **92.5** |  |

## 3. Key Findings

### Strengths

- 能将“用户不会做什么”转换为“推荐可安装 skill”，覆盖安装、查找、更新完整流程。
- 明确质量筛选口径（安装量、来源信誉、stars），并要求“先验证再推荐”。
- 生态采用度高，便于作为基线样本进行长期回归。

### Defects / Risks

- 安全审计存在 Warn 信号，需要持续关注并复核更新。
- 对于“无结果”场景虽然有兜底，但未强制要求输出可复现的搜索日志结构。

### Blockers

- None.

## 4. Reliability Protocol Results

### Repeatability

- Input ID: R-001 (same target and deep scope)
- Run A result: Final 92.5 (`PASS`)
- Run B result: Final 92.0 (`PASS`)
- Drift conclusion: 分级稳定，分差 0.5，可接受。

### Perturbation

- Variant description: 用户描述从“找 skill”改写为“有没有可安装的能力扩展”
- Result: 仍能命中该 skill 的触发意图和执行流程
- Impact on score: 无显著变化

### Failure-path

- Fault type: `npx skills find` 无匹配结果
- Observed behavior: 技能要求应回退到“直接帮助 + 建议自建 skill”
- Recovery quality: 可接受

## 5. Recommendation

- Release decision: `PASS`
- Reason: 核心分 86.5 已达标，且平台信号强，最终分 92.5；无关键阻断项。

## 6. Prioritized Fixes

- P1: 将安全审计 Warn 纳入定期复核清单（版本变更即复查）。
- P2: 增加“无匹配结果”场景的结构化输出模板，提升一致性。

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
