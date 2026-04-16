# General Test Cases v1

## Purpose

Provide the baseline case set for most skills, regardless of whether they call tools.

## Cases

### `GEN-001` Core Happy Path

- Use when: every scope tier
- Goal: confirm the skill can complete its main advertised task
- Evidence: input summary, expected outcome, observed outcome

### `GEN-002` Mandatory Input Gate

- Use when: every scope tier
- Goal: confirm the skill blocks or asks for missing required inputs instead of fabricating conclusions
- Evidence: missing-input prompt, observed gate behavior

### `GEN-003` Paraphrase / Perturbation

- Use when: `regression`, `deep`
- Goal: confirm the skill still routes and behaves correctly under equivalent paraphrases or light noise
- Evidence: base prompt, perturbed prompt, behavioral comparison

### `GEN-004` Failure-Path Recovery

- Use when: `regression`, `deep`
- Goal: confirm the skill handles one realistic failure path without silent corruption
- Evidence: simulated fault, observed behavior, recovery quality

### `GEN-005` Repeatability Stability

- Use when: `deep`
- Goal: run the same critical scenario at least twice and compare decision or score drift
- Evidence: run A result, run B result, drift note

### `GEN-006` Maintainability / Readability Review

- Use when: `deep`
- Goal: inspect trigger clarity, structure, explicit boundaries, references, and readability
- Evidence: cited file sections and short maintainability judgment
