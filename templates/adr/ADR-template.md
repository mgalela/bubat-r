# ADR — [Judul Singkat]

- Status: **PROPOSED** | **ACCEPTED** | **IN PROGRESS** | **IMPLEMENTED** | **ABANDONED**
- Date: YYYY-MM-DD
- Implemented: — (isi tanggal + phase saat IMPLEMENTED)
- Owners: [area / domain / team]
- Related:
  - `[path ke refactor plan]` (akan ada setelah `bubat-r plan` dijalankan)
  - `[path ke artifact BUBAT-R yang relevan]`
  - `[path ke file kode yang terdampak]`

---

## BUBAT-R Evidence Source

<!-- Diisi otomatis oleh `bubat-r adr`. Review dan koreksi sebelum finalize. -->
<!-- Jika tidak ada artifacts: "No relevant evidence found — run bubat-r run first." -->

| Artifact | Row / Section | Status | Citation |
|---|---|---|---|
| coverage-ledger | [area] / [item] | [Partial / Contradicted / Covered with Critical Risk] | [Stage I GAP-xxx / Stage H] |
| drift-report | [area] | [Contradicted / Ambiguous] | [row / section reference] |
| GAP file | [GAP-xxx-area] | [Closed / Blocked] | `STAGES/I/gaps/GAP-xxx.md` |
| research memo | [question] | [key finding] | `STAGES/overlays/research/[file].md` |

---

## Affected BUBAT-R Areas

<!-- Diisi otomatis oleh `bubat-r adr` (heuristic). Review dan koreksi. -->
<!-- `bubat-r impact` membaca section ini setelah ADR IMPLEMENTED. -->

- [ ] Runtime boundary / executable unit  → Stage B (runtime-map), Stage G (component-map)
- [ ] Flow / write-path behavior           → Stage C (behavior-spine), Stage F (contract-map)
- [ ] Data ownership / entity             → Stage D (ownership-map), Stage E (domain-map)
- [ ] API / external contract surface     → Stage F (contract-map), Stage H (reference-design)
- [ ] Component structure / decomposition → Stage G (component-map), Stage H (reference-design)
- [ ] Code trace                          → Stage H (code-trace-map) — centang ini selalu
- [ ] DOCR area affected                  → Stage J (AGENTS.md refresh needed)

---

## Latar Belakang (Context)

<!-- Apa kondisi saat ini. Bukan masalah — itu di bagian Problem. -->
<!-- Cite temuan dari BUBAT-R Evidence Source di atas. -->

[Deskripsi kondisi arsitektur saat ini. Gunakan tabel Fakta jika ada beberapa poin teknis konkret.]

| Fakta | Bukti |
|---|---|
| [observasi teknis] | [file/symbol/migration/config citation] |

---

## Problem

<!-- Keputusan apa yang belum diambil. Bisa beberapa. -->
<!-- Format: P1, P2, dst — satu problem per sub-heading atau bullet. -->

**P1 — [label]**
[Deskripsi problem spesifik.]

**P2 — [label]**
[Deskripsi problem spesifik.]

---

## Keputusan

<!-- Keputusan yang diambil untuk setiap problem. -->
<!-- Format: satu sub-heading per keputusan. Langsung ke point. -->

### Keputusan 1 — [label]

**[Pernyataan keputusan dalam bold — satu kalimat.]**

Implikasi:
- [implikasi konkret 1]
- [implikasi konkret 2]

### Keputusan 2 — [label]

**[Pernyataan keputusan dalam bold.]**

Implikasi:
- [implikasi konkret]

---

## Alasan Keputusan (Why)

<!-- Kenapa keputusan ini, bukan yang lain. Satu sub-section per keputusan utama. -->

### [Label keputusan 1]

[Argumen teknis. Cite bukti spesifik — file, angka, constraint.]

### [Label keputusan 2]

[Argumen teknis.]

---

## Alternatif yang Dipertimbangkan

### Opsi A — [label]

Ditolak: [alasan singkat + trade-off yang tidak acceptable.]

### Opsi B — [label]

Ditolak: [alasan singkat.]

---

## Shape Implementasi

<!-- Kode konkret atau shape sebelum/sesudah. Opsional tapi sangat membantu untuk `bubat-r plan`. -->

[Gambarkan perubahan konkret: struct sebelum/sesudah, file yang dibuat/dihapus, env vars baru/dihapus.]

---

## Konsekuensi

### Positif

- [manfaat konkret 1]
- [manfaat konkret 2]

### Negatif

- [cost atau tradeoff 1]
- [cost atau tradeoff 2]

### Netral / Accepted Tradeoff

- [tradeoff yang disadari dan diterima]

---

## Deferred Decisions

| Keputusan | Alasan Defer | Trigger untuk Resolve |
|---|---|---|
| [keputusan] | [alasan] | [kondisi yang akan membuka keputusan ini] |

---

## Migration Plan

<!-- Dipakai oleh `bubat-r plan` untuk generate refactor-tasklist. -->
<!-- Phase A selalu additive (schema / stub / DAO) — bukan cutover. -->

### Phase A — [title]

[Apa yang dilakukan. Gate: test/build yang harus pass.]

### Phase B — [title]

[Apa yang dilakukan. Depends on: Phase A.]

---

## Summary

| Keputusan | Status |
|---|---|
| [keputusan 1] | PROPOSED / ACCEPTED / IMPLEMENTED / DEFERRED |
| [keputusan 2] | PROPOSED |
