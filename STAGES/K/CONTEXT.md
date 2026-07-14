# Stage K — Diagram Suite

Tujuan:

- generate diagram arsitektur PlantUML dan png dari artifacts rekonstruksi yang sudah terverifikasi
- hasilkan diagram yang **akurat** (evidence-backed), **navigable** (per-topik + konsolidasi), dan **security-aware** (⚠️ inline)

Kapan dijalankan:

- setelah Stage H (reference design v0.1 tersedia), atau
- setelah Stage I bila critical area perlu diagram ter-update, atau
- setiap kali artifact input (03, 04, 05, 07, 08, 09, 10, 12) berubah signifikan

Input minimum:

- `03-main-spine.md` — services, key abstractions, security model
- `04-runtime-map.md` — containers, ports, deployment units
- `09-component-map.md` — komponen per service, dependencies
- `10-code-trace-map.md` — file:line refs per handler/function

Input preferred:

- `05-behavior-spine.md` — flows, branch logic, failure paths (untuk dataflow diagrams)
- `07-domain-map.md` — bounded contexts, owned tables (untuk context enrichment)
- `08-contract-map.md` — endpoints, break risk (untuk ⚠️ High pada contract)
- `12-drift-ambiguity-report.md` — CRITICAL/HIGH drift items → sumber ⚠️ annotations

## Output

Generated from BUBAT-R Stage K.

| File                                | Type             | Purpose                                                                | Primary Input                       |
| ----------------------------------- | ---------------- | ---------------------------------------------------------------------- | ----------------------------------- |
| `diagrams/c4-container.puml`        | C4 Container     | Container diagram: semua services, ports, tables, deprecated, external | 04-runtime-map                      |
| `diagrams/c4-component-{svc}.puml`  | C4 Component     | Per service: handler components + security ⚠️ + line refs              | 09-component-map, 10-code-trace-map |
| `diagrams/read-path-dataflow.puml`  | Dataflow         | Semua read flows konsolidasi (flow header per flow)                    | 05-behavior-spine                   |
| `diagrams/write-path-dataflow.puml` | Dataflow         | Semua write flows konsolidasi                                          | 05-behavior-spine                   |
| `diagrams/read-path-{topic}.puml`   | Dataflow (topic) | Per topik, satu flow per file (navigable)                              | 05-behavior-spine                   |
| `diagrams/write-path-{topic}.puml`  | Dataflow (topic) | Per topik                                                              | 05-behavior-spine                   |
| `diagrams/read-path-sequence.puml`  | Sequence         | Semua read flows konsolidasi — urutan temporal antar service + DB      | 05-behavior-spine                   |
| `diagrams/write-path-sequence.puml` | Sequence         | Semua write flows konsolidasi — urutan temporal antar service + DB     | 05-behavior-spine                   |
| `diagrams/read-path-sequence-{topic}.puml` | Sequence (topic) | Per topik read sequence, satu flow per file                      | 05-behavior-spine                   |
| `diagrams/write-path-sequence-{topic}.puml` | Sequence (topic) | Per topik write sequence, satu flow per file                     | 05-behavior-spine                   |
| `diagrams/README.md`                | Index            | Index diagram: file, purpose, input artifact                           | —                                   |
| `diagrams/png/*.png`                | Image            | PNG generated dari setiap `.puml` — layout top-to-bottom, readable tanpa zoom horizontal | —  |

Write output to this stage directory first, then after stage done, copy to target repo:

```bash
cp -r STAGES/K/diagrams/ <target>/reconstruction/diagrams/
```

Topic naming: `storage`, `catalog`, `query`, `managed`, `pipeline`, `ext-connection`, `lifecycle`

## Aturan Kualitas (WAJIB)

### 1. Evidence-Backed Only

Setiap element di diagram WAJIB dapat ditelusuri ke:

- evidence ID dari `01-evidence-catalog.md` (EV-xxx), atau
- section artifact rekonstruksi (03/04/05/07/08/09/10)

Elemen yang hanya ada di dokumen lama (aspirasional, belum terverifikasi) TIDAK BOLEH masuk — kecuali ditandai eksplisit dengan warna `#FFE0B2` dan label `[ASPIRATIONAL]`.

### 2. Container Completeness

- Setiap container dari `04-runtime-map.md` WAJIB muncul di `c4-container.puml`
- Container deprecated/secondary: warna `#B3B3B3`
- External services (di luar repo): warna `#B3B3B3`
- Port number, DB/bucket name WAJIB dicantumkan bila diketahui dari evidence
- Semua routes APISIX (atau gateway equivalent) WAJIB tercantum lengkap

### 3. Security Annotation Mandatory

Setiap item CRITICAL atau HIGH dari `12-drift-ambiguity-report.md` WAJIB ada `⚠️` di diagram:

- di label komponen bila menyangkut single component
- di `note` block bila menyangkut flow atau policy
- TIDAK BOLEH disembunyikan demi "kebersihan" diagram

Contoh:

```puml
component "Query Executor\nPOST /query\nmain.py:execute_query()\n⚠️ arbitrary SQL — injection risk" as h_query
```

### 4. Line Reference Mandatory

Setiap component handler di `c4-component-*.puml` WAJIB menyertakan:

```
ComponentName\nfilename:function()\n(line:NNN)
```

dari `10-code-trace-map.md`. Bila line belum diketahui, tulis `(line:?)` — jangan dihapus.

### 5. Layout Direction (WAJIB)

Semua diagram WAJIB menggunakan layout **top-to-bottom** agar PNG readable tanpa zoom horizontal berlebihan:

```puml
@startuml ...
top to bottom direction
' ... skinparam ...
```

Aturan arrow direction:

| Konteks | Arrow | Alasan |
|---------|-------|--------|
| Flow utama (request → service → DB → response) | `-down->` | stack vertikal |
| Branch YES path (path utama) | `-down->` | terus ke bawah |
| Branch NO / parallel path | `-right->` atau `-left->` | horizontal hanya untuk cabang |
| Antar flow section di consolidated file | `-down->` atau separator `rectangle` | jangan pakai `-right->` antar flow |

Consolidated dataflow (`*-dataflow.puml`): setiap flow section disusun **ke bawah**, bukan ke samping. Gunakan `rectangle` header per flow sebagai anchor, sambung dengan `fN_title -[hidden]down-> fM_title` bila perlu paksa urutan vertikal antar flow.

### 6. C4 PlantUML Syntax

Component diagrams:

- Gunakan `package "Name" as id #A9DCDF { component "..." as id }` — bukan `rectangle` nested
- Actor entry: `actor "User / Gateway" as client #08427B`
- External systems: `database/rectangle` di LUAR container boundary `{}`

Container diagram:

- Gunakan `rectangle` untuk services, `database` untuk storage
- Satu sistem boundary: `rectangle "Platform" as boundary #ffffff {}`

### 7. Color Palette (enforced)

| Elemen                       | Kode Warna | Konteks                                 |
| ---------------------------- | ---------- | --------------------------------------- |
| Active container/component   | `#438DD5`  | services, DBs dalam kontrol sistem      |
| Component package background | `#A9DCDF`  | `package` background di c4-component    |
| External / deprecated        | `#B3B3B3`  | external systems, deprecated services   |
| Actor (person)               | `#08427B`  | user/actor node                         |
| Policy / constraint zone     | `#FFF3E0`  | COW engine, invariant block, error zone |
| Read-path flow header        | `#E3F2FD`  | `rectangle "Flow N: ..." as fN #E3F2FD` |
| Write-path flow header       | `#E8F5E9`  | `rectangle "Flow N: ..." as fN #E8F5E9` |
| Aspirasional (unverified)    | `#FFE0B2`  | belum ada bukti dari rekonstruksi       |

### 8. Branch Logic Visible di Dataflow

Setiap branching yang mengakibatkan different data path WAJIB divisualisasikan eksplisit:

```puml
rectangle "[BRANCH]\ncondition?" as branchN
branchN -down-> pathA : "YES → ..."
branchN -right-> pathB : "NO → ..."
```

Bukan hanya sequential arrows. Minimal: setiap `if/else` yang memilih backend berbeda harus tampak.

### 9. Sequence Diagram — Wajib

Setiap write-path dan read-path WAJIB punya sequence diagram (PlantUML `@startuml sequence`) sebagai pelengkap dataflow. Dataflow tunjukin *apa* jalurnya, sequence tunjukin *urutan temporal* — siapa ngomong ke siapa, dalam urutan apa, seberapa lama.

Gunakan `->` (async) dan `->>` (sync). Jangan pakai `-down->` karena sequence diagram punya aturan arrow sendiri.

### 10. Dual Granularity Output (wajib)

Selalu produce dua layer:

- **Konsolidasi** (`*-dataflow.puml`): semua flows dalam satu file, flow header zone per flow — untuk overview dan cross-flow comparison
- **Per-topik** (`*-path-{topic}.puml`): satu flow per file, lebih verbose — untuk navigasi cepat, reference individu, dan diagram embed di doc

## Format per Diagram

### c4-container.puml

Template structure:

```puml
@startuml {project}-c4-container
top to bottom direction
' ... skinparam ...
actor "User\n[Role]" as user #08427B
rectangle "Platform Name" as boundary #ffffff {
  rectangle "ServiceName\n[Tech Stack]\nResponsibility + port" as svc #438DD5
  rectangle "DeprecatedSvc\n[Tech Stack]\n[DEPRECATED]" as dep_svc #B3B3B3
  database "DBName\n[:port /dbname]\nOwned tables: ..." as db #438DD5
  rectangle "ExternalSvc\n[External]" as ext #B3B3B3
}
user -down-> gateway : "HTTP (:port)"
gateway -down-> svc : "/api/prefix/* → :port"
svc -down-> db : "SQL / S3 API"
legend top left
  |= Element |= Description |
  | <#438DD5> | container (service / DB) |
  | <#B3B3B3> | external / deprecated |
  | <#08427B> | actor |
endlegend
@enduml
```

Wajib cantumkan:

- Semua runtime units dari `04-runtime-map.md`
- Port numbers dan DB/bucket names dari evidence
- Semua gateway routes lengkap
- Arrow label: protocol + direction context

### c4-component-{svc}.puml

Template structure:

```puml
@startuml {project}-c4-component-{svc}
top to bottom direction
' ... skinparam ...
actor "User / APISIX" as client #08427B
rectangle "service-name\n[Tech]" as container #438DD5 {
  package "Functional Group" as grp #A9DCDF {
    component "HandlerName\nHTTP METHOD /path\nfilename:function()\n(line:NNN)\nbrief behavior" as h_name
    component "HandlerWithRisk\nHTTP METHOD /path\nfilename:function()\n⚠️ risk description" as h_risk
  }
  package "Infrastructure" as infra #A9DCDF {
    component "PoolName\nfilename:init_fn()\nconnection strategy" as pool
  }
}
rectangle "ExternalDB" as db #438DD5
client -down-> grp : "HTTP /api/prefix/*"
h_name -down-> pool
pool -down-> db
note top of h_risk
  ⚠️ Risk detail:
  - specific impact
  - affected flow
  File: filename:function()
end note
@enduml
```

### read/write-path-dataflow.puml (konsolidasi)

Structure per flow:

```puml
@startuml {project}-read-path-dataflow
top to bottom direction
' ... skinparam ...

' ── Flow N: Name ──
rectangle "Flow N: {Name}" as fN_title #{E3F2FD|E8F5E9}

actor_or_src -down-> gateway : "METHOD /path"
note right: request schema
gateway -down-> svc : proxy
rectangle "[BRANCH]" as branch #FFF3E0
svc -down-> branch : "condition?"
branch -down-> pathA : "YES → ..."
branch -right-> pathB : "NO → ..."
pathA -down-> db1 : "operation"
note right
  Policy:
  [VALIDASI] ...
  [VERIFIKASI] ...
  [SECURITY] ⚠️ ...
  File: filename:function()
end note
db1 -down-> result : "response schema"

' ── Flow separator: paksa urutan vertikal antar flow ──
fN_title -[hidden]down-> fM_title

' ── Flow M: Name ──
rectangle "Flow M: {Name}" as fM_title #{E3F2FD|E8F5E9}
' ... dst
```

### read/write-path-{topic}.puml (per-topik)

- Tambahkan `top to bottom direction` setelah `@startuml`
- Flow progresses **top-to-bottom**: gunakan `-down->` untuk main path, `-right->` hanya untuk branch parallel
- Satu flow lengkap dengan semua branches
- Policy note WAJIB: [VALIDASI], [VERIFIKASI], [SECURITY], [PERFORMANCE] jika ada
- `⚠️` inline di note bila ada risk
- Legend bottom dengan file:line refs:
  ```puml
  legend bottom
    File locations:
    service/filename.ext:
      functionName:lineN — description
  endlegend
  ```

### read/write-path-sequence-{topic}.puml (per-topik sequence)

Template:

```puml
@startuml {project}-read-path-sequence-{topic}
!pragma layout smetana  ' force top-to-bottom participant stacking

skinparam {
  BackgroundColor #FEFEFE
  ParticipantPadding 20
  BoxPadding 10
  ArrowColor #333333
  ActorBorderColor #08427B
  DatabaseBorderColor #438DD5
  LifeLineBackgroundColor #FFFFFF
}

' ── Participants ──
actor "Client / Gateway" as client #08427B
box "Service Layer" #E3F2FD
  participant "ServiceName\n:port" as svc
end box
box "Storage Layer" #E8F5E9
  database "DB / S3\n:bucket/dbname" as db
end box

' ── Flow: {FlowName} ──
== Flow N: {FlowName} ==

client -> svc ++ : "METHOD /path\npayload schema"
note right: headers: {auth, content-type}

svc -> svc : "validasi input\nfilename:validasi()"
note right #FFF3E0
  [VALIDASI] …
end note

alt cache hit
  svc -> db : "check cache"
  db --> svc : "cached result"
else cache miss
  svc -> db ++ : "SELECT / GET\nquery params"
  note right #FFF3E0
    [PERFORMANCE] …
  end note
  db --> svc -- : "result set"
  svc -> svc : "transform response\nfilename:format()"
end

svc --> client -- : "200 OK\nresponse schema"
note right
  ⚠️ risk description bila ada
  File: filename:function()
end note

@enduml
```

Aturan khusus sequence:

1. **Sync vs Async**: `->>` untuk sync (request → response), `->` untuk async/fire-and-forget. Jangan campur aduk.
2. **Activation bar**: `++` masuk activation, `--` keluar. Wajib dipasangkan. `++` di arrow ke participant, `--` di arrow balik.
3. **Branching**: pakai `alt/else/end` untuk conditional paths. Jangan pakai `if` di dalam participant.
4. **Loop**: pakai `loop N times / end` untuk retry/polling patterns.
5. **Cache boundary**: tampilkan `alt cache hit / cache miss` ketika behavior-spine menyebut cache strategy.
6. **Time notes**: `note right: ~Xms` bila ada timeout/metrics di behavior-spine.
7. **Color**: header sama — `#E3F2FD` untuk read, `#E8F5E9` untuk write. Box storage layer pakai warna sesuai read/write.
8. **No participants inline**: semua participant dideklarasikan di awal (sebelum `== Flow ==`), bukan di tengah.

### read/write-path-sequence.puml (konsolidasi)

Sama seperti per-topik, tapi:

- Semua flows dalam satu file, dipisah `== Flow N: Name ==` separator
- Semua participant dideklarasi di awal, termasuk yang reusable antar flow
- Antar flow pakai separator `==` — jangan pakai hidden arrow
- Flow yang tidak related cukup dipisah urutan: urutkan flow dari yang paling sederhana ke paling kompleks

### diagrams/README.md

Format:

```markdown
# Diagram Index

Seperti section `### Output` di atas.

## ⚠️ Security Annotations

All `⚠️` markers trace to `12-drift-ambiguity-report.md`.
```

## Incremental Update Protocol

Bila menjalankan Stage K ulang setelah satu artifact berubah:

| Changed artifact               | Regenerate                                              |
| ------------------------------ | ------------------------------------------------------- |
| `04-runtime-map.md`            | `c4-container.puml`                                     |
| `09-component-map.md`          | `c4-component-{svc}.puml` untuk service yang berubah    |
| `10-code-trace-map.md`         | semua `c4-component-*.puml` (line refs berubah)         |
| `05-behavior-spine.md`         | `*-path-dataflow.puml` + `*-path-sequence.puml` + per-topic yang terpengaruh     |
| `12-drift-ambiguity-report.md` | semua files (⚠️ annotations bisa berubah)               |
| `08-contract-map.md`           | `c4-container.puml` + per-topic path files yang relevan |

## Auto-generate PNG (otomatis, tanpa perintah tambahan)

Setelah semua `.puml` ditulis, agent WAJIB:

1. **Detect PlantUML JAR** — cari di (urutkan):
   - `/opt/homebrew/var/homebrew/tmp/.cellar/plantuml/*/libexec/plantuml.jar`
   - `~/.vscode/extensions/jebbs.plantuml-*/plantuml.jar`
   - `which plantuml` atau `brew --prefix plantuml`
   - `find / -name "plantuml.jar" 2>/dev/null`
   Bila tidak ditemukan, install via `brew install plantuml` atau download.

2. **Generate PNG** — jalankan:
   ```bash
   cd STAGES/K/diagrams/
   java -Djava.awt.headless=true -jar /path/to/plantuml.jar -tpng "*.puml" -o png/
   ```

3. **Verifikasi** — setiap file PNG:
   - exit code = 0 (tidak ada error syntax)
   - file size > 1000 bytes (bukan error overlay)
   Bila ada yang gagal, perbaiki syntax `.puml` dan ulang.

4. **Copy ke reconstruction** — setelah sukses:
   ```bash
   cp -r STAGES/K/diagrams/png/ <project>/reconstruction/diagrams/png/
   ```

### Aturan syntax agar PNG tidak error

| Larangan | Contoh salah | Perbaikan |
|----------|-------------|-----------|
| Inline rectangle di arrow target | `src -> rectangle "X" as a #C : "label"` | Deklarasi rectangle dulu:
`rectangle "X" as a #C`
`src -> a : "label"` |
| Karakter `?` di luar string (seperti `WHERE id=?`) | `WHERE id=?` | Ganti ke `WHERE id = :id` atau `BY id` |
| `database` keyword tanpa `!include` | `database "DB" as db` | Gunakan `rectangle "DB" as db` untuk dataflow / sequence |
| `(line:?)` di label | `(line:?)` | Ganti ke `(line:UNKNOWN)` |
| Duplicate `@startuml` name antar file | Dua file pakai `@startuml read-path-dataflow` | Setiap file harus punya `@startuml` name unik |

## Exit Criteria

- semua containers dari `04-runtime-map.md` ada di `c4-container.puml`
- semua deprecated/external services ditampilkan (warna `#B3B3B3`)
- semua component groups dari `09-component-map.md` ada di component diagrams yang sesuai
- semua CRITICAL/HIGH dari `12-drift-ambiguity-report.md` punya `⚠️` di diagram
- semua handler components punya line ref dari `10-code-trace-map.md` (atau explicit `?`)
- consolidated dataflow + per-topic files keduanya ada
- **sequence diagram konsolidasi + per-topic** untuk write-path & read-path keduanya ada
- semua sequence diagram punya `++`/`--` activation pairs yang valid (tidak ada activation floating)
- tidak ada elemen tanpa evidence trace (atau explicit `[ASPIRATIONAL]`)
- **semua `.puml` ter-generate PNG** dan disimpan di `diagrams/png/` — otomatis (lihat section Auto-generate PNG)
- semua PNG **tidak mengandung error overlay** — verifikasi dengan cek exit code = 0 dan file size > 1KB
- **semua PNG readable tanpa zoom horizontal**: setiap `.puml` WAJIB punya `top to bottom direction` dan flow main-path menggunakan `-down->` (bukan `-right->`); verifikasi PNG sebelum mark done
- `diagrams/README.md` ter-update
- Workflow Status updated untuk Stage K

## AST Index Commands

Stage K primarily reads from reconstruction artifacts, not raw code. AST index digunakan hanya untuk memverifikasi line refs sebelum ditulis ke diagram:

```bash
ast-index symbol "FunctionName"        # verify line ref sebelum tulis ke diagram
ast-index outline path/to/file         # get handler list + line numbers per file
ast-index refs "Symbol"                # verify symbol location bila line ref ragu
```

Gunakan `rg` untuk verify literal/config values yang akan masuk ke label diagram:

```bash
rg "MINIO_DEFAULT_BUCKET|PORT|:8" compose.yml    # verify port + bucket names
rg "def function_name|func functionName" service/ # verify line number
```
