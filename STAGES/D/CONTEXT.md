# Stage D — Data Ownership Map

Tujuan:

- tentukan siapa benar-benar memiliki data dan invariant

Cari:

- siapa menulis entity/table/collection
- siapa enforce invariant
- siapa reference owner / authoritative writer
- siapa hanya read/projection/cache
- siapa owns/publishes events
- siapa owns/refreshes projections/read models
- cross-module writes
- shared table access
- transaction boundaries

Aturan:

- write owner > read user
- invariant owner > DTO owner
- shared database tidak otomatis berarti shared ownership

Output:

- `Workflow Status` updated for Stage D
- `DOCR Candidates` updated with ownership-boundary candidates
- `Ownership Map`
- updated `Coverage Ledger`
- event/projection ownership evidence

Struktur minimum:

- entity/data object
- owner candidate
- write paths
- invariants
- dependents/readers
- conflicts/ambiguity

Exit criteria:

- entity bisnis utama punya owner candidate
- area shared ownership terdeteksi eksplisit
- data ownership coverage dihitung
- uncovered/ambiguous owner untuk entity weight 5–4 masuk gap list

## Working Files

Write output to this stage directory first:

- `STAGES/D/06-ownership-map.md`
- `STAGES/D/02-coverage-ledger.md` (updated copy from Stage C)

After stage done, mark as `Done` in `00-workflow-status.md`.

## AST Index Commands

```bash
ast-index refs "Symbol"                # definitions + usages by name
ast-index usages "Symbol"              # usage sites
ast-index callers "functionName"       # call sites
ast-index outline path/to/file         # file structure before reading file
ast-index query "SQL"                  # raw SQLite index query
```
