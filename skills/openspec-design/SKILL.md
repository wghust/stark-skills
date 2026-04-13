---
name: openspec-design
description: Extends OpenSpec with design asset integration. Use when the user asks to "run openspec-design", "enhance openspec design", or "apply openspec-design". When invoked, updates the project's openspec/AGENTS.md to extend the proposal flow with Figma MCP, design asset directory, and design-map.md.
---

# OpenSpec Design Extension

Adds design asset integration to OpenSpec's proposal stage: when the user's prompt includes Figma links or images, fetch design data via the **configured** Figma MCP (tool names vary by server), save under `openspec/changes/<change-id>/design/`, and generate `design/design-map.md`.

**Non-goals**: Editing Confluence/wiki; writing to Figma.

---

## Updating AGENTS.md on Execution

**When the user invokes this skill**, read the project's `openspec/AGENTS.md` and apply **both** updates below. OpenSpec templates differ by version—use the **anchor lines** to locate; if a section is missing, insert at the closest equivalent and keep numbering consistent.

### 1. Stage 1 workflow (numbered list under Creating Changes)

**Anchor**: Heading `### Stage 1: Creating Changes` (or equivalent), then the line `**Workflow**` and the numbered list.

**Change**: After `change-id` and the change folder exist, add an explicit Design Extension step. **Do not** break apart a single “choose `change-id` and scaffold …” bullet into two bullets unless the template already does.

- Find the `**Workflow**` numbered list (usually step `1.` reviews context; step `2.` begins with `Choose a unique verb-led` and includes scaffolding under `openspec/changes/<id>/`).
- **Leave step 2 wording as-is** (one combined choose+scaffold step is correct for stock OpenSpec AGENTS).
- **Insert** a **new** numbered step **immediately after** that step, with this body (adjust the number to sit between scaffold and “Draft spec deltas” / validate):

  **Design Extension (if Figma or images in prompt):** If the user prompt includes a Figma URL or images, the agent **MUST** use `call_mcp_tool` to invoke the **available** Figma MCP tools (see `### Design Extension` below), ensure `openspec/changes/<change-id>/design/` exists, save exports/copies there, and write `design/design-map.md`. When a Figma URL is present, **do not skip** MCP calls. If there is no Figma URL and no images, skip this step.

- **Renumber** all following steps (+1): old `3.` → `4.`, old `4.` → `5.`, etc.

If the template already has separate “pick change-id” and “scaffold” lines (e.g. in TL;DR only), still ensure **Stage 1 Workflow** contains an explicit Design Extension step tied to `change-id` and `design/`.

**Optional**: In `## TL;DR Quick Checklist`, between the bullet that picks `change-id` and the bullet that says `Scaffold:`, add:  
`- Design (if Figma/images in prompt): run Figma MCP → \`openspec/changes/<id>/design/\` + \`design-map.md\` (see ### Design Extension).`

### 2. Design Extension section (before Spec File Format)

**Anchor**: The heading `## Spec File Format`.

**Change**: Insert **immediately before** `## Spec File Format` the full fragment in the next section. If `### Design Extension (Figma & Images)` already exists, **replace** it with this version.

---

## Full Fragment to Insert into AGENTS.md

```markdown
### Design Extension (Figma & Images)

When the proposal prompt contains **Figma links** or **images**, the agent **MUST** use `call_mcp_tool` to invoke the **Figma MCP server that is actually configured**—do not only describe steps. When a Figma URL is present, **do not skip** the MCP call.

**Figma detection** (any of the following):

- URLs containing `figma.com/file/` or `figma.com/design/`, e.g. `https://www.figma.com/design/pxhnkHfGrSwHbxT1pfV0T4/xxx?node-id=2496-1199`
- **fileKey**: path segment after `/design/` or `/file/` (alphanumeric id)
- **node-id**: query `node-id=...`; normalize `2496-1199` → `2496:1199` when the tool schema expects colon form

**Tool discovery (mandatory)**:

1. List or read MCP tool descriptors for the Figma server (exact names differ by vendor).
2. Call only tools that exist; map arguments per schema.

**Common patterns** (use whichever matches the connected server):

- **Pattern A — multi-tool chain**: e.g. parse URL → get file/node → export images (names like `parse_figma_url`, `get_file`, `get_node`, `export_images` are **examples** only).
- **Pattern B — Framelink-style**: often `get_figma_data` (`fileKey`, optional `nodeId`) and `download_figma_images` (`fileKey`, `nodes`, `localPath`). **Typical order**: call `get_figma_data` first to find frames/components/icons and any `imageRef` / `gifRef` fields the export tool needs, then build the `nodes` array for `download_figma_images` per its schema (each item needs at least `nodeId` and `fileName`). Set `localPath` to the repo-relative folder `openspec/changes/<change-id>/design` so files land in the change’s `design/` directory.

**Extension flow**:

1. Ensure `openspec/changes/<change-id>/` exists; create `design/` under it.
2. If Figma: run the discovered export path; save raster/vector files into `design/` with stable names (e.g. `figma-<slug>-<index>.png`).
3. If the prompt has attached images or local image paths: copy them into `design/`.
4. Write `design/design-map.md` (asset table + short design summary).

**Note**: Directory `design/` holds visual assets; sibling `design.md` is the technical design doc. If Figma MCP fails or is absent, tell the user to check MCP config; without Figma tools, still copy local/attached images when possible.

```

Skill maintainers: extra detail in `references/figma-mcp-variants.md`.

---

## Execution Checklist (agent)

1. Read `openspec/AGENTS.md`; apply inserts above if missing or outdated.
2. On a proposal with Figma/images: resolve `change-id`, create `openspec/changes/<change-id>/design/`.
3. **Discover** Figma MCP tools → follow Pattern A or B (Pattern B: usually `get_figma_data` then `download_figma_images` with `nodes` built from the response; see `references/figma-mcp-variants.md`).
4. Copy non-Figma images into `design/` when applicable.
5. Write `design/design-map.md` using the template below.

### design-map.md template

```markdown
# Design Map

## Asset List

| File | Source | Description |
|------|--------|-------------|
| figma-hero-1.png | Figma MCP | Homepage hero |
| screenshot-1.png | User attachment | Reference screenshot |

## Design Summary

- [Key design decisions from designs/images]
```

---

## Dependencies

- **Figma MCP**: Must be enabled in the IDE/project; tool **names and args** depend on the server—always use discovery + schema.
- **No Figma in prompt**: Normal OpenSpec flow; skip `design/` unless images are provided.
