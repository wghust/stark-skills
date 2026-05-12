---
name: skills-overall-analysis
version: 0.1.0
description: |
  Enumerate locally installed agent skills (workspace + user scopes, Cursor/Claude/Codex/Agents roots), output a structured inventory, and analyze overlaps—duplicate frontmatter names, redundant paths, and low-confidence trigger collisions. Read-only; does not edit skill files. Use when the user asks for a full skill inventory, overlap/shadowing audit, global vs project skills, or skills overall analysis.
  统计本机已安装的 Agent Skill（工作区与用户目录、多提供方根），输出结构化清单并分析重叠（同名、路径冗余、触发语启发式混淆）。默认只读，不修改 Skill 文件。触发词：skill 清单、统计 skills、全局 skill 与项目 skill、重叠 skill、遮蔽、shadowing、skills overall analysis、本地 skill 审计。
---

# skills-overall-analysis

> **语言**：与用户一致（中文提问则中文回复）。

## 角色与边界

你是**只读审计员**：完成磁盘探测、frontmatter 解析、报告生成。**不得**创建/编辑/移动/删除任何 `SKILL.md` 或提供方注册表。若用户要求自动去重、合并或应用治理计划：仅提供分析报告 + **建议**其使用 **skill-governor**（`bin/skill-governor` 的 `dedupe` / `optimize` / `apply`）或经确认的手动编辑——**不要**代替 skill-governor 执行写操作。

## Step 0 · 输入

1. **工作区根目录**：默认当前工作区/打开仓库根路径；若用户指定目录则以其为准。
2. **可选**：用户是否同意运行 **skill-governor** 只读交叉校验（见 Step 5）；默认可先完成文件扫描再询问。

缺少工作区根时，用尽最大努力从环境推断并**在报告中写明假设**。

## Step 1 · 解析扫描根（存在则扫）

读取 `references/platform-paths.md`，在工作区根下与用户 home 下**探测**下列相对路径：仅当路径**存在且可读**时加入本轮 `resolved_scan_roots`；不存在则跳过，不计为失败。

对每个 `(root, relative_path)`：

- 若路径表示**文件**且文件名为 `SKILL.md` → 作为一条候选条目，其「父 skill 包目录」为父目录。
- 若路径表示**目录** → **递归**查找其下所有名为 `SKILL.md` 的文件（路径深度建议至少到 8 层；遇权限错误则记录到 `skipped_paths` 并继续）。

为每条候选记录推断：

- `source_scope`：`workspace`（路径位于用户给定工作区根之下）或 `user`（位于 `~` 展开后的用户目录树下且不在工作区根下）；若两者重叠或不确定则标 `unknown` 并说明。
- `provider`：按路径段匹配 `references/platform-paths.md` 中的标签（`cursor` / `claude` / `codex` / `agents`）；无法匹配则 `unknown`。

## Step 2 · 解析 frontmatter

对每个 `SKILL.md` 路径，读取文件；解析第一个 **YAML frontmatter** 块（`---` … `---`），抽取：

- `name`、`description`、`version`（缺省则字段留空并在表中注明）

若解析失败，该行仍列入清单，`name` 可填「(parse error)」并摘录首行错误原因。

## Step 3 · 输出清单（必选结构）

生成**一份**助手可用的报告，**必须**包含：

### 3.1 摘要

一行统计：**技能条数**、**实际扫描的根数**（`resolved_scan_roots` 长度）、**跳过的路径数**（若有）。

### 3.2 `resolved_scan_roots`

编号列表，每项为「本机绝对路径 + 本次是否扫描成功（或 skip 原因）」。

### 3.3 清单表（或等价列表）

列至少包括：

| path | source_scope | provider | frontmatter name | version | description (truncated) |

说明：`description` 栏可截断至约 120 字符并加省略号。

## Step 4 · 重叠与遮蔽分析（必选）

在报告中增加 **Findings** 小节，分 **P0 / P1 / P2**。**须**在 P0 小节首段写清本报告对「同一 session 内可同时加载」的**假设**（例如：工作区与全局/用户级 skills 可能同时可见），并注明**具体 IDE/CLI 版本优先级以官方文档为准**。

### P0 · 遮蔽 / 路由风险（高优先级）

- 多条目具有**相同** frontmatter `name`（非空），且至少两条来自不同 `source_scope`，或来自不同 `path` 且均被判定为可同时加载 → 逐组列出：`name`、所有 `path`、`source_scope`、`provider`。每组给出**人工复核**建议（保留一侧 / 改名 / 调整描述触发语），**不要**自动改文件。

### P1 · 冗余副本

- 对可解析的路径调用 `realpath`（或等价）：多条目指向**同一规范化路径** → 列为 P1。**或**两文件哈希/大小+修改时间一致（若你愿意读取比较）→ 标为冗余并附证据。

### P2 · 低置信度「可能混淆」（启发式）

- 仅当用户未要求极简摘要时输出本节。
- `name` 不同，但 `description` 经分词后 **Jaccard( token_set ) ≥ 0.55**（或连续子串高度重合）→ 标为 P2，注明**非权威、不误删依据**。

若无 P0：须明确写 **「无 P0 发现」**。

## Step 5 · skill-governor 交叉校验（可选）

文件扫描结果是本 skill 报告的**主数据源**。

若用户**同意**且环境中存在可执行的 `skill-governor` / `bin/skill-governor`：

- 运行**只读**子命令（例如 `list --format json`，以该 CLI 文档为准），将输出与扫描表对比。
- 在报告末尾增加 **「CLI 交叉校验」**：列计数差异或路径差异摘要；若未运行 CLI，写 **「CLI 交叉校验已跳过」** 及原因。

## Step 6 · 建议后续动作（只读收尾）

简短列表：

- 若存在 P0：建议用户 review 后手动调整或转 **skill-governor**。
- 若仅为 P2：说明可忽略或按需微调触发描述。

## 与用户叙述的对应

- 「全局 vs 项目」→ 对应 `source_scope` 为 `user` vs `workspace` 的对照表与 P0 分组。
- 「重叠 skill」→ P0（同名多实例）为主；P1/P2 为辅。

## 参考

- 路径与作用域约定：`references/platform-paths.md`
- 用户 FAQ：`USAGE.md`
