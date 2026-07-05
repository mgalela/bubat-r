# bubat-r gap

Run Stage I Critical Gap Deepening Loop.

## Intent

```text
bubat-r gap <area> max <n>
bubat-r gap checkout-ledger max 3
```

## Protocol

1. Read `reconstruction/00-workflow-status.md` first.
2. Read `reconstruction/02-coverage-ledger.md`.
3. Read `reconstruction/12-drift-ambiguity-report.md`.
4. Mark Stage I in `00-workflow-status.md` as `In Progress`.
5. Create `reconstruction/gaps/GAP-xxx-<area>.md` from template.
6. Run loop until stop condition or max loops.
7. Update affected artifacts.
8. Update `00-workflow-status.md` with active gap, loop result, coverage/readiness impact, and next recommended step.
9. If Stage J / DOCR docs exist for touched area, refresh nearest relevant `AGENTS.md` and affected parent indexes.
10. Write coverage/readiness verdict.
11. Mark Stage I as `Done` or `Blocked` explicitly in status file.

## Status Rule

Formal `GAP-*.md` should exist when:
- weight-5 or weight-4 gap is selected for deepening
- gap affects major-change readiness
- contradiction/unknown needs dedicated loop history

If gap remains only in `02-coverage-ledger.md`, `00-workflow-status.md` should say no formal gap loop has started yet.

## Stop Condition

```text
critical coverage >= 90%
AND no Unknown weight-5
AND no unresolved Contradicted
AND no unresolved Covered with Critical Risk
AND owner/writer list complete for changed data
AND failure path traced for changed flow
AND build/check/test viability proven or explicitly risk-accepted
```
