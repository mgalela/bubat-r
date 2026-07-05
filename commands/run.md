# bubat-r run

Run first-pass hard-evidence reconstruction for target repo.

## Intent

```text
bubat-r run [target-path] [--max-hours N]
```

## Protocol

1. Ensure `ast-index` installed.
2. Create/update `.ast-index.yaml` excludes if needed.
3. Run `ast-index rebuild` or `ast-index update`.
4. Copy templates into `<target>/reconstruction/` if missing.
5. Execute workflow Stage A–H.
6. Write coverage and reference design.
7. If critical coverage below target, recommend `bubat-r gap`.
8. If durable local context near code is needed, recommend `bubat-r export docr`.

## Outputs

- `reconstruction/01-evidence-catalog.md`
- `reconstruction/02-coverage-ledger.md`
- `reconstruction/11-reference-design.md`
- `reconstruction/12-drift-ambiguity-report.md`
