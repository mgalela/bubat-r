# Architecture Reference Design

Project: `[PROJECT]`  
Date: `[YYYY-MM-DD]`  
Status: `Draft / Reviewed / Accepted`

## Scope

This reference design covers:

- `[area]`

Out of scope / unresolved:

- `[area]`

## Evidence Basis

Inputs:

- `01-evidence-catalog.md`
- `02-coverage-ledger.md`
- `03-main-spine.md`
- `04-runtime-map.md`
- `05-behavior-spine.md`
- `06-ownership-map.md`
- `07-domain-map.md`
- `08-contract-map.md`
- `09-component-map.md`
- `10-code-trace-map.md`

## Coverage Gate

| Dimension            | Coverage |       Gate | Status                 |
| -------------------- | -------: | ---------: | ---------------------- |
| Runtime              |    `NN%` |        80% | Pass/Fail/Accepted Gap |
| Behavior             |    `NN%` |        70% | Pass/Fail/Accepted Gap |
| Data ownership       |    `NN%` |        70% | Pass/Fail/Accepted Gap |
| Integration/contract |    `NN%` | `[target]` | Pass/Fail/Accepted Gap |

## Runtime Reference Design

| Runtime Unit | Responsibility     | Inbound     | Outbound     | Evidence |
| ------------ | ------------------ | ----------- | ------------ | -------- |
| `[unit]`     | `[responsibility]` | `[inbound]` | `[outbound]` | `EV-...` |

## Domain Reference Design

| Context     | Responsibility     | Owned Data   | Key Flows | Evidence |
| ----------- | ------------------ | ------------ | --------- | -------- |
| `[context]` | `[responsibility]` | `[entities]` | `[flows]` | `EV-...` |

## Data Ownership Reference

| Data Object | Authoritative Writer | Invariants | Readers     | Evidence |
| ----------- | -------------------- | ---------- | ----------- | -------- |
| `[entity]`  | `[writer]`           | `[rules]`  | `[readers]` | `EV-...` |

## Contract Reference

| Contract     | Producer     | Consumer     | Mechanism     | Evidence |
| ------------ | ------------ | ------------ | ------------- | -------- |
| `[contract]` | `[producer]` | `[consumer]` | `[mechanism]` | `EV-...` |

## Component Reference

| Component     | Responsibility     | Runtime Unit | Code Trace                 |
| ------------- | ------------------ | ------------ | -------------------------- |
| `[component]` | `[responsibility]` | `[unit]`     | `10-code-trace-map.md#...` |

## Explicit Non-Claims

These areas are not verified enough to include as reference design:

- `[area] — reason`

## Change Guidance

| Area     | Guidance           | Reason     |
| -------- | ------------------ | ---------- |
| `[area]` | safe/caution/avoid | `[reason]` |
