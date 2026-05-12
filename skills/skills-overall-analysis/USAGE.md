# skills-overall-analysis — 使用说明

## 用途

在本机（当前工作区 + 用户主目录下的常见 Agent Skill 根）枚举 `SKILL.md`，输出表格化清单，并按 **P0 / P1 / P2** 给出重叠与遮蔽提示。**不会**修改任何 Skill 文件。

## 何时使用

- 想看清「项目里装了哪些 skill」「用户全局还有哪些」
- 怀疑**同名 Skill** 同时存在于全局与工作区
- 做一次定期「Skill 盘点」或交付前审计

## 如何收窄扫描范围

在对话中说明即可，例如：

- 「只扫当前仓库下的 `.cursor/skills`」
- 「不要扫 `~/.claude`」

执行时助手仍应在报告中列出**实际**使用的 `resolved_scan_roots`。

## 与 skill-governor 的区别

| | skills-overall-analysis | skill-governor |
|---|------------------------|----------------|
| 默认行为 | 只读报告 | 可生成并应用治理计划 |
| 依赖 | 文件系统（+ 可选 CLI 对比） | `bin/skill-governor` |
| 适用 | 盘点、重叠分析、 explain | 去重、profile、回滚 |

需要自动 `apply` / `rollback` 时请使用 **skill-governor**，本 skill 不代劳。

## 常见问题

**Q：报告里 P2 很多，要不要删？**  
A：P2 为启发式，**不要**仅凭 P2 删除；先看 P0。

**Q：frontmatter 没有 `name` 怎么办？**  
A：仍出现在清单中；P0 分组仅对**非空且相同**的 `name` 触发，缺失 `name` 的条目可依赖 P路径/P1 分析。
