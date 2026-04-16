# Tooling Test Cases v1

## Purpose

Extend the general case set when the target skill depends on tools, environment state, permissions, or external systems.

## Cases

### `TOOL-001` Tool Selection Correctness

- Use when: the skill may choose among multiple tools, commands, or paths
- Goal: confirm the selected tool/path is appropriate for the user task
- Evidence: target task, chosen tool/path, rationale, observed correctness

### `TOOL-002` Dependency / Environment Handling

- Use when: the skill depends on local binaries, MCP tools, network access, APIs, or workspace state
- Goal: confirm it detects missing or unavailable dependencies and responds with the correct fallback or stop behavior
- Evidence: dependency condition, observed behavior, safety note

### `TOOL-003` Permission or Fault Handling

- Use when: the skill can hit permission errors, timeouts, empty results, or other operational faults
- Goal: confirm the skill does not present failed operations as success
- Evidence: simulated fault, observed failure handling, recovery quality

### `TOOL-004` Output Traceability

- Use when: the skill produces operational or tool-backed conclusions
- Goal: confirm conclusions can be traced back to tool output, paths, or observable evidence
- Evidence: output summary, linked trace or file/path evidence
