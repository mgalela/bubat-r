# bubat-r feed docs

Feed late/stale docs into reconstruction without letting docs override evidence.

## Intent

```text
bubat-r feed docs <path-or-url> for <area> max <n>
```

Example:

```text
bubat-r feed docs docs/LEDGER_DESIGN.md for checkout-ledger max 3
```

## Protocol

1. Register doc under `reconstruction/docs-feed/`.
2. Classify doc/sections.
3. Extract atomic claims.
4. If multiple docs hit same area, cluster duplicate/near-duplicate claims with `docs-feed/CLAIMS-AGGREGATE.md`.
5. Map claims or claim clusters to gaps/coverage items.
6. Verify claims against code/runtime/schema/config.
7. Update artifacts only for verified impact.
8. Record contradicted/stale docs in drift report.
9. Surface `Target Design Only` claims clearly in `docs-feed/docs-feed-summary.md`.

Rule:

```text
docs feed hypotheses, evidence decides
```
