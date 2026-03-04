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

Audit and optimize news articles for Google News SEO. Covers NewsArticle Schema review, AI-generated content compliance checks, and Google News inclusion requirements.

**Use when:**
- "Check this article's Google News SEO"
- "Audit / fix the NewsArticle Schema"
- "How can AI-generated content get into Google News?"
- Reviewing a news article's structured data

**Features:**
- Full NewsArticle Schema checklist (critical + recommended fields)
- AI content compliance checks (image filenames, author attribution, E-E-A-T)
- Ready-to-use Schema fix template
- Systemic bug detection for batch template-level fixes
- Structured output report with P0 / P1 / P2 priority fix list

**Output example:**

| Check item | Result | Notes |
|---|---|---|
| `@context` uses HTTPS | Pass ✅ | — |
| `dateModified` ≥ `datePublished` | Fail ❌ | `dateModified` is earlier; fix assignment order |
| `author` is a real Person | Manual 🔍 | Verify byline matches Schema |

**Languages:** Responds in the same language as the user (English / Chinese auto-detect).

**References:** See [skills/google-news-seo/reference.md](skills/google-news-seo/reference.md) for Google News ranking factors, AI content policy, and News Sitemap examples.

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

## What are Agent Skills?

Agent skills are reusable instruction sets that extend your coding agent's capabilities. They are defined in `SKILL.md` files with YAML frontmatter containing a `name` and `description`. The agent loads a skill when the user's request matches the description.

Skills let agents perform specialized tasks like:
- Integrating design assets (Figma, images) into workflows
- Extending proposal flows with automated steps
- Auditing and fixing SEO structured data at scale
- Generating structured outputs (e.g. design-map.md, SEO audit reports)

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
│   └── google-news-seo/
│       ├── SKILL.md
│       └── reference.md
├── AGENTS.md
├── CLAUDE.md
└── README.md
```

## License

MIT
