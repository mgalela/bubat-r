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

## Reports

- runtime coverage
- behavior coverage
- data ownership coverage
- integration/contract coverage
- critical coverage
- open `Unknown` weight-5 items
- unresolved `Contradicted`
- unresolved `Covered with Critical Risk`
- next recommended gap loop
