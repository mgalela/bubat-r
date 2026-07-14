# Stage K — Diagram Suite

Tujuan:

- Generate diagram arsitektur PlantUML dan PNG dari artifacts rekonstruksi yang sudah terverifikasi
- Akurat (evidence-backed), navigable (per-topik + konsolidasi), security-aware (⚠️ inline)

Kapan dijalankan:

- Setelah Stage H (reference design v0.1 tersedia), atau
- Setelah Stage I bila critical area perlu diagram ter-update, atau
- Setiap kali artifact input (03, 04, 05, 07, 08, 09, 10, 12) berubah signifikan

## Input

Minimum:

- `03-main-spine.md` — services, key abstractions, security model
- `04-runtime-map.md` — containers, ports, deployment units
- `09-component-map.md` — komponen per service, dependencies
- `10-code-trace-map.md` — file:line refs per handler/function

Preferred:

- `05-behavior-spine.md` — flows, branch logic, failure paths
- `07-domain-map.md` — bounded contexts, owned tables
- `08-contract-map.md` — endpoints, break risk
- `12-drift-ambiguity-report.md` — CRITICAL/HIGH drift → sumber ⚠️ annotations

Stage K primarily reads reconstruction artifacts, not raw code. ast-index hanya untuk verifikasi line refs.

## Output

Write to `STAGES/K/diagrams/` first. After stage done:

```bash
cp -r STAGES/K/diagrams/ <target>/reconstruction/diagrams/
```

| File                                | Type             | Purpose                                             | Primary Input                       |
| ----------------------------------- | ---------------- | --------------------------------------------------- | ----------------------------------- |
| `diagrams/c4-container.puml`        | C4 Container     | Semua services, ports, tables, deprecated, external | 04-runtime-map                      |
| `diagrams/c4-component-{svc}.puml`  | C4 Component     | Per service: handlers + ⚠️ + line refs              | 09-component-map, 10-code-trace-map |
| `diagrams/read-path-dataflow.puml`  | Dataflow         | Semua read flows konsolidasi                        | 05-behavior-spine                   |
| `diagrams/write-path-dataflow.puml` | Dataflow         | Semua write flows konsolidasi                       | 05-behavior-spine                   |
| `diagrams/read-path-{topic}.puml`   | Dataflow (topic) | Per topik, satu flow per file                       | 05-behavior-spine                   |
| `diagrams/write-path-{topic}.puml`  | Dataflow (topic) | Per topik                                           | 05-behavior-spine                   |
| `diagrams/README.md`                | Index            | Index diagram: file, purpose, input artifact        | —                                   |
| `diagrams/png/*.png`                | Image            | PNG dari setiap `.puml`                             | —                                   |

Topic names: `storage`, `catalog`, `query`, `managed`, `pipeline`, `ext-connection`, `lifecycle`

## Quality Rules & Templates

- Quality rules (9 rules, color palette): [`quality-rules.md`](quality-rules.md)
- PlantUML templates + PNG generation + syntax rules: [`../../skills/puml-diagram/SKILL.md`](../../skills/puml-diagram/SKILL.md)

## Incremental Update Protocol

| Changed artifact               | Regenerate                                              |
| ------------------------------ | ------------------------------------------------------- |
| `04-runtime-map.md`            | `c4-container.puml`                                     |
| `09-component-map.md`          | `c4-component-{svc}.puml` untuk service yang berubah    |
| `10-code-trace-map.md`         | semua `c4-component-*.puml` (line refs berubah)         |
| `05-behavior-spine.md`         | `*-path-dataflow.puml` + per-topic yang terpengaruh     |
| `12-drift-ambiguity-report.md` | semua files (⚠️ annotations bisa berubah)               |
| `08-contract-map.md`           | `c4-container.puml` + per-topic path files yang relevan |

## Exit Criteria

- Semua containers dari `04-runtime-map.md` ada di `c4-container.puml`
- Semua deprecated/external services ditampilkan (`#B3B3B3`)
- Semua component groups dari `09-component-map.md` ada di component diagrams
- Semua CRITICAL/HIGH dari `12-drift-ambiguity-report.md` punya `⚠️` di diagram
- Semua handler components punya line ref (atau explicit `(line:UNKNOWN)`)
- Consolidated dataflow + per-topic files keduanya ada
- Tidak ada elemen tanpa evidence trace (atau explicit `[ASPIRATIONAL]`)
- Semua `.puml` ter-generate PNG di `diagrams/png/` — exit code 0, size > 1KB
- Semua PNG readable tanpa zoom horizontal (`top to bottom direction` + `-down->` main path)
- `diagrams/README.md` ter-update
- Workflow Status updated untuk Stage K
