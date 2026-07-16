# bubat-r status

Summarize reconstruction progress.

## Intent

```text
bubat-r status [target-path]
```

## Path Resolution

Determine `${BUBATR_HOME}` — directory containing `bubat-r`.

For `02-coverage-ledger.md`: read from the latest Done stage that produced it — check `STAGES/I/` first, then `STAGES/D/`, `STAGES/C/`, `STAGES/B/`, `STAGES/A/`.
For `12-drift-ambiguity-report.md`: check `STAGES/I/` first, then `STAGES/H/`.

## Reads

- `${BUBATR_HOME}/STAGES/A/00-workflow-status.md` first
- latest `02-coverage-ledger.md` per resolution rule above
- latest `12-drift-ambiguity-report.md` per resolution rule above
- `${BUBATR_HOME}/STAGES/I/gaps/*.md` if Stage I ran
- `${BUBATR_HOME}/STAGES/I/13-readiness-verdict.md` if present
- `${BUBATR_HOME}/STAGES/overlays/research/*.md` if research overlay used
- `${BUBATR_HOME}/STAGES/overlays/docs-feed/*.md` if late-doc overlay used
- `${BUBATR_HOME}/STAGES/J/docr-export-report.md` if Stage J ran
- root `AGENTS.md` and selected child `AGENTS.md` in target repo if Stage J ran

## Reports

- current highest completed stage
- stage checklist status: done / in progress / blocked / not run
- runtime coverage
- behavior coverage
- data ownership coverage
- integration/contract coverage
- critical coverage
- open `Unknown` weight-5 items
- unresolved `Contradicted`
- unresolved `Covered with Critical Risk`
- gap dossier status: present/missing formal `GAP-*.md` vs gap signals only in ledger
- research overlay status: present/missing memo files
- late-doc overlay status: present/missing register/verification/aggregate/summary files, count of `Target Design Only` claims
- DOCR status: present/missing root doc, present/missing key child docs, present/missing export report, suspected stale local context docs
- next recommended stage, gap loop, or `bubat-r export docr`

## Interpretation Rule

If an expected artifact is missing, report whether:
- stage not run yet
- stage blocked
- stage in progress
- feature/overlay optional and not invoked
