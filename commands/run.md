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
4. For each stage A–H:
   a. Read `STAGES/<X>/CONTEXT.md` for stage instructions, templates, and ast-index commands.
   b. Write output artifacts to `STAGES/<X>/` using templates in that directory.
   c. When stage is done, copy outputs to `<target>/reconstruction/` (copy commands in each CONTEXT.md).
   d. Update `STAGES/A/00-workflow-status.md` after each completed, blocked, or skipped stage.
5. If run stops before later stages, mark them `Not Run` or `Blocked` in `00-workflow-status.md`.
6. If critical coverage below target, recommend `bubat-r gap` and record next step in status file.
7. If durable local context near code is needed, recommend `bubat-r export docr` and mark DOCR status.

## Stage → Output Files

| Stage | Write here first          | Copy to target after done                        |
|-------|---------------------------|--------------------------------------------------|
| A     | `STAGES/A/`               | `<target>/reconstruction/00–03 + docr-candidates` |
| B     | `STAGES/B/`               | `<target>/reconstruction/04 + 02`                |
| C     | `STAGES/C/`               | `<target>/reconstruction/05 + 02`                |
| D     | `STAGES/D/`               | `<target>/reconstruction/06 + 02`                |
| E     | `STAGES/E/`               | `<target>/reconstruction/07`                     |
| F     | `STAGES/F/`               | `<target>/reconstruction/08`                     |
| G     | `STAGES/G/`               | `<target>/reconstruction/09, 10`                 |
| H     | `STAGES/H/`               | `<target>/reconstruction/11, 12`                 |
| I     | `STAGES/I/`               | `<target>/reconstruction/gaps/, 13, 02, 11, 12`  |
| J     | `STAGES/J/`               | `<target>/AGENTS.md`, subtree `AGENTS.md`, `reconstruction/docr-export-report` |

## Status Rule

Absent output must be explained by `00-workflow-status.md`.
Examples:
- Stage not run yet
- Stage blocked by missing runtime/secrets/access
- Optional overlay not used
