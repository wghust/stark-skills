---
name: confluence-distill
description: |
  Read-only Confluence search and distillation into a new multi-file Agent Skill package (SKILL.md + references/ + optional scripts/). Use when the user wants to search Confluence by topic (e.g. alerts, runbooks), distill pages into a new skill, generate a skill from wiki docs, Confluence 蒸馏, 从 Confluence 生成 skill, CQL 搜索 Confluence, 告警文档转 skill, Membrane Confluence 只读拉取.
  从 Confluence 只读检索主题页面，**策展式**蒸馏为多文件 Cursor/Claude Skill 包（非整页粘贴）；支持直连（基址 + API Token）或 Membrane CLI（connectionId）二选一。禁止在蒸馏流程中创建/编辑/删除 Confluence 内容。
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

### 2.0 · Scope gate (MANDATORY, hard stop)

Before running any search/fetch command, the agent and user **MUST** agree all fields below:

- **Goal sentence** (one sentence): what downstream skill must solve.
- **Scope statement**: in-scope / out-of-scope bullets (for broad topics).
- **Spaces**: explicit list or `all allowed spaces`.
- **Page budget**:
  - default `max pages = 20`
  - hard cap `max pages = 50` for one distillation batch

**If any field is missing or unclear, STOP and ask for clarification. Do not start fetching.**

If requested scope exceeds the hard cap, switch to **batched distillation**:

1. Propose split plan (by space or subtopic).
2. Get user approval for batch order.
3. Process one batch at a time, each batch with its own `source-map.md` section/date notes.

1. Build **CQL** (adapt to instance capabilities), e.g. `type=page AND text ~ "alert"` or title contains keywords. Use `/content/search` (or the versioned search endpoint your base URL supports).
2. **Paginate** (`limit`, `start` / links in response) until the cap or no more results.
3. Respect rate limits with backoff:
   - start with 1-2 requests/second for page fetches;
   - on `429` or server throttling hints, back off exponentially (2s, 4s, 8s, up to 30s) and retry limited times;
   - if throttling persists, stop and ask user whether to narrow scope or continue later.

---

## Step 3 · Fetch page bodies (read-only)

For each hit (bounded list):

1. **GET** page metadata and **body** (`body.storage` or `body.view`, or export representation per API version).
2. Normalize to plain text or markdown-like notes for distillation; preserve **page id**, **title**, **space**, and **web UI URL** for the source map.

**On 401 / 403** → stop and explain token, URL, space permissions, or Membrane connection scope; do not invent content.
**On 429 / heavy throttling** → apply backoff policy from Step 2; do not bypass limits with aggressive parallel retries.

---

## Step 4 · Curate, then write the Agent Skill **package**

Retrieved page bodies are **source material only**. **Do not** ship a skill whose `references/*.md` are mostly unedited full-page dumps, macro token garbage, or off-topic bulk lists (e.g. unrelated JIRA/feature inventories) as the canonical “how-to” unless the user explicitly asked for that inventory.

### 4.1 · Intent alignment and triage (MANDATORY)

- Map each fetched page to the user’s **distillation goal**; mark paragraphs as **on-topic**, **off-topic**, or **unclear**.
- **Off-topic** bulk blocks MUST NOT form the main body of `references/<topic>.md`. Omit them with a one-line reason tied to the goal, or move to `## Appendix: …` with a warning that the section is **not normative** (traceability stays in `source-map.md`).

### 4.2 · De-noise and macro repair (MANDATORY)

- Remove or rewrite **macro debris** and meaningless token runs (e.g. parameter fragments between sentences); never treat them as procedural steps.
- When tables collapse on export, rebuild as readable markdown **only** when meaning is clear; otherwise state “see Confluence UI” and link via `source-map.md`.

### 4.3 · Multi-source reconciliation (MANDATORY)

- If two or more pages **disagree** on a material point, add a dedicated section (e.g. **Conflicts / needs confirmation** / 多源差异与待确认) listing each variant with **space/page identity** and URLs from the source map. **Do not** silently pick one as company-wide truth.
- If recency or correctness cannot be determined, say so and recommend verifying in Confluence.

### 4.4 · Quality gate before writing files (MANDATORY)

Before saving `references/*.md`, confirm:

1. **Topic fit** — canonical sections directly support the stated goal.
2. **Traceability** — non-obvious claims in canonical sections map to `source-map.md`.
3. **Noise control** — no macro garbage in canonical flow; off-topic bulk demoted or appendix-only.
4. **Conflicts** — material disagreements recorded.

If the corpus is empty, irrelevant, or unusably corrupted after triage, **do not** invent procedures — report the gap and suggest narrower CQL, spaces, or follow-up pages (same spirit as “insufficient content”).

### 4.5 · Sensitive-content hygiene (MANDATORY)

- Treat fetched wiki text as potentially sensitive. Do not copy obvious secrets/PII into canonical sections of `references/*.md`.
- If source pages contain credentials-like strings, tokens, private keys, customer PII, or internal endpoints that should not be redistributed, replace with `[REDACTED]` and note the redaction rationale in `source-map.md` notes.
- If redaction would remove critical operational meaning, keep a minimal safe summary and direct users to Confluence URL for privileged details.

### 4.6 · Package layout

**MUST** write a **new directory** (default under the user’s workspace): `skills/<slug>/` or a path the user specifies. Minimum layout:

| Path | Purpose |
|------|---------|
| `SKILL.md` | YAML `name` + `description` (“Use when” style triggers); **short** body: when to use, step order, **explicit list of `references/*.md` to read first** for facts/procedures. **No** huge tables or full runbooks here. |
| `references/source-map.md` | Table: title, page id, space, canonical Confluence URL, fetch date / notes. |
| `references/overview.md` | Domain summary, terminology, boundaries; **include** guidance when multiple spaces/policies apply (agent should ask user which applies). |
| `references/<topic>.md` | Curated procedures, rules, checklists, tables; optional **Conflicts / needs confirmation**; optional **Appendix** for low-signal or auxiliary dumps. |

**Optional**

- `USAGE.md` — human FAQ (auth, 403, rate limits).
- `scripts/` — **placeholder-only** examples (`curl` / `membrane request`); see `scripts/README.md` in this skill.

**Rules**

- **Shard** long content across `references/`; keep root `SKILL.md` a **router**.
- Every non-trivial claim in canonical sections should be traceable via `source-map.md`.
- **Do not** fabricate Confluence content when search returns nothing; suggest broader CQL or spaces.

---

## Step 5 · Handoff

Tell the user where the new skill directory is, remind them **not to commit secrets**, and suggest verifying critical steps against Confluence using `references/source-map.md`.
If batched distillation was used, report what was completed in this batch and list the remaining approved batches.
