# openspec-design User Guide

Extends OpenSpec's proposal stage with design asset integration: when a proposal includes a Figma link or images, the agent calls the **Figma MCP you have configured**, saves assets under `openspec/changes/<change-id>/design/`, and writes `design/design-map.md`.

---

## Prerequisites

1. **Project has OpenSpec initialized**: Root directory has `openspec/` with `AGENTS.md`, `project.md`, etc.
2. **Figma MCP enabled** in Cursor (or your client): Framelink and other servers expose **different tool names**—the agent should read the live tool list.

---

## Installation

1. Unzip `openspec-design.zip` to get the `openspec-design` folder
2. Copy to Cursor global skills directory: `~/.cursor/skills/openspec-design/`

```bash
unzip openspec-design.zip -d /tmp
cp -r /tmp/openspec-design ~/.cursor/skills/
```

---

## Usage Steps

### Step 1: Extend OpenSpec (First-Time Setup)

In a **project with OpenSpec initialized**, tell the AI:

- "Run openspec-design"
- "Enhance openspec design"
- "Apply openspec-design"

The AI will read and update the project's `openspec/AGENTS.md`, inserting the Design Extension section and a Stage 1 workflow step. After `openspec update` or upstream template changes, you may need to re-run or merge manually.

**Note**: Execute once per project (or after major AGENTS refreshes). If `AGENTS.md` already contains Design Extension, the skill may overwrite that block to the latest version.

---

### Step 2: Use Figma in Proposals

When creating a proposal, **paste the Figma link** (and optionally attach images):

```
/openspec/proposal Add user center page, design at https://www.figma.com/design/pxhnkHfGrSwHbxT1pfV0T4/xxx?node-id=2496-1199
```

The AI will:

1. **Detect** `figma.com/file/` / `figma.com/design/` URLs (and attachments/local paths).
2. **Call Figma MCP** using the tools that actually exist (e.g. Framelink: `get_figma_data`, `download_figma_images`; other servers may use different names).
3. **Create** `openspec/changes/<change-id>/design/` and place exports/copies there.
4. **Write** `design/design-map.md`.

**Supported Figma URL shapes**:

- Full link: `https://www.figma.com/design/<fileKey>/...?node-id=...`
- File link: `https://www.figma.com/file/<fileKey>/...`

**Image attachments**: Saved into `design/` as context assets.

---

## Directory Structure Example

After running a proposal, the change directory may look like:

```
openspec/changes/add-user-center/
├── proposal.md
├── tasks.md
├── design.md
├── design/              ← Design asset directory
│   ├── figma-hero-1.png
│   ├── figma-form-2.png
│   └── design-map.md    ← Design summary
└── specs/
    └── user-center/
        └── spec.md
```

---

## FAQ

**Q: Figma MCP not being called?**  
A: Confirm Step 1 was run and `openspec/AGENTS.md` includes the Design Extension section. Ensure Figma MCP is enabled for this workspace.

**Q: Errors like “tool not found” or wrong argument errors?**  
A: Your Figma server may use different tool names than another vendor’s docs. The agent should use the **configured** MCP’s tool list. See `references/figma-mcp-variants.md` in the skill folder for common patterns.

**Q: Figma MCP call failed?**  
A: Check link validity, file access, and API token/auth for that MCP.

**Q: Does proposal work without Figma?**  
A: Yes. Without Figma links or images, the normal proposal flow runs and `design/` is usually omitted.
