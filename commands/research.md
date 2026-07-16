# bubat-r research

Run question-driven codebase research as overlay for Stage A discovery or Stage I deepening.

## Intent

```text
bubat-r research <question>
bubat-r research <question> for <area>
bubat-r research <question> for <area> max-depth <n>
```

Examples:

```text
bubat-r research "who writes order status?"
bubat-r research "how checkout posts ledger" for checkout-ledger
bubat-r research "which runtimes consume tenant events" for tenant-isolation max-depth 3
```

## Protocol

1. Determine `${BUBATR_HOME}` — directory containing `bubat-r`.
2. Read existing canonical artifacts if present:
   - latest `02-coverage-ledger.md` (check `STAGES/I/` → `STAGES/D/` → `STAGES/C/` → `STAGES/B/` → `STAGES/A/`)
   - latest `12-drift-ambiguity-report.md` (check `STAGES/I/` → `STAGES/H/`)
   - related `STAGES/I/gaps/GAP-*.md`
3. Frame research question and success condition.
4. Decompose into focused research lanes.
5. Run parallel discovery sweep using structural search first.
6. Consolidate candidate evidence and counter-evidence.
7. Save research memo under `${BUBATR_HOME}/STAGES/overlays/research/`.
7. Recommend exact artifact updates or next `bubat-r gap` loop.

## Rule

```text
parallelize search, not truth
```

Research memo helps discovery and deepening.
Canonical status still lives in:
- `02-coverage-ledger.md`
- `05-behavior-spine.md`
- `06-ownership-map.md`
- `11-reference-design.md`
- `12-drift-ambiguity-report.md`
