# bubat-r feed bubat

Deterministically prepare BUBAT-R reconstruction outputs as BUBAT inputs.

## Intent

```text
bubat-r feed bubat [target-path]
```

Default target path: `reconstruction/`.

## Protocol

1. Resolve BUBAT workspace root.
2. Resolve reconstruction folder.
3. Verify primary files:
   - `02-coverage-ledger.md`
   - `11-reference-design.md`
   - `12-drift-ambiguity-report.md`
4. Register reconstruction folder in `raw/SOURCES.md`.
5. Update `raw/MANIFEST.md` with a deterministic marker block.
6. Preserve unrelated manifest rows.
7. Replace existing block for same reconstruction path; never duplicate.

## Manifest Block

Use marker block:

```md
<!-- BEGIN BUBAT-R: <reconstruction-path> -->

...

<!-- END BUBAT-R: <reconstruction-path> -->
```

## Fixed Mapping

| BUBAT-R Artifact               | BUBAT Stages                                                                                                       | Purpose                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| `01-evidence-catalog.md`       | `01-discovery, 04-component`                                                                                       | evidence/source catalog                       |
| `02-coverage-ledger.md`        | `01-discovery, 01b-flow, 01c-bounded-context, 01d-data-model, 02-context, 03-container, 04-component`              | coverage/confidence; primary input            |
| `03-main-spine.md`             | `02-context, 03-container, 04-component`                                                                           | main execution spine                          |
| `04-runtime-map.md`            | `02-context, 03-container`                                                                                         | runtime/deploy topology                       |
| `05-behavior-spine.md`         | `01b-flow, 01d-data-model, 03-container, 04-component`                                                            | behavior/scenario spine; EventStorming seed   |
| `06-ownership-map.md`          | `01c-bounded-context, 01d-data-model, 03-container, 04-component`                                                 | ownership, aggregate/event/projection owners  |
| `07-domain-map.md`             | `01c-bounded-context, 01d-data-model`                                                                              | domain terms, aggregates, event ownership     |
| `08-contract-map.md`           | `01d-data-model, 03-container, 04-component, 06-spec`                                                             | APIs/events/projection contracts              |
| `09-component-map.md`          | `04-component`                                                                                                     | component/module map                          |
| `10-code-trace-map.md`         | `04-component`                                                                                                     | component-to-code trace                       |
| `11-reference-design.md`       | `01-discovery, 01b-flow, 01c-bounded-context, 01d-data-model, 02-context, 03-container, 04-component, 05-document` | reconstructed reference design; primary input |
| `12-drift-ambiguity-report.md` | `01-discovery, 02-context, 03-container, 04-component`                                                             | drift, ambiguity, unknowns; primary input     |
| `13-readiness-verdict.md`      | `01-discovery, 05-document`                                                                                        | takeover/change readiness                     |
| `gaps/*.md`                    | `01-discovery, 01b-flow, 01d-data-model, 02-context, 03-container, 04-component`                                  | deep gap evidence, flow/data uncertainty      |
| `docs-feed/*.md`               | `01-discovery, 02-context, 03-container, 04-component`                                                             | verified late/stale document claims           |
