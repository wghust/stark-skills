# Stark Skills

A collection of skills for AI coding agents. Skills are packaged instructions that extend agent capabilities for design and spec workflows.

Skills follow the [Agent Skills](https://agentskills.io/) format and are compatible with Cursor.

## Install a Skill

Using the [skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add <owner>/stark-skills
```

### Source Formats

```bash
# GitHub shorthand (replace with your repo)
npx skills add owner/stark-skills

# Full GitHub URL
npx skills add https://github.com/owner/stark-skills

# Direct path to a skill in this repo
npx skills add https://github.com/owner/stark-skills/tree/main/skills/openspec-design

# Local path
npx skills add ./stark-skills
```

### Manual Installation (Cursor)

If you prefer not to use the CLI, copy the skill directly:

```bash
git clone <repo-url> stark-skills
cp -r stark-skills/skills/openspec-design ~/.cursor/skills/
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

## Usage

Skills are loaded on demand. When the user's message matches the skill's trigger phrases, the agent reads `SKILL.md` and applies its instructions.

**Examples:**
```
Run openspec-design
```
```
Enhance OpenSpec design, then create a proposal for the user center with design at https://www.figma.com/design/xxx?node-id=2496-1199
```

## What are Agent Skills?

Agent skills are reusable instruction sets that extend your coding agent's capabilities. They are defined in `SKILL.md` files with YAML frontmatter containing a `name` and `description`. The agent loads a skill when the user's request matches the description.

Skills let agents perform specialized tasks like:
- Integrating design assets (Figma, images) into workflows
- Extending proposal flows with automated steps
- Generating structured outputs (e.g. design-map.md)

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
│   └── openspec-design/
│       ├── SKILL.md
│       └── USAGE.md
├── AGENTS.md
├── CLAUDE.md
└── README.md
```

## License

MIT
