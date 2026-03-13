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

### 本地安装 Local Installation

- **npm**: `npm install -g openclaw@latest` → `openclaw onboard --install-daemon`
- **一键脚本** (macOS/Linux): `curl -fsSL https://openclaw.ai/install.sh | bash`
- **macOS**: 需 Xcode Command Line Tools (`xcode-select --install`)
- **Windows**: 强烈推荐 WSL2，在 Ubuntu 内按 Linux 流程安装
- **守护进程**: macOS 用 launchd，Linux 用 systemd；Gateway 监听 ws://127.0.0.1:18789

### 国内云厂商一键部署

所有主流云厂商支持 OpenClaw 一键部署，差异在价格和 IM 生态。

#### 阿里云

| 项目 | 详情 |
|------|------|
| 配置 | 2vCPU + 2GiB + 40GiB ESSD，Alibaba Cloud Linux 3 |
| 价格 | 限时秒杀 9.9元/月，包年约 68元/年 |
| 模型 | 默认 qwen3.5-plus；百炼 Coding Plan Lite 首月 10元 |
| IM | 钉钉、飞书（openclaw-china） |
| 步骤 | 1) 购买预装镜像轻量服务器 2) 放通 18789、3000 端口，配百炼 API Key 3) 访问 http://IP:3000 |
| 注意 | 9.9元/月需抢；续费比新购贵 |

#### 腾讯云

| 项目 | 详情 |
|------|------|
| 配置 | 推荐 2核4G，最低 2核2G |
| 价格 | 新人约 17元/月，一年 99元起 |
| 模型 | Coding Plan 首月 7.9元起（GLM-5、kimi、MiniMax 等） |
| IM | 企微、QQ、钉钉、飞书（四大 IM 全覆盖） |
| 步骤 | 1) 购买 Lighthouse 2) 应用模板→AI智能体→OpenClaw 3) 购 Coding Plan + 接入 IM |
| 注意 | 支持限时同价续费 |

#### 百度智能云

| 项目 | 详情 |
|------|------|
| 配置 | 2核4G 4M 带宽 |
| 价格 | 首月 0.01元（每日限量 500 台），常规 70~140元/月 |
| 模型 | 千帆：文心、Qwen、DeepSeek 系列 |
| IM | 钉钉、飞书 |
| 步骤 | 1) 购买轻量服务器选 OpenClaw 镜像 2) 自动安装 3) 页面选模型 4) 对接 IM |
| 注意 | 0.01元需抢；续费较高，建议仅体验 |

#### 火山引擎

| 项目 | 详情 |
|------|------|
| 配置 | 2核4G，支持云手机 |
| 价格 | 活动 9.9元/月；方舟组合套餐 19.8元/月（服务器+模型） |
| 模型 | 方舟平台，内置可用 |
| IM | 飞书（深度集成）、企微、钉钉、QQ |
| 步骤 | 1) 购买云服务器/云手机选 OpenClaw 模板 2) 配置方舟 Coding Plan 3) 接入飞书 |
| 注意 | 综合性价比最高；飞书用户首选 |

#### 华为云

| 项目 | 详情 |
|------|------|
| 配置 | Flexus L 实例，需 EIP + 安全组 |
| 价格 | ~85~155元/月 |
| 模型 | MaaS 控制台单独开通 |
| 步骤 | 5步+（实例→EIP→安全组→安装→配模型） |
| 注意 | 企业合规最强；个人用户步骤较多 |

#### 扣子编程 Coze Code

| 项目 | 详情 |
|------|------|
| 配置 | 无需服务器 |
| 价格 | ¥49/月（基础）或 ¥99/月（进阶），免费版不支持 |
| 模型 | Seed 2.0、DeepSeek、GLM-4.7 等 |
| 步骤 | 1) 访问 code.coze.cn 2) 一键部署或从案例创建 3) 确认即完成 |
| 注意 | 零门槛；数据在第三方；成本敏感可选火山+DeepSeek 约¥19/月起 |

### 按场景推荐

| 场景 | 首选 | 备选 |
|------|------|------|
| 零基础最快体验 | 扣子编程 | 百度云 |
| 个人长期，预算敏感 | 火山引擎 | 阿里云 |
| 飞书重度 | 火山引擎 | 扣子编程 |
| 企微/QQ 生态 | 腾讯云 | — |
| 企业合规 | 华为云 | 阿里云 |
| 海外/开发者 | Railway | Zeabur |

### Docker 部署

```bash
git clone https://github.com/openclaw/openclaw.git && cd openclaw
docker-compose up -d
```

**挂载**（必选，否则重启丢失）:
```yaml
volumes:
  - ~/.openclaw:/root/.openclaw
  - ~/openclaw/workspace:/workspace
```
**端口**: 18789 (Gateway), 3000 (Web UI)

**镜像变体**: OPENCLAW_VARIANT=slim（更小）、sandbox（沙箱）、sandbox-browser（含浏览器）

**Podman**: `podman-compose up -d` 兼容。v2026.3.8 起自动处理 SELinux :Z。

### 首次配置 Initial Configuration

**Gateway 认证** (v2026.3.7+ 必设，否则无法启动):
```yaml
gateway:
  auth:
    mode: token   # 或 password
    token: "your-secret-token"
```

**openclaw doctor**: 检查 Node 版本、依赖、Gateway、模型 API、守护进程、网络。

**备份** (v2026.3.8+): `openclaw backup create`，改配置前建议执行。

**版本更新**: `openclaw update --channel stable|beta|dev`

### 远程访问 Remote Access

**Tailscale Serve**（仅 Tailscale 网络）: `tailscale serve --bg https+insecure://127.0.0.1:18789`

**Tailscale Funnel**（公网 webhook）: `tailscale funnel --bg https+insecure://127.0.0.1:18789`

**SSH 端口转发**: `ssh -L 18789:127.0.0.1:18789 user@your-server`

---

## Channels 渠道

### 平台列表

| 渠道 | 类型 | 耗时 |
|------|------|------|
| Telegram | 内置 | 5分钟 |
| QQ | 插件 | 5分钟 |
| Discord | 内置 | 15–20分钟 |
| 飞书 | 内置 | 15–20分钟 |
| WhatsApp | 内置 | 10–15分钟 |
| 钉钉 | 插件 | 20–30分钟 |
| 企业微信 | 插件 | 20–30分钟 |

### Telegram 接入

1. 找 @BotFather 发 /newbot → 创建 Bot，获取 Token
2. 写入 openclaw.yaml: `channels.telegram.enabled: true`, `botToken: "xxx"`, `dmPolicy: pairing`
3. 重启 Gateway，给 bot 发消息，输入配对码

### Discord 接入

1. discord.com/developers/applications 创建 Application
2. Bot 页获取 Token，开启 Message Content Intent、Server Members Intent
3. OAuth2 URL Generator 生成邀请链接，添加 bot
4. 开启 Developer Mode，复制 Server ID、User ID 写入配置
5. 私聊 bot 输入配对码（1小时有效）

### WhatsApp 接入

1. `openclaw onboard` 选 WhatsApp
2. 终端显示 QR 码，手机扫码（设置→已连接设备→连接新设备）
3. 配对完成即可对话
注意：用 Node 不用 Bun；session 过期需重新扫码；建议独立号码

### QQ 接入

1. 手机 QQ 扫码完成开发者注册
2. QQ 开放平台创建 Bot，获取 App ID、Token
3. OpenClaw 配置绑定，即可在 QQ 对话
支持：Markdown、图片、语音、文件；个人助手或群管理

### 飞书接入

1. open.feishu.cn 创建企业自建应用，获取 App ID、App Secret
2. `openclaw onboard` 选 Feishu，粘贴凭证
3. 重启 Gateway
2026.2 起内置支持；WebSocket 事件订阅

### 钉钉接入

1. 钉钉开放平台创建应用，添加机器人
2. 消息接收设为 **Stream 模式**（免公网）
3. 安装 @soimy/dingtalk 或 dingtalk-openclaw-connector，配置后启动
社区成熟，Stream 模式不需公网回调

### 企业微信 / 微信

企微：Agent 或 Bot 模式，插件如 dingxiang-me/OpenClaw-Wechat。微信个人号：企微中转 / iPad 协议 / 小程序，封号风险存在。

### openclaw-china 统一插件

飞书、钉钉、QQ、企微、微信一站式。`openclaw plugins install @openclaw-china/channels`，`openclaw china setup` 交互式配置。

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
