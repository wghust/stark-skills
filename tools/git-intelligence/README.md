# git-intelligence

AI-powered git repository analysis CLI. Extract structured insights from commits, PRs, and repository history to improve engineering productivity.

## Features

- **Summarize commits** — group recent commits by category (Features, Fixes, Refactor, Performance)
- **Generate release notes** — structured notes between any two tags
- **Analyze PR** — risk score, impacted modules, suggested reviewers, test suggestions
- **Detect risky changes** — heuristic + LLM risk assessment
- **Change impact** — map changed files to logical system modules

All commands are **read-only** — the tool never modifies your repository.

## Installation

### From source (recommended)

```bash
cd tools/git-intelligence
pnpm install
pnpm build
pnpm link --global
```

### Without global install

```bash
cd tools/git-intelligence
pnpm install && pnpm build
node dist/cli.js <command>
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | Yes (for LLM) | — | OpenAI-compatible API key |
| `OPENAI_BASE_URL` | No | `https://api.openai.com/v1` | Custom API endpoint (Ollama, Azure, etc.) |
| `OPENAI_MODEL` | No | `gpt-4o` | Model name to use |

Use `--no-llm` to run without an API key (heuristics only).

## CLI Usage

```
git-intelligence <command> [options]

Global options:
  --repo <path>       Path to git repository (default: current directory)
  --output md|json    Output format (default: md)
  --no-llm            Skip LLM, use heuristics only
  -v, --version       Show version
  -h, --help          Show help
```

### summarize-commits

Collect and categorize commits since a given time.

```bash
git-intelligence summarize-commits --since 7d
git-intelligence summarize-commits --since 2w --no-llm
git-intelligence summarize-commits --since 2024-01-01 --output json
```

**Duration formats**: `7d` (days), `2w` (weeks), `1mo` (months), `2024-01-01` (ISO date)

**Example output**:
```markdown
## Commit Summary

### Features
- Add SSR degrade strategy
- Support Redis cache

### Fixes
- Fix login redirect bug

### Performance
- Optimize news list rendering
```

---

### release-notes

Generate structured release notes between two git tags.

```bash
git-intelligence release-notes --from v1.2.0 --to v1.3.0
```

**Example output**:
```markdown
## Release Notes: v1.2.0 → v1.3.0

### Features
- Add SSR fallback when API fails
- Support multi-region deployment

### Fixes
- Fix session expiry on mobile
```

---

### analyze-pr

Full PR analysis: summary, impacted modules, risk score, suggested reviewers, and test cases.

```bash
git-intelligence analyze-pr --branch feature/payment-refactor
git-intelligence analyze-pr --branch feature/my-feature --base develop
git-intelligence analyze-pr --branch feature/my-feature --output json
```

**Example output**:
```markdown
## PR Analysis: feature/payment-refactor

### Summary
Refactors payment processing module to support async workflows...

### Impacted Modules
- payment/checkout
- middleware/auth

### Risk Score
🔴 8/10

### Suggested Reviewers
- Jane Smith
- payments team

### Suggested Tests
- Payment timeout scenario
- Auth middleware regression
```

---

### detect-risk

Heuristic + LLM risk assessment for a branch.

```bash
git-intelligence detect-risk --branch feature/large-refactor
git-intelligence detect-risk --branch feature/small-fix --no-llm
```

**Heuristic scoring**:
| Condition | Score |
|---|---|
| Files changed > 50 | +3 |
| Lines changed > 1000 | +3 |
| Sensitive folder touched (`auth/`, `payment/`, `infra/`, `middleware/`, `cache/`) | +2 per folder (max +4) |
| Test file ratio < 10% | +1 |

Score is clamped to 1–10. LLM may adjust by ±2.

---

### impact

Analyze which system modules may be affected by a branch.

```bash
git-intelligence impact --branch feature/api-rewrite
git-intelligence impact --branch feature/api-rewrite --output json
```

**Example output**:
```markdown
## Change Impact: feature/api-rewrite

### Modules Affected
- src/api
- src/middleware
- src/auth

### Potential Risks
- Sensitive module modified: src/auth/login.ts
- Large diff — some impact areas may not be listed
```

## Development

```bash
pnpm dev -- summarize-commits --since 7d --no-llm   # run with tsx
pnpm build                                            # compile TypeScript
pnpm test                                             # run unit tests
pnpm typecheck                                        # type-check only
```

## Architecture

```
src/
  cli.ts                     # commander CLI entry point
  types.ts                   # shared TypeScript types
  git/
    gitClient.ts             # simple-git wrapper + GitError
    commitCollector.ts       # getCommitsSince, getCommitsBetweenTags
    diffParser.ts            # getBranchDiff → ParsedDiff
  llm/
    llmClient.ts             # OpenAI-compatible client
    prompts.ts               # pure prompt builder functions
  analysis/
    summarizeCommits.ts      # LLM + heuristic commit classification
    generateReleaseNotes.ts  # structured release notes
    detectRiskyPR.ts         # heuristic + LLM risk scoring
    changeImpact.ts          # module impact analysis
    suggestReviewers.ts      # git blame-based reviewer suggestion
  utils/
    logger.ts                # info/warn/error → stderr
    markdown.ts              # markdown builder helpers
```

**Design principles**:
- Read-only: never writes to the repository
- All output to stdout (data) and stderr (logs)
- Every LLM call has a heuristic fallback
- `--no-llm` makes the tool fully offline-capable
