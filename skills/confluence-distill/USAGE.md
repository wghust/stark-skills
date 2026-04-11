# confluence-distill — 使用说明

## 用途

在对话里让代理**只读**搜索你的 Confluence，把某主题（如告警、发布流程）的多篇页面**蒸馏**成一个新的 **Agent Skill 目录**：根 `SKILL.md` + `references/`（+ 可选 `scripts/`），符合 [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) 的常见结构。

蒸馏产物是 **策展后的规范与流程**（`references/` 正文），不是 Confluence 整页粘贴：与主题无关的长列表会省略或放入带警告的 **Appendix**；多页冲突会出现在 **「多源差异与待确认」**（或同名英文小节）中，并链回 `source-map.md` 里的原文链接。Wiki 可能过时或写错，关键步骤请在 Confluence 中复核。

## 如何描述主题边界（建议）

- 用**一句话**说明下游 Skill 要解决什么问题（例如「手机主站 Git 分支从开发到发布的命名与合并顺序」）。
- 可选：列出 **in scope** / **out of scope**（例如「不要收录各版本 JIRA 工作量表」），减少无关内容进入正文。

## 两种连网方式（二选一）

### 直连 REST

- 准备：**实例基址**（Cloud 常见为 `https://<site>.atlassian.net/wiki`）、**API Token**、Cloud 下还需 **Atlassian 账户邮箱**（Basic Auth 用户名）。
- 不要把 Token 写进仓库；可用环境变量或仅在当前对话中提供。

### Membrane CLI

- 若团队已用 [Membrane Confluence 技能](https://skills.sh/membranedev/application-skills/confluence) 完成登录与连接，可提供 **`connectionId`**，由代理使用 `membrane request` 等**只读**方式访问 REST。
- 蒸馏流程**不要**使用其中的创建/更新/删除类 action。

## 常见问题

**401 / 403**

- 检查基址是否包含正确的 `/wiki` / REST 前缀；Token 是否有效；账户对目标空间是否有读权限；Membrane 连接是否仍有效。

**速率限制**

- 缩小 CQL 范围、降低并发、减少拉取页数上限；必要时加重试间隔。

**CQL 报错**

- 不同 Confluence 版本字段可能不同，以贵司实例与管理文档为准，先在小范围试搜。

## 安全

- **禁止**将 Token、`connectionId` 敏感输出提交到 git。
- 生成的下游 Skill 里，`scripts/` 只应含**占位符**示例，不含真实机密。
