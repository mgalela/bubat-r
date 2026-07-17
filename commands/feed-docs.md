# bubat-r feed-docs

Feed late/stale docs into reconstruction without letting docs override evidence.

## Intent

```text
bubat-r feed docs <path-or-url> for <area> max <n> [--type post-refactor]
```

Example:

```text
bubat-r feed docs docs/LEDGER_DESIGN.md for checkout-ledger max 3
bubat-r feed docs docs/REFACTOR_NOTES.md for auth-layer max 2 --type post-refactor
```

## Protocol

1. Determine `${BUBATR_HOME}` — directory containing `bubat-r`.
2. Register doc under `${BUBATR_HOME}/STAGES/overlays/docs-feed/`.
3. Classify doc/sections.
4. Extract atomic claims.
5. If multiple docs hit same area, cluster duplicate/near-duplicate claims with `overlays/docs-feed/CLAIMS-AGGREGATE.md`.
6. Map claims or claim clusters to gaps/coverage items.
7. Verify claims against code/runtime/schema/config.
7a. Cross-check verified claims against existing STAGES/ artifacts — flag conflicts as `Verified-Artifact-Stale`.
8. Update artifacts only for verified impact — write updated artifacts back to their STAGES/ home.
   If `Verified-Artifact-Stale`: sweep all affected artifact sections for stale content and update.
9. Record contradicted/stale docs in drift report (`STAGES/I/12-drift-ambiguity-report.md` or `STAGES/H/` if Stage I not yet run).
10. Surface `Target Design Only` claims clearly in `overlays/docs-feed/docs-feed-summary.md`.

Rule:

```text
docs feed hypotheses, evidence decides
```
