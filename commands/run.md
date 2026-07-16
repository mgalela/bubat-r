# bubat-r run

Run first-pass hard-evidence reconstruction for target repo.

## Path Convention

This doc uses `${BUBATR_HOME}` as placeholder — replace it with the actual location (default: `.bubat-r/`).

> All `STAGES/`, `templates/`, `docs/`, `skills/` references are relative to `${BUBATR_HOME}`.

## Intent

```text
bubat-r run [target-path]
```

## Protocol

1. Determine `${BUBATR_HOME}` — the directory containing `bubat-r` (see Path Convention above).
2. Ensure `ast-index` installed.
3. Create/update `.ast-index.yaml` excludes if needed.
4. Run `ast-index rebuild` or `ast-index update`.
5. For each stage A–H:
   a. Read `${BUBATR_HOME}/STAGES/<X>/CONTEXT.md` for stage instructions, templates, and ast-index commands.
   b. Write output artifacts to `${BUBATR_HOME}/STAGES/<X>/` using templates in that directory.
   c. When stage is done, mark it `Done` in `${BUBATR_HOME}/STAGES/A/00-workflow-status.md`. Do NOT copy to `<target>/reconstruction/` — outputs stay in `STAGES/` until user runs `bubat-r export` explicitly.
   d. Update `${BUBATR_HOME}/STAGES/A/00-workflow-status.md` after each completed, blocked, or skipped stage.
6. If run stops before later stages, mark them `Not Run` or `Blocked` in `00-workflow-status.md`.
7. If critical coverage below target, recommend `bubat-r gap` and record next step in status file.
8. When run completes, remind user to run `bubat-r export <target-path>` to materialize outputs into target repo's `reconstruction/` directory.
9. If durable local context near code is needed, recommend `bubat-r export docr` and mark DOCR status.

## Stage → Output Files

Outputs stay in `STAGES/` until `bubat-r export` is run explicitly.

| Stage | Write here (under `${BUBATR_HOME}/`) | Artifacts                                                |
| ----- | ------------------------------------ | -------------------------------------------------------- |
| A     | `${BUBATR_HOME}/STAGES/A/`           | `00–03` + `docr-candidates`                              |
| B     | `${BUBATR_HOME}/STAGES/B/`           | `04` + `02` (updated)                                    |
| C     | `${BUBATR_HOME}/STAGES/C/`           | `05` + `02` (updated)                                    |
| D     | `${BUBATR_HOME}/STAGES/D/`           | `06` + `02` (updated)                                    |
| E     | `${BUBATR_HOME}/STAGES/E/`           | `07`                                                     |
| F     | `${BUBATR_HOME}/STAGES/F/`           | `08`                                                     |
| G     | `${BUBATR_HOME}/STAGES/G/`           | `09`, `10`                                               |
| H     | `${BUBATR_HOME}/STAGES/H/`           | `11`, `12`                                               |
| I     | `${BUBATR_HOME}/STAGES/I/`           | `gaps/`, `13`, `02`, `11`, `12` (updated)                |
| J     | `${BUBATR_HOME}/STAGES/J/`           | `root-AGENTS.md`, subtree `AGENTS.md`, export report     |
| K     | `${BUBATR_HOME}/STAGES/K/`           | `diagrams/`                                              |

## Status Rule

Absent output must be explained by `00-workflow-status.md`.
Examples:

- Stage not run yet
- Stage blocked by missing runtime/secrets/access
- Optional overlay not used
