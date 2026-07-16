# GAP-000 — [Gap Title]

Project: `[PROJECT]`  
Area: `[checkout-ledger / inventory / tenant-isolation / build / other]`  
Loop: `[current]/[max]`  
Status: `Open / Covered / Covered with Risk / Covered with Critical Risk / Accepted Gap / Blocked / Not Ready`  
Date: `[YYYY-MM-DD]`

## 1. Gap Statement

Question:

- `[What must be proven?]`

Why critical:

- `[Why this blocks major change or lowers confidence]`

Stop condition for this gap:

- `[e.g. critical coverage >= 90%, all writers mapped, no Unknown weight-5]`

## 2. Current Evidence

| Evidence ID | Fact     | Citation    | Confidence        |
| ----------- | -------- | ----------- | ----------------- |
| `EV-...`    | `[fact]` | `path:line` | Observed/Inferred |

## 3. Missing Evidence

| Missing Item | Weight | Why Needed | Search Target           |
| ------------ | -----: | ---------- | ----------------------- |
| `[item]`     |      5 | `[reason]` | `[symbol/file/pattern]` |

## 4. Search Plan

Structural first:

```bash
ast-index refs "[Symbol]"
ast-index usages "[Symbol]"
ast-index callers "[Function]"
ast-index call-tree "[Function]"
ast-index outline path/to/file.ts
```

Targeted fallback:

```bash
rg -n "[literal|ORM write pattern|env var]" src scripts prisma
```

## 5. Trace Results

| Finding     | Evidence    | Counter-Evidence    | Status                               | Notes     |
| ----------- | ----------- | ------------------- | ------------------------------------ | --------- |
| `[finding]` | `path:line` | `path:line or none` | Covered/Partial/Contradicted/Unknown | `[notes]` |

## 6. Writer / Caller / Failure Map

Use only relevant sections.

### Writers

| Data Object | Writer     | Operation            | Transaction Boundary | Evidence    |
| ----------- | ---------- | -------------------- | -------------------- | ----------- |
| `[entity]`  | `[symbol]` | create/update/delete | `[boundary]`         | `path:line` |

### Callers

| Function     | Caller     | Path           | Evidence    |
| ------------ | ---------- | -------------- | ----------- |
| `[function]` | `[caller]` | `[call chain]` | `path:line` |

### Failure Paths

| Failure     | Handling     | Retry/Idempotency     | Evidence    | Status  |
| ----------- | ------------ | --------------------- | ----------- | ------- |
| `[failure]` | `[handling]` | `[retry/idempotency]` | `path:line` | Unknown |

## 7. Coverage Delta

Before:

- Runtime coverage: `NN%`
- Behavior coverage: `NN%`
- Data ownership coverage: `NN%`
- Integration coverage: `NN%`
- Critical coverage: `NN%`

After:

- Runtime coverage: `NN%`
- Behavior coverage: `NN%`
- Data ownership coverage: `NN%`
- Integration coverage: `NN%`
- Critical coverage: `NN%`

Changed ledger rows:

- `[row/item]`: `Partial -> Covered`

## 8. Decision

Coverage Verdict:

- `Pass / Fail`

Readiness Verdict:

- `Ready / Yellow / Not Ready`

Decision:

- `Covered / Covered with Risk / Covered with Critical Risk / Accepted Gap / Blocked / Not Ready`

Rationale:

- `[short rationale]`

Safe-change implication:

- `Green / Yellow / Red`

Required follow-up:

- `[tests, guardrails, refactor, runtime validation]`

## 9. Loop Control

Loop result:

- `[continue / stop target met / coverage pass but readiness not ready / stop max loops / blocked]`

Next loop target:

- `[next gap or none]`
