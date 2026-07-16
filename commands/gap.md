# bubat-r gap

Run Stage I Critical Gap Deepening Loop.

## Intent

```text
bubat-r gap <area> max <n>
bubat-r gap checkout-ledger max 3
```

## Path Resolution

Determine `${BUBATR_HOME}` — directory containing `bubat-r`.

For `02-coverage-ledger.md`: read from the latest Done stage that produced it — check `STAGES/I/` first, then `STAGES/D/`, `STAGES/C/`, `STAGES/B/`, `STAGES/A/`.
For `12-drift-ambiguity-report.md`: check `STAGES/I/` first, then `STAGES/H/`.

## Protocol

1. Read `${BUBATR_HOME}/STAGES/A/00-workflow-status.md` first.
2. Read latest `02-coverage-ledger.md` per resolution rule above.
3. Read latest `12-drift-ambiguity-report.md` per resolution rule above.
4. Mark Stage I in `STAGES/A/00-workflow-status.md` as `In Progress`.
5. Create `${BUBATR_HOME}/STAGES/I/gaps/GAP-xxx-<area>.md` from template.
   Header must include: `Status: \`In Progress\``.
6. Run loop until stop condition or max loops.
7. Update affected artifacts in `STAGES/I/` (coverage-ledger, reference-design, drift-report).
8. Update `STAGES/A/00-workflow-status.md` with active gap, loop result, coverage/readiness impact, and next recommended step.
9. If Stage J / DOCR docs exist for touched area, refresh nearest relevant `AGENTS.md` and affected parent indexes.
10. Write coverage/readiness verdict at bottom of gap file.
11. **Update gap file header `Status` to reflect actual state**: `\`Closed\`` when fully resolved, `\`Blocked\`` when cannot proceed, or keep `\`In Progress\`` for partial progress.
12. Mark Stage I as `Done` or `Blocked` in `STAGES/A/00-workflow-status.md`.

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
