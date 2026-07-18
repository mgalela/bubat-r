# RFC: BUBAT-R Refactoring SDLC Loop

Status: draft  
Scope: integrated refactoring lifecycle — dari gap discovery sampai artifact refresh  
Companion docs: `docs/workflow.md`, `commands/gap.md`, `commands/research.md`

---

## Problem

BUBAT-R kuat untuk rekonstruksi → discovery → gap deepening, tapi tidak punya jalur resmi dari temuan ke eksekusi dan kembali ke artifacts.

Gap yang ada saat ini:

1. **ADR tidak tersumber dari artifacts.** "Latar Belakang" ditulis manual — bisa miss evidence penting yang sudah ada di `coverage-ledger.md` atau `drift-ambiguity-report.md`.
2. **Refactor plan tidak terhubung ke BUBAT-R.** Plan ditulis lepas, scope tidak dipetakan ke stage mana yang akan stale setelah perubahan.
3. **Tidak ada impact detection post-refactor.** Setelah kode berubah, tidak ada mekanisme untuk tahu artifacts mana yang outdated. Coverage ledger dan reference design bisa drift dari kode aktual tanpa terdeteksi.
4. **`bubat-r gap` tidak punya jalur ke "buat refactor plan".** Gap ditemukan, ditutup, selesai — padahal gap bisa jadi trigger ADR yang perlu eksekusi.

Akibatnya: BUBAT-R adalah tool rekonstruksi yang baik, tapi berhenti sebelum SDLC loop tertutup.

---

## Solution

Tiga command baru yang menutup loop:

```
bubat-r adr <title>        — buat ADR tersumber dari artifacts
bubat-r plan <adr-id>      — generate refactor plan dari ADR
bubat-r impact <adr-id>    — identifikasi stale artifacts setelah refactor done
```

Lifecycle lengkap:

```
[existing artifacts: gap, coverage-ledger, drift-report, research memos]
        │
        ▼
  bubat-r adr <title>
        │  pre-fills: Latar Belakang dari artifact evidence
        │  output: ADR + Affected BUBAT-R Areas checklist
        ▼
  bubat-r plan <adr-id>
        │  pre-fills: Goal, Inventory, Risk dari ADR Migration Plan
        │  output: refactor-tasklist (phased, granular, junior-friendly)
        ▼
  [developer execute phases — update plan per phase: Executed / Results / Findings]
        │
        ▼
  [ADR status update: IMPLEMENTED]
        │
        ▼
  bubat-r impact <adr-id>
        │  reads: Affected BUBAT-R Areas dari ADR
        │  output: IMPACT file dengan stale artifact list + recommended re-run
        ▼
  [targeted stage refresh — hanya stages yang listed di IMPACT]
        │
        └───────────────────────────────────► [coverage naik, siklus ulang]
```

Tidak ada format baru yang dipaksakan. ADR mengikuti format yang sudah dipakai di project target. Refactor plan mengikuti template yang sudah dipakai di project target. BUBAT-R hanya menambah dua section wajib di ADR sebagai hook untuk `bubat-r impact`.

---

## Command: `bubat-r adr <title>`

### Intent

```text
bubat-r adr <title>
bubat-r adr "ganti CLI binary DuckDB ke embedded library"
bubat-r adr "pisah reporting gateway ke trx-engine"
```

### Input Sources (dibaca otomatis)

| Artifact | Yang Diambil |
|---|---|
| `02-coverage-ledger.md` | Rows dengan status: `Partial`, `Covered with Critical Risk`, `Contradicted`, `Accepted Gap` |
| `12-drift-ambiguity-report.md` | Semua unresolved contradictions |
| `STAGES/I/gaps/GAP-*.md` | Closed/blocked gaps sebagai evidence untuk Latar Belakang |
| `STAGES/overlays/research/*.md` | Research memos yang relevan ke title |

### Protocol

1. Tentukan `${BUBATR_HOME}`.
2. Baca artifacts per daftar di atas. Jika artifact tidak ada (stage belum run), skip dengan catatan.
3. Filter evidence yang relevan ke scope `<title>` — jangan dump semua rows ke ADR.
4. Buat file `${BUBATR_HOME}/STAGES/overlays/adrs/ADR-YYYY-MM-DD-<slug>.md`.
5. Pre-fill section berikut dari artifact evidence:
   - **Latar Belakang** — cite coverage-ledger rows dan contradiction sebagai "Fakta" table
   - **BUBAT-R Evidence Source** — tabel link ke artifact rows yang jadi input
   - **Affected BUBAT-R Areas** — checklist stage berdasarkan scope perubahan (lihat mapping di bawah)
6. Sisakan section `Problem`, `Keputusan`, `Alasan`, `Alternatif`, `Konsekuensi`, `Migration Plan` untuk diisi user.
7. Update `STAGES/A/00-workflow-status.md` — tambah baris di `## Active Refactoring Cycles`.

### Output: ADR Template

ADR mengikuti format project target. Dua section BUBAT-R ditambahkan sebagai section tersendiri:

```markdown
## BUBAT-R Evidence Source

| Artifact | Row / Section | Status | Citation |
|---|---|---|---|
| coverage-ledger | <area> / <item> | Partial | Stage I GAP-001 |
| drift-report | <area> | Contradicted | Stage H row 23 |

> Sumber ini dibaca otomatis oleh `bubat-r impact` setelah ADR IMPLEMENTED.

## Affected BUBAT-R Areas

Centang area yang berubah akibat keputusan ADR ini.
`bubat-r impact` membaca section ini untuk menentukan stale artifacts.

- [ ] Runtime boundary / executable unit  → Stage B (runtime-map), Stage G (component-map)
- [ ] Flow / behavior                     → Stage C (behavior-spine), Stage F (contract-map)
- [ ] Data ownership / entity             → Stage D (ownership-map), Stage E (domain-map)
- [ ] API / external contract             → Stage F (contract-map), Stage H (reference-design)
- [ ] Component structure                 → Stage G (component-map), Stage H (reference-design)
- [ ] Code trace (any code change)        → Stage H (code-trace-map) — centang ini selalu
- [ ] DOCR area affected                  → Stage J (AGENTS.md refresh needed)
```

### Affected Area → Stage Mapping

| Centang | Artifacts yang stale |
|---|---|
| Runtime boundary | `04-runtime-map.md`, `09-component-map.md` |
| Flow / behavior | `05-behavior-spine.md`, `08-contract-map.md` |
| Data ownership | `06-ownership-map.md`, `07-domain-map.md` |
| API / contract | `08-contract-map.md`, `11-reference-design.md` |
| Component structure | `09-component-map.md`, `10-code-trace-map.md`, `11-reference-design.md` |
| Code trace (always) | `10-code-trace-map.md`, `02-coverage-ledger.md`, `12-drift-ambiguity-report.md` |
| DOCR affected | nearest `AGENTS.md` per `docr-candidates.md` |

---

## Command: `bubat-r plan <adr-id>`

### Intent

```text
bubat-r plan <adr-id>
bubat-r plan ADR-2026-07-16-duckdb-primary-dwh
```

`<adr-id>` adalah filename tanpa extension, atau path lengkap ke ADR file.

### Pre-condition

ADR harus ada di `STAGES/overlays/adrs/`. Status `Proposed` atau `Accepted` — keduanya valid.

### Protocol

1. Baca ADR file target.
2. Extract:
   - `Keputusan` → jadi `Goal` di plan
   - `Migration Plan` → jadi draft phases
   - `Konsekuensi (Negatif)` + coverage-ledger risks → jadi `Risk callouts`
   - `Shape Implementasi` → jadi `Inventory being replaced / added` table
3. Buat file `${BUBATR_HOME}/STAGES/overlays/plans/refactor-tasklist-<slug>.md`.
4. Template ikut format project target (baca dari `docs/issues/CONTEXT.md` jika ada, atau pakai template built-in).
5. Phase A selalu additive (schema / stub / DAO) — enforce ini di generated draft.
6. Tiap task harus punya: target file/symbol, aksi konkret, cara verifikasi.
7. Update `STAGES/A/00-workflow-status.md` — tambah kolom `Plan` di baris ADR yang sesuai.

### Task Granularity Rule

Task yang terlalu abstrak tidak diterima di generated plan:

| Tidak diterima | Harus diganti dengan |
|---|---|
| "refactor auth middleware" | "extract `verifyToken()` dari `middleware/auth.ts:45` ke `lib/jwt.ts`" |
| "update tests" | "update `TestAuthMiddleware` di `middleware/auth_test.ts:12` — tambah case token expired" |
| "cleanup old code" | "hapus `legacy/auth_v1.go` setelah gate: `grep -r 'auth_v1'` returns empty" |

Junior developer harus bisa kerjakan satu task tanpa membaca seluruh ADR.

---

## Command: `bubat-r impact <adr-id>`

### Intent

```text
bubat-r impact <adr-id>
bubat-r impact ADR-2026-07-16-duckdb-primary-dwh
```

Dijalankan setelah ADR status diupdate ke `IMPLEMENTED`.

### Protocol

1. Baca ADR file target.
2. Baca `## Affected BUBAT-R Areas` — kumpulkan semua centang yang `[x]`.
3. Map ke artifact list per tabel di section `bubat-r adr` (stage mapping).
4. Cek `docr-candidates.md` — jika area yang affected punya DOCR candidate, tandai sebagai `DOCR refresh needed`.
5. Baca `STAGES/A/00-workflow-status.md` — ambil highest completed stage dan last known coverage.
6. Buat file `${BUBATR_HOME}/STAGES/overlays/impact/IMPACT-<adr-id>.md`.
7. Update `STAGES/A/00-workflow-status.md` — update baris ADR: kolom `Impact Analyzed` = `Yes`.

### Output: IMPACT File

```markdown
# Impact Report — <ADR title>

Source ADR: STAGES/overlays/adrs/<adr-file>.md
Analyzed: YYYY-MM-DD
ADR Status at analysis: IMPLEMENTED

## Stale Artifacts

| Priority | Artifact | Stage | Recommended Action | Effort |
|---|---|---|---|---|
| HIGH | 04-runtime-map.md | B | re-run Stage B for <area> boundary | medium |
| HIGH | 09-component-map.md | G | update <component> entry | small |
| MEDIUM | 11-reference-design.md | H | update deployment shape section | small |
| ALWAYS | 02-coverage-ledger.md | — | update rows for <area> | small |
| ALWAYS | 12-drift-ambiguity-report.md | — | resolve contradiction: <desc> | small |

## DOCR Refresh Needed

- `<path>/<subdir>/.bubat-r/STAGES/J/` — AGENTS.md needs update (area: <area>)

## Recommended Re-run Order

1. Stage B (runtime-map) — area: <affected area>
2. Stage G (component-map) — area: <affected component>
3. Stage H (reference-design) — section: <section>
4. Stage I if new gaps surface after re-run

## Coverage Impact Estimate

Pre-refactor coverage snapshot: NN% (from 00-workflow-status.md)
Expected direction: UP — <area> was Partial/Contradicted, refactor resolves it
Re-run Stage B–H for affected area, then re-score coverage-ledger.
```

### Priority Rules

| Priority | Kondisi |
|---|---|
| HIGH | Area ada di `coverage-ledger.md` dengan status `Partial` atau `Contradicted` sebelum refactor |
| HIGH | Runtime boundary atau ownership berubah |
| MEDIUM | Component atau reference design berubah tapi coverage sudah `Covered` |
| ALWAYS | `coverage-ledger.md` dan `drift-ambiguity-report.md` — selalu stale setelah kode berubah |

---

## Extension: `00-workflow-status.md`

Tambah section `## Active Refactoring Cycles` setelah `## Active Gaps`:

```markdown
## Active Refactoring Cycles

| ADR | Plan | ADR Status | Impact Analyzed |
|---|---|---|---|
| `STAGES/overlays/adrs/ADR-2026-07-16-duckdb-primary-dwh.md` | `STAGES/overlays/plans/refactor-tasklist-g1-g5.md` | IMPLEMENTED | Yes — `STAGES/overlays/impact/IMPACT-duckdb.md` |
```

Field `Impact Analyzed`:
- `No` — ADR belum IMPLEMENTED atau `bubat-r impact` belum dijalankan
- `Yes — <path>` — IMPACT file sudah ada, link ke file tersebut

---

## Folder Structure

```
${BUBATR_HOME}/STAGES/overlays/
  adrs/
    ADR-YYYY-MM-DD-<slug>.md
  plans/
    refactor-tasklist-<slug>.md
  plans/
    (existing) research/
  impact/
    IMPACT-<adr-slug>.md
```

`overlays/` sudah ada untuk research memos. ADR, plans, dan impact menjadi sub-folder baru di dalamnya — tidak ada direktori baru di level atas.

---

## Files yang Perlu Dibuat

| File | Keterangan |
|---|---|
| `commands/adr.md` | Command spec untuk `bubat-r adr` |
| `commands/plan.md` | Command spec untuk `bubat-r plan` |
| `commands/impact.md` | Command spec untuk `bubat-r impact` |
| `templates/adr/ADR-template.md` | ADR template dengan dua BUBAT-R sections |
| `templates/refactor-plan/PLAN-template.md` | Refactor plan template (built-in fallback) |
| `docs/workflow.md` | Tambah section: Refactoring SDLC Loop |
| `CONTEXT.md` | Tambah 3 command baru ke command table |

`templates/refactor-plan/PLAN-template.md` adalah fallback. Jika project target punya `docs/issues/CONTEXT.md` sendiri (seperti jiel), `bubat-r plan` membaca template dari sana dan tidak pakai built-in.

---

## Constraints

**Tidak ada format baru yang dipaksakan.** ADR dan refactor plan mengikuti konvensi project target. Jika target tidak punya template, BUBAT-R menyediakan built-in fallback. BUBAT-R hanya menambah dua section (`BUBAT-R Evidence Source`, `Affected BUBAT-R Areas`) ke ADR project target — bukan mengganti seluruh format.

**`bubat-r impact` tidak otomatis re-run stage.** Hanya menghasilkan IMPACT file berisi recommended action. Re-run tetap keputusan user — bisa via `bubat-r gap`, `bubat-r run`, atau manual update.

**ADR bisa dibuat tanpa artifacts.** Jika tidak ada Stage A–H yang sudah run, `bubat-r adr` tetap bisa dijalankan — hanya section `BUBAT-R Evidence Source` yang kosong. Tidak ada hard prerequisite.

**Gap → ADR bukan wajib.** `bubat-r gap` bisa tutup gap tanpa membuat ADR. ADR hanya dibuat kalau gap atau temuan butuh formal keputusan arsitektur dan rencana eksekusi.

---

## Test Plan

Test plan ini memverifikasi maturity RFC — bahwa commands berperilaku sesuai spec, edge cases ditangani, dan loop SDLC benar-benar tertutup.

Setiap test case: **ID**, **Setup**, **Input**, **Expected**, **Pass Criteria** (cara verifikasi objektif).

---

### T-ADR: `bubat-r adr`

**T-ADR-01 — No artifacts**

Setup: STAGES/ kosong, tidak ada Stage A–H yang run.  
Input: `bubat-r adr "pisah reporting gateway"`  
Expected:
- File `STAGES/overlays/adrs/ADR-<date>-pisah-reporting-gateway.md` dibuat.
- Section `BUBAT-R Evidence Source` berisi: `No artifacts available — run bubat-r run first for evidence-backed ADR.`
- Section `Affected BUBAT-R Areas` seluruhnya `[ ]`.
- `00-workflow-status.md` tidak diupdate (file tidak ada) — noted di output.

Pass: file ada, Evidence Source tidak kosong asal-asalan (berisi pesan eksplisit), tidak ada fabricated rows.

---

**T-ADR-02 — Evidence filter: hanya ambil rows bermasalah**

Setup: `coverage-ledger.md` ada dengan rows:
- Auth / token-verify: `Partial`, Weight 5
- Auth / login-flow: `Covered`, Weight 5
- Billing / invoice: `Contradicted`, Weight 4

Input: `bubat-r adr "refactor auth middleware"`  
Expected:
- Evidence Source include: Auth / token-verify (Partial), Billing / invoice (Contradicted jika area match)
- Evidence Source NOT include: Auth / login-flow (Covered, tidak bermasalah)

Pass: grep Evidence Source table — baris `Covered` tidak muncul tanpa catatan risk.

---

**T-ADR-03 — Affected Areas heuristic: title "pisah module"**

Setup: artifacts ada atau tidak ada.  
Input: `bubat-r adr "pisah dwhduck ke module terpisah"`  
Expected:
- `[x] Component structure / decomposition` — terdeteksi dari kata "pisah" dan "module"
- `[x] Code trace` — selalu dicentang
- `[ ] Runtime boundary`, `[ ] Flow`, `[ ] Data ownership`, `[ ] API / contract` — tidak dicentang

Pass: baca generated ADR — Component structure dan Code trace `[x]`, sisanya `[ ]`.

---

**T-ADR-04 — Affected Areas heuristic: title "ganti runtime server"**

Input: `bubat-r adr "ganti runtime server ke embedded container"`  
Expected: `[x] Runtime boundary / executable unit`, `[x] Code trace`. Sisanya `[ ]`.

---

**T-ADR-05 — GAP file Blocked masuk ke Evidence**

Setup: `STAGES/I/gaps/GAP-001-auth-boundary.md` dengan `Status: Blocked`, area "auth".  
Input: `bubat-r adr "refactor auth boundary"`  
Expected: GAP-001 muncul di Evidence Source dengan kolom Citation = `STAGES/I/gaps/GAP-001-auth-boundary.md`.

Pass: Evidence Source table punya baris GAP file dengan path yang benar.

---

**T-ADR-06 — Research memo: hanya key finding, bukan full memo**

Setup: `STAGES/overlays/research/research-auth-propagation.md` ada, question = "how auth claims propagate", area match "auth".  
Input: `bubat-r adr "refactor auth token propagation"`  
Expected: Evidence Source include satu baris untuk research memo — hanya recommended action atau key finding, bukan paste seluruh memo.

Pass: length baris research di Evidence Source ≤ 3 kalimat.

---

**T-ADR-07 — Slug derivation**

Input: `bubat-r adr "Ganti CLI Binary DuckDB ke Embedded Library (CGO)"`  
Expected output filename: `ADR-<date>-ganti-cli-binary-duckdb-ke-embedded-library-cgo.md`

Pass: filename lowercase, spasi → `-`, tanda kurung dan karakter non-alphanumeric dihapus, tidak ada double `--`.

---

**T-ADR-08 — 00-workflow-status.md diupdate**

Setup: `STAGES/A/00-workflow-status.md` ada.  
Input: `bubat-r adr "pisah reporting gateway"`  
Expected: section `## Active Refactoring Cycles` muncul atau diupdate — row baru dengan path ADR, Plan = `—`, ADR Status = `Proposed`, Impact = `No`.

Pass: grep `## Active Refactoring Cycles` di workflow-status — row ADR ada.

---

**T-ADR-09 — Project target punya format ADR sendiri**

Setup: project target punya `docs/adr/` dengan file ADR yang menggunakan format berbeda (misal: Status di atas, sections berbahasa Inggris).  
Input: `bubat-r adr "extract auth lib"`  
Expected: generated ADR mengikuti format target (bukan template built-in), dua section BUBAT-R (`## BUBAT-R Evidence Source`, `## Affected BUBAT-R Areas`) muncul sebagai section tambahan di akhir file.

Pass: ADR tidak punya section dari template built-in yang tidak ada di format target. Dua BUBAT-R sections ada.

---

### T-PLAN: `bubat-r plan`

**T-PLAN-01 — ADR status IMPLEMENTED → ditolak**

Setup: ADR ada dengan `Status: **IMPLEMENTED**`.  
Input: `bubat-r plan ADR-2026-07-16-duckdb-primary-dwh`  
Expected: error message `ADR sudah final. Buat ADR baru untuk wave refactor berikutnya.` Tidak ada file plan yang dibuat.

Pass: `STAGES/overlays/plans/` tetap kosong. Error message tampil.

---

**T-PLAN-02 — ADR status ABANDONED → ditolak**

Sama dengan T-PLAN-01 tapi status `ABANDONED`.

---

**T-PLAN-03 — ADR tanpa Migration Plan dan tanpa Keputusan → diblok**

Setup: ADR ada tapi section `## Keputusan` dan `## Migration Plan` tidak ada (hanya header dan Problem).  
Input: `bubat-r plan <adr-id>`  
Expected: error `Migration Plan di ADR belum ada. Isi section Migration Plan terlebih dahulu.`

Pass: tidak ada file plan dibuat.

---

**T-PLAN-04 — ADR punya Keputusan tapi tidak ada Migration Plan**

Setup: ADR punya `## Keputusan` tapi `## Migration Plan` tidak ada.  
Input: `bubat-r plan <adr-id>`  
Expected:
- File plan dibuat.
- `## Goal` diisi dari `## Keputusan`.
- Phase A ada sebagai placeholder: `[TODO: decompose Migration Plan dari ADR]`.
- ⚠️ note: `Migration Plan belum ada di ADR — phase perlu diisi manual.`

Pass: file plan ada, Goal tidak kosong, Phase A punya placeholder tidak kosong.

---

**T-PLAN-05 — ADR Migration Plan Phase A cutover → warning ditambahkan**

Setup: ADR Migration Plan Phase A berisi "hapus seluruh auth lama dan ganti dengan auth baru."  
Input: `bubat-r plan <adr-id>`  
Expected: Phase A di plan punya note `⚠️ Pastikan phase ini additive — jangan cutover di Phase A.`

Pass: grep `⚠️` di Phase A section plan.

---

**T-PLAN-06 — Task abstrak dari ADR → flagged**

Setup: ADR Migration Plan berisi task: "refactor auth middleware", "update tests".  
Expected: generated plan punya note per task abstrak: `[TODO: decompose — tambahkan target file/symbol dan gate sebelum eksekusi]`

Pass: tidak ada task di plan yang hanya satu kata kerja tanpa file target.

---

**T-PLAN-07 — Project target punya docs/issues/CONTEXT.md → ikuti template target**

Setup: project target punya `docs/issues/CONTEXT.md` dengan `## Refactor Plan Template`.  
Expected: generated plan mengikuti format dari CONTEXT.md, bukan `templates/refactor-plan/PLAN-template.md`.

Pass: plan file punya section-section dari CONTEXT.md template (e.g. "Phase status" table dengan emoji legend).

---

**T-PLAN-08 — Tidak ada template target → fallback ke built-in**

Setup: project target tidak punya `docs/issues/CONTEXT.md`.  
Expected: generated plan mengikuti `templates/refactor-plan/PLAN-template.md`.

Pass: plan file punya "Checklist Sebelum Mulai" dan "Checklist Akhir Tiap Phase" dari built-in template.

---

**T-PLAN-09 — 00-workflow-status.md Plan column diupdate**

Setup: ADR row sudah ada di `## Active Refactoring Cycles` dengan Plan = `—`.  
Input: `bubat-r plan <adr-id>`  
Expected: Plan column di row ADR diupdate ke path plan file.

Pass: grep plan file path di 00-workflow-status.md.

---

### T-IMP: `bubat-r impact`

**T-IMP-01 — ADR tanpa ## Affected BUBAT-R Areas → error**

Setup: ADR ada tapi section `## Affected BUBAT-R Areas` tidak ada.  
Input: `bubat-r impact <adr-id>`  
Expected: error `ADR belum punya Affected BUBAT-R Areas yang diisi.`

Pass: tidak ada IMPACT file dibuat.

---

**T-IMP-02 — Affected Areas semua unchecked → error**

Setup: ADR punya `## Affected BUBAT-R Areas` tapi semua `[ ]`.  
Expected: error `Tidak ada area yang dicentang di Affected BUBAT-R Areas.`

---

**T-IMP-03 — Hanya "Code trace" yang dicentang**

Setup: ADR dengan hanya `[x] Code trace` dicentang.  
Expected IMPACT file Stale Artifacts:
- `ALWAYS` | `02-coverage-ledger.md`
- `ALWAYS` | `10-code-trace-map.md`
- `ALWAYS` | `12-drift-ambiguity-report.md`
- Tidak ada HIGH atau MEDIUM rows.

Pass: IMPACT table hanya punya 3 baris ALWAYS.

---

**T-IMP-04 — Runtime boundary dicentang, area Partial di coverage-ledger → priority HIGH**

Setup: `[x] Runtime boundary` dicentang. Coverage-ledger: area "dwhduck runtime" = `Partial`.  
Expected: `04-runtime-map.md` dan `09-component-map.md` di IMPACT dengan Priority = `HIGH`.

---

**T-IMP-05 — Component structure dicentang, area sudah Covered di coverage-ledger → priority MEDIUM**

Setup: `[x] Component structure` dicentang. Coverage-ledger: area "dwhduck component" = `Covered`.  
Expected: `09-component-map.md`, `10-code-trace-map.md`, `11-reference-design.md` di IMPACT dengan Priority = `MEDIUM`.

---

**T-IMP-06 — Multiple areas dicentang → tidak ada duplikat artifact**

Setup: `[x] Flow`, `[x] API / contract` dicentang. Keduanya menghasilkan `08-contract-map.md`.  
Expected: `08-contract-map.md` muncul satu kali saja di IMPACT table.

Pass: grep `contract-map` di IMPACT table — hanya 1 baris.

---

**T-IMP-07 — DOCR area dicentang + docr-candidates.md ada dengan matching area**

Setup: `[x] DOCR area affected`. `docr-candidates.md` punya entry untuk area yang affected.  
Expected: `## DOCR Refresh Needed` section di IMPACT berisi path ke AGENTS.md area tersebut.

---

**T-IMP-08 — Re-run order mengikuti B→C→D→E→F→G→H**

Setup: `[x] Flow` dan `[x] Component structure` dicentang.  
Expected Recommended Re-run Order:
1. Stage C (behavior-spine) — sebelum G
2. Stage F (contract-map)
3. Stage G (component-map) — setelah C

Pass: urutan stage di IMPACT ascending (C sebelum G, tidak terbalik).

---

**T-IMP-09 — Coverage Impact Estimate diisi dari 00-workflow-status.md**

Setup: 00-workflow-status.md ada dengan Coverage Snapshot: Runtime coverage = 72%.  
Expected: IMPACT `## Coverage Impact Estimate` berisi `Pre-refactor coverage snapshot: 72%`.

---

**T-IMP-10 — ADR belum IMPLEMENTED → IMPACT tetap dibuat**

Setup: ADR status `Proposed`.  
Input: `bubat-r impact <adr-id>`  
Expected: IMPACT dibuat. Header: `ADR Status at analysis: Proposed`.

Pass: IMPACT file ada, ADR Status di header bukan hardcoded "IMPLEMENTED".

---

**T-IMP-11 — 00-workflow-status.md Impact column diupdate**

Setup: ADR row di `## Active Refactoring Cycles` dengan Impact = `No`.  
Input: `bubat-r impact <adr-id>`  
Expected: Impact column = `Yes — STAGES/overlays/impact/IMPACT-<slug>.md`.

Pass: grep `Yes —` di Active Refactoring Cycles row.

---

### T-INT: Integration (Full Lifecycle)

**T-INT-01 — Happy path: gap → adr → plan → impact**

Setup:
- Stage A–H selesai.
- coverage-ledger: area "reporting-gateway" = `Partial`, weight 5.
- GAP-002-reporting-gateway.md ada, Status: `Closed`.

Steps:
1. `bubat-r adr "pisah reporting gateway ke trx-engine"`
2. User isi Problem, Keputusan, Migration Plan di ADR. Centang `[x] Runtime boundary`, `[x] Flow`, `[x] Code trace`.
3. `bubat-r plan ADR-<date>-pisah-reporting-gateway-ke-trx-engine`
4. Simulate phase execution (update plan phases ke ✅ merged).
5. Update ADR Status ke `IMPLEMENTED`.
6. `bubat-r impact ADR-<date>-pisah-reporting-gateway-ke-trx-engine`

Expected:
- `STAGES/overlays/adrs/ADR-<date>-pisah-reporting-gateway-ke-trx-engine.md` ada.
- `STAGES/overlays/plans/refactor-tasklist-pisah-reporting-gateway-ke-trx-engine.md` ada.
- `STAGES/overlays/impact/IMPACT-ADR-<date>-pisah-reporting-gateway-ke-trx-engine.md` ada.
- `00-workflow-status.md § Active Refactoring Cycles`: row lengkap — ADR path, Plan path, Status IMPLEMENTED, Impact Yes + path.
- IMPACT berisi `04-runtime-map.md`, `05-behavior-spine.md` sebagai HIGH (area Partial sebelumnya).
- GAP-002 dikutip di ADR Evidence Source.

Pass: semua 3 output files ada, workflow-status row complete, IMPACT priority HIGH untuk area yang Partial.

---

**T-INT-02 — Multiple concurrent ADRs tidak saling interferensi**

Setup: dua ADRs berbeda active secara bersamaan.  
Steps:
1. `bubat-r adr "refactor auth"`
2. `bubat-r adr "ganti DuckDB CLI"`
3. `bubat-r plan` untuk masing-masing.
4. `bubat-r impact` untuk masing-masing.

Expected:
- Dua ADR files, dua plan files, dua IMPACT files — masing-masing terpisah.
- `## Active Refactoring Cycles` punya dua baris.
- IMPACT untuk auth tidak memuat artifact dari DuckDB scope, dan sebaliknya.

Pass: file count = 2 per type. Tidak ada content cross-contamination antar ADR.

---

**T-INT-03 — Traceability: gap → ADR → IMPACT → coverage ledger row**

Verify rantai referensi lengkap:
- GAP-001 area `auth-boundary` → dikutip di ADR Evidence Source
- ADR `Affected BUBAT-R Areas`: `[x] Runtime boundary`
- IMPACT: `04-runtime-map.md` (HIGH) dengan annotation area `auth-boundary`
- Setelah re-run Stage B: coverage-ledger row `auth-boundary` update dari `Partial` → `Covered`

Pass: dapat trace dari GAP ID ke coverage improvement via ADR + IMPACT tanpa ambiguitas.

---

### T-EDGE: Edge Cases

**T-EDGE-01 — Output directories tidak ada → dibuat otomatis**

Setup: `STAGES/overlays/adrs/`, `plans/`, `impact/` tidak ada.  
Expected: semua direktori dibuat saat command pertama dijalankan.

---

**T-EDGE-02 — ADR file sudah ada (same slug same day)**

Setup: `ADR-2026-07-18-refactor-auth.md` sudah ada.  
Input: `bubat-r adr "refactor auth"` di hari yang sama.  
Expected: warning ditampilkan: `ADR sudah ada: <path>. Overwrite? [y/N]` atau suffix `-2` ditambah ke slug.

Pass: tidak ada silent overwrite. User dikonfirmasi atau suffix dipakai.

---

**T-EDGE-03 — coverage-ledger ada tapi tidak ada rows yang match title**

Setup: coverage-ledger ada tapi semua area tidak overlap dengan title "pisah DuckDB".  
Expected: Evidence Source: `No relevant evidence found for this scope.`

Pass: bukan kosong, bukan fabricated rows — pesan eksplisit.

---

**T-EDGE-04 — 00-workflow-status.md tidak ada saat `bubat-r adr` dijalankan**

Expected: ADR tetap dibuat. Output mencatat: `00-workflow-status.md not found — Active Refactoring Cycles not updated.`

Pass: ADR file ada. Tidak ada crash.

---

**T-EDGE-05 — `bubat-r plan` dengan path absolut ke ADR file**

Input: `bubat-r plan /Users/user/project/.bubat-r/STAGES/overlays/adrs/ADR-2026-07-18-foo.md`  
Expected: plan file dibuat di `STAGES/overlays/plans/` di `${BUBATR_HOME}` yang tepat.

Pass: plan file ada di BUBATR_HOME, bukan di CWD random.

---

**T-EDGE-06 — Title dengan karakter non-ASCII**

Input: `bubat-r adr "pisah modul otorisasi"`  
Expected slug: `pisah-modul-otorisasi` (bukan URL-encode, bukan error).

---

### T-QUAL: Artifact Quality

**T-QUAL-01 — Evidence Source rows cite real artifact locations**

Check: setiap baris di `## BUBAT-R Evidence Source` punya Citation yang menunjuk ke file nyata (`STAGES/I/gaps/GAP-*.md`, `STAGES/A/02-coverage-ledger.md`, dsb.) — bukan fabricated reference.

Pass: buka setiap citation path — file harus ada dan area/row yang dikutip harus match.

---

**T-QUAL-02 — Plan tasks tidak ada yang lolos tanpa target file/symbol**

Check: scan semua task di generated plan — setiap `- [ ]` harus punya minimal satu path atau symbol konkret.

Pass: `grep -E "^\- \[ \]" plan-file.md` — tidak ada baris yang hanya berisi verb tanpa file/symbol.

---

**T-QUAL-03 — IMPACT re-run order ascending stage**

Check: `## Recommended Re-run Order` di setiap IMPACT file — stage number harus ascending (B < C < D < E < F < G < H).

Pass: parse stage letters dari re-run order list — tidak ada regression (G sebelum B, H sebelum C).

---

**T-QUAL-04 — File paths di IMPACT dan workflow-status relatif, bukan absolut**

Check: grep `/Users/` atau `/home/` di semua generated files.

Pass: tidak ada absolute path di output files.

---

**T-QUAL-05 — Slug deterministic**

Check: jalankan `bubat-r adr "Ganti CLI Binary DuckDB"` dua kali di hari berbeda tapi title sama.

Pass: slug portion identik (`ganti-cli-binary-duckdb`), hanya date prefix yang berbeda.

---

**T-QUAL-06 — ADR tanpa BUBAT-R sections tidak bisa jadi input `bubat-r impact`**

Check: ADR punya format project target tapi tanpa dua BUBAT-R sections.  
Expected: `bubat-r impact` error dengan pesan yang mengarahkan user untuk menambahkan `## Affected BUBAT-R Areas`.

Pass: tidak ada IMPACT yang dibuat dari ADR yang tidak punya BUBAT-R hook sections.
