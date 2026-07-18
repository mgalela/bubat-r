# bubat-r adr

Buat ADR tersumber dari BUBAT-R artifacts untuk keputusan arsitektur yang butuh eksekusi refactor.

## Intent

```text
bubat-r adr <title>
bubat-r adr "ganti CLI binary DuckDB ke embedded library"
bubat-r adr "pisah reporting gateway ke trx-engine"
bubat-r adr "extract auth middleware ke shared lib"
```

## Path Resolution

Tentukan `${BUBATR_HOME}` — direktori yang berisi `.bubat-r/` atau direktori rekonstruksi.

Artifact resolution:
- `02-coverage-ledger.md`: cek `STAGES/I/` → `STAGES/D/` → `STAGES/C/` → `STAGES/B/` → `STAGES/A/`
- `12-drift-ambiguity-report.md`: cek `STAGES/I/` → `STAGES/H/`
- `STAGES/I/gaps/GAP-*.md`: semua file di folder `gaps/`
- `STAGES/overlays/research/*.md`: semua research memos

Output:
- `${BUBATR_HOME}/STAGES/overlays/adrs/ADR-YYYY-MM-DD-<slug>.md`

## Protocol

1. Tentukan `${BUBATR_HOME}`.
2. Derive `<slug>` dari `<title>`: lowercase, spasi → `-`, hapus karakter non-alphanumeric kecuali `-`.
3. Tentukan tanggal: `YYYY-MM-DD` hari ini.
4. Baca artifacts per resolution path di atas. Jika artifact tidak ada, skip dengan catatan.
5. Filter evidence relevan ke scope `<title>` — jangan dump semua rows. Ikuti aturan di `overlays/refactor-lifecycle.md § 4. Evidence Relevance Filter`.
6. Buat direktori `${BUBATR_HOME}/STAGES/overlays/adrs/` jika belum ada.
7. Tulis file ADR dari template di `templates/adr/ADR-template.md`.
   - Pre-fill `## BUBAT-R Evidence Source` dari evidence yang ditemukan.
   - Pre-fill `## Affected BUBAT-R Areas` — centang area yang terindikasi dari scope title (bisa salah, user yang finalize).
   - Sisakan semua section lain untuk diisi user.
8. Update `${BUBATR_HOME}/STAGES/A/00-workflow-status.md`:
   - Tambah section `## Active Refactoring Cycles` jika belum ada.
   - Tambah row baru: ADR path, Plan = `—`, ADR Status = `Proposed`, Impact = `No`.

## Pre-fill Rules

### `## BUBAT-R Evidence Source`

Include dari coverage-ledger:
- Rows dengan `Status` = `Partial`, `Contradicted`, `Covered with Critical Risk`, `Accepted Gap`
- Filter: `Area` atau `Item` mengandung keyword dari `<title>`

Include dari drift-report:
- Semua unresolved contradictions

Include dari GAP files:
- Gap `Status: Closed` tanpa ADR — resolved tapi belum diformalkan
- Gap `Status: Blocked`
- Gap area overlap dengan title

Include dari research memos:
- Hanya: recommended action + key finding. Bukan seluruh memo.

Jika tidak ada evidence relevan: tulis `No relevant evidence found — run bubat-r run first for evidence-backed ADR.`

### `## Affected BUBAT-R Areas`

Derive initial checklist dari title heuristic:
- Title mengandung "runtime", "server", "container", "deploy", "service" → centang Runtime boundary
- Title mengandung "flow", "behavior", "settlement", "orchestrat", "pipeline" → centang Flow
- Title mengandung "ownership", "entity", "table", "schema", "migration" → centang Data ownership
- Title mengandung "API", "contract", "endpoint", "client", "gateway" → centang API / contract
- Title mengandung "component", "module", "package", "extract", "split", "pisah" → centang Component
- "Code trace" selalu dicentang — setiap refactor mengubah kode

User wajib review dan koreksi sebelum finalize ADR.

## Output: ADR File

Gunakan template `templates/adr/ADR-template.md`. Jika project target punya format ADR sendiri (deteksi dari `docs/adr/` di project target), ikuti format target dan append dua BUBAT-R sections di akhir file.

## Rule

```text
ADR tanpa artifact citation adalah opini.
Jika tidak ada artifacts: tulis itu secara eksplisit di Evidence Source section.
```

Canonical ADR status ada di file ADR itu sendiri, bukan di `00-workflow-status.md`.
`00-workflow-status.md` hanya index pointer — bukan truth.
