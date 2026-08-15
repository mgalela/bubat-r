# bubat-r plan

Generate refactor plan dari ADR. Output mengikuti format refactor tasklist project target.

Sumber utama tetap ADR. Issue files (mis. output [`lint-to-issues`](~/.claude/skills/lint2i/SKILL.md)) adalah **input opsional** via `--issues` — bisa jadi evidence tambahan untuk ADR, atau sumber berdiri sendiri kalau belum ada ADR.

> **Mode `--issues`:** semua aturan issue (flags, protocol tambahan, parsing, phase derivation, gate command, lint config, coverage) ada di [`commands/plan-issues.md`](./plan-issues.md). File ini hanya jalur ADR murni.

## Intent

```text
bubat-r plan <adr-id>
bubat-r plan ADR-2026-07-16-duckdb-primary-dwh
bubat-r plan STAGES/overlays/adrs/ADR-2026-07-16-duckdb-primary-dwh.md
```

`<adr-id>` adalah filename tanpa extension, atau path relatif/absolut ke ADR file.

Tambah issue sebagai input (detail → [`plan-issues.md`](./plan-issues.md)):

```text
bubat-r plan ADR-20260806-001 --issues docs/issues/INDEX.md   # ADR + issues
bubat-r plan --issues docs/issues/INDEX.md                    # issues saja
```

Tanpa `--issues`, command berjalan mode ADR murni (dijelaskan di bawah).

## Path Resolution

Tentukan `${BUBATR_HOME}`.

ADR file lookup:

1. Jika argumen adalah path (mengandung `/`): resolve langsung.
2. Jika argumen adalah ID: cari `${BUBATR_HOME}/STAGES/overlays/adrs/<adr-id>.md`.

Template lookup (prioritas):

1. Cari `docs/issues/CONTEXT.md` di project target root — jika ada, baca section `## Refactor Plan Template`.
2. Jika tidak ada: gunakan `${BUBATR_HOME}/templates/refactor-plan/PLAN-template.md` (built-in).

Output:

- `${BUBATR_HOME}/STAGES/overlays/plans/PL-<adr-code>.md` — e.g. `PL-ADR-20260718-001.md`
- Opsional short suffix: `PL-<adr-code>-<short>.md` — hanya jika user sediakan label pendek (≤30 char, no spaces)
- `<adr-code>` diambil dari baris pertama ADR file (`adr-code: ADR-YYYYMMDD-NNN`)

Naming di atas berlaku selama ada ADR — termasuk saat ADR dikombinasi dengan `--issues`. Naming untuk mode issue-only ada di [`plan-issues.md`](./plan-issues.md#output-naming-issue-only).

## Protocol

Jalur utama (mode ADR). Kalau `--issues` dipakai, jalankan juga protocol tambahan di [`plan-issues.md`](./plan-issues.md#protocol-tambahan).

1. Tentukan `${BUBATR_HOME}`.
2. Baca ADR file target.
3. Validasi pre-condition:
   - ADR file ada → lanjut.
   - ADR status bukan `IMPLEMENTED` atau `ABANDONED` → lanjut. Jika ya: tolak dengan pesan `ADR sudah final. Buat ADR baru untuk wave refactor berikutnya.`
   - ADR punya section `Migration Plan` atau minimal `Keputusan` → lanjut. Jika tidak ada keduanya: tulis `Migration Plan di ADR belum ada. Isi section Migration Plan terlebih dahulu.`
4. Resolve template (lihat Template Lookup di atas).
5. Extract dari ADR:
   - `Keputusan` → `## Goal` di plan
   - `Migration Plan` phases → draft phases di plan
   - `Konsekuensi (Negatif)` + risk rows dari `## BUBAT-R Evidence Source` → `## Risk callouts`
   - `Shape Implementasi` inventory table → `### Inventory being replaced / added`
   - ADR `Status`, `Date`, `Owners` → header plan
6. Derive `<slug>` dari ADR title (lowercase, spasi → `-`).
7. Buat direktori `${BUBATR_HOME}/STAGES/overlays/plans/` jika belum ada.
8. Tulis refactor plan.
9. Enforce Phase A rule: Phase A di generated plan selalu additive (schema / stub / DAO). Jika ADR Migration Plan Phase A bukan additive, tambah note di task: `⚠️ Pastikan phase ini additive — jangan cutover di Phase A.`
10. Enforce task granularity (lihat aturan di bawah).
11. Update `${BUBATR_HOME}/STAGES/A/00-workflow-status.md`:
    - Update baris ADR di `## Active Refactoring Cycles`: isi kolom Plan = path ke plan file.
12. Tulis ke plan file section `## Detail Plans` dengan placeholder:
    ```markdown
    ## Detail Plans

    _Belum dibuat. Jalankan `bubat-r plan-detail <plan-id>` untuk generate per-phase detail files._
    ```

## Task Granularity Rules

Setiap task di generated plan harus punya tiga elemen:

1. **Target** — file path dan symbol konkret (bukan "auth module")
2. **Aksi** — verb konkret: `extract`, `hapus`, `tulis ulang`, `pindahkan`, `tambah`, `update`
3. **Gate** — cara verifikasi: test yang harus pass, grep yang harus return empty, build yang harus clean

Task yang terlalu abstrak tidak diterima:

| Tidak diterima             | Harus diganti dengan                                                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| "refactor auth middleware" | "extract `verifyToken()` dari `middleware/auth.go:45` ke `lib/jwt.go` — gate: `go build ./...` clean + `TestAuthMiddleware` pass"      |
| "update tests"             | "update `TestDWHClient` di `client_test.go:12` — tambah case: nil db returns error"                                                    |
| "cleanup old code"         | "hapus `legacy/dwhduck_cli.go` — gate: `grep -r 'defaultDuckDBCLI' .` returns empty"                                                   |
| "pisah module"             | "buat `tools/dwhduck/go.mod` dengan `module dwhduck`, tambah `replace` ke root module — gate: `cd tools/dwhduck && go mod tidy` clean" |

Jika ADR Migration Plan sudah granular: salin langsung dan format sebagai checklist tasks.
Jika ADR Migration Plan masih high-level: decompose per file/symbol yang disebutkan di `Shape Implementasi`.

Junior developer harus bisa kerjakan satu task tanpa membaca seluruh ADR.

Aturan tambahan khusus task turunan issue ada di [`plan-issues.md`](./plan-issues.md#task-granularity--tambahan-issue).

## Output: Refactor Plan File

Format output mengikuti template yang ditemukan. Selalu ada header:

```markdown
**Companion to:** `STAGES/overlays/adrs/<adr-file>.md`
**Generated by:** `bubat-r plan`
**Date opened:** YYYY-MM-DD
**Status:** ⏳ pending
```

Kalau sumbernya issue saja (tanpa ADR), ganti baris `Companion to` dan tambah `Source mode` (lihat [`plan-issues.md`](./plan-issues.md)):

```markdown
**Companion to:** `docs/issues/INDEX.md` (24 issue)
**Source mode:** issues
**Generated by:** `bubat-r plan --issues`
**Date opened:** YYYY-MM-DD
**Status:** ⏳ pending
```

Phase structure:

```markdown
## Phase A — <title>

**Status:** ⏳ pending
**Commit SHA:** —
**Depends on:** none
**Issues:** LI-20260806-007, LI-20260806-011   <!-- hanya kalau ada input issue -->

### Summary

<Apa yang dilakukan di phase ini — satu paragraf.>

### Tasks

- [ ] [target: file/symbol] [aksi konkret] — gate: [cara verifikasi]
- [ ] [target] [aksi] — gate: [verifikasi]

### Acceptance

- [ ] [kriteria terukur — angka, test pass/fail, grep result]
- [ ] [kriteria terukur]

### Planned changes

<Daftar file/symbol yang akan berubah.>

### Executed changes

<Diisi setelah eksekusi.>

### Results

<Output acceptance check.>

### Findings

<Temuan tak terduga.>

### Notes

<Catatan untuk phase berikutnya.>
```

## Rule

```text
refactor plan harus bisa dikerjakan junior tanpa baca seluruh ADR
```

Jika project target punya `docs/issues/CONTEXT.md` dengan template sendiri: ikuti format target sepenuhnya.
Built-in template `templates/refactor-plan/PLAN-template.md` hanya fallback jika target tidak punya template.
