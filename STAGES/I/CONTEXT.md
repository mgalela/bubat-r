# Stage I — Critical Gap Deepening Loop

Tujuan:

- ulangi investigasi pada gap critical sampai stop condition tercapai atau batas loop terlampaui
- naikkan coverage area yang akan diubah, bukan seluruh sistem
- ubah `Partial/Unknown/Contradicted` weight 5–4 menjadi `Covered` atau accepted gap eksplisit

Kapan dijalankan:

- setelah Stage H reference design v0.1, atau
- langsung setelah Stage D bila gap critical sudah jelas, atau
- sebelum major change pada area tertentu

Input:

- `02-coverage-ledger.md`
- `11-reference-design.md`
- `12-drift-ambiguity-report.md`
- intended change area, bila ada

Output:

- `Workflow Status` updated for Stage I
- `gaps/GAP-xxx-*.md`
- updated `02-coverage-ledger.md`
- updated affected maps: behavior, ownership, contract, component, code trace
- updated `11-reference-design.md`
- updated `12-drift-ambiguity-report.md`

Loop instruction format:

```text
run critical deepening for <area> until <stop-condition> or max <N> loops
```

Examples:

```text
run critical deepening for checkout-ledger until critical coverage >= 90% or max 3 loops
run critical deepening for inventory ownership until no Unknown weight-5 or max 5 loops
run critical deepening for tenant isolation until all tenant API routes classified or max 4 loops
```

Per-loop protocol:

1. Select top gap by weight, risk, and intended change relevance.
2. Create/update `gaps/GAP-xxx-*.md`.
3. Write search plan before searching.
4. Run structural search with `ast-index` first.
5. Run targeted `rg` only for literals/config/ORM write patterns.
6. Read exact files/symbols for decision points.
7. Record evidence and counter-evidence.
8. Update status: `Covered`, `Partial`, `Unknown`, `Contradicted`, or `Accepted Gap`.
9. Update coverage numbers.
10. Decide continue/stop.

Stop condition options:

- selected area critical coverage `>= 90%`
- no `Unknown` weight-5 item remains
- no unresolved `Contradicted` item remains
- no unresolved `Covered with Critical Risk` remains for selected area
- all writers for selected data object mapped
- all failure paths for selected flow traced
- all external contract request/response/failure semantics traced
- route/API guard classification complete for auth/tenant/security areas
- build/check/test viability proven for change-bearing runtime, or explicitly blocked
- max loop count reached
- blocked by missing runtime/secret/access; create blocker note

Default stop condition for major change:

```text
critical coverage >= 90%
AND no Unknown weight-5
AND no unresolved Contradicted
AND no unresolved Covered with Critical Risk
AND owner/writer list complete for changed data
AND failure path traced for changed flow
AND build/check/test viability proven or explicitly risk-accepted
```

Per-loop verdict format:

```text
Coverage Verdict: Pass/Fail
Readiness Verdict: Ready/Yellow/Not Ready
Reason: <blocking risks or accepted gaps>
Next Loop: <gap-id or stop>
```

Exit criteria:

- every loop leaves artifacts in repo
- coverage delta recorded
- readiness verdict recorded separately from coverage verdict
- unresolved gaps explicitly remain in drift/ambiguity report
- if max loop reached without meeting target, Stage I returns `Not Ready` for selected area
- if coverage passes but critical risk remains, Stage I returns `Coverage Pass / Readiness Not Ready`

## Working Files

Write output to this stage directory first:

- `STAGES/I/gaps/GAP-NNN-<area>.md` (new file per gap, copied from `gaps/GAP-000-template.md`)
- `STAGES/I/13-readiness-verdict.md`
- `STAGES/I/02-coverage-ledger.md` (updated)
- `STAGES/I/11-reference-design.md` (updated)
- `STAGES/I/12-drift-ambiguity-report.md` (updated)

After stage done, mark as `Done` in `00-workflow-status.md`.

## AST Index Commands

```bash
ast-index refs "Symbol"                # definitions + usages by name
ast-index usages "Symbol"              # usage sites
ast-index callers "functionName"       # call sites
ast-index call-tree "functionName"     # call hierarchy tree
ast-index query "SQL"                  # raw SQLite index query
```

Use targeted `rg` for literals, config values, ORM write patterns — only after ast-index search exhausted.
