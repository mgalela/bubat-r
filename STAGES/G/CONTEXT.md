# Stage G — Component Decomposition

Tujuan:

- turunkan komponen arsitektur di dalam runtime/container/context yang sudah jelas

Komponen tipikal:

- controller/handler
- application service / use-case
- domain service / policy
- repository
- adapter/gateway
- consumer/worker
- mapper/translator
- orchestrator

Aturan:

- komponen didefinisikan oleh responsibility
- file list bukan komponen
- helper teknis murni tidak otomatis jadi komponen arsitektur
- Stage G tidak boleh jalan sebelum Runtime Map, Behavior Spine, dan Ownership Map cukup stabil

Output:

- `Workflow Status` updated for Stage G
- `DOCR Candidates` updated with component-locality hints where useful
- `Component Map`
- `Code Trace Map`

Isi minimum:

- component
- responsibility
- depends on
- owned contracts or policies
- file/symbol/line trace
- drift notes

Exit criteria:

- tiap runtime/container utama punya decomposition yang dapat dijelaskan
- trace ke code tersedia

## Working Files

Write output to this stage directory first:

- `STAGES/G/09-component-map.md`
- `STAGES/G/10-code-trace-map.md`

After stage done, mark as `Done` in `00-workflow-status.md`.

## AST Index Commands

```bash
ast-index outline path/to/file         # file structure before reading file
ast-index symbol "Name"                # locate symbols
ast-index class "Name"                 # locate classes/interfaces/structs
ast-index implementations "Interface"  # implementations/subtypes
```
