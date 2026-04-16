# Baseline Index (Skill Evaluation)

## Purpose

统一管理高优先级 skill 的基线评测报告，便于后续回归对比、发布门禁和复评排期。

## Baseline Reports

| Target | Baseline File | Scope | Final Decision | Priority | Last Updated | Next Review |
|--------|---------------|-------|----------------|----------|--------------|-------------|
| `skill-evaluation` | `baseline-skill-evaluation-v3.md` | deep | PASS | P0 | 2026-04-16 | 版本变更后立即复评；否则双周 |
| `find-skills` (skills.sh) | `baseline-find-skills-v2.md` | deep | PASS | P0 | 2026-04-16 | 版本变更后立即复评；否则双周 |
| `anthropics/skills` source benchmark | `baseline-anthropics-skills-repo-benchmark-v1.md` | deep | PASS | P1 | 2026-04-11 | 月度刷新或上游重大变更后 |

## Prioritization Rule

优先级建议按以下顺序确定：

1. 使用频次
2. 业务风险
3. 变更频率
4. 历史缺陷密度

## Review Cadence

- **P0**: 每次变更必跑 `smoke` + `regression`；关键改动跑 `deep`
- **P1**: 每次关键改动跑 `regression`；月度跑 `deep`
- **P2**: 按需复评

## Versioning Convention

建议基线文件命名逐步统一为：

- `baseline-<skill>-v1.md`
- `baseline-<skill>-v2.md`

并在每次更新时记录：

- 评测范围变化
- 核心分变化
- trust modifier 变化
- 新增/消除 blocker

## Standard Case Reference Rule

建议从本次变更后开始，baseline / regression 报告尽量引用标准 case ID：

- 通用骨架：`GEN-###`
- 工具型扩展：`TOOL-###`

推荐最少记录：

- scope tier
- 已执行 case IDs
- 每个关键 finding 对应的 case ID
