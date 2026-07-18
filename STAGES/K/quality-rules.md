# Stage K — Diagram Quality Rules

Reference lengkap untuk semua aturan kualitas diagram. Dibaca oleh Stage K agent saat generate atau review diagram.

## Rule 1: Evidence-Backed Only

Setiap element di diagram WAJIB dapat ditelusuri ke:
- evidence ID dari `01-evidence-catalog.md` (EV-xxx), atau
- section artifact rekonstruksi (03/04/05/07/08/09/10)

Elemen hanya dari dokumen lama (aspirasional, belum terverifikasi) TIDAK BOLEH masuk — kecuali ditandai eksplisit dengan warna `#FFE0B2` dan label `[ASPIRATIONAL]`.

## Rule 2: Container Completeness

- Setiap container dari `04-runtime-map.md` WAJIB muncul di `c4-container.puml`
- Container deprecated/secondary: warna `#B3B3B3`
- External services (di luar repo): warna `#B3B3B3`
- Port number, DB/bucket name WAJIB dicantumkan bila diketahui dari evidence
- Semua routes gateway (APISIX atau equivalent) WAJIB tercantum lengkap

## Rule 3: Security Annotation Mandatory

Setiap item CRITICAL atau HIGH dari `12-drift-ambiguity-report.md` WAJIB ada `⚠️` di diagram:
- di label komponen bila menyangkut single component
- di `note` block bila menyangkut flow atau policy
- TIDAK BOLEH disembunyikan demi "kebersihan" diagram

Contoh inline:
```puml
component "Query Executor\nPOST /query\nmain.py:execute_query()\n⚠️ arbitrary SQL — injection risk" as h_query
```

## Rule 4: Line Reference Mandatory

Setiap component handler di `c4-component-*.puml` WAJIB menyertakan:
```
ComponentName\nfilename:function()\n(line:NNN)
```
dari `10-code-trace-map.md`. Bila line belum diketahui: tulis `(line:UNKNOWN)` — jangan dihapus, jangan pakai `?`.

## Rule 5: Layout Direction

Semua diagram WAJIB `top to bottom direction` di baris kedua setelah `@startuml`:
```puml
@startuml name
top to bottom direction
```

Arrow direction:

| Konteks | Arrow |
|---------|-------|
| Flow utama (request → service → DB → response) | `-down->` |
| Branch YES path | `-down->` |
| Branch NO / parallel path | `-right->` atau `-left->` |
| Antar flow section di consolidated file | `fN_title -[hidden]down-> fM_title` |

## Rule 6: C4 PlantUML Syntax

Component diagrams:
- Gunakan `package "Name" as id #A9DCDF { component "..." as id }` — bukan `rectangle` nested
- Actor entry: `actor "User / Gateway" as client #08427B`
- External systems: `database`/`rectangle` di LUAR container boundary `{}`

Container diagram:
- Gunakan `rectangle` untuk services, `database` untuk storage
- Satu sistem boundary: `rectangle "Platform" as boundary #ffffff {}`

## Rule 7: Color Palette

| Elemen | Kode Warna | Konteks |
|--------|------------|---------|
| Active container/component | `#438DD5` | services, DBs dalam kontrol sistem |
| Component package background | `#A9DCDF` | `package` background di c4-component |
| External / deprecated | `#B3B3B3` | external systems, deprecated services |
| Actor (person) | `#08427B` | user/actor node |
| Policy / constraint zone | `#FFF3E0` | BRANCH block, COW engine, invariant, error zone |
| Read-path flow header | `#E3F2FD` | `rectangle "Flow N: ..." as fN #E3F2FD` |
| Write-path flow header | `#E8F5E9` | `rectangle "Flow N: ..." as fN #E8F5E9` |
| Aspirasional (unverified) | `#FFE0B2` | belum ada bukti dari rekonstruksi |

## Rule 8: Branch Logic Visible

Setiap branching yang mengakibatkan different data path WAJIB divisualisasikan eksplisit:
```puml
rectangle "[BRANCH]\ncondition?" as branchN #FFF3E0
branchN -down-> pathA : "YES → ..."
branchN -right-> pathB : "NO → ..."
```

Minimal: setiap `if/else` yang memilih backend berbeda harus tampak. Bukan hanya sequential arrows.

## Rule 9: Dual Granularity Output

Selalu produce dua layer:
- **Konsolidasi** (`*-dataflow.puml`): semua flows dalam satu file, flow header zone per flow — overview + cross-flow comparison
- **Per-topik** (`*-path-{topic}.puml`): satu flow per file, lebih verbose — navigasi cepat, reference individu, embed di doc

Topic names: `storage`, `catalog`, `query`, `managed`, `pipeline`, `ext-connection`, `lifecycle`

## Rule 10: Syntax Rules (PNG error prevention)

| Larangan | Contoh salah | Perbaikan |
|----------|-------------|-----------|
| Inline rectangle di arrow target | `src -> rectangle "X" as a #C : "label"` | Deklarasi rectangle dulu, baru arrow |
| `?` di luar string | `WHERE id=?` | Ganti ke `WHERE id = :id` |
| `database` keyword di dataflow/sequence | `database "DB" as db` | Gunakan `rectangle "DB" as db` |
| `(line:?)` di label | `(line:?)` | Ganti ke `(line:UNKNOWN)` |
| Duplicate `@startuml` name antar file | dua file pakai nama sama | Setiap file harus punya nama unik |
