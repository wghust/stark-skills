---
name: c4-interactive-html
description: |
  Analyze the current workspace codebase and produce a single-file interactive C4 architecture diagram as HTML (L1 System Context → L2 Containers → L3 Components), with drill-down, breadcrumb, side panel, and light theme. Use when the user asks for C4 diagrams, interactive architecture HTML, system context/container/component views, or 可交互 C4 架构图.
  分析当前项目代码结构，生成交互式 C4 架构图（单文件 HTML）：系统上下文、容器、组件三级下钻、面包屑、侧栏详情、浅色主题。触发词：C4 架构图、交互式架构、系统上下文、容器图、组件图、架构可视化、可下钻、architecture diagram、interactive C4。
triggers:
  - C4
  - c4 architecture
  - interactive architecture
  - system context
  - container diagram
  - component diagram
  - C4 架构图
  - 交互式架构
  - 系统上下文
  - 容器图
  - 组件图
  - 架构图 HTML
  - 可下钻
---

# c4-interactive-html

> **Language**: Match the user’s language (中文提问则中文回复).

When this skill applies, the agent **MUST** analyze the **user’s current workspace project** (the opened repo), then **generate one self-contained HTML file** that implements the interactive C4 viewer described below. Do not only describe the HTML—**write the file** to disk.

---

## Architectural anchors (from design)

- **L1**: The **current product/repo** is the **core system** (highlighted, **only** node that drills to L2).
- **L2**: Containers laid out by layers (interface → application → domain → infrastructure). **Only** the container that has L3 content shows the drill badge.
- **L3**: **Exactly one** chosen core container (e.g. main API or main web app) is expanded; others stay at L2 only.
- **Evidence**: Prefer facts from files; in the side panel, state **inference basis** when uncertain (e.g. “inferred from `docker-compose.yml`”).

---

## Step 1 · Analyze project architecture

Read enough of the repo to justify the diagram:

**Build & package**

- `pom.xml`, `build.gradle`, `package.json`, `go.mod`, `requirements.txt`, `Cargo.toml`, etc.

**Config & ops**

- `application.yml`, `docker-compose.yml`, `Dockerfile`, `.env` (or `.env.example`)

**Entry & layout**

- App entry points, `src/` or language-idiomatic structure, notable modules

**C4 elements to identify**

| Level | What to capture |
|--------|------------------|
| **People** | End users, admins, operators, integrators—who uses or operates the system |
| **L1 Software system** | This system + external dependencies (DB, MQ, 3rd-party APIs, other microservices) |
| **L2 Containers** | Deployable/runnable units: web apps, APIs, workers, DB, cache, brokers, etc. |
| **L3 Components** | Inside **one** core container: controllers/services/repositories/modules—only the most important slice |

**Large or unclear repos**: Prefer a representative L3; merge minor pieces into grouped nodes; document scope in node `sub` or side panel.

---

## Step 2 · Build the interactive HTML

### Overall design

- **Theme**: Light, professional—white/light gray background, clean typography.
- **Top bar**: Project name + **breadcrumb** `L1 / L2 / L3` (each segment **clickable** to go back to that level).
- **Legend row**: Colored dots for node categories (People / core / external / interface / domain / infra, etc.—align with your `legends` data).

### Three canvases

**1) L1 System Context (default)**

- Layout: **People** (left), **core system** (center, highlighted, **clickable → L2**), **external systems** (right).
- **SVG curved edges** between nodes; label **protocol** when known (`HTTP`, `gRPC`, `MQ`, `JDBC`, etc.).
- **Only the core system** shows a **“点击下钻”** (or “Drill down ↓”) badge; **all other nodes** use **`opacity: 0.5`** (dimmed).
- Click **core** → switch canvas to **L2**.
- Click **dimmed** node → open **right panel** (relationships + description); do **not** change level.

**2) L2 Containers**

- Show all internal containers with **layer separators** and labels, e.g. 接口层 → 应用层 → 领域层 → 基础设施层 (or equivalent for the stack).
- **SVG edges** for calls/data flow.
- **Only** the container that has **L3** content: colored border + drill badge + `cursor: pointer`.
- Containers **without** L3: dimmed (`opacity: 0.5`), no badge; click opens panel only.
- Click drillable container → **L3**.

**3) L3 Components**

- Components grouped by function; **SVG edges** for dependencies.
- **Every** node click opens the **side panel** (no further drill level required).

### Right panel

- **Fixed width 380px**, slides in from the right.
- Shows: name, **level badge** (L1/L2/L3), description, **related relationships** (list of edges touching the node).
- **ESC** or **×** closes the panel.

### Node styling

- **Drillable**: colored border/background treatment + **top-right badge** “点击下钻 ↓” + `cursor: pointer`.
- **Non-drillable**: `opacity: 0.5`, no badge; click → panel only.
- **Selected**: blue glow/shadow; **incident edges** emphasized; other edges and nodes fade.

### Data shape (embed in HTML)

Use one object per level (names may be `L1`, `L2`, `L3` or `level1`—be consistent in JS):

```javascript
const L1 = {
  nodes: [
    {
      id: 'unique-id',
      label: '显示名称',
      sub: '描述 / 推断依据',
      c: 'color-key',
      x: 0,
      y: 0,
      w: 180,
      drill: true,
      drillTo: 'L2',
    },
  ],
  edges: [
    { f: 'from-id', t: 'to-id', c: 'color-key', protocol: 'HTTP' },
  ],
  layers: [{ y: 120, label: '层名称', color: '#ccc' }],
  legends: [{ c: 'core', l: '核心系统' }],
};
```

- **`c`**: maps to the palette / CSS class for node category.
- **`protocol`**: optional; show on or near the edge if present.
- **No external JSON fetch**—all data inline in the same file.

### Color palette (light mode)

- Background `#f5f7fa`, cards `#ffffff`, hover `#f0f2f5`
- Core: `#1168BD` · Domain/data: `#2b8a3e` · External/AI: `#6f42c1` · Interface: `#d4620a` · Governance: `#b8860b`

### Fonts

- **Allowed external dependency**: Google Fonts CDN (e.g. a Latin + CJK-friendly stack). If CDN is undesirable, use a **system font stack** that supports Chinese: e.g. `system-ui, "PingFang SC", "Microsoft YaHei", sans-serif`.

### Layout quality

- Avoid overlapping nodes; keep edge labels readable; use canvas size / coordinates so the diagram fits a typical laptop viewport with scroll as fallback.

---

## Step 3 · Output path

1. **Default**: save as **`~/Downloads/c4-architecture.html`** (user home → `Downloads` → filename `c4-architecture.html`).
2. **If not writable** (permissions, sandbox, missing folder): ask the user for a path **or** write **`c4-architecture.html`** at the **workspace root** and **explain the fallback** in the reply.
3. Confirm the **absolute path** in the assistant message after writing.

---

## Acceptance checklist (before finishing)

- [ ] Single file, opens in a normal browser; **no** npm/build step.
- [ ] Breadcrumb, legend, L1/L2/L3 behavior, panel, ESC close, selection highlight—all present.
- [ ] Core system-only drill on L1; single L3 target; dimmed nodes behave as specified.
- [ ] Chinese labels render correctly (`<meta charset="utf-8">` + fonts).
- [ ] File written to default or agreed path.

---

## Related doc

See `USAGE.md` in this folder for FAQs (path override, minimal backends, offline fonts).
