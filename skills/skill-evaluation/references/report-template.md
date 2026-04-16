# Skill Evaluation Report Template

## 1. Context

- Target skill:
- Evaluation objective:
- Scope tier: `smoke | regression | deep`
- Date:
- Evaluator:
- Baseline reference (optional):
- Standard case set:
- Custom extra cases (optional):

## 2. Score Matrix

| Dimension | Score (1-5) | Weight | Weighted Score | Evidence ID |
|-----------|-------------|--------|----------------|-------------|
| Task Completion |  | 25% |  |  |
| Procedure/Tool Correctness |  | 20% |  |  |
| Robustness & Consistency |  | 20% |  |  |
| Safety & Policy Adherence |  | 15% |  |  |
| Efficiency |  | 10% |  |  |
| Usability & Maintainability |  | 10% |  |  |
| **Core Total (0-100)** |  | 100% |  |  |

## 2.1 Platform Trust Overlay (skills.sh, optional)

| Signal | Observation | Score Impact | Evidence ID |
|--------|-------------|--------------|-------------|
| Install signal |  |  |  |
| Source reputation |  |  |  |
| GitHub stars |  |  |  |
| Security audits |  |  |  |
| Spec conformance |  |  |  |
| **Trust Modifier (-10 to +10)** |  |  |  |
| **Final Total (0-100)** | `Core Total + Trust Modifier` |  |  |

### 2.1.1 Trust Evidence Completeness (recommended)

- Page identity recorded:
- Install signal completeness: `complete | partial | missing`
- Source reputation completeness: `complete | partial | missing`
- Repository signal completeness: `complete | partial | missing`
- Security audit completeness: `complete | partial | missing`
- Conformance check completeness: `complete | partial | missing`
- Completeness risk note:

## 2.2 Conformance Checklist (recommended)

- [ ] `SKILL.md` frontmatter contains `name` and `description`
- [ ] Instructions define clear trigger/use boundaries
- [ ] Skill is self-contained (or has explicit dependencies)
- [ ] Supporting references/scripts are explicitly linked
- [ ] Risk/disclaimer notes are present when needed

## 3. Key Findings

### Strengths

- 

### Defects / Risks

- 

### Blockers

- Severity:
- Description:
- Evidence:

## 4. Reliability Protocol Results

### Repeatability

- Input ID:
- Run A result:
- Run B result:
- Drift conclusion:

### Perturbation

- Variant description:
- Result:
- Impact on score:

### Failure-path

- Fault type:
- Observed behavior:
- Recovery quality:

## 5. Recommendation

- Release decision: `PASS | CONDITIONAL PASS | FAIL`
- Reason:

## 5.1 Dual-Judge Conflict Review (when applicable)

| Conflict ID | Case ID | Conflict Type | Final Arbitration | Score Impact | Uncertainty Note |
|-------------|---------|---------------|-------------------|--------------|------------------|
| CJ-001 |  |  |  |  |  |

## 6. Prioritized Fixes

- P0:
- P1:
- P2:

## 7. Evidence Appendix

| Evidence ID | Input / Trace Summary | Source Link or Path |
|-------------|------------------------|---------------------|
| E-001 |  |  |
| E-002 |  |  |

## 7.1 Standard Case Coverage (recommended)

| Case ID | Description | Status | Evidence ID |
|---------|-------------|--------|-------------|
| GEN-001 |  |  |  |
| GEN-002 |  |  |  |
