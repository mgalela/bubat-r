# bubat-r run

Run first-pass hard-evidence reconstruction for target repo.

## Path Convention

This doc uses `${BUBATR_HOME}` as placeholder — replace it with the actual location (default: `.bubat-r/`).

> All `STAGES/`, `templates/`, `docs/`, `skills/` references are relative to `${BUBATR_HOME}`.

## Intent

```text
bubat-r run [target-path] [--max-hours N]
```

## Protocol

1. Determine `${BUBATR_HOME}` — the directory containing `bubat-r` (see Path Convention above).
2. Ensure `ast-index` installed.
3. Create/update `.ast-index.yaml` excludes if needed.
4. Run `ast-index rebuild` or `ast-index update`.
5. For each stage A–H:
   a. Read `${BUBATR_HOME}/STAGES/<X>/CONTEXT.md` for stage instructions, templates, and ast-index commands.
   b. Write output artifacts to `${BUBATR_HOME}/STAGES/<X>/` using templates in that directory.
   c. When stage is done, copy outputs to `<target>/reconstruction/` (copy commands in each CONTEXT.md).
   d. Update `${BUBATR_HOME}/STAGES/A/00-workflow-status.md` after each completed, blocked, or skipped stage.
6. If run stops before later stages, mark them `Not Run` or `Blocked` in `00-workflow-status.md`.
7. If critical coverage below target, recommend `bubat-r gap` and record next step in status file.
8. If durable local context near code is needed, recommend `bubat-r export docr` and mark DOCR status.

## Stage → Output Files

| Stage | Write here first (under `${BUBATR_HOME}/`) | Copy to target after done                                                      |
| ----- | ------------------------------------------ | ------------------------------------------------------------------------------ |
| A     | `${BUBATR_HOME}/STAGES/A/`                 | `<target>/reconstruction/00–03 + docr-candidates`                              |
| B     | `${BUBATR_HOME}/STAGES/B/`                 | `<target>/reconstruction/04 + 02`                                              |
| C     | `${BUBATR_HOME}/STAGES/C/`                 | `<target>/reconstruction/05 + 02`                                              |
| D     | `${BUBATR_HOME}/STAGES/D/`                 | `<target>/reconstruction/06 + 02`                                              |
| E     | `${BUBATR_HOME}/STAGES/E/`                 | `<target>/reconstruction/07`                                                   |
| F     | `${BUBATR_HOME}/STAGES/F/`                 | `<target>/reconstruction/08`                                                   |
| G     | `${BUBATR_HOME}/STAGES/G/`                 | `<target>/reconstruction/09, 10`                                               |
| H     | `${BUBATR_HOME}/STAGES/H/`                 | `<target>/reconstruction/11, 12`                                               |
| I     | `${BUBATR_HOME}/STAGES/I/`                 | `<target>/reconstruction/gaps/, 13, 02, 11, 12`                                |
| J     | `${BUBATR_HOME}/STAGES/J/`                 | `<target>/AGENTS.md`, subtree `AGENTS.md`, `reconstruction/docr-export-report` |
| K     | `${BUBATR_HOME}/STAGES/K/`                 | `<target>/reconstruction/diagrams/`                                            |

## Status Rule

Absent output must be explained by `00-workflow-status.md`.
Examples:

- Stage not run yet
- Stage blocked by missing runtime/secrets/access
- Optional overlay not used
