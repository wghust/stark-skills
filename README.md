# Stark Skills

A collection of skills for AI coding agents. Skills are packaged instructions that extend agent capabilities for design, spec, SEO, and debugging workflows.

Skills follow the [Agent Skills](https://agentskills.io/) format and are compatible with Cursor.

## Install a Skill

Using the [skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add wghust/stark-skills
```

### Source Formats

```bash
# GitHub shorthand
npx skills add wghust/stark-skills

# Full GitHub URL
npx skills add https://github.com/wghust/stark-skills

# Direct path to a specific skill
npx skills add https://github.com/wghust/stark-skills/tree/main/skills/openspec-design
npx skills add https://github.com/wghust/stark-skills/tree/main/skills/google-news-seo
npx skills add https://github.com/wghust/stark-skills/tree/main/skills/copy-web
npx skills add https://github.com/wghust/stark-skills/tree/main/skills/nextjs-debug
npx skills add https://github.com/wghust/stark-skills/tree/main/skills/git-intelligence
npx skills add https://github.com/wghust/stark-skills/tree/main/skills/interview-evaluation

# Local path
npx skills add ./stark-skills
```

### Manual Installation (Cursor)

If you prefer not to use the CLI, copy the skill directly:

```bash
git clone https://github.com/wghust/stark-skills stark-skills

# Install a single skill globally
cp -r stark-skills/skills/openspec-design ~/.cursor/skills/
cp -r stark-skills/skills/google-news-seo ~/.cursor/skills/
cp -r stark-skills/skills/copy-web ~/.cursor/skills/
cp -r stark-skills/skills/nextjs-debug ~/.cursor/skills/
cp -r stark-skills/skills/git-intelligence ~/.cursor/skills/
cp -r stark-skills/skills/interview-evaluation ~/.cursor/skills/
```

### Installation Scope

| Scope       | Location              | Use Case                         |
| ----------- | --------------------- | -------------------------------- |
| **Project** | `./.agents/skills/`   | Committed with project, team use |
| **Global**  | `~/.cursor/skills/`   | Available across all projects    |

Use `-g` or `--global` with the skills CLI for global installation.

## Available Skills

### openspec-design

Adds design asset integration: when the user's prompt includes Figma links or images, the agent fetches data via Figma MCP, saves to a `design/` directory, and generates a design summary document.

**Use when:**
- "Run openspec-design" / "Enhance OpenSpec design" / "Apply openspec-design"
- Creating proposals or tasks that reference Figma designs or design images

**Features:**
- Integrates Figma MCP (parse_figma_url, get_file, get_node, export_images)
- Creates `design/` directory, generates `design-map.md` with asset list and summary
- Supports Figma links and local/attached images

**Prerequisites:** Figma MCP Server configured in Cursor (required for Figma links)

**Output structure:**
```
design/
├── figma-hero-1.png
├── figma-form-2.png
└── design-map.md    # Asset list + design summary
```

See [skills/openspec-design/USAGE.md](skills/openspec-design/USAGE.md) for detailed usage and FAQ.

---

### google-news-seo

Full-stack audit and optimization skill for Google News SEO. Covers initial context assessment, NewsArticle Schema review, AI content compliance, technical news SEO, on-page checks, Google E-E-A-T scanning, and structured report generation.

**Use when:**
- "Check this article's Google News SEO"
- "Audit / fix the NewsArticle Schema"
- "How can AI-generated content get into Google News?"
- "Run EEAT scan" / "EEAT 扫描" / "EEAT audit"
- "Check robots.txt / News Sitemap / Core Web Vitals"
- Reviewing title tags, meta descriptions, canonical tags, or heading structure

**Features:**
- **Initial Assessment** — collects site type, target topics, known issues, and audit scope before starting; skips answered questions automatically
- **Schema detection safeguard** — warns that `web_fetch` can't detect JS-injected JSON-LD (Yoast/AIOSEO/RankMath); provides Rich Results Test and DevTools alternatives
- **NewsArticle Schema checklist** — critical + recommended fields; ready-to-use fix template and systemic bug table
- **AI content compliance** — image filename checks, author attribution, E-E-A-T signals for AI-generated content
- **Technical SEO** — robots.txt/Googlebot-News, News Sitemap (`<news:news>` tags), Core Web Vitals (LCP/INP/CLS), HTTPS
- **On-page checks** — title tag length and keyword placement, meta description, canonical tag, H1/heading hierarchy
- **E-E-A-T scanning** — 24-signal four-dimension scan (Experience / Expertise / Authoritativeness / Trustworthiness) with 0–100 scores per dimension
- **Structured report** — Executive Summary (🟢/🟡/🔴 health rating, Top Issues, Quick Wins) + per-dimension check tables + P0/P1/P2 priority fix list

**Output example:**

```
### Executive Summary

Overall Health: 🟡 Needs Work
Scope: NewsArticle Schema + EEAT scan

Top Issues
- [P0] Schema: dateModified is earlier than datePublished
- [P1] On-Page: Meta description missing
- [P1] EEAT/Experience: AI-tool marker found in image filename

Quick Wins
- Fix dateModified: Set to last-edited timestamp in CMS Schema output
- Add meta description: Map article excerpt to meta description in theme template
```

**Languages:** Responds in the same language as the user (English / Chinese auto-detect).

**References:**
- Google News ranking factors, AI content policy, News Sitemap examples: [reference.md](skills/google-news-seo/reference.md)
- EEAT signal definitions (24 signals, priority table): [eeat-reference.md](skills/google-news-seo/eeat-reference.md)

---

### copy-web

Full-stack replication of any public website. Given a URL, the agent performs deep CSS/API/service analysis, then generates a complete monorepo with a Next.js 14 frontend, NestJS 10 backend, MySQL + Redis via Docker, and a credentials report listing every required external API key.

**Use when:**
- "Clone this website: [URL]"
- "Replicate / copy / mirror / rebuild [URL] — I need a working full-stack version"
- "复刻 / 仿写 / 克隆这个网站：[URL]"
- Rebuilding a competitor's site or turning a reference design into a deployable product

**Features:**
- Deep analysis: `getComputedStyle` per element (pixel-perfect CSS), XHR/fetch network interception (API discovery), third-party service scan (Maps, Stripe, OpenAI, Clerk, etc.)
- **1:1 pixel-perfect frontend**: Tailwind arbitrary values (`bg-[#1a1f2e]`) + shadcn/ui for interactive components + Framer Motion for animations
- **Working backend**: NestJS 10 with full CRUD modules per inferred entity, TypeORM + MySQL, conditional JWT auth
- **Infrastructure**: `docker-compose.yml` (MySQL 8 + optional Redis 7), `.env.example`, `backend/Dockerfile`
- **Credentials report**: lists every required API key (Google Maps, Stripe, AI keys, etc.) with acquisition instructions before any code is generated
- Multi-page support (up to 5 pages), responsive layout replication, TanStack Query frontend ↔ backend wiring

**Output structure:**
```
<domain>-clone/
├── frontend/               # Next.js 14 App Router + shadcn/ui + TanStack Query
│   ├── app/                # layout.tsx, page.tsx, [route]/page.tsx
│   ├── components/         # ui/ (shadcn), layout/, sections/
│   └── lib/api.ts          # Axios client → backend
├── backend/                # NestJS 10
│   ├── src/[feature]/      # module / controller / service / entity / dto
│   └── Dockerfile
├── docker-compose.yml      # MySQL 8.0 (+ Redis 7 if needed)
├── .env.example
├── site-analysis.md        # Deep analysis output — review before codegen
├── credentials-report.md   # Required API keys — fill before starting
└── copy-report.md          # Feature coverage + design fidelity table
```

**Languages:** Responds in the same language as the user (English / Chinese auto-detect).

**Prerequisites:** browser-use skill + Docker Desktop.

See [skills/copy-web/USAGE.md](skills/copy-web/USAGE.md) for detailed usage, running instructions, and FAQ.

---

### nextjs-debug

Diagnoses and fixes Next.js project startup, compilation, and runtime errors. Given a log or problem description, the agent classifies the error, locates the exact file and line in the project source, traces import chains, audits dependencies, checks version compatibility, and correlates the issue with recent git changes.

**Use when:**
- "My Next.js app fails to start / won't compile"
- "Module not found" / "Cannot find module" errors
- "Hydration failed" / hydration mismatch warnings
- Server Component / Client Component boundary errors ("use client missing")
- Environment variable not working / `NEXT_PUBLIC_` issues
- `next build` fails after upgrading packages
- "next dev fails" / Turbopack errors / port conflict
- 启动报错 / 编译失败 / 模块找不到 / hydration 错误

**Features:**
- **6-class error classification**: `COMPILE_ERROR`, `MODULE_ERROR`, `BOUNDARY_ERROR`, `ENV_ERROR`, `CONFIG_ERROR`, `RUNTIME_ERROR`
- **Active code location**: reads real project files, extracts inline code snippets with `▶` error-line markers
- **Import chain tracing**: follows import chains up to 2 levels; resolves `tsconfig.json` path aliases
- **Stack trace mapping**: maps Node.js stack frames back to project source files
- **Version compatibility check**: detects Node.js/React/Next.js version mismatches and deprecated API usage
- **Dependency audit**: finds peer dep conflicts, duplicate React instances, missing `node_modules`, stale `.next` cache
- **Git context**: correlates error with recent commits, uncommitted changes, and `package.json` diffs
- **Fix verification**: each fix step includes a concrete verification command and expected output

**Output structure:**
```
## Version Stack          — version summary + compatibility warnings
## Likely Regression      — git context: which commit / diff introduced the issue
## Error 1: MODULE_ERROR  — blocking
  ### Root Cause
  ### Affected Files      — with inline code snippet + ▶ error line marker
  ### Fix Steps
  ### Verify Fix          — exact command + expected output
  ### References          — nextjs.org/docs links
```

**Languages:** Responds in the same language as the user (English / Chinese auto-detect).

**References:**
- Error patterns, version matrix, code search templates: [reference.md](skills/nextjs-debug/reference.md)

---

### git-intelligence

AI-powered git repository analysis. Extracts structured insights from commits, PRs, and repository history — **zero installation, works immediately after adding the skill**.

**Use when:**
- "Summarize commits from the last 7 days" / "What changed this week?"
- "Generate release notes between v1.2.0 and v1.3.0"
- "Analyze this PR" / "Is branch X risky?" / "What does this branch affect?"
- "PR risk check" / "Code impact analysis"
- 提交总结 / 发版说明 / PR 风险分析 / 代码影响范围

**Features:**
- **summarize-commits**: Classifies recent commits → Features / Fixes / Refactor / Performance
- **release-notes**: Structured release notes between any two tags
- **analyze-pr**: Risk score + impacted modules + suggested reviewers (via `git blame`) + test suggestions
- **detect-risk**: Heuristic risk scoring (files, lines, sensitive folders, test ratio)
- **change-impact**: Maps changed files to logical system modules and risk areas
- **Zero-install**: The agent runs `git` commands directly — no Node.js, no API key, no compilation needed
- **Read-only**: never modifies your repository

**Output example (detect-risk):**
```
## Risk Assessment: feature/payment-refactor

**Risk Score**: 🔴 8/10

**Reasons**:
- Large diff (1200 lines)
- Payment module modified
- Low test coverage for changed files
```

> **Optional CLI tool**: For CI/CD or scripted usage without an agent, see [tools/git-intelligence/README.md](tools/git-intelligence/README.md).

---

### interview-evaluation

Generates structured interview summaries from conversation records. Parses dialogue heuristically into four sections: background & credentials, core project, engineering experience, and coding test.

**Use when:**
- "面试评价" / "面试总结" / "面试复盘"
- "Interview evaluation"
- Need a structured summary from an interview conversation for archival or cross-candidate comparison

**Features:**
- **Input**: Paste conversation text or provide file path (.txt / .md)
- **Four-section output**: 1) 背景与履历 2) 核心项目 3) 工程经验 4) 编程题
- **Heuristic extraction**: Infers blocks from keywords, turn-taking, and topic shifts
- **Markdown format**: Numbered sections, concise and scannable

**Output structure:**
```
1、某985硕+某211本，专业前X%保研。主要研究方向…，奖项…，AI 编码…
2、核心项目这块，技术方案、方法论、架构熟悉度…
3、工程方面，系统架构、规模指标、技术栈、工程痛点…
4、编程题（题目）实现思路正确，X 分钟左右完成编码。
```

**Languages:** Responds in the same language as the user (English / Chinese auto-detect).

---

### insight-pdf

Generates professional corporate/business report PDFs with advanced visualizations and modern design. Uses ECharts for rich charts (heatmaps, radar, gauge, sankey), infographic components (progress bars, timelines, comparison blocks), and enterprise-grade typography.

**Use when:**
- "Generate a PDF report from this data"
- "Create a professional business report PDF"
- "Make an enterprise report with charts and visualizations"
- 生成专业 PDF 报告 / 创建企业级报告

**Features:**
- **Advanced visualizations**: ECharts integration with heatmaps, radar charts, gauges, sankey diagrams
- **Infographic components**: Progress bars, comparison blocks, timelines, stat cards, callout boxes
- **Professional design**: Gradient covers, 8-color palette, enhanced tables, badges
- **Clean output**: Generates only the final PDF in user's project directory (no HTML/node_modules pollution)
- **Template-based**: Uses HTML templates with placeholder system for easy customization

**Output:**
```
project/
└── report.pdf    # Professional PDF with charts and infographics
```

**Prerequisites:** Playwright Chromium installed in skill directory (one-time setup: `cd ~/.cursor/skills/insight-pdf && npm install && npx playwright install chromium`)

---

## Usage

Skills are loaded on demand. When the user's message matches the skill's trigger phrases, the agent reads `SKILL.md` and applies its instructions.

**Examples:**

```
# openspec-design
Run openspec-design
Enhance OpenSpec design, then create a proposal for the user center with design at https://www.figma.com/design/xxx?node-id=2496-1199
```

```
# google-news-seo
Check the Google News SEO for https://example.com/news/article-slug/
审查这篇文章的 NewsArticle Schema，帮我修复 AI 内容合规问题
EEAT 扫描 https://example.com/news/article-slug/
```

```
# copy-web
Clone this website: https://globalsight.ai/home
复刻这个网站：https://globalsight.ai/home
```

```
# nextjs-debug
My Next.js app fails to start — Module not found: Can't resolve './components/Button'
next build 报错，帮我定位问题
Hydration failed after upgrading to Next.js 15
```

```
# git-intelligence
Summarize commits from the last 7 days
Generate release notes from v1.2.0 to v1.3.0
Is branch feature/payment-refactor risky?
What does branch feature/api-rewrite affect?
Who should review this PR?
```

```
# interview-evaluation
面试评价：[粘贴面试对话]
面试总结：帮我总结这份面试记录
Interview evaluation: [paste conversation or path to interview-xxx.md]
```

```
# insight-pdf
Generate a professional PDF report from this analysis data
Create an enterprise report with charts showing Q4 revenue trends
生成一份包含数据可视化的专业 PDF 报告
```

## What are Agent Skills?

Agent skills are reusable instruction sets that extend your coding agent's capabilities. They are defined in `SKILL.md` files with YAML frontmatter containing a `name` and `description`. The agent loads a skill when the user's request matches the description.

Skills let agents perform specialized tasks like:
- Integrating design assets (Figma, images) into workflows
- Extending proposal flows with automated steps
- Auditing and fixing SEO structured data at scale
- Cloning and replicating websites as production-ready React projects
- Diagnosing and fixing Next.js startup, compilation, and runtime errors
- Analyzing git commit history, PR risk, and code change impact
- Generating structured interview summaries from conversation records
- Generating structured outputs (e.g. design-map.md, SEO audit reports, diagnostic reports, release notes)

## Supported Agents

This repository targets **Cursor**. Skills use the [Agent Skills specification](https://agentskills.io) and may work with other agents that support it. Cursor install path: `~/.cursor/skills/` (global) or `.agents/skills/` (project).

## Skill Structure

Each skill in this repo contains:

| File | Purpose |
| --- | --- |
| `SKILL.md` | Agent instructions (required) |
| `reference.md` | Lookup tables, patterns, quick reference (optional) |
| `USAGE.md` | User guide and FAQ (optional) |

## Repository Structure

```
stark-skills/
├── skills/
│   ├── openspec-design/
│   │   ├── SKILL.md
│   │   └── USAGE.md
│   ├── google-news-seo/
│   │   ├── SKILL.md
│   │   ├── reference.md        # Google News ranking factors & policy
│   │   └── eeat-reference.md   # EEAT 24-signal checklist
│   ├── copy-web/
│   │   ├── SKILL.md
│   │   └── USAGE.md
│   ├── nextjs-debug/
│   │   ├── SKILL.md            # Execution flow + diagnostic report template
│   │   └── reference.md        # Error patterns, version matrix, code search templates
│   ├── git-intelligence/
│   │   └── SKILL.md            # CLI command mapping + trigger phrases
│   └── interview-evaluation/
│       └── SKILL.md            # Four-section interview summary from conversation
├── tools/
│   └── git-intelligence/       # Runnable TypeScript CLI companion tool
│       ├── src/                # cli.ts, git/, llm/, analysis/, utils/
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md           # Installation + CLI reference
├── AGENTS.md
├── CLAUDE.md
└── README.md
```

## License

MIT
