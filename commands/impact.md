# bubat-r impact

Identifikasi BUBAT-R artifacts yang stale setelah refactor selesai. Generate recommended re-run list per stage.

## Intent

```text
bubat-r impact <adr-id>
bubat-r impact ADR-2026-07-16-duckdb-primary-dwh
bubat-r impact STAGES/overlays/adrs/ADR-2026-07-16-duckdb-primary-dwh.md
```

`<adr-id>` adalah filename tanpa extension, atau path relatif/absolut ke ADR file.

## Path Resolution

Tentukan `${BUBATR_HOME}`.

ADR file lookup:
1. Jika argumen adalah path (mengandung `/`): resolve langsung.
2. Jika argumen adalah ID (tidak mengandung `/`): cari `${BUBATR_HOME}/STAGES/overlays/adrs/<adr-id>.md`.

Output:
- `${BUBATR_HOME}/STAGES/overlays/impact/IMPACT-<adr-slug>.md`

## Protocol

1. Tentukan `${BUBATR_HOME}`.
2. Baca ADR file target.
3. Validasi pre-condition:
   - ADR file ada → lanjut.
   - ADR punya section `## Affected BUBAT-R Areas` → lanjut.
   - Section `## Affected BUBAT-R Areas` punya minimal satu centang `[x]` → lanjut.
   - Jika tidak: tulis error: `ADR belum punya Affected BUBAT-R Areas yang diisi. Centang area yang relevan di ADR terlebih dahulu.`
4. Parse `## Affected BUBAT-R Areas` — kumpulkan semua baris dengan `[x]`.
5. Map setiap centang ke stale artifacts dan stage menggunakan tabel di `overlays/refactor-lifecycle.md § 3`.
6. Baca `docr-candidates.md` (jika ada) — cek apakah area yang affected punya DOCR candidate.
7. Baca `STAGES/A/00-workflow-status.md` — ambil coverage snapshot (untuk "Pre-refactor coverage").
8. Assign priority per artifact:
   - HIGH: area ada di coverage-ledger dengan `Partial` atau `Contradicted` sebelum refactor
   - HIGH: runtime boundary atau data ownership berubah
   - MEDIUM: component atau reference design berubah, coverage sebelumnya `Covered`
   - ALWAYS: `coverage-ledger.md` dan `drift-ambiguity-report.md` — selalu stale setelah kode berubah
9. Tentukan re-run order: B → C → D → E → F → G → H. Skip stage yang area-nya tidak ada di centang.
10. Buat direktori `${BUBATR_HOME}/STAGES/overlays/impact/` jika belum ada.
11. Tulis IMPACT file (lihat format di bawah).
12. Update `${BUBATR_HOME}/STAGES/A/00-workflow-status.md`:
    - Update baris ADR di `## Active Refactoring Cycles`: kolom `Impact Analyzed` = `Yes — <path-ke-impact-file>` juga kolom `Status` sesuaikan dengan status pada dokumen ADR.

## Output: IMPACT File

```markdown
# Impact Report — <ADR title>

Source ADR: STAGES/overlays/adrs/<adr-file>.md
Analyzed: YYYY-MM-DD
ADR Status at analysis: <status>

## Stale Artifacts

| Priority | Artifact | Stage | Recommended Action | Effort |
|---|---|---|---|---|
| HIGH | 04-runtime-map.md | B | re-run Stage B for <area> boundary | medium |
| HIGH | 09-component-map.md | G | update <component> entry | small |
| MEDIUM | 11-reference-design.md | H | update <section> | small |
| ALWAYS | 02-coverage-ledger.md | — | update rows for <affected area> | small |
| ALWAYS | 12-drift-ambiguity-report.md | — | resolve contradiction: <desc if known> | small |

## DOCR Refresh Needed

<!-- Kosong jika tidak ada DOCR di area yang affected. -->
- `<path>/.bubat-r/STAGES/J/` — AGENTS.md needs update (area: <area>)

## Recommended Re-run Order

1. Stage B (runtime-map) — area: <affected area>
2. Stage C (behavior-spine) — area: <affected flow>
3. Stage G (component-map) — area: <affected component>
4. Stage H (reference-design) — section: <section>
5. Stage I if new gaps surface after re-run

## Coverage Impact Estimate

Pre-refactor coverage snapshot: NN% (from 00-workflow-status.md, <date>)
Expected direction: UP / DOWN / NEUTRAL
Reason: <area> was <Partial/Contradicted> — refactor resolves / introduces / restructures it.
Re-run affected stages, then re-score coverage-ledger.
```

## Priority Rules

| Priority | Kondisi |
|---|---|
| HIGH | Area ada di coverage-ledger dengan `Partial` atau `Contradicted` sebelum refactor |
| HIGH | Runtime boundary atau data ownership berubah |
| MEDIUM | Component atau reference design berubah, coverage sebelumnya sudah `Covered` |
| ALWAYS | `coverage-ledger.md` dan `drift-ambiguity-report.md` — selalu include, tidak peduli scope |

## Effort Estimate

| Effort | Kriteria |
|---|---|
| small | Update manual 1–5 rows atau 1 section di artifact — bukan re-run stage penuh |
| medium | Re-run satu stage untuk satu area — partial re-run, bukan full reconstruction |
| large | Re-run satu stage penuh untuk seluruh area — biasanya hanya kalau boundary berubah signifikan |

## Rule

```text
impact selalu dianalisa — tidak ada refactor tanpa impact check
```

`bubat-r impact` tidak otomatis re-run stage. IMPACT file hanya berisi recommended action.
Re-run adalah keputusan user — bisa via `bubat-r gap`, `bubat-r run`, atau manual update artifact.
