# bubat-r status

Summarize reconstruction progress.

## Intent

```text
bubat-r status [target-path]
```

## Reads

- `reconstruction/00-workflow-status.md` first
- `reconstruction/02-coverage-ledger.md`
- `reconstruction/12-drift-ambiguity-report.md`
- `reconstruction/gaps/*.md`
- `reconstruction/13-readiness-verdict.md` if present
- `reconstruction/research/*.md` if research overlay used
- `reconstruction/docs-feed/*.md` if late-doc overlay used
- `reconstruction/docr-export-report.md` if Stage J / DOCR export ran
- root `AGENTS.md` and selected child `AGENTS.md` if Stage J / DOCR export already ran

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
