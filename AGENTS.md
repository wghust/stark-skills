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

## openspec-design Skill

The only skill in this repo is `skills/openspec-design/`. It adds design asset integration: when the user's prompt includes Figma links or images, the agent fetches design data via Figma MCP, saves assets to a `design/` directory, and generates a design summary document.

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
