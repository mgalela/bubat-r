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
4. Map claims to gaps/coverage items.
5. Verify claims against code/runtime/schema/config.
6. Update artifacts only for verified impact.
7. Record contradicted/stale docs in drift report.

Rule:

```text
docs feed hypotheses, evidence decides
```
