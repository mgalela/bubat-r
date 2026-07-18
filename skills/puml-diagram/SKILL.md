# puml-diagram

Generate PlantUML diagram files and PNG renders for BUBAT-R Stage K.

## Trigger

User types `diagram K` or Stage K agent needs to write `.puml` files.

## File Templates

### c4-container.puml

```puml
@startuml {project}-c4-container
top to bottom direction
skinparam rectangle {
  BackgroundColor #438DD5
  FontColor white
}
skinparam database {
  BackgroundColor #438DD5
  FontColor white
}

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

Wajib cantumkan: semua runtime units dari `04-runtime-map.md`, port numbers, DB/bucket names, semua gateway routes, arrow label dengan protocol + direction.

### c4-component-{svc}.puml

```puml
@startuml {project}-c4-component-{svc}
top to bottom direction
skinparam component {
  BackgroundColor #438DD5
  FontColor white
}

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

Rules:

- Gunakan `package "Name" as id #A9DCDF { component ... }` — bukan `rectangle` nested
- External systems di LUAR container boundary `{}`
- Setiap handler WAJIB punya line ref: `(line:NNN)` atau `(line:UNKNOWN)` — jangan dihapus

### read/write-path-dataflow.puml (konsolidasi)

```puml
@startuml {project}-read-path-dataflow
top to bottom direction

' ── Flow N: Name ──
rectangle "Flow N: {Name}" as fN_title #E3F2FD

actor_or_src -down-> gateway : "METHOD /path"
note right: request schema
gateway -down-> svc : proxy
rectangle "[BRANCH]\ncondition?" as branchN #FFF3E0
svc -down-> branchN
branchN -down-> pathA : "YES → ..."
branchN -right-> pathB : "NO → ..."
pathA -down-> db1 : "operation"
note right
  Policy:
  [VALIDASI] ...
  [VERIFIKASI] ...
  [SECURITY] ⚠️ ...
  File: filename:function()
end note
db1 -down-> result : "response schema"

' ── paksa urutan vertikal antar flow ──
fN_title -[hidden]down-> fM_title

' ── Flow M: Name ──
rectangle "Flow M: {Name}" as fM_title #E3F2FD
' ... dst
@enduml
```

Write-path header warna: `#E8F5E9`. Read-path: `#E3F2FD`.

### read/write-path-{topic}.puml (per-topik)

```puml
@startuml {project}-{read|write}-path-{topic}
top to bottom direction

' full flow untuk satu topic
' main path: -down->
' branch parallel: -right-> atau -left->

rectangle "[BRANCH]\ncondition?" as branch1 #FFF3E0
branch1 -down-> pathA : "YES → ..."
branch1 -right-> pathB : "NO → ..."

note right of pathA
  [VALIDASI] ...
  [VERIFIKASI] ...
  [SECURITY] ⚠️ ...
  [PERFORMANCE] ...
  File: filename:function()
end note

legend bottom
  File locations:
  service/filename.ext:
    functionName:lineN — description
endlegend
@enduml
```

### read/write-path-sequence-{topic}.puml (per-topik sequence)

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

Aturan sequence:

1. **Sync vs Async**: `->>` sync, `->` async/fire-and-forget.
2. **Activation bar**: `++` masuk, `--` keluar. Wajib dipasangkan.
3. **Branching**: `alt/else/end` untuk conditional. Jangan pakai `if` di dalam participant.
4. **Loop**: `loop N times / end` untuk retry/polling patterns.
5. **Cache boundary**: `alt cache hit / cache miss` bila behavior-spine menyebut cache strategy.
6. **Time notes**: `note right: ~Xms` bila ada timeout/metrics di behavior-spine.
7. **Color**: header `#E3F2FD` read, `#E8F5E9` write.
8. **No participants inline**: deklarasi semua participant di awal sebelum `== Flow ==`.

### read/write-path-sequence.puml (konsolidasi)

Sama seperti per-topik, tapi:

- Semua flows dalam satu file, dipisah `== Flow N: Name ==` separator
- Semua participant dideklarasi di awal, termasuk yang reusable antar flow
- Antar flow pakai separator `==` — jangan pakai hidden arrow
- Urutkan flow dari paling sederhana ke paling kompleks

### diagrams/README.md

```markdown
# Diagram Index

Seperti section Output di CONTEXT.md.

## ⚠️ Security Annotations

All `⚠️` markers trace to `12-drift-ambiguity-report.md`.
```

## Arrow Direction Rules

→ See `STAGES/K/quality-rules.md` Rule 5.

## Auto-generate PNG

Setelah semua `.puml` ditulis:

### 1. Detect PlantUML JAR

Cek apakah `plantuml.jar` telah terinstall; sebagai plugin java ataupun extension vscode.
Bila tidak ada hentikan proses lalu notif user untuk install `plantuml.jar`

### 2. Generate

```bash
cd STAGES/K/diagrams/
java -Djava.awt.headless=true -jar /path/to/plantuml.jar -tpng "*.puml" -o png/
```

### 3. Verify

- exit code = 0
- setiap PNG file size > 1000 bytes (bukan error overlay)

Bila gagal: perbaiki syntax `.puml`, ulang.

### 4. Export ke reconstruction

Jangan copy manual. Jalankan `bubat-r export <target-path> stages K` setelah PNG sukses ter-generate.

## Syntax Rules (PNG error prevention)

→ See `STAGES/K/quality-rules.md` Rule 10.
