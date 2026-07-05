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

1. Read existing canonical artifacts if present:
   - `reconstruction/02-coverage-ledger.md`
   - `reconstruction/12-drift-ambiguity-report.md`
   - related `reconstruction/gaps/GAP-*.md`
2. Frame research question and success condition.
3. Decompose into focused research lanes.
4. Run parallel discovery sweep using structural search first.
5. Consolidate candidate evidence and counter-evidence.
6. Save research memo under `reconstruction/research/`.
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
