# Coverage Ledger

Project: `[PROJECT]`  
Date: `[YYYY-MM-DD]`

## Scoring Rules

Status values:

- `Covered` — enough evidence and trace
- `Partial` — evidence exists but path/owner/edge incomplete
- `Uncovered` — known item not traced yet
- `Unknown` — indication exists, insufficient evidence
- `N/A` — not relevant

Formula:

```text
coverage = sum(weight for Covered + 0.5 * weight for Partial) / sum(weight for all non-N/A items)
```

## Coverage Table

| Area        | Item       | Evidence Type     | Weight | Status  | Confidence | Citation    | Notes |
| ----------- | ---------- | ----------------- | ------ | ------- | ---------- | ----------- | ----- |
| Runtime     | `[unit]`   | executable        | 5      | Unknown | Unknown    | `path:line` |       |
| Flow        | `[flow]`   | write-path        | 5      | Unknown | Unknown    | `path:line` |       |
| Data        | `[entity]` | table/entity      | 5      | Unknown | Unknown    | `path:line` |       |
| Integration | `[system]` | outbound/contract | 4      | Unknown | Unknown    | `path:line` |       |

## Runtime Coverage

| Metric                  | Value |
| ----------------------- | ----- |
| Covered weight          | `0`   |
| Partial adjusted weight | `0`   |
| Total non-N/A weight    | `0`   |
| Coverage                | `0%`  |

## Behavior Coverage

| Metric                  | Value |
| ----------------------- | ----- |
| Covered weight          | `0`   |
| Partial adjusted weight | `0`   |
| Total non-N/A weight    | `0`   |
| Coverage                | `0%`  |

## Data Ownership Coverage

| Metric                  | Value |
| ----------------------- | ----- |
| Covered weight          | `0`   |
| Partial adjusted weight | `0`   |
| Total non-N/A weight    | `0`   |
| Coverage                | `0%`  |

## Integration / Contract Coverage

| Metric                  | Value |
| ----------------------- | ----- |
| Covered weight          | `0`   |
| Partial adjusted weight | `0`   |
| Total non-N/A weight    | `0`   |
| Coverage                | `0%`  |

## Gap List

| Gap     | Area                          | Weight | Impact     | Next Step |
| ------- | ----------------------------- | ------ | ---------- | --------- |
| `[gap]` | Runtime/Flow/Data/Integration | 5      | `[impact]` | `[next]`  |
