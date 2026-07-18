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
