# OpenClaw Reference — 橙皮书 Extracts

Derived from OpenClaw橙皮书-从入门到精通 v1.2.0. For latest commands and setup, prefer [docs.openclaw.ai](https://docs.openclaw.ai).

---

## Architecture 架构

### Gateway-Node-Channel 三层架构

| 层级 | 职责 | 关键细节 |
|------|------|----------|
| Gateway | 中央控制平面 | 默认 ws://127.0.0.1:18789，每台主机一个实例 |
| Node | 设备端执行 | camera、screen recording、system.run 等 |
| Channel | 消息渠道接入 | WhatsApp、Telegram、Discord、飞书、钉钉等 20+ 平台 |

**Loopback-First**: Gateway 默认只绑定 localhost，不开放外网端口。远程访问通过 Tailscale Serve/Funnel。

### 记忆系统 Memory

| 层级 | 存储 | 说明 |
|------|------|------|
| SOUL | SOUL.md | 不可变人格内核 |
| TOOLS | Skills | 动态工具，按需加载 |
| USER | MEMORY.md + 向量库 | 持久化用户偏好 |
| Session | 内存 + sessions.json | 实时对话上下文 |

### Agent 工作区 Workspace

```
workspace/
├── AGENTS.md    # Agent 定义
├── SOUL.md      # 灵魂/人格（不可变）
├── MEMORY.md    # 长期记忆
├── memory/      # 每日日志 YYYY-MM-DD.md
└── skills/      # 项目级技能
```

### 设计哲学 Design Philosophy

- **Unix 哲学**: 小工具、可组合、文本流。核心工具仅 4 个：Read、Write、Edit、Bash
- **反 MCP 立场**: 通过 CLI/Bash 操作，不依赖预构建 MCP；可选 mcporter 桥接

---

## Deployment 部署

### 系统要求

| 要求 | 详情 |
|------|------|
| Node.js | >= 22（官方文档推荐 Node 24） |
| Windows | 强烈推荐 WSL2 |

### 安装命令

```bash
# npm 安装
npm install -g openclaw@latest
openclaw onboard --install-daemon

# 一键脚本 (macOS/Linux)
curl -fsSL https://openclaw.ai/install.sh | bash
```

### 按场景推荐

| 场景 | 首选 | 备选 |
|------|------|------|
| 零基础最快体验 | 扣子编程 | 百度云 |
| 个人长期，预算敏感 | 火山引擎 | 阿里云 |
| 飞书重度 | 火山引擎 | 扣子编程 |
| 企微/QQ 生态 | 腾讯云 | — |
| 企业合规 | 华为云 | 阿里云 |
| 海外/开发者 | Railway | Zeabur |

### Docker

```bash
docker-compose up -d
```

挂载: `~/.openclaw`, `workspace`。端口: 18789 (Gateway), 3000 (Web UI)。

---

## Channels 渠道

### 平台列表（部分）

| 渠道 | 类型 | 难度 |
|------|------|------|
| Telegram | 内置 | 5分钟 |
| QQ | 插件 | 5分钟 |
| Discord | 内置 | 15–20分钟 |
| 飞书 | 内置 | 15–20分钟 |
| WhatsApp | 内置 | 10–15分钟 |
| 钉钉 | 插件 | 20–30分钟 |
| 企业微信 | 插件 | 20–30分钟 |

### 新手推荐顺序

Telegram/QQ → Discord/飞书 → WhatsApp/钉钉/企微

### 国内统一插件

`openclaw-china`: 飞书、钉钉、QQ、企微、微信。`openclaw china setup` 交互式配置。

---

## Skills 技能系统

### 三层优先级

1. `<workspace>/skills/` — 项目级，最高
2. `~/.openclaw/skills/` — 用户级
3. bundled — 内置 55 个

### ClawHub

- 总注册: 13,729; 精选(awesome): 5,494; 被标记恶意: 800+
- **安装前务必审查源码**。优先用 awesome-openclaw-skills 精选列表。

### 必装 Top 10

Gmail/Google、Agent Browser、Summarize、GitHub、Claude Code、Web Search、File Manager、Calendar、Translator、Image Gen

### 技能安装

```bash
openclaw skills install <name>
openclaw skills search "browser automation"
openclaw skills list
```

### 安全建议

1. 安装前审查 SKILL.md 源码，警惕「helper agent」诱导
2. 使用 SecureClaw 扫描: `secureclaw scan ~/.openclaw/skills/`
3. 定期检查 SOUL.md、MEMORY.md 是否被篡改

---

## Model Providers 模型配置

### 核心概念

- **内置 Provider**: Anthropic、OpenAI、Google、智谱，设 API Key 即可
- **自定义 Provider**: DeepSeek、豆包等需在 models.providers 添加
- **Fallback**: 主模型不可用时自动切换

### 价格速查（输入 /1M tokens）

| 模型 | 输入 | 输出 |
|------|------|------|
| DeepSeek-V3 | $0.14 | $0.28 |
| GLM-5 | $0.80 | $2.56 |
| Claude Sonnet 4.6 | $3.00 | $15.00 |

### 配置要点

```bash
openclaw onboard
openclaw models list
openclaw models status --probe
openclaw config set agents.defaults.model.primary provider/model
openclaw gateway restart  # 改配置后必须执行
```

---

## Security 安全

### Gateway 认证 (v2026.3.7+ 必设)

```yaml
gateway:
  auth:
    mode: token  # 或 password
    token: "your-secret-token"
```

### 已知风险

- **CVE-2026-25253** RCE 漏洞（已修复，务必更新）
- **ClawHavoc** 供应链攻击，安装 Skill 前审查
- **30,000+ 未认证实例** 暴露，务必配置 gateway.auth.mode

### 安全红线

拒绝任何要求「下载 zip」「执行 shell」「输入密码」的 Skill。

---

## FAQ 常见问题

**Q1 免费吗？** 软件 MIT 免费；需服务器 + 模型 API 费用。本地 Ollama 可零 API 费。

**Q2 技术水平？** 能用命令行安装 npm 包即可。云一键部署门槛更低。

**Q3 vs ChatGPT？** ChatGPT 顾问式问答；OpenClaw 自主执行任务、接消息平台、管理邮件日历。

**Q4 安全吗？** 自托管数据在己。注意：(1)CVE-2026-25253 已修复需更新；(2)ClawHavoc Skill 供应链；(3)Gateway 暴露需认证。

**Q5 月成本？** 免费(本地) → $2–5(DeepSeek) → $5–15(GLM) → $10–30(Claude)。务必设消费限额。

**Q6 国产模型？** DeepSeek-V3、GLM-5 主流。推荐 Fallback 混合。

**Q7 Claude OAuth？** 已封杀。用 Anthropic API Key，配置 ANTHROPIC_API_KEY。

**Q8 创始人加入 OpenAI 后？** 项目转开源基金会运营，继续更新。

**Q9 ClawHub Skill 安全？** 约 20% 有问题。只装 starred 多的，安装前审源码，用 awesome-openclaw-skills。

**Q10 微信？** 非直接个人微信。企微中转、iPad 协议、小程序等方案。钉钉/QQ 最简单。

**Q11 Claude Code？** 可一起用。openclaw-claude-code-skill 桥接。

**Q12 本地模型？** 32GB 可跑 Qwen3-Coder:32B。效果不如云端 Claude，适合隐私场景。

---

## Command Cheat Sheet 命令速查表

### 安装与更新

| 命令 | 说明 |
|------|------|
| `npm install -g openclaw@latest` | 全局安装 |
| `openclaw onboard --install-daemon` | 初始化 + 安装守护进程 |
| `openclaw update --channel stable` | 更新稳定版 |
| `openclaw doctor` | 诊断排查 |
| `openclaw --version` | 查看版本 |

### 日常使用

| 命令 | 说明 |
|------|------|
| `openclaw gateway --port 18789 --verbose` | 启动 Gateway |
| `openclaw gateway restart` | 重启（改配置后必须） |
| `openclaw dashboard` | 打开 Control UI |
| `openclaw models list` | 列出模型 |
| `openclaw models status --probe` | 测试模型连通性 |

### 插件管理

| 命令 | 说明 |
|------|------|
| `openclaw plugins install <name>` | 安装插件 |
| `openclaw plugins install @openclaw-china/channels` | 中国 IM 插件 |
| `openclaw china setup` | 配置中国 IM |

### 聊天命令（对话内）

| 命令 | 说明 |
|------|------|
| `/status` | 会话概览 |
| `/new` | 清空历史 |
| `/activation mention\|always` | 群消息模式 |

### Docker

```bash
docker-compose up -d
docker-compose logs -f
docker-compose pull && docker-compose up -d
```

---

## Resources 资源链接

### 官方

| 资源 | 地址 |
|------|------|
| GitHub | github.com/openclaw/openclaw |
| 官方文档 | docs.openclaw.ai |
| ClawHub | clawhub.ai |
| Moltbook | moltbook.com |

### 社区

| 资源 | 地址 |
|------|------|
| awesome-openclaw-skills | github.com/VoltAgent/awesome-openclaw-skills |
| openclaw-china | github.com/BytePioneer-AI/openclaw-china |

### 模型控制台

Anthropic: console.anthropic.com | OpenAI: platform.openai.com | DeepSeek: platform.deepseek.com | 智谱: bigmodel.cn | 通义: dashscope.aliyun.com
