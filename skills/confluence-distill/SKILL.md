---
name: confluence-distill
description: |
  Read-only Confluence search and distillation into a new multi-file Agent Skill package (SKILL.md + references/ + optional scripts/). Use when the user wants to search Confluence by topic (e.g. alerts, runbooks), distill pages into a new skill, generate a skill from wiki docs, Confluence 蒸馏, 从 Confluence 生成 skill, CQL 搜索 Confluence, 告警文档转 skill, Membrane Confluence 只读拉取.
  从 Confluence 只读检索主题页面，蒸馏为多文件 Cursor/Claude Skill 包；支持直连（基址 + API Token）或 Membrane CLI（connectionId）二选一。禁止在蒸馏流程中创建/编辑/删除 Confluence 内容。
---

# confluence-distill

> **Language**: Match the user's language (中文提问则中文回复).

When this skill applies, the agent **MUST** follow the workflow below: establish **read-only** connectivity, search and fetch pages, then **write** a **new skill directory** (not a single monolithic `SKILL.md`). **Do not** use Confluence or Membrane to create, update, or delete content during this workflow.

**Normative references**

- Agent Skills layout: [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) (`SKILL.md`, optional `references/`, `scripts/`).
- Optional Membrane path: [membranedev/application-skills — Confluence](https://skills.sh/membranedev/application-skills/confluence) (`membrane login`, `membrane connect`, `membrane request`). Use **only** read operations for distillation.

---

## Before you start (secrets)

- **Never** commit API tokens, passwords, or Membrane secrets. **Never** write tokens into tracked files under this repo (`skills/`, `openspec/`, etc.).
- Prefer environment variables or paste into chat only for the session; if the user needs a local file, use a path that is **gitignored** and warn them.
- **Do not** echo full tokens in assistant output.

---

## Step 1 · Choose connectivity mode (exactly one)

### Mode A — Direct REST (default)

**WHEN** the user can provide:

1. **Base URL** for the Confluence REST API. Common shapes:
   - **Confluence Cloud**: often `https://<site>.atlassian.net/wiki` — REST prefix is typically `/wiki/rest/api` (if base already includes `/wiki`, paths start with `/rest/api/...`; align with [Atlassian Confluence Cloud REST](https://developer.atlassian.com/cloud/confluence/rest/v2/intro/)).
   - **Server / Data Center**: site-specific; use the admin-documented REST root.
2. **Credentials**:
   - **Cloud**: HTTP Basic — username = Atlassian **account email**, password = **API token**.
   - **Server/DC**: follow org policy (PAT, Basic, etc.).

**THEN** use `curl` or equivalent HTTP client with **GET** (and query bodies only if the API requires POST for search — still no writes to wiki content).

### Mode B — Membrane CLI

**WHEN** the user has [Membrane](https://skills.sh/membranedev/application-skills/confluence) installed and a Confluence **connection** (they provide `connectionId`, or you discover it via `membrane connection list --json`).

**THEN** use **read-only** calls only, for example:

- `membrane request CONNECTION_ID /rest/api/content/search --method GET --query "cql=..."` (adjust path to match their site’s REST prefix; Membrane proxies under the connection).
- Prefer listing/fetching patterns from the Membrane Confluence skill docs; **do not** run create-page, update-page, delete-page, or other mutating actions for this workflow.

**IF** Membrane is missing or the connection fails → fall back to Mode A after explaining the error.

---

## Step 2 · Search (CQL first)

1. Agree with the user on **topic**, optional **space** (`space=KEY`), and **max pages** (cap early; respect rate limits).
2. Build **CQL** (adapt to instance capabilities), e.g. `type=page AND text ~ "alert"` or title contains keywords. Use `/content/search` (or the versioned search endpoint your base URL supports).
3. **Paginate** (`limit`, `start` / links in response) until the cap or no more results.

---

## Step 3 · Fetch page bodies (read-only)

For each hit (bounded list):

1. **GET** page metadata and **body** (`body.storage` or `body.view`, or export representation per API version).
2. Normalize to plain text or markdown-like notes for distillation; preserve **page id**, **title**, **space**, and **web UI URL** for the source map.

**On 401 / 403** → stop and explain token, URL, space permissions, or Membrane connection scope; do not invent content.

---

## Step 4 · Distill into a new Agent Skill **package**

**MUST** write a **new directory** (default under the user’s workspace): `skills/<slug>/` or a path the user specifies. Minimum layout:

| Path | Purpose |
|------|---------|
| `SKILL.md` | YAML `name` + `description` (“Use when” style triggers); **short** body: when to use, step order, **explicit list of `references/*.md` to read first** for facts/procedures. **No** huge tables or full runbooks here. |
| `references/source-map.md` | Table: title, page id, space, canonical Confluence URL, fetch date / notes. |
| `references/overview.md` | Domain summary, terminology, boundaries. |
| `references/<topic>.md` | One or more topic files (e.g. `alerts-routing.md`) with procedures, checklists, tables. |

**Optional**

- `USAGE.md` — human FAQ (auth, 403, rate limits).
- `scripts/` — **placeholder-only** examples (`curl` / `membrane request`); see `scripts/README.md` in this skill.

**Rules**

- **Shard** long content across `references/`; keep root `SKILL.md` a **router**.
- Every non-trivial claim in `references/` should be traceable via `source-map.md`.
- **Do not** fabricate Confluence content when search returns nothing; suggest broader CQL or spaces.

---

## Step 5 · Handoff

Tell the user where the new skill directory is, remind them **not to commit secrets**, and suggest verifying critical steps against Confluence using `references/source-map.md`.
