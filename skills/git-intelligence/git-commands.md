# git-intelligence: Command Reference

Agent-internal reference for git commands used by each capability.
All commands are read-only and do not modify the repository.

---

## Repository Health Check

```bash
git rev-parse --git-dir
# ✅ Returns: .git (or path to git dir)
# ❌ Fails:   not a git repository (or any of the parent directories)
```

---

## Base Branch Detection

```bash
git symbolic-ref refs/remotes/origin/HEAD
# ✅ Returns: refs/remotes/origin/main  → extract "main"
# ✅ Returns: refs/remotes/origin/master → extract "master"
# ❌ Fails:   no upstream configured → fallback to "master"
```

---

## summarize-commits

### Duration → ISO date conversion

| Input | Formula |
|---|---|
| `7d` | today − 7 days |
| `2w` | today − 14 days |
| `1mo` | today − 1 month |
| `2024-01-15` | use as-is |

### Collect commits

```bash
git log --since="2024-06-01" --oneline --no-merges
# Output format: <short-hash> <subject>
# Example:
#   a1b2c3d feat: add SSR fallback
#   e4f5a6b fix: resolve login redirect
```

### Edge cases

```bash
# Empty result = no commits in range
git log --since="2030-01-01" --oneline --no-merges
# (returns nothing)

# Check total commit count
git rev-list --count HEAD
# 0 = empty repository
```

---

## release-notes

### Verify tags exist

```bash
git rev-parse --verify refs/tags/v1.2.0
# ✅ Returns: commit hash
# ❌ Fails:   fatal: Needed a single revision

git tag -l
# List all available tags (show when tag not found)
```

### Collect commits between tags

```bash
git log v1.2.0..v1.3.0 --oneline --no-merges
# Note: v1.2.0 commits are EXCLUDED, v1.3.0 commits are INCLUDED
```

---

## analyze-pr / detect-risk / change-impact

### Get diff statistics (per-file line counts)

```bash
git diff master...feature/my-feature --numstat
# Output format (tab-separated): <added> <removed> <filepath>
# Example:
#   45    12    src/auth/login.ts
#   8     3     src/utils/helpers.ts
#   -     -     assets/logo.png     ← binary file (ignore)
```

**Note:** Use three-dot `...` syntax (merge base diff), not two-dot `..` (direct diff).

### Count changed files and lines

```bash
git diff master...feature/my-feature --shortstat
# Example: 12 files changed, 340 insertions(+), 89 deletions(-)
```

### List changed file paths only

```bash
git diff master...feature/my-feature --name-only
```

### Sensitive path detection

Check if any changed file path contains:
- `auth/` — authentication module
- `payment/` — payment processing
- `infra/` — infrastructure / deployment
- `middleware/` — request middleware
- `cache/` — caching layer

---

## suggest-reviewers (part of analyze-pr)

### Run blame on changed files (up to 5 files)

```bash
git blame --porcelain -- src/auth/login.ts
# Output: one header block per blamed line
# Key lines to parse:
#   <40-char commit hash> <orig-line> <final-line> <line-count>
#   author John Doe
#   author-mail <john@example.com>
#   ...
#   <tab><line content>
```

### Parsing logic

1. For each line starting with a 40-char hex hash: a new blame entry starts
2. Parse `author <name>` (not `author-mail`, `author-time`, etc.)
3. Parse `author-mail <email@domain>` → strip `<>` → use as unique key
4. Skip `author-mail <not.committed.yet>` (uncommitted changes)
5. Count entries per email → rank by count → take top 3 display names

### Fallback roles for sensitive paths

| Path contains | Role label |
|---|---|
| `auth/` or `payment/` | "security team" |
| `infra/` | "infra team" |
| `middleware/` | "backend team" |
| `cache/` | "infrastructure team" |

Apply fallbacks only when fewer than 2 distinct blame authors are found.

---

## Risk Scoring Reference

```
score = 1  (base)
+ 3  if total files changed > 50
+ 3  if total lines changed (added + removed) > 1000
+ 2  per unique sensitive folder touched (max contribution: +4)
+ 1  if test files < 10% of changed files
     (test files match: *.test.*, *.spec.*, __tests__/*)

final_score = clamp(score, 1, 10)
```

**Display:**
- `🔴` if score ≥ 8
- `🟡` if score 5–7
- `🟢` if score ≤ 4

---

## Large Diff Handling

When `git diff --numstat` returns > 100 file entries:
- Analyze first 100 files only
- Append to report: `[Large diff — showing top 100 of N total changed files]`
- Still count total lines from `--shortstat` for risk scoring
