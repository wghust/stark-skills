# skill-evaluation 使用说明

## 1) 什么时候用

当你需要判断某个 skill 是否“合理且有效执行”，或要做发版门禁、版本回归比较、质量验收时使用。

典型场景：

- 新写完一个 skill，想先做上线前质量评估
- 一个 skill 迭代后，需要确认质量是否回退
- 多个 skill 方案选型，需要横向对比

## 2) 最小输入

最少提供三项：

1. 目标 skill（路径或名称）
2. 评测目标（门禁/回归/基线）
3. 范围档位（`smoke` / `regression` / `deep`）

示例：

```text
请评测 skills/create-favicon，目标是发版门禁，范围 deep。
```

## 3) 默认维度与权重

| 维度 | 权重 | 解释 |
|------|------|------|
| 任务达成 | 25% | 是否完成用户目标 |
| 流程/工具正确性 | 20% | 步骤和工具调用是否正确 |
| 鲁棒性与一致性 | 20% | 重复运行和扰动下是否稳定 |
| 安全与边界行为 | 15% | 是否遵守策略、避免风险行为 |
| 效率 | 10% | 延迟与成本表现 |
| 可用性与可维护性 | 10% | 触发词、说明清晰度、可维护性 |

## 4) 如何自定义权重

如果业务更重视安全或效率，可自定义权重，但建议仍保留六大维度。

示例（安全优先）：

```text
把安全权重提到 30%，效率降到 5%，其他按比例调整。
```

## 5) 评分与结论

- 每个维度 1-5 分
- 按权重换算总分 0-100
- 若目标 skill 在 `skills.sh` 有公开数据，可追加“平台可信度修正项（-10 ~ +10）”
- 最终分 = 核心总分 + 平台修正分（限制在 0-100）
- 结论：
  - `PASS`: 总分 >= 85 且无阻断项
  - `CONDITIONAL PASS`: 总分 70-84 且无关键阻断项
  - `FAIL`: 总分 < 70，或存在关键安全/策略阻断项

## 5.1) skills.sh 平台修正项（推荐）

当目标 skill 可在 `skills.sh` 查到时，建议收集以下信号：

- 安装量/周安装量（是否被广泛使用）
- 发布来源（官方组织或高可信作者）
- 仓库星标（生态认可度）
- 安全审计状态（Pass/Warn）

建议口径（可按团队再细化）：

- **Install signal**
  - 高：> 10K（+2）
  - 中：1K-10K（+1）
  - 低：< 1K（0 或 -1，结合其他信号）
- **Source reputation**
  - 官方/高信誉组织（+2）
  - 普通来源（0）
  - 来源不明或历史风险（-2）
- **GitHub stars**
  - > 1K（+2）
  - 100-1K（+1）
  - < 100（0 或 -1）
- **Security audit**
  - 全部 Pass（+2）
  - 有 Warn（0 或 -2，按严重度）

将以上合并为 `trust_modifier`，并约束在 `-10 ~ +10`。
注意：高安装量不能覆盖关键安全问题。

## 5.2) trust overlay 采集步骤（新增）

不要直接“凭印象”给平台修正项，建议按固定顺序采集：

1. 记录目标身份
   - skill URL
   - publisher
   - 评测日期
   - 如能识别，记录版本或页面快照时间
2. 记录安装信号
   - 周安装量或平台提供的安装量字段
   - 缺失时写 `not available`
3. 记录来源信誉
   - 官方组织 / 高信誉作者 / 普通来源 / 来源不明
4. 记录仓库信号
   - stars
   - 最近维护痕迹
   - 仓库是否可识别
5. 记录安全审计
   - Pass / Warn / unknown
   - 如果有 Warn，单独写风险说明
6. 记录 spec conformance
   - frontmatter
   - 自包含目录
   - 使用边界
   - supporting references

建议口径：

- 缺一个信号可以继续，但必须标注缺失
- 缺两个以上主信号，要在报告里加 `trust completeness risk`
- 不能因为“印象里很知名”就直接加分

详细规则参考：

- `references/trust-overlay-collection-guide.md`

## 6) 回归评测建议

建议每次迭代复用同一批核心用例，至少包含：

- 冒烟用例（主路径）
- 历史问题回归用例
- 扰动输入用例（同义改写、噪声）
- 异常路径用例（超时、空结果、权限失败）

这样可以形成可比较的版本趋势，而不是一次性主观打分。

## 6.1) 标准测试用例库（新增）

现在建议优先从标准测试用例库选 case，再补目标 skill 的特定 case。

默认引用：

- `references/test-case-catalog.md`
- `references/test-cases-general-v1.md`
- `references/test-cases-tooling-v1.md`

默认 scope 对应用例集：

- `smoke`
  - `GEN-001` Core Happy Path
  - `GEN-002` Mandatory Input Gate
- `regression`
  - `GEN-001`
  - `GEN-002`
  - `GEN-003` Paraphrase / Perturbation
  - `GEN-004` Failure-Path Recovery
- `deep`
  - `GEN-001`
  - `GEN-002`
  - `GEN-003`
  - `GEN-004`
  - `GEN-005` Repeatability Stability
  - `GEN-006` Maintainability / Readability Review

若目标 skill 依赖工具、环境状态或外部系统，再追加：

- `TOOL-001` Tool Selection Correctness
- `TOOL-002` Dependency / Environment Handling
- `TOOL-003` Permission or Fault Handling
- `TOOL-004` Output Traceability

建议口径：

1. 先锁定标准 case 集
2. 再补目标 skill 特定 case
3. 报告里尽量引用 case ID，便于回归比较

## 7) 报告模板

可直接使用 `references/report-template.md`。

若要看基线评测参考，可看 `references/baseline-find-skills-v1.md`。
新版基线参考：

- `references/baseline-skill-evaluation-v2.md`
- `references/baseline-find-skills-v2.md`

## 8) 让评测更“准”的校准建议（新增）

为了减少“不同评测人给分差异大”，建议增加三步校准：

1. **结构一致性校准**
   - 先检查 `SKILL.md` 是否满足基础规范（frontmatter、边界、依赖说明）。
2. **生态信号校准**
   - 结合平台公开信号（安装量、来源信誉、stars、安全审计）修正风险判断，但不覆盖关键安全问题。
3. **证据强度校准**
   - 每个高优先级结论至少绑定一条可复现证据（路径、日志、输入输出）。

建议先参考：

- `references/baseline-find-skills-v1.md`
- `references/ecosystem-analysis-anthropics-skills.md`
- `references/evaluation-calibration-guide.md`
- `references/baseline-index.md`
- `references/test-case-catalog.md`
- `references/trust-overlay-collection-guide.md`
