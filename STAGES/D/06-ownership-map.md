# Ownership Map

Project: `[PROJECT]`  
Date: `[YYYY-MM-DD]`

## Coverage Summary

- Weighted coverage: `NN%`
- Covered weight-5 items: `X/Y`
- Partial items: `[list]`
- Uncovered high-weight items: `[list]`
- Unknowns requiring validation: `[list]`

## Data Ownership Table

| Data Object | Type | Weight | Owner Candidate | Write Paths | Invariants | Readers/Dependents | Status | Evidence |
|---|---|---:|---|---|---|---|---|---|
| `[entity/table]` | table/collection/event/cache | 5 | `[owner]` | `[paths]` | `[rules]` | `[readers]` | Unknown | `path:line` |

## Write Path Detail

| Data Object | Writer | Operation | Transaction Boundary | Evidence | Confidence |
|---|---|---|---|---|---|
| `[entity]` | `[component/runtime]` | create/update/delete | `[boundary]` | `path:line` | Observed |

## Invariants

| Invariant | Enforced By | Evidence | Violators / Bypass Risk | Status |
|---|---|---|---|---|
| `[rule]` | `[code/component]` | `path:line` | `[risk]` | Unknown |

## Event / Projection Ownership

Use for BUBAT Stage `01d-data-model` and EventStorming `.es` derivation.

| Event / Projection | Type | Source Owner | Consumer / Reader | Data Fields | Refresh / Trigger | Evidence | Status |
|---|---|---|---|---|---|---|---|
| `[Order Placed]` | event | `[BC/runtime]` | `[consumer]` | `[fields]` | `[published after write]` | `path:line` | Unknown |
| `[Customer Ref]` | projection/readmodel | `[source owner]` | `[consumer BC/runtime]` | `[fields]` | event/scheduled/on-demand/manual | `path:line` | Unknown |

## Aggregate Decision Ownership

| Aggregate / Business Object | Decides Commands | Emits Events | Enforces Invariants | Owner Evidence | Confidence |
|---|---|---|---|---|---|
| `[Aggregate]` | `[commands]` | `[events]` | `[rules]` | `path:line` | Observed/Inferred |

## Shared Ownership / Conflict Areas

| Data Object | Conflict | Evidence | Impact | Next Step |
|---|---|---|---|---|
| `[entity]` | `[conflict]` | `path:line` | `[impact]` | `[next]` |

## Unknown Ownership

| Data Object | Why Unknown | Weight | Next Search |
|---|---|---:|---|
| `[entity]` | `[reason]` | 5 | `[ast-index/grep command]` |
