# openspec-design User Guide

Extends OpenSpec's proposal stage with design asset integration: when a proposal includes a Figma link, automatically calls Figma MCP to fetch design data, save to `design/`, and generate a design summary document.

---

## Prerequisites

1. **Project has OpenSpec initialized**: Root directory has `openspec/` with `AGENTS.md`, `project.md`, etc.
2. **Cursor has Figma MCP configured**: Enable Figma MCP Server in Cursor settings

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

The AI will read and update the project's `openspec/AGENTS.md`, inserting the design extension section and workflow steps. After that, the project's proposal flow supports Figma design asset integration.

**Note**: Execute once per project. If `AGENTS.md` already has the design extension, you may skip or overwrite.

---

### Step 2: Use Figma in Proposals

When using OpenSpec's proposal command (e.g. `/openspec/proposal`), **include the Figma link directly** in your input:

```
/openspec/proposal Add user center page, design at https://www.figma.com/design/pxhnkHfGrSwHbxT1pfV0T4/xxx?node-id=2496-1199
```

The AI will:

1. **Detect Figma link**: Recognize `figma.com/file/`, `figma.com/design/` URLs
2. **Call Figma MCP**: Use `parse_figma_url`, `get_file`, `get_node`, `export_images` to fetch design data
3. **Create design/ directory**: Save exported images under `openspec/changes/<change-id>/design/`
4. **Generate design-map.md**: Asset list and design summary

**Supported Figma formats**:

- Full link: `https://www.figma.com/design/xxx?node-id=2496-1199`
- File link: `https://www.figma.com/file/xxx`
- Text mention: e.g. "Figma design", "reference Figma link"

**Image attachments**: If the proposal includes image attachments or local image paths, they will also be saved to `design/` as context assets.

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
A: Confirm Step 1 was run and `openspec/AGENTS.md` includes the Design Extension section. If it still doesn't run, check that Figma MCP is enabled in Cursor.

**Q: Figma MCP call failed?**  
A: Check that the Figma link is valid, you have access, and Figma MCP API key/auth is configured correctly.

**Q: Does proposal work without Figma?**  
A: Yes. Without Figma links or images, the normal proposal flow runs and `design/` is not created.
