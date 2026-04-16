# Dual-Judge Conflict Template

## Purpose

Provide a standard way to record and arbitrate conflicts between:

- trace-based or automated checks
- human or LLM-as-judge quality judgments

## Required Conflict Record Fields

- `conflict_id`
- `case_id`
- `trace_finding`
- `judge_finding`
- `conflict_type`
- `evidence_strength`
- `final_arbitration`
- `score_impact`
- `uncertainty_note`

## Supported Conflict Types (v1)

### `trace-clean / judge-negative`

Use when:

- trace, structure, or procedural checks show no obvious failure
- judge still finds poor quality, low usefulness, weak clarity, or maintainability issues

Arbitration rule:

- may count as a quality defect
- should not automatically escalate to procedural/tool failure without stronger evidence
- if the quality defect is reproducible and material, it may still reduce score and release confidence

### `judge-positive / evidence-weak`

Use when:

- judge gives a favorable assessment
- trace or evidence support is incomplete, weak, or missing

Arbitration rule:

- mark as `uncertain` or `evidence-limited`
- do not let unsupported positive judgment lift the release decision
- use the more conservative interpretation

## Evidence Strength Guidance

- `strong`: reproducible trace, concrete input/output mismatch, or cited path-backed evidence
- `medium`: one solid trace or clearly reproducible qualitative example
- `weak`: impressionistic quality judgment without enough supporting evidence

## Final Arbitration Values

Recommended values:

- `accept-trace`
- `accept-judge-quality-defect`
- `mark-uncertain`
- `defer-with-more-evidence`

## Score Impact Guidance

- `none`
- `minor-downward`
- `moderate-downward`
- `block-release-upgrade`

## Example Record

- `conflict_id`: `CJ-001`
- `case_id`: `GEN-006`
- `trace_finding`: "Structure is present and no procedural misuse detected"
- `judge_finding`: "Output is technically complete but unclear and difficult to use"
- `conflict_type`: `trace-clean / judge-negative`
- `evidence_strength`: `medium`
- `final_arbitration`: `accept-judge-quality-defect`
- `score_impact`: `minor-downward`
- `uncertainty_note`: "Not a procedural error; quality issue accepted with moderate confidence"
