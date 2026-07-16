# Behavior Spine

Project: `[PROJECT]`  
Date: `[YYYY-MM-DD]`

## Coverage Summary

- Weighted coverage: `NN%`
- Covered weight-5 items: `X/Y`
- Partial items: `[list]`
- Uncovered high-weight items: `[list]`
- Unknowns requiring validation: `[list]`

## Flow Index

| Flow ID | Flow     | Trigger             | Actor/System | Weight | Status  | Primary Evidence |
| ------- | -------- | ------------------- | ------------ | -----: | ------- | ---------------- |
| FL-001  | `[flow]` | `[route/event/job]` | `[actor]`    |      5 | Unknown | `path:line`      |

## Flow Detail: FL-001 `[Flow Name]`

### Summary

- Trigger: `[trigger]`
- Actor/System: `[actor/system]`
- Runtime units: `[units]`
- Data written: `[entities]`
- External effects: `[effects]`
- Coverage status: `Covered/Partial/Unknown`

### Steps

| Step | Action     | Code Evidence | Data/Side Effect | Confidence |
| ---: | ---------- | ------------- | ---------------- | ---------- |
|    1 | `[action]` | `path:line`   | `[effect]`       | Observed   |

### EventStorming Evidence

Use this section to seed BUBAT Stage `01b-flow` `.es` DSL. Keep citations on every inferred command/event/read model.

| DSL Type  | ID  | Name                        | Trigger / After / By  | Target / Owner        | Data / Reads / Fields    | Evidence    | Confidence        |
| --------- | --- | --------------------------- | --------------------- | --------------------- | ------------------------ | ----------- | ----------------- |
| actor     | A1  | `[actor]`                   | `[trigger source]`    | `[N/A]`               | `[N/A]`                  | `path:line` | Observed/Inferred |
| command   | C1  | `[Command Name]`            | by A1                 | `[aggregate/runtime]` | reads `[readmodel]`      | `path:line` | Observed/Inferred |
| event     | E1  | `[Event Name]`              | after C1              | `[BC/owner]`          | `[payload/state fields]` | `path:line` | Observed/Inferred |
| policy    | P1  | `[When Event then Command]` | after E1              | emits C2              | `[rule inputs]`          | `path:line` | Observed/Inferred |
| readmodel | R1  | `[Read Model]`              | from `[event/source]` | `[consumer]`          | `[fields]`               | `path:line` | Observed/Inferred |
| aggregate | G1  | `[Aggregate]`               | `[N/A]`               | `[owner]`             | `[invariants]`           | `path:line` | Observed/Inferred |
| hotspot   | H1  | `[unknown/risk]`            | near `[id]`           | `[N/A]`               | `[gap]`                  | `path:line` | Unknown           |

### Candidate `.es` Draft

```text
mode draft
flow "[Flow Name]" level L1

[actor] -> "[Command Name]"
"[Command Name]" -> "[Event Name]"
```

Convert to canonical before feeding BUBAT stage output.

### Failure Paths

| Failure     | Handling     | Evidence    | Status  |
| ----------- | ------------ | ----------- | ------- |
| `[failure]` | `[handling]` | `path:line` | Unknown |

### Missing Segments

| Segment                                 | Missing Detail | Impact     | Next Step |
| --------------------------------------- | -------------- | ---------- | --------- |
| trigger/write/side effect/event/failure | `[detail]`     | `[impact]` | `[next]`  |

## Cross-Flow Observations

| Observation     | Evidence | Impact     |
| --------------- | -------- | ---------- |
| `[observation]` | `EV-...` | `[impact]` |
