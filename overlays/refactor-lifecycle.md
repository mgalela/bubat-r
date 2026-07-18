# Refactoring SDLC Lifecycle Overlay

Status: draft overlay  
Scope: integrated refactoring lifecycle — ADR sourcing, plan generation, post-refactor artifact impact detection  
Companion docs: `docs/RFC-refactor-sdlc.md`, `commands/adr.md`, `commands/plan.md`, `commands/impact.md`

## 1. Purpose

Overlay ini menjawab:
- bagaimana menyumber ADR dari artifact BUBAT-R yang sudah ada
- bagaimana menghasilkan refactor plan dari ADR
- bagaimana mendeteksi artifact mana yang stale setelah refactor selesai
- bagaimana menutup loop SDLC sehingga coverage naik setelah tiap refactor cycle

Gunakan overlay ini saat:
- `bubat-r gap` atau `bubat-r research` menghasilkan temuan yang butuh keputusan arsitektur formal
- ada bug yang teridentifikasi di coverage-ledger sebagai `Contradicted` atau `Covered with Critical Risk`
- tim ingin traceability lengkap dari "kenapa refactor" sampai "artifacts mana yang diupdate"

Prinsip:
- ADR adalah first-class citizen dalam BUBAT-R — bukan dokumen terpisah
- refactor plan harus traceable ke artifact evidence, bukan opini
- post-refactor impact harus selalu dianalisa — tidak boleh skip
- coverage-ledger dan drift-ambiguity-report selalu stale setelah kode berubah

---

## 2. Lifecycle Overview

```
[existing artifacts]
        │
        ▼ trigger: gap closed, bug listed, research finding
  bubat-r adr <title>
        │  reads:  coverage-ledger, drift-report, gap files, research memos
        │  writes: STAGES/overlays/adrs/ADR-YYYY-MM-DD-<slug>.md
        │          00-workflow-status.md § Active Refactoring Cycles (new row)
        ▼
  [user fills: Problem, Keputusan, Alasan, Alternatif, Migration Plan]
        │
        ▼
  bubat-r plan <adr-id>
        │  reads:  ADR Migration Plan, Keputusan, Konsekuensi
        │  writes: STAGES/overlays/plans/refactor-tasklist-<slug>.md
        │          00-workflow-status.md § Active Refactoring Cycles (Plan column)
        ▼
  [developer execute phases — update plan per phase]
        │
        ▼
  [ADR status → IMPLEMENTED, plan phases → ✅ merged]
        │
        ▼
  bubat-r impact <adr-id>
        │  reads:  ADR § Affected BUBAT-R Areas checklist
        │          docr-candidates.md
        │          00-workflow-status.md (coverage snapshot)
        │  writes: STAGES/overlays/impact/IMPACT-<slug>.md
        │          00-workflow-status.md § Active Refactoring Cycles (Impact column)
        ▼
  [targeted stage refresh — only stages listed in IMPACT file]
        │
        └──────────────────────────────────────────► [loop, coverage naik]
```

---

## 3. Artifact-to-Stage Mapping

Mapping ini adalah source of truth untuk `bubat-r impact` dan section `## Affected BUBAT-R Areas` di ADR.

| Changed Area | Stale Artifacts | Stage to Re-run |
|---|---|---|
| Runtime boundary / executable unit | `04-runtime-map.md`, `09-component-map.md` | B, G |
| Flow / write-path behavior | `05-behavior-spine.md`, `08-contract-map.md` | C, F |
| Data ownership / entity | `06-ownership-map.md`, `07-domain-map.md` | D, E |
| API / external contract surface | `08-contract-map.md`, `11-reference-design.md` | F, H |
| Component structure / internal decomposition | `09-component-map.md`, `10-code-trace-map.md`, `11-reference-design.md` | G, H |
| Any code change (always) | `02-coverage-ledger.md`, `10-code-trace-map.md`, `12-drift-ambiguity-report.md` | — (manual update) |
| DOCR area affected | nearest `AGENTS.md` per `docr-candidates.md` | J (partial refresh) |

Re-run ordering rule: B → C → D → E → F → G → H. Jangan re-run G sebelum B dan C stabil.

---

## 4. Evidence Relevance Filter

`bubat-r adr` membaca artifacts tetapi tidak dump semua rows ke ADR. Filter berikut menentukan evidence yang relevan:

### Dari `coverage-ledger.md`

Include jika:
- `Status` = `Partial`, `Contradicted`, `Covered with Critical Risk`, atau `Accepted Gap`
- `Area` atau `Item` mengandung keyword dari `<title>` command

Exclude:
- `Status` = `Covered` dengan `Confidence` = `Observed` — tidak ada masalah
- `Weight` = 1 atau 2 kecuali secara eksplisit disebut di title

### Dari `drift-ambiguity-report.md`

Include:
- Semua unresolved contradictions
- Semua open ambiguities yang belum ada resolution

### Dari `GAP-*.md`

Include:
- Gap dengan `Status: Closed` yang belum ada ADR — gap ini resolved tapi belum ada keputusan formal
- Gap dengan `Status: Blocked` — bisa jadi trigger refactor
- Gap yang area-nya overlap dengan title

### Dari research memos

Include:
- Memo yang area atau question-nya overlap dengan title
- Ambil hanya: recommended action dan key finding, bukan seluruh memo

---

## 5. Pre-condition Rules

### `bubat-r adr`

- Tidak ada hard prerequisite. Bisa dijalankan bahkan sebelum Stage A.
- Jika artifacts tidak ada: section `BUBAT-R Evidence Source` kosong, tulis `No artifacts available — run bubat-r run first for evidence-backed ADR`.
- Jika artifacts ada tapi tidak ada evidence relevan: tulis `No relevant evidence found in artifacts for this scope`.

### `bubat-r plan`

- ADR file harus ada di `STAGES/overlays/adrs/`.
- ADR harus punya section `Migration Plan` (atau minimal `Keputusan`) untuk bisa di-generate plan-nya.
- ADR status `Proposed` atau `Accepted` — keduanya valid.
- ADR status `IMPLEMENTED` atau `Abandoned` → tolak, tulis: `ADR sudah final. Buat ADR baru untuk wave refactor berikutnya.`

### `bubat-r impact`

- ADR file harus ada.
- ADR harus punya section `## Affected BUBAT-R Areas` yang sudah diisi minimal satu centang `[x]`.
- ADR status belum wajib `IMPLEMENTED` — impact bisa dianalisa kapan saja, tapi paling berguna setelah IMPLEMENTED.

---

## 6. `00-workflow-status.md` Extension

Tambah section `## Active Refactoring Cycles` setelah `## Active Gaps`:

```markdown
## Active Refactoring Cycles

| Code | ADR | Plan | ADR Status | Impact Analyzed |
|---|---|---|---|---|
| `ADR-YYYYMMDD-NNN` | `STAGES/overlays/adrs/<file>.md` | `STAGES/overlays/plans/<file>.md` | Proposed / Accepted / In Progress / IMPLEMENTED / Abandoned | No / Yes — `STAGES/overlays/impact/<file>.md` |
```

Update rules:
- `bubat-r adr` → tambah row baru: Code = `adr-code`, Plan = `—`, Impact = `No`
- `bubat-r plan` → isi kolom Plan
- `bubat-r impact` → update kolom Impact = `Yes — <path>`
- ADR status diupdate manual oleh user (BUBAT-R tidak auto-detect kode selesai)

---

## 7. Folder Structure

```
${BUBATR_HOME}/STAGES/overlays/
  adrs/
    ADR-YYYY-MM-DD-<slug>.md
  plans/
    refactor-tasklist-<slug>.md
  impact/
    IMPACT-<adr-slug>.md
  research/
    (existing)
  docs-feed/
    (existing)
```

`overlays/` ada sebagai sub-folder di `STAGES/`. ADR, plans, dan impact menjadi sub-folder baru di dalamnya.

---

## 8. Operating Maxims

- evidence decides — ADR tanpa artifact citation adalah opini
- impact selalu dianalisa — tidak ada refactor tanpa impact check
- artifacts yang stale lebih berbahaya dari artifacts yang tidak ada
- refactor plan harus bisa dikerjakan junior tanpa baca seluruh ADR
- loop tertutup — coverage naik setiap cycle, bukan hanya coverage rekonstruksi
