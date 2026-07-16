# bubat-r export

Copy completed STAGES/ artifacts to an output directory in the target repo.

## Intent

```text
bubat-r export [target-path] [to <output-dir>] [stages <A-K>]
```

Examples:

```text
bubat-r export .
bubat-r export /path/to/repo
bubat-r export . to reconstruction
bubat-r export . to docs/architecture
bubat-r export . to .bubat-out stages A-H
bubat-r export /path/to/repo to arch-output stages I
```

Default target path: current directory (`.`).
Default output-dir: `reconstruction`.
Default stages: all stages marked `Done` in `00-workflow-status.md`.

## Protocol

1. Determine `${BUBATR_HOME}` — directory containing `bubat-r`.
2. Resolve `<output-dir>`: use `to <output-dir>` if given, else `reconstruction`.
3. Resolve `<out>` = `<target>/<output-dir>/`.
4. Read `${BUBATR_HOME}/STAGES/A/00-workflow-status.md`.
5. Determine which stages to export:
   - If `stages <list>` given: use that list.
   - Otherwise: all stages with status `Done`.
6. For each selected stage:
   a. Verify source files exist in `${BUBATR_HOME}/STAGES/<X>/`.
   b. If source missing, report as `Skipped (missing source)` and continue.
   c. Copy per mapping below, substituting `<out>` for `<target>/reconstruction/`.
   d. Report each file as `Copied` or `Skipped`.
7. Create `<out>` directory if absent.
8. Print summary: output dir, stages copied, stages skipped, files written.

## Stage → Artifact Mapping

`<out>` = `<target>/<output-dir>/` (default: `<target>/reconstruction/`).

| Stage | Copy from `STAGES/<X>/`         | Copy to                                                           |
| ----- | -------------------------------- | ----------------------------------------------------------------- |
| A     | `A/00-workflow-status.md`        | `<out>/00-workflow-status.md`                                     |
|       | `A/01-evidence-catalog.md`       | `<out>/01-evidence-catalog.md`                                    |
|       | `A/02-coverage-ledger.md`        | `<out>/02-coverage-ledger.md`                                     |
|       | `A/03-main-spine.md`             | `<out>/03-main-spine.md`                                          |
|       | `A/docr-candidates.md`           | `<out>/docr-candidates.md`                                        |
| B     | `B/04-runtime-map.md`            | `<out>/04-runtime-map.md`                                         |
|       | `B/02-coverage-ledger.md`        | `<out>/02-coverage-ledger.md`                                     |
| C     | `C/05-behavior-spine.md`         | `<out>/05-behavior-spine.md`                                      |
|       | `C/02-coverage-ledger.md`        | `<out>/02-coverage-ledger.md`                                     |
| D     | `D/06-ownership-map.md`          | `<out>/06-ownership-map.md`                                       |
|       | `D/02-coverage-ledger.md`        | `<out>/02-coverage-ledger.md`                                     |
| E     | `E/07-domain-map.md`             | `<out>/07-domain-map.md`                                          |
| F     | `F/08-contract-map.md`           | `<out>/08-contract-map.md`                                        |
| G     | `G/09-component-map.md`          | `<out>/09-component-map.md`                                       |
|       | `G/10-code-trace-map.md`         | `<out>/10-code-trace-map.md`                                      |
| H     | `H/11-reference-design.md`       | `<out>/11-reference-design.md`                                    |
|       | `H/12-drift-ambiguity-report.md` | `<out>/12-drift-ambiguity-report.md`                              |
| I     | `I/gaps/*.md`                    | `<out>/gaps/`                                                     |
|       | `I/13-readiness-verdict.md`      | `<out>/13-readiness-verdict.md`                                   |
|       | `I/02-coverage-ledger.md`        | `<out>/02-coverage-ledger.md`                                     |
|       | `I/11-reference-design.md`       | `<out>/11-reference-design.md`                                    |
|       | `I/12-drift-ambiguity-report.md` | `<out>/12-drift-ambiguity-report.md`                              |
| J     | `J/docr-export-report.md`        | `<out>/docr-export-report.md`                                     |
|       | `J/root-AGENTS.md`               | `<target>/AGENTS.md`                                              |
|       | `J/<subtree>-AGENTS.md`          | `<target>/<subtree>/AGENTS.md` (one per selected subtree)         |
| K     | `K/diagrams/`                    | `<out>/diagrams/`                                                 |
| —     | `overlays/research/*.md`         | `<out>/research/` (if research overlay used)                      |
| —     | `overlays/docs-feed/*.md`        | `<out>/docs-feed/` (if late-doc overlay used)                     |

## Conflict Rule

If file already exists in `<out>`, overwrite it — STAGES/ is source of truth for reconstruction outputs.
Exception: `gaps/*.md` — merge by filename; do not delete existing gap files not present in STAGES/I/.

## Outputs

- Reconstruction artifacts under `<target>/<output-dir>/`
- Export summary printed to stdout
