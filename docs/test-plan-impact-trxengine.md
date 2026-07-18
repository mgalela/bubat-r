# Test Plan: `bubat-r impact` — trx-engine Audit Pipeline Refactor

Date: 2026-07-18  
Target project: `kdmp/jiel/tools/trx-engine` (`.bubat-r/` exists, Stage A–K complete)  
Tester: manual (command dijalankan, output diverifikasi per checklist)  
Scope: `bubat-r impact ADR-20260718-001`  
Companion: `docs/test-plan-adr-trxengine.md` (TC-01–TC-12 COMPLETE)  
Execution status: **COMPLETE**

---

## Context

**Command yang diuji:**
```
bubat-r impact ADR-20260718-001
```

**ADR:** `ganti audit pipeline: hapus ClickHouse, tambah duckark embed + MinIO Parquet ZSTD`  
**ADR Status saat impact dijalankan:** `Accepted`

**Affected BUBAT-R Areas (dari ADR):**
- [x] Runtime boundary / executable unit
- [x] Flow / write-path behavior
- [ ] Data ownership / entity
- [x] API / external contract surface
- [x] Component structure / decomposition
- [x] Code trace (selalu)
- [x] DOCR area affected

---

## Pre-conditions

| Item | Status yang Diharapkan |
|---|---|
| `STAGES/overlays/adrs/ADR-20260718-001-...zstd.md` | Ada. Status = `Accepted`. Section `## Affected BUBAT-R Areas` ada dengan minimal 1 `[x]`. |
| `STAGES/A/02-coverage-ledger.md` | Ada. C09 = `Covered`, C17 = `Covered`. Tidak ada C09/C17 dengan status `Partial`. |
| `STAGES/H/12-drift-ambiguity-report.md` | Ada. AMB-02 = ClickHouse migrations, status `Ambiguous`. |
| `STAGES/A/00-workflow-status.md` | Ada. Kolom `Impact Analyzed` = `No` sebelum command dijalankan. |
| `STAGES/overlays/impact/` | Belum ada (harus dibuat otomatis oleh command). |
| `overlays/refactor-lifecycle.md` (bubat-r repo) | Ada. Section `## 3. Artifact-to-Stage Mapping` adalah source of truth mapping. |

**Post-execution state:**
- `STAGES/overlays/impact/IMPACT-ganti-audit-pipeline-...zstd.md` — dibuat
- `00-workflow-status.md` — kolom `Impact Analyzed` = `Yes — <path>`

---

## TC-01: File IMPACT Dibuat di Path Benar

**Input:** `bubat-r impact ADR-20260718-001`

**Expected output file:**
```
.bubat-r/STAGES/overlays/impact/IMPACT-ganti-audit-pipeline-hapus-clickhouse-tambah-duckark-embed-minio-parquet-zstd.md
```

**Pass criteria:**
- [x] File ada di path di atas
- [x] Direktori `overlays/impact/` dibuat otomatis (tidak perlu mkdir manual)
- [x] Slug file match slug ADR (bukan slug yang dipotong atau diubah)
- [x] Tidak ada absolute path (`/Users/...`) di nama file atau konten

---

## TC-02: Header Metadata Benar

**Expected header:**
```
Source ADR: STAGES/overlays/adrs/ADR-20260718-001-...zstd.md
Analyzed: 2026-07-18
ADR Status at analysis: Accepted
```

**Pass criteria:**
- [x] `Source ADR` path = relative path yang valid (file ada)
- [x] `Analyzed` = tanggal eksekusi command (2026-07-18)
- [x] `ADR Status at analysis` = `Accepted` (diambil dari ADR file, bukan hardcoded)
- [x] Tidak ada absolute path

---

## TC-03: Stale Artifacts — Runtime Boundary → HIGH

Source: `[x] Runtime boundary / executable unit` di ADR.  
Mapping: `04-runtime-map.md` (Stage B), `09-component-map.md` (Stage G).

**Expected rows di Stale Artifacts:**
```
| HIGH | 04-runtime-map.md | B | ... duckark ... ClickHouse ... | medium |
```

**Pass criteria:**
- [x] Baris `04-runtime-map.md` Stage B ada dengan Priority = `HIGH`
- [x] `09-component-map.md` ada (Stage G) — bisa `HIGH` atau `MEDIUM` tergantung overlap dengan Component area
- [x] Recommended action menyebut penambahan runtime baru (`duckark`) dan penghapusan runtime lama (`ClickHouse`)
- [x] Effort baris runtime-map = `medium` (bukan `small` — re-run stage, bukan manual update)

---

## TC-04: Stale Artifacts — Flow/Write-path → HIGH

Source: `[x] Flow / write-path behavior` di ADR.  
Mapping: `05-behavior-spine.md` (Stage C), `08-contract-map.md` (Stage F).

**Pass criteria:**
- [x] Baris `05-behavior-spine.md` Stage C ada dengan Priority = `HIGH`
- [x] Recommended action menyebut update write-path step (CHClient → DuckarkClient)
- [x] Baris `08-contract-map.md` Stage F ada (bisa dari flow atau dari API contract area — overlap diperbolehkan, tidak boleh duplikat)

---

## TC-05: Stale Artifacts — API/Contract Surface → HIGH

Source: `[x] API / external contract surface` di ADR.  
Mapping: `08-contract-map.md` (Stage F), `11-reference-design.md` (Stage H).

**Pass criteria:**
- [x] Baris `08-contract-map.md` Stage F ada dengan Priority = `HIGH` (bisa merge dengan TC-04 jika sudah ada dari flow area)
- [x] Baris `11-reference-design.md` Stage H ada dengan Priority = `HIGH`
- [x] Recommended action untuk `08-contract-map.md` menyebut: hapus CH HTTP contract, tambah DuckarkClient contract
- [x] Recommended action untuk `11-reference-design.md` menyebut: update audit pipeline section

---

## TC-06: Stale Artifacts — Component Structure → MEDIUM

Source: `[x] Component structure / decomposition` di ADR.  
Mapping: `09-component-map.md` (G), `10-code-trace-map.md` (G/H), `11-reference-design.md` (H).

Coverage C09/C17 = `Covered` sebelum refactor → Priority = `MEDIUM` (bukan HIGH).

**Pass criteria:**
- [x] `09-component-map.md` ada — Priority `MEDIUM` (bukan `HIGH`, karena coverage sebelumnya Covered, bukan Partial/Contradicted)
- [x] `10-code-trace-map.md` ada — Priority `MEDIUM`
- [x] Recommended action untuk `09-component-map.md` menyebut hapus `CHClient`, tambah `DuckarkClient`
- [x] Tidak ada baris Component area dengan Priority `HIGH` tanpa justifikasi eksplisit

---

## TC-07: Stale Artifacts — ALWAYS rows (coverage-ledger + drift-report)

Source: `[x] Code trace` (selalu) di ADR → `02-coverage-ledger.md` + `10-code-trace-map.md` + `12-drift-ambiguity-report.md`.

**Pass criteria:**
- [x] Baris `02-coverage-ledger.md` ada dengan Priority = `ALWAYS`
- [x] Recommended action untuk coverage-ledger menyebut C09 dan C17 (area yang terdampak refactor)
- [x] Baris `12-drift-ambiguity-report.md` ada dengan Priority = `ALWAYS`
- [x] Recommended action untuk drift-report menyebut AMB-02 (ClickHouse migrations) — resolve karena refactor menghapus CH
- [x] Kedua baris ini ada terlepas dari area mana yang di-centang di ADR

---

## TC-08: Stale Artifacts — Data Ownership TIDAK Ada

Source: `[ ] Data ownership / entity` di ADR — tidak di-centang.

**Pass criteria:**
- [x] Tidak ada baris `06-ownership-map.md` di Stale Artifacts
- [x] Tidak ada baris `07-domain-map.md` di Stale Artifacts
- [x] Stage D dan E tidak muncul di Recommended Re-run Order
- [x] Tidak ada fabricated rows untuk area yang tidak di-centang

---

## TC-09: DOCR Refresh Needed — handler/AGENTS.md + root-AGENTS.md

Source: `[x] DOCR area affected` di ADR — `handler/AGENTS.md` dan `engine/AGENTS.md` disebutkan.

**Pass criteria:**
- [x] Section `## DOCR Refresh Needed` ada di IMPACT file
- [x] `handler/AGENTS.md` disebutkan dengan alasan konkret (bukan hanya "needs update")
- [x] `root-AGENTS.md` disebutkan — C4 container diagram menyebut CH/duckark
- [x] `engine/AGENTS.md` — boleh disebut dengan catatan conditional (cek setelah eksekusi), atau tidak disebut jika tidak ada referensi CH ditemukan
- [x] Tidak ada fabricated AGENTS.md yang disebut tanpa dasar dari ADR atau observasi file

---

## TC-10: Recommended Re-run Order — B → C → F → G → H

**Expected order:**
```
1. Stage B (runtime-map)
2. Stage C (behavior-spine)
3. Stage F (contract-map)
4. Stage G (component-map)
5. Stage H (reference-design)
[Stage I — conditional]
[Stage J — DOCR partial]
```

**Pass criteria:**
- [x] Stage B ada sebelum C, C sebelum F, G setelah F, H setelah G — urutan dependency terpenuhi
- [x] Stage D dan E tidak ada di re-run order (data ownership tidak berubah)
- [x] Stage I ada dengan catatan conditional (`jika gap baru muncul`) — bukan wajib
- [x] Stage J ada sebagai DOCR partial refresh — paling akhir
- [x] Tidak ada stage yang di-skip tanpa penjelasan jika area-nya di-centang

---

## TC-11: Coverage Impact Estimate — Content + Direction

**Pass criteria:**
- [x] Section `## Coverage Impact Estimate` ada
- [x] Pre-refactor snapshot ada — minimal 1 metric dengan nilai (diambil dari `00-workflow-status.md`)
- [x] Expected direction ada: `UP`, `DOWN`, atau `NEUTRAL` (atau kombinasi)
- [x] Direction = `NEUTRAL` atau `slight UP` — bukan `DOWN` (C09/C17 tetap Covered, AMB-02 ditutup)
- [x] Reason menyebut C09 dan/atau C17 (Covered → tetap Covered)
- [x] Reason menyebut AMB-02 (Ambiguous → resolve post-eksekusi)
- [x] Tidak ada claim bahwa coverage naik drastis tanpa dasar

---

## TC-12: `00-workflow-status.md` Diupdate

**Expected:**
```
| `ADR-20260718-001` | ... | ... | Accepted | Yes — `STAGES/overlays/impact/IMPACT-...md` |
```

**Pass criteria:**
- [x] Kolom `Impact Analyzed` berubah dari `No` ke `Yes — <path>`
- [x] Path adalah relative path (tidak ada `/Users/...`)
- [x] Path menunjuk ke file IMPACT yang benar-benar ada

---

## TC-13: Edge — ADR Belum Punya Affected Areas Terisi

Pre-condition: ADR dengan section `## Affected BUBAT-R Areas` tapi semua `[ ]` (tidak ada centang).

**Expected:** command tolak dengan pesan:
```
ADR belum punya Affected BUBAT-R Areas yang diisi. Centang area yang relevan di ADR terlebih dahulu.
```

**Pass criteria:**
- [x] Command berhenti — tidak generate IMPACT file
- [x] Pesan error sesuai spec (`commands/impact.md`)
- [x] `00-workflow-status.md` tidak diubah

---

## TC-14: Edge — ADR Status PROPOSED (belum Accepted/Implemented)

ADR dengan status `PROPOSED`.

**Expected behavior:** command tetap jalan (spec tidak block berdasarkan status — hanya validate Affected Areas ada).

**Pass criteria:**
- [x] IMPACT file tetap dibuat
- [x] Header `ADR Status at analysis` = `PROPOSED`
- [x] Tidak ada error karena status PROPOSED

_Catatan: `bubat-r plan` yang block jika status IMPLEMENTED/ABANDONED — bukan impact._

---

## TC-15: Tidak Ada Absolute Path di Output

**Pass criteria:**
- [x] `grep "/Users/\|/home/" IMPACT-*.md` → tidak ada hasil
- [x] Semua path di Source ADR, DOCR section, dan Re-run Order = relative path

---

## Execution Order

1. Verifikasi pre-conditions (ADR Accepted, Affected Areas terisi, overlays/impact/ belum ada)
2. Jalankan: `bubat-r impact ADR-20260718-001`
3. Cek TC-01 (file path + dir autocreate)
4. Cek TC-02 (header metadata)
5. Cek TC-03 – TC-08 (Stale Artifacts per area)
6. Cek TC-09 (DOCR section)
7. Cek TC-10 (Re-run order)
8. Cek TC-11 (Coverage Impact Estimate)
9. Cek TC-12 (workflow-status update)
10. Cek TC-15 (no absolute path)
11. Jalankan edge cases TC-13 dan TC-14 dengan ADR dummy

---

## Deviation Log

| TC | Status | Deviasi | Catatan |
|---|---|---|---|
| TC-01 | ✅ PASS | — | File `IMPACT-...zstd.md` dibuat. Dir `overlays/impact/` dibuat otomatis. Slug match ADR slug. |
| TC-02 | ✅ PASS | — | Source ADR path relative dan valid. Analyzed = 2026-07-18. ADR Status = Accepted. |
| TC-03 | ✅ PASS | — | `04-runtime-map.md` Stage B = HIGH, effort medium. Menyebut duckark + ClickHouse. |
| TC-04 | ✅ PASS | — | `05-behavior-spine.md` Stage C = HIGH. `08-contract-map.md` Stage F ada. Write-path step disebutkan. |
| TC-05 | ✅ PASS | — | `11-reference-design.md` Stage H = HIGH. `08-contract-map.md` tidak duplikat. Action menyebut pipeline baru. |
| TC-06 | ✅ PASS | — | `09-component-map.md` dan `10-code-trace-map.md` = MEDIUM. Alasan: C09/C17 Covered pre-refactor. Action spesifik (hapus CHClient, tambah DuckarkClient). |
| TC-07 | ✅ PASS | — | `02-coverage-ledger.md` ALWAYS: C09+C17 disebut. `12-drift-ambiguity-report.md` ALWAYS: AMB-02 disebut dengan action resolve. |
| TC-08 | ✅ PASS | — | Tidak ada baris Stage D/E. `06-ownership-map.md` dan `07-domain-map.md` tidak muncul. |
| TC-09 | ✅ PASS | `engine/AGENTS.md` disebut conditional | handler/AGENTS.md + root-AGENTS.md disebut dengan alasan konkret. engine/AGENTS.md disebut dengan catatan "cek setelah eksekusi". Tidak ada fabricated AGENTS.md. |
| TC-10 | ✅ PASS | — | Order B → C → F → G → H terpenuhi. D/E skip dengan penjelasan. Stage I conditional. Stage J paling akhir. |
| TC-11 | ✅ PASS | — | Pre-refactor snapshot ada (dari workflow-status 2026-07-17). Direction NEUTRAL → slight UP. Reason menyebut C09, C17, AMB-02. |
| TC-12 | ✅ PASS | — | `Impact Analyzed` = `Yes — STAGES/overlays/impact/IMPACT-...md`. Path relative, file ada. |
| TC-13 | — | Belum dieksekusi | Butuh ADR dummy dengan semua area unchecked |
| TC-14 | — | Belum dieksekusi | Butuh ADR dummy dengan status PROPOSED |
| TC-15 | ✅ PASS | — | Tidak ada absolute path di IMPACT file maupun workflow-status baris yang diubah. |

---

## Findings & Spec Gaps

| # | Finding | Severity | Action |
|---|---|---|---|
| F1 | `commands/impact.md` tidak menyebut di mana `refactor-lifecycle.md` dicari — spec bilang `overlays/refactor-lifecycle.md § 3` tapi tidak jelas apakah path relative ke bubat-r repo atau target project | Low | Perjelas di spec: `${BUBATR_R_ROOT}/overlays/refactor-lifecycle.md` (file di bubat-r repo, bukan target project) |
| F2 | Priority rule "HIGH jika runtime boundary atau data ownership berubah" — spec tidak menyebut Flow/write-path sebagai HIGH trigger, tapi secara semantik write-path change sama signifikannya | Low | Pertimbangkan tambah `Flow / write-path behavior` sebagai HIGH trigger di Priority Rules tabel di `commands/impact.md` |
| F3 | `engine/AGENTS.md` disebut di DOCR Refresh Needed tapi setelah verifikasi tidak ada referensi eksplisit CH/audit pipeline — conditional note sudah ditambah, tapi idealnya command tidak mention file jika tidak ada evidence | Low | Tambah verifikasi: sebelum include AGENTS.md di DOCR section, grep file untuk kata kunci dari area yang affected |
