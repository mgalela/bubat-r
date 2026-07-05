# bubat-r status

Summarize reconstruction progress.

## Intent

```text
bubat-r status [target-path]
```

## Reads

- `reconstruction/02-coverage-ledger.md`
- `reconstruction/12-drift-ambiguity-report.md`
- `reconstruction/gaps/*.md`
- `reconstruction/13-readiness-verdict.md` if present
- root `AGENTS.md` and selected child `AGENTS.md` if Stage J / DOCR export already ran

## Reports

- runtime coverage
- behavior coverage
- data ownership coverage
- integration/contract coverage
- critical coverage
- open `Unknown` weight-5 items
- unresolved `Contradicted`
- unresolved `Covered with Critical Risk`
- DOCR status: present/missing root doc, present/missing key child docs, suspected stale local context docs
- next recommended gap loop or `bubat-r export docr` if reconstruction is stable but local context docs are missing/stale
