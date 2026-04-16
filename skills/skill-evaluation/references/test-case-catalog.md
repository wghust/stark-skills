# Standard Test Case Catalog

## Purpose

Provide the default test-case selection rules for `skill-evaluation` so evaluators begin from a stable baseline case set before adding target-specific cases.

## How To Use

1. Select the evaluation scope tier: `smoke`, `regression`, or `deep`.
2. Start with the required general-purpose case set for that tier.
3. If the target skill depends on tools, environment state, or external systems, append the tooling extension cases.
4. Only after the standard set is selected may you add custom target-specific cases.

## Case ID Convention

- General cases: `GEN-###`
- Tooling cases: `TOOL-###`
- Optional target-specific cases may use a local prefix such as `LOCAL-###`

Case IDs should remain stable across future versions so baseline and regression reports stay comparable.

## Minimal Evidence Fields Per Case

For each executed case, record at minimum:

- `case_id`
- input summary
- expected behavior
- observed behavior
- evidence ID or trace note

## Scope Mapping

### `smoke`

Required cases:

- `GEN-001` Core happy path
- `GEN-002` Mandatory input gate

Add tooling cases only if applicable:

- `TOOL-001` Tool selection correctness

### `regression`

Required cases:

- `GEN-001` Core happy path
- `GEN-002` Mandatory input gate
- `GEN-003` Paraphrase / perturbation
- `GEN-004` Failure-path recovery

Add tooling cases if applicable:

- `TOOL-001` Tool selection correctness
- `TOOL-002` Dependency / environment handling

### `deep`

Required cases:

- `GEN-001` Core happy path
- `GEN-002` Mandatory input gate
- `GEN-003` Paraphrase / perturbation
- `GEN-004` Failure-path recovery
- `GEN-005` Repeatability stability
- `GEN-006` Maintainability / readability review

Add tooling cases if applicable:

- `TOOL-001` Tool selection correctness
- `TOOL-002` Dependency / environment handling
- `TOOL-003` Permission or fault handling
- `TOOL-004` Output traceability

## Planning Rule

An evaluation plan is incomplete if it skips the required standard cases for the chosen scope tier.
