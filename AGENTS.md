<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Cursor, Copilot, etc.) when working with code in this repository.

## Project Overview

`stark-skills` is a skills workspace for AI coding agents. It contains Cursor Skills—packaged instructions that extend agent capabilities. This repo has no traditional app code; it is a meta/skills repo built on Markdown and the Cursor Skills format.

## Skills in this repo

This workspace ships multiple Cursor Skills under `skills/`. Two primary examples:

### openspec-design (`skills/openspec-design/`)

Adds design asset integration: when the user's prompt includes Figma links or images, the agent fetches design data via Figma MCP, saves assets to a `design/` directory, and generates a design summary document.

### When to Use

Use when the user says:

- "Run openspec-design"
- "Enhance OpenSpec design"
- "Apply openspec-design"
- Or when creating proposals/tasks that reference Figma designs or design images

### What It Does

1. **First-time setup**: Reads the project's `openspec/AGENTS.md` and inserts Design Extension workflow steps and a Design Extension section
2. **When Figma in prompt**: Calls Figma MCP (`parse_figma_url`, `get_file`, `get_node`, `export_images`), saves exported images to `design/`
3. **When images in prompt**: Copies user-attached or local images to `design/`
4. **Output**: Generates `design-map.md` with asset list and design summary

### Skill Structure

```
skills/openspec-design/
├── SKILL.md    # Agent instructions (read this when skill is invoked)
└── USAGE.md    # User guide and FAQ
```

### Dependencies

- **Figma MCP**: Required when the prompt contains Figma links. User must configure Figma MCP Server in Cursor. Without it, the skill only processes local/attached images.

### Reference

For full execution details, tool names, and insertion fragments, read `skills/openspec-design/SKILL.md`.

### confluence-distill (`skills/confluence-distill/`)

Read-only Confluence search and distillation into a **new multi-file Agent Skill** (`SKILL.md` + `references/` + optional `scripts/`). Supports direct REST (base URL + API token) or optional Membrane CLI (`connectionId`). Use when the user wants Confluence 蒸馏, topic search, or generating a skill from wiki/runbook content. See `skills/confluence-distill/SKILL.md` and `USAGE.md`.

### create-favicon (`skills/create-favicon/`)

Build **`favicon.ico`** from a **user-supplied** image: ICO container with embedded **PNG** at **32×32**, **48×48**, and **180×180**. **Without** an attached image or explicit source path, the agent must **stop** and ask the user to upload/specify one. Companion CLI: `tools/create-favicon/` (`pnpm install && pnpm build`, then `node dist/cli.js --input … --output …`). See `skills/create-favicon/SKILL.md` and `USAGE.md`.
