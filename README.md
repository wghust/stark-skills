# Stark Skills

A collection of skills for AI coding agents. Skills are packaged instructions that extend agent capabilities for design, spec, and SEO workflows.

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

## Usage

Skills are loaded on demand. When the user's message matches the skill's trigger phrases, the agent reads `SKILL.md` and applies its instructions.

**Examples:**
```
Run openspec-design
```
```
Enhance OpenSpec design, then create a proposal for the user center with design at https://www.figma.com/design/xxx?node-id=2496-1199
```
```
Check the Google News SEO for https://example.com/news/article-slug/
```
```
审查这篇文章的 NewsArticle Schema，帮我修复 AI 内容合规问题
```
```
EEAT 扫描 https://example.com/news/article-slug/
```
```
Run EEAT audit for https://example.com/news/article-slug/
Clone this website: https://globalsight.ai/home
```
```
复刻这个网站：https://globalsight.ai/home
```

## What are Agent Skills?

Agent skills are reusable instruction sets that extend your coding agent's capabilities. They are defined in `SKILL.md` files with YAML frontmatter containing a `name` and `description`. The agent loads a skill when the user's request matches the description.

Skills let agents perform specialized tasks like:
- Integrating design assets (Figma, images) into workflows
- Extending proposal flows with automated steps
- Auditing and fixing SEO structured data at scale
- Cloning and replicating websites as production-ready React projects
- Generating structured outputs (e.g. design-map.md, SEO audit reports, copy-report.md)

## Supported Agents

This repository targets **Cursor**. Skills use the [Agent Skills specification](https://agentskills.io) and may work with other agents that support it. Cursor install path: `~/.cursor/skills/` (global) or `.agents/skills/` (project).

## Skill Structure

Each skill in this repo contains:

| File      | Purpose                          |
| --------- | -------------------------------- |
| `SKILL.md` | Agent instructions (required)    |
| `USAGE.md` | User guide and FAQ (optional)    |

## Repository Structure

```
stark-skills/
├── skills/
│   ├── openspec-design/
│   │   ├── SKILL.md
│   │   └── USAGE.md
│   ├── google-news-seo/
│   │   ├── SKILL.md
│   │   └── reference.md
│   └── copy-web/
│       ├── SKILL.md
│       ├── eeat-reference.md   # EEAT 24-signal checklist
│       └── reference.md        # Google News ranking factors & policy
│       └── USAGE.md
├── AGENTS.md
├── CLAUDE.md
└── README.md
```

## License

MIT
