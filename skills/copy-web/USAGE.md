# copy-web User Guide / 使用指南

Full-stack replication of any public website: Next.js 14 frontend + NestJS 10 backend + MySQL/Redis via Docker.
全栈复刻任意公开网站：Next.js 14 前端 + NestJS 10 后端 + MySQL/Redis Docker 服务。

---

## Prerequisites 前置条件

| Requirement | Details |
|---|---|
| **Cursor** | AI model enabled (Claude recommended for code generation quality) |
| **browser-use skill** | Required for page fetching and deep CSS/network analysis |
| **Docker Desktop** | Required to start MySQL and Redis services |
| **Node.js 20+** | For running frontend and backend locally |
| **Target site** | Must be publicly accessible (no login required for initial page load) |

---

## Installation 安装

### All skills (recommended)

```bash
npx skills add wghust/stark-skills
```

### This skill only

```bash
npx skills add https://github.com/wghust/stark-skills/tree/main/skills/copy-web
```

### Manual (Cursor global)

```bash
git clone https://github.com/wghust/stark-skills stark-skills
cp -r stark-skills/skills/copy-web ~/.cursor/skills/
```

---

## Usage 使用方法

### Trigger phrases 触发语

**English:**
- "Clone this website: [URL]"
- "Replicate [URL] as a full-stack React app"
- "Copy this site: [URL]"
- "Rebuild [URL] — I need a working full-stack version"

**中文：**
- "复刻这个网站：[URL]"
- "仿写 [URL]，需要前后端都能用"
- "克隆这个网址：[URL]"
- "参考 [URL] 做一个全栈版本"

### Examples 示例

```
Clone this website: https://globalsight.ai/home
```

```
复刻这个网站：https://globalsight.ai/home，要前后端都可以运行
```

---

## What the agent does 执行阶段

| Phase | What happens |
|---|---|
| **1 · Deep Analysis** | Screenshots at 375/768/1440px; `getComputedStyle` per element; XHR/fetch network interception; third-party service scan; auth flow detection |
| **2 · site-analysis.md** | Writes layout map, precise CSS values, API endpoints, inferred entities, third-party services → **waits for your review** |
| **3 · credentials-report.md** | Lists every required API key with how-to-obtain links → **waits for your acknowledgment** |
| **4 · Code generation** | Next.js frontend (1:1 pixel), NestJS backend (CRUD modules), TypeORM entities, conditional Auth + Redis |
| **5 · Infrastructure** | `docker-compose.yml`, `.env.example`, `README.md`, `backend/Dockerfile` |
| **6 · copy-report.md** | Feature coverage table, design fidelity table, manual follow-up list |

---

## Output structure 输出结构

```
<domain>-clone/
├── frontend/                   # Next.js 14 App Router
│   ├── app/
│   │   ├── layout.tsx          # next/font + Providers
│   │   ├── page.tsx
│   │   └── [route]/page.tsx
│   ├── components/
│   │   ├── ui/                 # shadcn/ui (Dialog, NavigationMenu, etc.)
│   │   ├── layout/             # Navbar.tsx, Footer.tsx
│   │   └── sections/           # Hero.tsx, FeatureGrid.tsx, ...
│   ├── lib/
│   │   ├── api.ts              # Axios → backend
│   │   └── query-client.ts     # TanStack Query
│   ├── hooks/
│   ├── types/index.ts          # Mirrors backend DTOs
│   ├── tailwind.config.ts      # Extended with exact extracted colors
│   └── package.json
│
├── backend/                    # NestJS 10
│   ├── src/
│   │   ├── main.ts             # Swagger + CORS + ValidationPipe
│   │   ├── app.module.ts
│   │   └── [feature]/          # Full CRUD module per entity
│   ├── Dockerfile              # Production multi-stage build
│   └── package.json
│
├── docker-compose.yml          # MySQL 8.0 (+ Redis 7 if needed)
├── .env.example                # All env vars with comments
├── .env                        # Local values (gitignored)
├── site-analysis.md            # Phase 2 output — review before codegen
├── credentials-report.md       # Phase 3 output — fill before starting
├── copy-report.md              # Phase 6 output — coverage summary
└── README.md                   # Quick start guide
```

---

## Running the project 运行项目

```bash
cd <domain>-clone

# 1. Configure environment
cp .env.example .env
# Edit .env — check credentials-report.md for required API keys

# 2. Start database services
docker compose up -d

# 3. Start backend
cd backend && npm install && npm run start:dev
# → http://localhost:3001
# → http://localhost:3001/api/docs  (Swagger UI)

# 4. Start frontend
cd ../frontend && npm install && npm run dev
# → http://localhost:3000
```

---

## FAQ 常见问题

**Q: What makes this better than the old copy-web?**
A: The old version generated a frontend-only shell with mock data — it couldn't actually run. This version generates a working full-stack project: Next.js frontend wired to a NestJS API, with real MySQL persistence and Docker for the database services.

**Q: 和旧版 copy-web 有什么区别？**
A: 旧版只生成前端壳子 + mock 数据，无法真正运行。新版生成完整全栈项目：Next.js 前端真实调用 NestJS API，数据持久化到 MySQL，Docker 一键启动数据库服务。

---

**Q: What if the page fetch fails?**
A: The agent will ask you to paste the page's HTML (copy from browser DevTools → Elements) or provide a screenshot. It continues with whatever data you provide.

**Q: 页面抓取失败怎么办？**
A: Agent 会要求你粘贴页面 HTML（浏览器开发者工具 → Elements 复制）或截图，然后继续分析。

---

**Q: What is site-analysis.md and why should I review it?**
A: It contains the agent's interpretation of the site's layout, CSS values, API endpoints, and data models. Correcting errors here (especially inferred entities) prevents those errors from propagating into all generated code.

**Q: site-analysis.md 为什么要我审查？**
A: 它包含 agent 对网站布局、CSS 值、API 端点和数据模型的推断。在这里纠正错误（尤其是推断的实体），可以防止错误传递到所有生成代码中。

---

**Q: What if I don't have all the required API keys yet?**
A: You can proceed without them. The agent will add `// TODO: [KEY_NAME] required — see credentials-report.md` comments everywhere the key is used, so you can find and fill them later.

**Q: 如果还没有所需的 API Key 怎么办？**
A: 可以先继续生成。Agent 会在每个使用该 Key 的地方加 `// TODO` 注释，方便后续补充。

---

**Q: Does it support authenticated pages?**
A: Not for the initial fetch — the scraper can only access publicly rendered content. For pages behind login, paste the HTML manually. If auth is detected on the site, the agent generates a working JWT auth module in the backend.

**Q: 支持需要登录的页面吗？**
A: 初始抓取不支持——只能访问公开渲染的内容。需要登录的页面可以手动粘贴 HTML。如果检测到认证流，agent 会在后端生成完整的 JWT auth 模块。

---

**Q: Are complex animations (Three.js, Canvas, WebGL) cloned?**
A: No. They are marked as "Not covered ❌" in `copy-report.md` with a suggested replacement (e.g. `react-three-fiber`, CSS animation, Framer Motion). Standard CSS transitions and hover animations are fully cloned via Framer Motion.

**Q: 复杂动效（Three.js、Canvas、WebGL）能复刻吗？**
A: 不能。会在 `copy-report.md` 中标记为"未覆盖 ❌"并给出替代建议。普通 CSS transition 和 hover 动效会通过 Framer Motion 完整复刻。

---

**Q: Is Redis always included?**
A: No. Redis is only added to `docker-compose.yml` and the backend when signals are detected: session-based auth, WebSocket / real-time features, rate-limiting headers, or high-frequency polling API calls. Otherwise the Redis service block is commented out.

**Q: Redis 一定会有吗？**
A: 不一定。只有检测到 session 认证、WebSocket/实时功能、频率限制头或高频轮询 API 时才启用。否则 docker-compose.yml 中的 Redis 服务块保持注释状态。
