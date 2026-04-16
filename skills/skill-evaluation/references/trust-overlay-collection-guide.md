# Trust Overlay Collection Guide

## Purpose

Provide a repeatable way to collect platform trust signals before assigning the `trust_modifier` in `skill-evaluation`.

This guide is for cases where the evaluated skill has public ecosystem metadata, especially on `skills.sh`.

## Required Collection Order

1. Record page identity
2. Record install signal
3. Record source reputation
4. Record repository signal
5. Record security audit status
6. Record spec conformance
7. Record completeness and residual uncertainty

## 1. Page Identity

Always record:

- evaluated skill URL or canonical page identifier
- publisher / owner
- evaluation date
- version or page snapshot note when available

Why:

- trust signals change over time
- baseline comparability depends on knowing what page state was evaluated

## 2. Install Signal

Record:

- weekly installs or platform-provided install volume
- whether the number is current, stale, or unavailable

Recommended scoring anchor:

- strong install signal: broad adoption with concrete metric
- medium install signal: moderate adoption with concrete metric
- weak install signal: low or unavailable adoption metric

Evidence note requirement:

- include the platform field name or page area where the number was observed

## 3. Source Reputation

Classify the publisher:

- official / high-trust organization
- known individual / established maintainer
- ordinary publisher
- unknown or unclear publisher

Evidence note requirement:

- record the publisher label used for the classification

## 4. Repository Signal

When available, record:

- repository URL
- stars
- visible maintenance indicators

If no repository is linked, mark `not available` instead of inferring quality from brand familiarity.

## 5. Security Audit Status

Record:

- audit badge or status label
- count or severity note if the platform shows warnings

Rules:

- unresolved warnings must produce a risk note
- strong install or source reputation must not erase a meaningful security warning

## 6. Spec Conformance

Check:

- `SKILL.md` frontmatter includes `name` and `description`
- package is self-contained or dependencies are explicit
- use boundaries are clear
- references or scripts are linked clearly

Use either:

- local workspace files
- or the platform-visible package snapshot

## 7. Completeness Rule

After collection, classify each major signal as:

- `complete`
- `partial`
- `missing`

Major signals:

- install
- source reputation
- repository
- security audit
- conformance

Completeness guidance:

- if 0-1 major signals are missing, normal trust overlay may proceed
- if 2 major signals are missing, keep the modifier conservative
- if 3 or more major signals are missing, prefer neutral modifier unless strong contrary evidence exists

## 8. Reporting Rule

A trust overlay section should always include:

- observed signals
- score impact per signal
- a trust completeness note
- any residual risk caused by missing or ambiguous ecosystem data

## 9. Anti-Patterns

Do not:

- assign trust uplift from memory alone
- treat popularity as a substitute for safety
- hide missing data by leaving rows blank
- over-penalize a low-adoption skill when direct quality evidence is strong
