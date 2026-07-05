# Domain Map

Project: `[PROJECT]`  
Date: `[YYYY-MM-DD]`

## Reconstruction Basis

Inputs:
- `03-main-spine.md`
- `05-behavior-spine.md`
- `06-ownership-map.md`
- `02-coverage-ledger.md`

## Candidate Contexts

| Context | Responsibility | Owned Data | Commands | Events | Policies | Read Models / Projections | Confidence | Evidence |
|---|---|---|---|---|---|---|---|---|
| `[context]` | `[responsibility]` | `[entities]` | `[commands]` | `[events]` | `[policies]` | `[readmodels/projections]` | Inferred | `EV-...` |

## Event Ownership

| Event | Owning Context | Aggregate / Decision Owner | Produced By Command/Policy | Consumed By | Evidence | Confidence |
|---|---|---|---|---|---|---|
| `[Event Name]` | `[context]` | `[aggregate]` | `[command/policy]` | `[context/runtime]` | `path:line` | Observed/Inferred |

## Command Ownership

| Command | Owning Context | Trigger Actor/System/Policy | Target Aggregate/Runtime | Resulting Events | Evidence | Confidence |
|---|---|---|---|---|---|---|
| `[Command Name]` | `[context]` | `[trigger]` | `[target]` | `[events]` | `path:line` | Observed/Inferred |

## Policy / Process Rules

| Policy | Trigger Event | Emits Command/Event | Context | Rule Evidence | Confidence |
|---|---|---|---|---|---|
| `[When X then Y]` | `[event]` | `[command/event]` | `[context]` | `path:line` | Observed/Inferred |

## Context Relationships

| Upstream | Downstream | Relation | Mechanism | Evidence | Notes |
|---|---|---|---|---|---|
| `[context]` | `[context]` | customer/supplier/peer | API/event/shared DB | `path:line` | |

## Decision-Making Zones

| Zone | Decisions Made | Evidence | Related Data |
|---|---|---|---|
| `[zone]` | `[decisions]` | `path:line` | `[entities]` |

## Read / Projection Zones

| Zone | Reads From | Purpose | Evidence |
|---|---|---|---|
| `[zone]` | `[source]` | `[purpose]` | `path:line` |

## Ambiguous Boundaries

| Boundary | Ambiguity | Evidence | Required Validation |
|---|---|---|---|
| `[boundary]` | `[ambiguity]` | `EV-...` | `[validation]` |
