# chrome-tab-killer scripts (macOS)

AppleScript helpers for **Google Chrome**. Invoked by the agent via `osascript`; no user copy/paste.

## Permissions

**System Settings → Privacy & Security → Automation**: allow the app running the script (e.g. Terminal, Cursor, iTerm) to control **Google Chrome**.

If blocked, macOS will prompt or silently fail.

## Scripts

| File | Purpose |
|------|---------|
| `list-chrome-tabs.applescript` | Prints TSV lines: `windowIndex\ttabIndex\ttitle\turl` |
| `close-chrome-tab.applescript` | Args: `windowIndex` `tabIndex` (1-based, as in Chrome) |
| `close-tab-by-url.applescript` | Arg: exact URL string to find and close first match |
| `close-tabs-except-localhost-3000.applescript` | Close all tabs whose URL does **not** contain `localhost:3000` (user-authorized one-shot) |

## Examples

From the skill directory:

```bash
osascript ./list-chrome-tabs.applescript
osascript ./close-chrome-tab.applescript 1 2
osascript ./close-tab-by-url.applescript 'https://github.com/openclaw/openclaw'
```

## Notes

- **Chromium** or **Chrome Canary**: change `tell application "Google Chrome"` to the correct app name in a copy of the script if needed.
- Tab/window order should match Chrome’s UI; CDP `json/list` order may differ—prefer **URL-based** close when correlating with CDP.
