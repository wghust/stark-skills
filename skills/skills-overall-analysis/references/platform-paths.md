# 平台路径与作用域约定（仅供参考）

以下为常见 **Skill 根目录**相对路径约定，用于从磁盘路径推断 `provider` 与 `source_scope`。**各产品在具体版本中的加载顺序与可见范围以官方文档为准**；本表仅供本 skill 做**一致性标注**，不构成法律或产品承诺。

## 相对路径探测列表（与工作区根或家目录组合）

将下列 **relative** 与工作区根 `$WORKSPACE` 或用户主目录 `$HOME` 拼接后探测存在性：

| relative | 典型 provider | 典型 scope |
|----------|---------------|------------|
| `.cursor/skills` | cursor | workspace |
| `.cursor/skills-cursor` | cursor | workspace |
| `.claude/skills` | claude | workspace |
| `.codex/skills` | codex | workspace |
| `.agents/skills` | agents | workspace |
| `$HOME/.cursor/skills` | cursor | user |
| `$HOME/.claude/skills` | claude | user |
| `$HOME/.codex/skills` | codex | user |
| `$HOME/.agents/skills` | agents | user |

说明：

- **Codex** 技能也可能安装在**用户**目录（例如 `~/.codex/skills`）；本 skill 按上表探测。
- 若路径同时落在 `$WORKSPACE` 与 `$HOME` 语义重叠（罕见），在报告中标 `source_scope: unknown` 并给出绝对路径。
- Cursor 等可能还有其他扩展路径；若在环境中发现未列出的根目录，可由用户指定加入 `resolved_scan_roots`。

## 「可同时加载」的假设（用于 P0 说明）

向用户解释时采用**保守**表述：

- **同一编辑器会话**可能同时加载**工作区级**与**用户级**技能；若 frontmatter `name` 相同，可能导致**路由歧义或遮蔽**，应以各产品文档中的优先级为准。
- 本 skill **不**裁判运行时究竟选用哪一条；仅标出**存在性风险**。

## skill-governor 交叉校验

若已安装 **skill-governor**，其可能对 `codex` / `cursor` / `claude` 等多提供方有统一视图。交叉校验时以**本 skill 的文件扫描**为基线，CLI 输出为辅助；差异需在报告中显式写出。
