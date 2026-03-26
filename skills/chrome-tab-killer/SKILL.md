---
name: chrome-tab-killer
description: |
  Automatically enumerate Chrome tabs, detect crash/error/duplicate candidates, and close tabs after user confirmation. Primary path Chrome DevTools Protocol (CDP); macOS AppleScript fallback via bundled scripts. No manual paste or opening chrome://discards/ for identification.
  全自动枚举 Chrome 标签、识别崩溃/错误/重复页候选，确认后关闭。主路径 CDP；无远程调试时用 AppleScript。识别阶段不要求用户手动打开 discards 或粘贴内容。
triggers:
  - chrome-tab-killer
  - chrome tab killer
  - 关闭 Chrome 标签
  - Chrome 标签太多
  - 清理 Chrome 标签
---

# chrome-tab-killer Skill

> **Language**: Respond in the same language as the user (中文提问则中文回答).

**Identification is fully automated** (CDP or AppleScript). **Closing** requires a **confirmation gate** (show proposed list → user confirms) unless the user explicitly authorizes a one-shot close.

---

## Prerequisites

| Item | Required for |
|------|----------------|
| **Google Chrome** (macOS) | AppleScript path |
| **Chrome with `--remote-debugging-port=9222`** | Full CDP enumeration + optional `chrome://discards/` automation |
| **Automation permission** | System Settings → Privacy & Security → Automation: allow Terminal/Cursor to control **Google Chrome** |

---

## Execution Flow

### Step 0 · Detect Language

Use the same language as the user for all output.

---

### Step 1 · Enumerate Tabs (Automated)

#### Path A — CDP (preferred)

1. Ensure Chrome was started with remote debugging, e.g.:
   ```bash
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
   ```
   Or add to a shortcut / shell profile for daily use.

2. **List targets** (agent runs, no user UI):
   ```bash
   curl -s http://127.0.0.1:9222/json/list
   ```
   Parse JSON: each `type: "page"` entry has `id`, `title`, `url`, `webSocketDebuggerUrl`.

3. Count tabs and build a table of `title`, `url`, `targetId`.

#### Path B — AppleScript (fallback when CDP unavailable)

Run the bundled script (use absolute path to the skill’s `scripts/` folder):
```bash
osascript /path/to/skills/chrome-tab-killer/scripts/list-chrome-tabs.applescript
```

Output format: `windowIndex\ttabIndex\ttitle\turl` per line.

**Limitation**: No per-tab memory from discards; tell the user that **full automation quality needs CDP**.

---

### Step 2 · Classify Candidates (Heuristics, Automated)

Apply rules **without** asking the user to paste anything:

| Class | Rule (examples) |
|-------|------------------|
| **Crash / error** | Title contains `Aw, Snap!`, `Page Unresponsive`, `无法访问此网站`, `ERR_`, `This site can’t be reached`, etc. |
| **Duplicate URL** | Same normalized URL appears in more than one tab (keep one). |
| **Low activity (conservative)** | Only when user enables **aggressive mode** in prompt; optional CDP discards data (see below). |

Default **conservative**: recommend closing **crash/error** and **duplicate URL** only.

---

### Step 3 · Optional — `chrome://discards/` via CDP (SHOULD / best-effort)

Only if CDP is connected:

1. Attach to a page target via WebSocket, `Page.navigate` to `chrome://discards/`.
2. After load, `Runtime.evaluate` or DOM query to read table rows (memory, last active, discard eligibility).

**If parsing fails** (Chrome update broke DOM): **stop** and continue with Step 2 data only (`json/list` + heuristics). **Do not** ask the user to open or paste the page.

---

### Step 4 · Default Dry-Run Report

Output Markdown:

- Total tab count
- Table of all tabs (title, url, targetId or W/T index)
- **Candidates** with reason (crash / duplicate / aggressive-only)
- **No closes** in this step unless user already requested execution

---

### Step 5 · Close (After Confirmation Only)

**Do not close** until the user explicitly confirms the list **or** gives a clear one-shot order (“关闭上表中的候选标签”).

**Option A — CDP `Target.closeTarget`**

Send over the target’s debugger WebSocket (same session as CDP):

```json
{"id":1,"method":"Target.closeTarget","params":{"targetId":"<id from json/list>"}}
```

Use the `webSocketDebuggerUrl` from the matching list entry, or a shared browser WebSocket if documented for your Chrome version.

**Option B — AppleScript**

Close by window/tab index:
```bash
osascript scripts/close-chrome-tab.applescript <windowIndex> <tabIndex>
```

Close by URL (often easier to align with CDP `url`):
```bash
osascript scripts/close-tab-by-url.applescript 'https://example.com/path'
```

---

## Safety

| Rule | Behavior |
|------|----------|
| Default | Analysis + dry-run only |
| Close | Only after explicit user confirmation or one-shot authorized command |
| Irreversible | Warn that closed tabs cannot be restored by this skill |

---

## Scripts (macOS)

See `scripts/README.md` for `osascript` usage and Automation permissions.

---

## Example

**User:** “用 chrome-tab-killer 分析一下标签”

**Agent:**

1. `curl -s http://127.0.0.1:9222/json/list` (or AppleScript if connection refused)
2. Classify crash titles and duplicate URLs
3. Print dry-run report
4. Ask: “是否关闭以上候选？” → only if yes, run `Target.closeTarget` or `osascript` …

---

## Error Handling

| Situation | Action |
|-----------|--------|
| Connection refused on :9222 | Fall back to AppleScript list; state that CDP is off |
| AppleScript denied | Tell user to enable Automation for Google Chrome |
| discards parse fails | Skip discards; continue with json/list heuristics |
