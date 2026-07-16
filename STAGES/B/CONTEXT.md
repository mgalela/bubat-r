# Stage B — Runtime Map

Tujuan:

- identifikasi boundary runtime/deployable paling nyata

Cari:

- frontend
- API/service
- background worker
- scheduler/cron
- websocket gateway
- db
- cache
- queue
- blob/search/vector storage
- external SaaS

Aturan:

- runtime boundary > package boundary
- jangan samakan folder dengan container
- deploy together vs deploy separately wajib dicatat

Output:

- `Workflow Status` updated for Stage B
- `DOCR Candidates` updated with runtime-boundary candidates
- `Runtime Map`
- updated `Coverage Ledger`

Isi minimum:

- runtime unit
- responsibility sementara
- inbound interfaces
- outbound dependencies
- sync/async relation
- read/write role

Exit criteria:

- semua executable/deployable utama masuk peta
- communication edges utama sudah terpetakan
- runtime coverage dihitung
- uncovered runtime units weight 5–4 dicatat eksplisit

## Working Files

Write output to this stage directory first:

- `STAGES/B/04-runtime-map.md`
- `STAGES/B/02-coverage-ledger.md` (updated copy from Stage A)

After stage done, mark as `Done` in `00-workflow-status.md`.

## AST Index Commands

```bash
ast-index file "pattern"               # locate files
ast-index map --limit 50               # compact project map
ast-index module ""                    # module inventory
ast-index deps "module"                # module dependencies
ast-index dependents "module"          # reverse dependencies
ast-index imports path/to/file         # import/dependency clues
```
