# c4-interactive-html — User guide

## Changing the output path

The skill defaults to `~/Downloads/c4-architecture.html`. In the same turn you can ask for a different absolute path or a path under the repo (e.g. `docs/c4-architecture.html`). If `Downloads` is not writable, the agent may fall back to the workspace root—check the assistant’s confirmation message.

## No Docker / single-process projects

If there is no `docker-compose.yml` or only one `package.json` app, L2 can still list logical containers: e.g. “Browser UI”, “Dev server”, “SQLite file”, “External OAuth”. Mark inferred boundaries in the side panel description.

## Offline or blocked Google Fonts

If you need fully offline behavior, ask the agent to **omit** the Google Fonts `<link>` and rely on the system font stack documented in `SKILL.md` (still UTF-8 for Chinese).

## Updating the diagram later

Regenerate the HTML after major structural changes, or edit the embedded `L1` / `L2` / `L3` JavaScript objects in the file—no separate data file is required by the skill.
