# bubat-r gap

Run Stage I Critical Gap Deepening Loop.

## Intent

```text
bubat-r gap <area> max <n>
bubat-r gap checkout-ledger max 3
```

## Protocol

1. Read `reconstruction/02-coverage-ledger.md`.
2. Read `reconstruction/12-drift-ambiguity-report.md`.
3. Create `reconstruction/gaps/GAP-xxx-<area>.md` from template.
4. Run loop until stop condition or max loops.
5. Update affected artifacts.
6. Write coverage/readiness verdict.

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
