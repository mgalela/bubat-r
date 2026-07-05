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
5. Initialize `reconstruction/00-workflow-status.md`.
6. Mark `A Evidence Harvest` as `In Progress` before discovery starts.
7. Execute workflow Stage A–H as far as evidence/time/access allow.
8. Update `00-workflow-status.md` after each completed, blocked, or skipped stage.
9. Write coverage and reference design artifacts reached by current run.
10. If run stops before later stages, mark them `Not Run` or `Blocked` explicitly in status file.
11. If critical coverage below target, recommend `bubat-r gap` and record next step in status file.
12. If durable local context near code is needed, recommend `bubat-r export docr` and mark DOCR status.

## Outputs

- `reconstruction/00-workflow-status.md`
- `reconstruction/01-evidence-catalog.md`
- `reconstruction/02-coverage-ledger.md`
- `reconstruction/11-reference-design.md` when Stage H runs
- `reconstruction/12-drift-ambiguity-report.md` when Stage H runs

## Status Rule

Absent output must be explained by `00-workflow-status.md`.
Examples:
- Stage not run yet
- Stage blocked by missing runtime/secrets/access
- Optional overlay not used
