# Stage J — Hierarchical Context Docs Materialization

Tujuan:

- materialize context docs hirarkis dekat code di repo target
- distribusikan hasil rekonstruksi ke subtree penting agar next run lebih lokal dan hemat context
- pertahankan unknown/contradiction sebagai context lokal, bukan menyapu ambiguity

Kapan dijalankan:

- setelah Stage H untuk baseline global, atau
- setelah Stage I pada area yang akan sering disentuh, atau
- sebelum handoff ke agent/tim berikutnya

Input minimum:

- `02-coverage-ledger.md`
- `03-main-spine.md`
- `04-runtime-map.md`
- `05-behavior-spine.md`
- `06-ownership-map.md`

Input preferred:

- `07-domain-map.md`
- `08-contract-map.md`
- `11-reference-design.md`
- `12-drift-ambiguity-report.md`

Output:

- `Workflow Status` updated for Stage J
- root `AGENTS.md` pada repo target
- selected child `AGENTS.md` pada subtree durable boundary
- refreshed parent/child index untuk docs yang dimaterialisasi

Aturan:

- jangan generate `AGENTS.md` di semua folder
- pilih subtree dengan runtime, ownership, contract, risk, atau main-spine significance yang jelas
- isi doc harus evidence-backed; tidak boleh lebih kuat dari confidence yang ada
- child doc adalah projection ringkas dari artifacts, bukan source of truth baru
- marker-block management direkomendasikan bila repo target juga diedit manusia

Exit criteria:

- root context doc ada dan menunjuk subtree penting
- area weight 5–4 yang boundary-worthy punya context lokal
- no false certainty introduced
- contradictions/unknowns material tetap terlihat

## Working Files

Write output to this stage directory first:

- `STAGES/J/root-AGENTS.md`
- `STAGES/J/child-AGENTS.md` (one per selected subtree boundary; rename per path)
- `STAGES/J/docr-export-report.md`

After stage done, mark as `Done` in `00-workflow-status.md`. Export handles: `docr-export-report.md`, `root-AGENTS.md → <target>/AGENTS.md`, and each `<subtree>-AGENTS.md → <target>/<subtree>/AGENTS.md`.

## AST Index Commands

```bash
ast-index map --limit 50               # compact project map
ast-index module ""                    # module inventory
ast-index deps "module"                # module dependencies
ast-index dependents "module"          # reverse dependencies
ast-index api "module"                 # public API surface
ast-index outline path/to/file         # targeted outline for subtree boundary selection
```
