# Evidence Catalog

Project: `[PROJECT]`  
Date: `[YYYY-MM-DD]`  
Index state: `ast-index stats` = `[summary]`

## Scope

Included paths:
- `[path]`

Excluded paths:
- `[path]`

## AST Index Baseline

Commands:

```bash
ast-index version
ast-index stats
ast-index map --limit 50
ast-index conventions
```

Notes:
- `[note]`

## Evidence Table

| ID | Type | Location | Observed Fact | Confidence | Weight | Coverage Status | Notes |
|---|---|---|---|---|---:|---|---|
| EV-001 | route/executable/schema/integration/test/config | `path:line` | `[fact]` | Observed/Inferred/Unknown | 1-5 | Covered/Partial/Uncovered/Unknown/N/A | `[notes]` |

## Evidence Type Checklist

| Type | Status | Notes |
|---|---|---|
| Repo topology | Unknown | |
| Executable entrypoints | Unknown | |
| Routes/RPC/CLI | Unknown | |
| Cron/workers/queues | Unknown | |
| Schema/migrations/models | Unknown | |
| Outbound integrations | Unknown | |
| Env/secrets/config | Unknown | |
| Deploy/infra/CI | Unknown | |
| Tests | Unknown | |
| Observability config | Unknown | |

## Coverage Summary

- Weighted coverage: `NN%`
- Covered weight-5 items: `X/Y`
- Partial items: `[list]`
- Uncovered high-weight items: `[list]`
- Unknowns requiring validation: `[list]`

## Open Questions

| Question | Related Evidence | Priority | Next Step |
|---|---|---|---|
| `[question]` | `EV-...` | High/Medium/Low | `[next]` |
