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
- `09-component-map.md` — komponen per service, dependencies — WAJIB juga untuk dataflow diagrams (node = component, bukan service)
- `10-code-trace-map.md` — file:line refs per handler/function — WAJIB juga untuk dataflow diagrams (line ref tiap node)

Input preferred:

- `05-behavior-spine.md` — flows, branch logic, failure paths (untuk dataflow diagrams)
- `07-domain-map.md` — bounded contexts, owned tables (untuk context enrichment)
- `08-contract-map.md` — endpoints, break risk (untuk ⚠️ High pada contract)
- `12-drift-ambiguity-report.md` — CRITICAL/HIGH drift items → sumber ⚠️ annotations

## Dataflow Node Granularity — WAJIB Component Level

Node dataflow (read-path/write-path, konsolidasi & per-topik) DILARANG berhenti di level service (mis. `rectangle "be Attendance" as be`). Tiap node WAJIB pecah jadi component/handler individual, konsisten dengan `c4-component-{svc}.puml`:

- Source flow di `05-behavior-spine.md` → map tiap step ke component di `09-component-map.md`
- Tiap component node WAJIB line ref dari `10-code-trace-map.md`: `ComponentName\nfilename:function()\n(line:NNN)` (atau `(line:UNKNOWN)` bila belum diketahui — lihat Rule 4)
- Package per service tetap dipertahankan sebagai boundary visual (`package "be" as be_pkg #A9DCDF { ... }`), component individual digambar di dalamnya
- DB/storage tetap node terpisah di luar package, sama seperti c4-component

Contoh salah (service-level, DILARANG):
```puml
rectangle "be Attendance" as be #438DD5
a -down-> be : "GET /api/v1/checkin/:id, / (PASETO)"
be -down-> pg : "GetCheckin / GetCheckinByTenantAndUID"
```

Contoh benar (component-level, WAJIB):
```puml
package "be" as be_pkg #A9DCDF {
  component "CheckinHandler\nattendance_handler.go:GetCheckin()\n(line:142)" as h_checkin
}
rectangle "PostgreSQL" as pg #438DD5
a -down-> h_checkin : "GET /api/v1/checkin/:id, / (PASETO)"
h_checkin -down-> pg : "GetCheckin / GetCheckinByTenantAndUID"
```

Berlaku untuk semua file dataflow (`*-path-dataflow.puml`, `*-path-{topic}.puml`) dan sequence (`*-path-sequence*.puml`) — bukan hanya component diagram.

## Output

Generated from BUBAT-R Stage K.

| File                                        | Type             | Purpose                                                                                  | Primary Input                       |
| ------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------- | ----------------------------------- |
| `diagrams/c4-container.puml`                | C4 Container     | Container diagram: semua services, ports, tables, deprecated, external                   | 04-runtime-map                      |
| `diagrams/c4-component-{svc}.puml`          | C4 Component     | Per service: handler components + security ⚠️ + line refs                                | 09-component-map, 10-code-trace-map |
| `diagrams/read-path-dataflow.puml`          | Dataflow         | Semua read flows konsolidasi (flow header per flow), node = component               | 05-behavior-spine, 09-component-map, 10-code-trace-map |
| `diagrams/write-path-dataflow.puml`         | Dataflow         | Semua write flows konsolidasi, node = component                                     | 05-behavior-spine, 09-component-map, 10-code-trace-map |
| `diagrams/read-path-{topic}.puml`           | Dataflow (topic) | Per topik, satu flow per file (navigable), node = component                         | 05-behavior-spine, 09-component-map, 10-code-trace-map |
| `diagrams/write-path-{topic}.puml`          | Dataflow (topic) | Per topik, node = component                                                         | 05-behavior-spine, 09-component-map, 10-code-trace-map |
| `diagrams/read-path-sequence.puml`          | Sequence         | Semua read flows konsolidasi — urutan temporal antar component + DB                 | 05-behavior-spine, 09-component-map, 10-code-trace-map |
| `diagrams/write-path-sequence.puml`         | Sequence         | Semua write flows konsolidasi — urutan temporal antar component + DB                | 05-behavior-spine, 09-component-map, 10-code-trace-map |
| `diagrams/read-path-sequence-{topic}.puml`  | Sequence (topic) | Per topik read sequence, satu flow per file, participant = component                | 05-behavior-spine, 09-component-map, 10-code-trace-map |
| `diagrams/write-path-sequence-{topic}.puml` | Sequence (topic) | Per topik write sequence, satu flow per file, participant = component               | 05-behavior-spine, 09-component-map, 10-code-trace-map |
| `diagrams/README.md`                        | Index            | Index diagram: file, purpose, input artifact                                             | —                                   |
| `diagrams/png/*.png`                        | Image            | PNG generated dari setiap `.puml` — layout top-to-bottom, readable tanpa zoom horizontal | —                                   |

Write output to this stage directory first. After stage done, mark as `Done` in `00-workflow-status.md`.

Topic naming: `storage`, `catalog`, `query`, `managed`, `pipeline`, `ext-connection`, `lifecycle`

## Aturan Kualitas

→ See `STAGES/K/quality-rules.md` (Rules 1–10).

## Diagram Templates & PNG Generation

→ See `skills/puml-diagram/SKILL.md`.

## Incremental Update Protocol

| Changed artifact               | Regenerate                                                                   |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `04-runtime-map.md`            | `c4-container.puml`                                                          |
| `09-component-map.md`          | `c4-component-{svc}.puml` untuk service yang berubah + semua `*-path-dataflow.puml`/`*-path-sequence*.puml` yang memakai component dari service tsb |
| `10-code-trace-map.md`         | semua `c4-component-*.puml` + semua `*-path-dataflow.puml`/`*-path-sequence*.puml` (line refs berubah) |
| `05-behavior-spine.md`         | `*-path-dataflow.puml` + `*-path-sequence.puml` + per-topic yang terpengaruh |
| `12-drift-ambiguity-report.md` | semua files (⚠️ annotations bisa berubah)                                    |
| `08-contract-map.md`           | `c4-container.puml` + per-topic path files yang relevan                      |

## Exit Criteria

- semua containers dari `04-runtime-map.md` ada di `c4-container.puml`
- semua deprecated/external services ditampilkan (warna `#B3B3B3`)
- semua component groups dari `09-component-map.md` ada di component diagrams yang sesuai
- semua CRITICAL/HIGH dari `12-drift-ambiguity-report.md` punya `⚠️` di diagram
- semua handler components punya line ref dari `10-code-trace-map.md` (atau explicit `(line:UNKNOWN)`)
- **semua node di dataflow & sequence diagram (read-path/write-path, konsolidasi & per-topik) level component/handler — bukan level service** (lihat "Dataflow Node Granularity — WAJIB Component Level"); tiap node punya line ref
- consolidated dataflow + per-topic files keduanya ada
- **sequence diagram konsolidasi + per-topic** untuk write-path & read-path keduanya ada
- semua sequence diagram punya `++`/`--` activation pairs yang valid (tidak ada activation floating)
- tidak ada elemen tanpa evidence trace (atau explicit `[ASPIRATIONAL]`)
- **semua `.puml` ter-generate PNG** dan disimpan di `diagrams/png/` — otomatis (lihat `skills/puml-diagram/SKILL.md`)
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
