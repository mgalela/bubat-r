# Test Plan: `bubat-r adr` — trx-engine Audit Pipeline Refactor

Date: 2026-07-18  
Target project: `kdmp/jiel/tools/trx-engine` (`.bubat-r/` exists, Stage A–K complete)  
Tester: manual (command dijalankan, output diverifikasi per checklist)  
Scope: `bubat-r adr` + `bubat-r plan` — `impact` belum dieksekusi  
Execution status: **COMPLETE**

---

## Context Refactor

**Judul ADR yang akan diuji:**
```
bubat-r adr "ganti audit pipeline: hapus ClickHouse, tambah duckark embed + MinIO Parquet ZSTD"
```

**Ringkasan perubahan yang diajukan:**
- Saat ini: `unlogged PG table → JSONL (fsync) → Tailer → PG partitioned → Daily Rollup → ClickHouse → Monthly Parquet Archiver → S3`
- Target: `unlogged PG table → duckark container (embedded DuckDB) → Parquet+ZSTD → MinIO`
- Read >7d: dari ClickHouse fallback → ke duckark query

**Container name:** `duckark` (embedded DuckDB archival container, menggantikan ClickHouse + Parquet Archiver)

---

## Pre-conditions

| Item | Status yang Diharapkan |
|---|---|
| `.bubat-r/STAGES/A/02-coverage-ledger.md` | Ada. C09 = Covered, C17 = Covered |
| `.bubat-r/STAGES/H/12-drift-ambiguity-report.md` | Ada. AMB-02 = ClickHouse migrations (Low) |
| `.bubat-r/STAGES/I/gaps/GAP-C09-request-audit-log.md` | Ada. Status: Covered |
| `.bubat-r/STAGES/overlays/research/RES-audit-log-write-read-pipeline.md` | Ada |
| `.bubat-r/STAGES/A/00-workflow-status.md` | Ada. Belum ada `## Active Refactoring Cycles` |
| `.bubat-r/STAGES/overlays/adrs/` | Belum ada (harus dibuat oleh command) |

**Post-execution state:**
- `overlays/adrs/ADR-20260718-001-....md` — dibuat
- `overlays/plans/refactor-tasklist-ganti-audit-pipeline-....md` — dibuat
- `00-workflow-status.md` — `## Active Refactoring Cycles` ada, ADR Status = Accepted, Plan terisi

---

## TC-01: File ADR Dibuat di Path Benar

**Input:** `bubat-r adr "ganti audit pipeline: hapus ClickHouse, tambah duckark embed + MinIO Parquet ZSTD"`

**Expected output file:**
```
.bubat-r/STAGES/overlays/adrs/ADR-20260718-001-ganti-audit-pipeline-hapus-clickhouse-tambah-duckark-embed-minio-parquet-zstd.md
```

**Expected adr-code** (baris pertama file): `adr-code: ADR-20260718-001`

**Pass criteria:**
- [x] File ada di path di atas
- [x] Direktori `overlays/adrs/` dibuat otomatis (tidak perlu mkdir manual)
- [x] Date format = `YYYYMMDD` (tanpa dash), bukan `YYYY-MM-DD`
- [x] Counter = `001` (tidak ada ADR lain hari ini)
- [x] Baris pertama file = `adr-code: ADR-20260718-001`
- [x] Slug: lowercase, spasi → `-`, tanda titik dua dan karakter non-alphanumeric dihapus, tidak ada double `--`

---

## TC-02: Template Structure Mengikuti `templates/adr/ADR-template.md`

**Expected sections (dalam urutan):**
1. Header metadata (Status, Date, Implemented, Owners, Related)
2. `## BUBAT-R Evidence Source`
3. `## Affected BUBAT-R Areas`
4. `## Latar Belakang (Context)`
5. `## Problem`
6. `## Keputusan`
7. `## Alasan Keputusan (Why)`
8. `## Alternatif yang Dipertimbangkan`
9. `## Shape Implementasi`
10. `## Konsekuensi`
11. `## Deferred Decisions`
12. `## Migration Plan`
13. `## Summary`

**Pass criteria:**
- [x] Semua section di atas ada
- [x] Status awal = `PROPOSED`
- [x] Section 4–13 berisi placeholder/template text, BUKAN diisi otomatis (kecuali Latar Belakang yang boleh punya hint dari Evidence)

---

## TC-03: Evidence Source — Research Memo Masuk

**Artifact:** `RES-audit-log-write-read-pipeline.md`  
Question: "jelaskan write-path, pipeline, read-path audit log"

**Expected:** baris di Evidence Source table:
```
| research memo | jelaskan write-path, pipeline, read-path audit log | key finding: 6-stage pipeline JSONL→PG→CH→S3; read-path PG hot + CH cold ≤/>7d | STAGES/overlays/research/RES-audit-log-write-read-pipeline.md |
```

**Pass criteria:**
- [x] Baris research memo ada di Evidence Source
- [x] Citation menunjuk ke path file yang benar (bisa diverifikasi exists)
- [x] Content baris ≤ 3 kalimat / ≤ 120 karakter (bukan paste seluruh memo)
- [x] TIDAK ada content fabricated (bukan ringkasan yang tidak ada di memo asli)

---

## TC-04: Evidence Source — GAP-C09 Masuk sebagai Evidence

**Artifact:** `STAGES/I/gaps/GAP-C09-request-audit-log.md`  
Status di file: `Covered` (bukan `Closed` atau `Blocked`)

Inclusion rule yang berlaku: **area overlap dengan title** — "audit log" overlap langsung dengan title.  
*(Bukan via "Status: Closed" rule — status file adalah Covered, bukan Closed.)*

**Expected:** baris di Evidence Source table:
```
| GAP file | GAP-C09-request-audit-log | Covered | STAGES/I/gaps/GAP-C09-request-audit-log.md |
```

**Pass criteria:**
- [x] Baris GAP-C09 ada di Evidence Source (via area overlap rule)
- [x] Citation path valid dan file ada
- [x] Status = `Covered` (bukan fabricated status lain)
- [x] Jika GAP-C09 TIDAK muncul: acceptable jika command hanya include "Closed"/"Blocked" gaps — catat sebagai spec deviation untuk dianalisis

---

## TC-05: Evidence Source — AMB-02 dari Drift Report Masuk

**Artifact:** `STAGES/H/12-drift-ambiguity-report.md`  
Entry: AMB-02 = "ClickHouse migrations — content not examined"

**Expected:** baris di Evidence Source:
```
| drift-report | ClickHouse migrations | Ambiguous | STAGES/H/12-drift-ambiguity-report.md AMB-02 |
```

**Pass criteria:**
- [x] AMB-02 ada di Evidence Source (sangat relevan: refactor menghapus ClickHouse)
- [x] Status = `Ambiguous` atau `Low risk`
- [x] Tidak ada baris drift report yang fabricated (hanya AMB-02 yang audit-relevant)

---

## TC-06: Evidence Source — C09/C17 Coverage Rows TIDAK Masuk sebagai Problematic Rows

RFC spec: Evidence Source hanya ambil rows dengan status `Partial`, `Contradicted`, `Covered with Critical Risk`, `Accepted Gap`.  
C09 = `Covered`, C17 = `Covered` — keduanya bukan problematic.

**Pass criteria:**
- [x] Tidak ada baris coverage-ledger C09 atau C17 di Evidence Source dengan label `Partial` atau `Contradicted` (karena statusnya memang Covered)
- [x] Jika C09/C17 muncul, harus dengan label `Covered` dan noted sebagai "area yang terdampak refactor" — bukan sebagai "problematic coverage"
- [x] Tidak ada fabricated rows dengan status yang tidak ada di coverage-ledger asli

---

## TC-07: Affected BUBAT-R Areas — Heuristic dari Title

Title: `"ganti audit pipeline: hapus ClickHouse, tambah duckark embed + MinIO Parquet ZSTD"`

**Expected checklist state:**
| Area | Expected | Alasan |
|---|---|---|
| Runtime boundary / executable unit | `[x]` | Container baru `duckark` = runtime baru |
| Flow / write-path behavior | `[x]` | Pipeline berubah (JSONL → duckark) |
| Data ownership / entity | `[ ]` | Entity audit record tidak berubah strukturnya |
| API / external contract surface | `[x]` | Read API >7d berubah dari CH ke duckark |
| Component structure / decomposition | `[x]` | Komponen baru (duckark), CHClient dihapus |
| Code trace | `[x]` | SELALU |
| DOCR area affected | `[x]` | handler/, engine/ AGENTS.md reference CH pipeline |

**Pass criteria (Phase 1 — heuristic dari title):**
- [x] Runtime boundary = `[x]`
- [x] Flow/write-path = `[x]`
- [x] API/contract = `[x]`
- [x] Component structure = `[x]`
- [x] Code trace = `[x]` (wajib selalu)
- [x] Data ownership = `[ ]` (entity tidak berubah)
- [x] DOCR = `[x]` atau `[ ]` — acceptable either way
- [x] Comment `<!-- Draft: heuristic dari title. Update setelah Problem + Keputusan diisi. -->` ada di atas checklist

---

## TC-08: `00-workflow-status.md` Diupdate

**Expected:** section `## Active Refactoring Cycles` muncul di file:
```markdown
## Active Refactoring Cycles

| Code | ADR | Plan | ADR Status | Impact Analyzed |
|---|---|---|---|---|
| `ADR-20260718-001` | `STAGES/overlays/adrs/ADR-20260718-001-ganti-audit-pipeline-...md` | — | Proposed | No |
```

**Pass criteria:**
- [x] Section `## Active Refactoring Cycles` ada di `00-workflow-status.md`
- [x] Kolom `Code` = `ADR-20260718-001`
- [x] ADR path dalam kolom ADR = relative path yang benar
- [x] Plan = `—`, ADR Status = `Proposed`, Impact = `No`
- [x] Tidak ada absolute path (`/Users/...`) di baris ini

---

## TC-09: Tidak Ada Absolute Path di Output

**Pass criteria:**
- [x] `grep -r "/Users/\|/home/" .bubat-r/STAGES/overlays/adrs/ADR-2026-07-18-*.md` → tidak ada hasil
- [x] `grep "/Users/\|/home/" .bubat-r/STAGES/A/00-workflow-status.md` → tidak ada hasil (di baris yang ditambahkan command ini)

---

## TC-10: Edge — Direktori `overlays/adrs/` Belum Ada

Pre-condition untuk test ini: hapus `overlays/adrs/` jika sudah ada sebelumnya.

**Expected:** command membuat direktori otomatis, ADR file berhasil dibuat.

**Pass criteria:**
- [x] Tidak ada error "directory not found"
- [x] File ADR tetap dibuat meskipun direktori sebelumnya tidak ada

---

## TC-11: Template Fallback — trx-engine Tidak Punya Format ADR Sendiri

trx-engine punya `doc/` (bukan `docs/adr/`). Tidak ada folder ADR di project target.

**Expected:** command pakai `templates/adr/ADR-template.md` (built-in fallback), BUKAN deteksi format target.

**Pass criteria:**
- [x] Generated ADR punya section `## Latar Belakang (Context)` (dari built-in template)
- [x] Generated ADR punya section `## Alasan Keputusan (Why)` (dari built-in template)
- [x] BUKAN format Inggris penuh yang bukan template built-in

---

## Execution Order

1. Verifikasi pre-conditions (cek semua artifacts ada)
2. Pastikan `overlays/adrs/` belum ada (TC-10 setup)
3. Jalankan: `bubat-r adr "ganti audit pipeline: hapus ClickHouse, tambah duckark embed + MinIO Parquet ZSTD"`
4. Cek output per TC-01 sampai TC-11 secara berurutan
5. Isi ADR: Latar Belakang, Problem, Keputusan, Alasan, Alternatif, Shape Implementasi, Konsekuensi, Deferred Decisions, Migration Plan, Summary
6. Update Affected BUBAT-R Areas (Phase 2 post-Keputusan) — update DOCR ke `[x]`
7. Update Status ADR ke `ACCEPTED`, update workflow-status
8. Jalankan: `bubat-r plan ADR-20260718-001`
9. Cek output per TC-12

---

## TC-12: `bubat-r plan` — Plan File Dibuat

**Input:** `bubat-r plan ADR-20260718-001`

**Expected output file:**
```
.bubat-r/STAGES/overlays/plans/refactor-tasklist-ganti-audit-pipeline-hapus-clickhouse-tambah-duckark-minio-parquet-zstd.md
```

**Pass criteria:**
- [x] File ada di path di atas, direktori `overlays/plans/` dibuat otomatis
- [x] Header: `Companion to:` menunjuk ke ADR file yang benar
- [x] `## Goal` diisi dari ADR `## Keputusan` — bukan placeholder
- [x] `### Inventory being replaced / added` diisi dari ADR `## Shape Implementasi`
- [x] `### Explicit non-goals` ada
- [x] `## Risk Callouts` minimal 3 items dari ADR `## Konsekuensi (Negatif)`
- [x] 4 phases (A, B, C, D) ada dengan `**Status:** ⏳ pending`
- [x] Phase A: tidak ada cutover (additive only)
- [x] Tiap task punya target file/symbol + aksi konkret + gate verifikasi
- [x] Tidak ada task abstrak tanpa file target (e.g. "refactor X" tanpa path)
- [x] `00-workflow-status.md` kolom Plan terisi dengan path plan file
- [x] ADR `- Related:` diupdate dengan path plan file

---

## Deviation Log

| TC | Status | Deviasi | Catatan |
|---|---|---|---|
| TC-01 | ✅ PASS | — | File `ADR-20260718-001-...-zstd.md` dibuat. `adr-code: ADR-20260718-001` baris pertama. Dir dibuat otomatis. |
| TC-02 | ✅ PASS | — | 13 sections sesuai template. Status = PROPOSED saat dibuat. |
| TC-03 | ✅ PASS | — | Research memo masuk 1 baris, key finding ≤ 120 char, citation valid. |
| TC-04 | ✅ PASS | — | GAP-C09 masuk via area overlap. Status = `Covered`. |
| TC-05 | ✅ PASS | — | AMB-02 masuk dengan label `Ambiguous — content not examined`. |
| TC-06 | ✅ PASS | — | Tidak ada baris coverage-ledger Partial/Contradicted. Note eksplisit ditulis. |
| TC-07 | ✅ PASS | DOCR awal `[ ]` → `[x]` di Phase 2 | Heuristic awal: DOCR `[ ]` (acceptable per TC-07). Phase 2 post-Keputusan: diupdate ke `[x]` — handler/engine AGENTS.md reference CHClient. Draft comment ada. |
| TC-08 | ✅ PASS | ADR Status akhir `Accepted`, Plan terisi | Saat `bubat-r adr`: Status = Proposed, Plan = `—` ✓. Kemudian diupdate manual ke Accepted + Plan path setelah `bubat-r plan`. |
| TC-09 | ✅ PASS | — | Tidak ada absolute path di ADR maupun workflow-status. |
| TC-10 | ✅ PASS | — | Dir `overlays/adrs/` dibuat otomatis (mkdir -p sebelum write). |
| TC-11 | ✅ PASS | — | Sections `## Latar Belakang (Context)` dan `## Alasan Keputusan (Why)` ada — built-in template. |
| TC-12 | ✅ PASS | — | Plan 16.3K, 28 tasks, 4 phases. Goal dari Keputusan. Inventory dari Shape. 4 risk items. Phase A additive. Tiap task punya target + aksi + gate. workflow-status Plan kolom terisi. ADR Related diupdate. |

---

## Notes

- `bubat-r adr` dan `bubat-r plan` dijalankan sebagai prompt command (bukan skill) — command spec di `commands/adr.md` dan `commands/plan.md`
- Container name dikunci: `duckark`
- Coverage-ledger tidak punya rows Partial/Contradicted yang audit-related (C21/C25/C31 Partial tapi scope lain) — Evidence Source TIDAK punya baris coverage-ledger, ini expected dan terdokumentasi di note bawah Evidence Source table
- AMB-02 dari drift-report adalah satu-satunya hard evidence ClickHouse-related yang ada
- Tidak ada fabricated content ditemukan di semua output

## Findings & Spec Gaps

| # | Finding | Severity | Action |
|---|---|---|---|
| F1 | GAP file status `Covered` tidak match spec rule `Status: Closed` — inclusion terjadi via rule ketiga "area overlap", bukan status rule | Low | Update spec `commands/adr.md` — tambah `Covered` ke daftar status yang di-include, atau perjelas bahwa "Covered" = "Closed" untuk GAP files |
| F2 | DOCR heuristic dari title tidak terdeteksi (title tidak mengandung keyword DOCR/AGENTS) — butuh Phase 2 manual update | Low — expected behavior | Spec sudah handle ini dengan two-phase approach; tidak ada action needed |
| F3 | `bubat-r plan` menggunakan built-in template meski project punya format refactor tasklist sendiri di `doc/refactor-tasklist-g1-3-*.md` — format akhir mirip tapi tidak identik | Low | `commands/plan.md` hanya cek `docs/issues/CONTEXT.md` — tidak scan `doc/*.md`. Bisa ditambahkan sebagai fallback scan path jika diinginkan |
| F4 | Plan file naming `refactor-tasklist-<slug>.md` tidak punya prefix standar — sulit dibedakan dari non-plan files | Medium | **Fixed:** naming diubah ke `PL-<adr-code>[-<short>].md` di `commands/plan.md`. File existing perlu rename manual. |
| F5 | Plan satu file terlalu panjang untuk plan dengan banyak phase — developer perlu baca seluruh file untuk fokus ke satu phase | Medium | **New command:** `bubat-r plan-detail <plan-id>` — generate per-phase files di direktori `plans/<plan-id>/`. Main plan jadi index. Spec ditambah ke `commands/plan.md`. |
| F6 | Tidak ada cara generate test plan dari plan secara otomatis — test plan dibuat manual seperti dokumen ini | Medium | **New command:** `bubat-r test-plan <plan-id> [--phase X]` — generate TC dari Gate + Acceptance + Risk Callout. Spec ditambah ke `commands/plan.md`. |
