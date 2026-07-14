# DOCR Export Report

Project: `[PROJECT]`  
Date: `[YYYY-MM-DD]`

## Purpose

Record why Stage J selected some subtrees for local `AGENTS.md` and deferred or rejected others.

## Root Output

| File | Status | Notes |
|---|---|---|
| `AGENTS.md` | Created / Updated / Unchanged | `[notes]` |

## Child Outputs

### Selected / Materialized

| Subtree | Reason | Signals / Score | Output | Notes |
|---|---|---|---|---|
| `[path]` | runtime / ownership / contract / contradiction / hotspot | `RT,WR,CT` / `N` | `<path>/AGENTS.md` | `[notes]` |

### Deferred

| Subtree | Reason Deferred | Covered By | Revisit Trigger |
|---|---|---|---|
| `[path]` | thin entrypoint / helper-only / low-value / partial evidence | `parent or sibling doc` | contradiction / growth / repeated change |

### Rejected

| Subtree | Reason Rejected | Notes |
|---|---|---|
| `[path]` | no durable boundary | `[notes]` |

## Materialization Rules Applied

- contradictions preserved: yes / no
- unknowns preserved: yes / no
- parent/child indexes refreshed: yes / no
- stale prior local claims removed: yes / no / n/a

## Follow-Up

- `[refresh or add child doc trigger]`
