# Hard-Evidence Architecture Reconstruction Workflow

Status: draft operating model  
Scope: existing codebase only, tanpa dokumentasi apa pun

## 1. Goal

Workflow ini dipakai saat kondisi seperti berikut:

- hanya ada existing code
- target akhir:
  - business/system understanding
  - domain boundaries
  - runtime/container boundaries
  - contract surfaces
  - component map
  - code traceability
  - baseline untuk change planning

Prinsip inti:

- reference design tidak diasumsikan dari nama folder/komentar/struktur repo permukaan, tapi dibentuk dari hard evidence yang dapat ditelusuri
- runtime behavior, write-path, schema, contracts, deploy config lebih kuat daripada naming
- komponen arsitektur diturunkan setelah boundary runtime, flow, dan ownership cukup stabil

---

## 2. Evidence Hierarchy

Urutan prioritas bukti:

1. runtime behavior / observed operation
2. write-path code
3. schema / migrations / contract definitions
4. tests yang benar-benar merepresentasikan perilaku
5. deploy / infra / ops config
6. read-path code
7. naming / comments

Aturan:

- bila bukti level rendah konflik dengan level tinggi, level tinggi menang
- naming tidak boleh dipakai sebagai penentu boundary tanpa bukti lain
- read-path tidak boleh mendominasi rekonstruksi domain bila write-path menunjukkan ownership berbeda

---

## 3. AST Index Acceleration

Gunakan `ast-index` sebagai mesin navigasi struktural utama untuk workflow ini.

Rule:

- create/update `.ast-index.yaml` before first `rebuild` when repo has dependency/generated folders
- if `ast-index map` is dominated by dependencies, rebuild with excludes before scoring coverage

Batasan:

- `refs/usages` berbasis nama, bukan resolusi semantik penuh lintas bahasa
- hasil index tetap harus diverifikasi dengan baca source pada titik keputusan penting
- string literal, config non-source, runtime logs, SQL mentah, dan generated edge mungkin tetap butuh grep/manual scan

---

## 4. Anti-Bias Guardrails

### 4.1 Separation rule

Pisahkan tiga aktivitas:

1. evidence harvest
2. inference
3. reference design decision

Jangan campur dalam satu langkah.

### 4.2 Counter-evidence rule

Setiap hipotesis wajib dicari bukti lawannya.

Contoh:

- hipotesis: `billing` memiliki invoice
- lawan yang harus dicari: siapa lagi menulis invoice state, siapa enforce invariant, siapa publish event invoice berubah

### 4.3 Unknown rule

Kalau belum terbukti, tandai unknown. Jangan isi gap dengan asumsi halus.

### 4.4 Citation rule

Setiap kesimpulan arsitektur penting wajib punya sitasi:

- file
- symbol
- route
- migration
- config
- runtime artifact

### 4.5 Hard-evidence-first rule

Jangan mulai dari domain names atau component names.
Mulai dari:

- executable boundary
- write path
- data ownership
- contract edge

---

## 5. Coverage and Scoring Model

Stage A–D wajib berorientasi coverage:

- cari semua evidence yang dapat ditemukan secara ekonomis
- beri bobot
- fokuskan analisis pada yang utama
- tandai yang sudah tercakup, belum tercakup, dan tidak relevan
- hasilkan angka coverage yang bisa dibandingkan antar-run

### 5.1 Coverage Ledger

Buat `coverage-ledger.md` sejak Stage A. Update sampai Stage D selesai.

Kolom minimum:

| Area    | Item        | Evidence Type | Weight | Status  | Confidence | Citation                        | Notes                      |
| ------- | ----------- | ------------- | ------ | ------- | ---------- | ------------------------------- | -------------------------- |
| Runtime | API service | executable    | 5      | Covered | Observed   | `package.json`, `src/server.ts` | main inbound HTTP          |
| Flow    | Checkout    | write-path    | 5      | Partial | Inferred   | `routes/checkout.ts`            | payment failure not traced |
| Data    | Order       | table/entity  | 5      | Covered | Observed   | `migrations/*orders*`           | owner candidate found      |

Status values:

- `Covered` — cukup bukti dan trace, no material unresolved risk
- `Covered with Risk` — evidence cukup, tapi ada risk non-blocking atau design decision tersisa
- `Covered with Critical Risk` — evidence cukup, tapi ada unresolved critical risk; tidak boleh dianggap ready untuk major change
- `Partial` — bukti ada tapi path/owner/edge belum lengkap
- `Uncovered` — diketahui ada tapi belum ditelusuri
- `Unknown` — indikasi ada, bukti belum cukup
- `Contradicted` — bukti saling bertentangan
- `Accepted Gap` — gap diketahui dan diterima eksplisit dengan reason/owner/expiry
- `N/A` — tidak relevan untuk repo ini

### 5.2 Weighting

Bobot 1–5:

| Weight | Meaning                        | Examples                                                            |
| ------ | ------------------------------ | ------------------------------------------------------------------- |
| 5      | Critical architecture spine    | main executable, top write flow, core entity, external payment/auth |
| 4      | High business/technical impact | major worker, important integration, shared table, core API         |
| 3      | Normal feature surface         | secondary flow, normal module, non-core entity                      |
| 2      | Supporting concern             | admin utility, reporting read path, helper adapter                  |
| 1      | Low architectural impact       | leaf helper, rare path, isolated script                             |

Rule:

- Stage A–D harus berusaha menemukan semua item weight 5–4
- weight 3 dicakup bila terkait flow utama
- weight 1–2 boleh dicatat sebagai `Uncovered` jika tidak mempengaruhi spine

### 5.3 Coverage Formula

Hitung weighted coverage:

```text
coverage = sum(weight for Covered/Covered with Risk/Covered with Critical Risk + 0.5 * weight for Partial) / sum(weight for all non-N/A items)
```

Pisahkan coverage per dimensi:

- runtime coverage
- behavior coverage
- data ownership coverage
- integration/contract coverage

Target awal:

- Stage A: inventory coverage >= 70% untuk weight 5–4
- Stage B: runtime coverage >= 80% untuk executable utama
- Stage C: behavior coverage >= 70% untuk write-path utama
- Stage D: data ownership coverage >= 70% untuk entity utama

Jika target belum tercapai:

- lanjut boleh, tapi `coverage-ledger.md` wajib tandai gap
- Stage H tidak boleh memasukkan area gap sebagai verified reference design

Risk override rule:

- numeric coverage pass does not imply readiness
- any unresolved `Covered with Critical Risk`, `Contradicted`, or high-impact `Accepted Gap` can force readiness verdict to `Not Ready`
- always report coverage verdict and readiness verdict separately

### 5.4 Main-Spine Selection

Setelah Stage A, pilih `main spine`:

- top 3–10 write flows
- top runtime units
- top entities
- top external integrations

Kriteria utama:

- ada write state
- ada revenue/risk/compliance/security impact
- banyak dependents
- sering menjadi entrypoint perubahan
- menjadi reference data penting

Output:

- `main-spine.md`

Isi minimum:

- selected item
- reason
- weight
- evidence citation
- expected downstream stages

### 5.5 Done/Not-Done Tracking

Setiap Stage A–D output wajib punya section:

```markdown
## Coverage Summary

- Weighted coverage: NN%
- Covered weight-5 items: X/Y
- Partial items: ...
- Uncovered high-weight items: ...
- Unknowns requiring validation: ...
```

---

## 5.6 Workflow Status Tracking

Create `00-workflow-status.md` at run start.

Purpose:

- show exactly which stages ran
- prevent absence of output from being misread as missing capability
- distinguish `Not Run`, `In Progress`, `Done`, and `Blocked`
- record optional overlay usage: research, docs-feed, DOCR

Rules:

- initialize before Stage A
- update after every completed stage
- if run stops early, explicitly mark later stages `Not Run` or `Blocked`
- if expected artifacts are absent, status doc must explain why
- `bubat-r status` should read this file first

Minimum fields:

- highest completed stage
- checklist for T0, A–J, optional overlays
- coverage snapshot
- active gaps
- next recommended step

## 5.8 Multi-Directory Federation

Ketika user menjalankan `bubat-r run` di beberapa direktori terpisah (e.g. root, backend, frontend), tiap run menghasilkan `00-workflow-status.md` sendiri yang terisolasi. Gunakan `bubat-r link` untuk menyambungkan node-node tersebut.

Setelah `bubat-r run` selesai di suatu direktori, jalankan dari root:

```text
bubat-r link ./backend
bubat-r link ./frontend
```

Efek:

- Tambah `## Cross-Dir Links` di masing-masing `00-workflow-status.md`
- Tambah `## Federation Index` di root node (auto-detect)
- Bidirectional — kedua node saling referensi

Query resolution lintas-direktori:

1. Buka `00-workflow-status.md` node saat ini
2. Cek `## Cross-Dir Links` → cari topic
3. Jika perlu lebih luas → buka root's `## Federation Index` → lookup topic → navigate ke primary node
4. Buka primary node's `## Stage Checklist` → ambil artifact path

Detail lengkap: `docs/RFC-multi-dir-federation.md` dan `commands/link.md`.

---

## 5.7 DOCR Candidate Tracking

Do not generate full hierarchical context docs during every stage.

Instead, maintain lightweight DOCR candidate tracking during Stage A–H.

Purpose:

- preserve subtree candidates for later Stage J selection
- capture local ambiguity/risk pointers near likely boundaries
- reduce repeated boundary rethinking across sessions
- avoid false certainty and doc churn from premature local docs

Rules:

- maintain `docr-candidates.md` as staging artifact only
- canonical truth remains `01–12` artifacts
- candidate tracking may be updated at any stage A–H
- Stage J remains sole full materialization step for root/child `AGENTS.md`
- Stage I may refresh nearest existing child doc only if DOCR already exists for touched area

Minimum fields:

- subtree path
- candidate reason
- signal tags (`RT`, `WR`, `CT`, `RS`, `MS`, `CH`, `SZ`)
- score or priority
- stage first seen
- local ambiguity pointer
- materialization readiness

---

## 6. Recommended Execution Order

Urutan wajib:

Initialize `00-workflow-status.md` -> A -> B -> C -> D -> E -> F -> G -> H -> I (when critical coverage target not met or before major change) -> J (when local durable context near code is useful)

Aturan:

- jangan lompat ke component decomposition di awal
- boleh scan komponen sejak awal untuk riset, tapi belum boleh dijadikan output arsitektur final
- domain naming final ditetapkan setelah ownership dan behavior cukup kuat
- jika Stage H menghasilkan critical coverage di bawah target, jalankan Stage I loop sebelum major change
- jika hasil rekonstruksi akan dipakai ulang lintas sesi/agent, jalankan Stage J untuk materialize context docs dekat code

---

## 7. Confidence Model

Setiap temuan wajib punya status salah satu:

- `Observed` — terlihat langsung di code/runtime/config/schema
- `Inferred` — kesimpulan kuat dari beberapa observed facts
- `Assumed` — belum cukup bukti, perlu validasi manusia
- `Contradicted` — ada bukti yang saling menolak
- `Unknown` — belum ada bukti cukup

Aturan:

- reference design final harus meminimalkan `Assumed`
- `Contradicted` wajib masuk drift/ambiguity report
- `Unknown` pada area penting wajib jadi backlog investigation

---

## 8. Deliverable Set

Workflow ini menghasilkan paket artefak berikut:

1. `workflow-status.md`
2. `evidence-catalog.md`
3. `coverage-ledger.md`
4. `main-spine.md`
5. `runtime-map.md`
6. `behavior-spine.md`
7. `ownership-map.md`
8. `domain-map.md`
9. `contract-map.md`
10. `component-map.md`
11. `code-trace-map.md`
12. `architecture-reference-design.md`
13. `drift-ambiguity-report.md`
14. `docr-candidates.md`
15. optional `gaps/GAP-xxx-*.md` from Stage I deepening loops
16. optional `readiness-verdict.md` when Stage I or takeover decision runs
17. optional hierarchical context docs in target repo: root `AGENTS.md` + selected child `AGENTS.md` from Stage J

Kalau ingin dipetakan ke penyusunan dokumen arsitektur:

- discovery intent = Evidence Catalog + Runtime Map
- flows = Behavior Spine + candidate EventStorming `.es`
- bounded contexts = Domain Map + event ownership
- data model = Ownership Map + event/projection ownership
- context/container = Runtime Map + Contract Map
- component = Component Map + Code Trace Map
- governance baseline = Reference Design + Drift/Ambiguity Report

---

## 9. Heuristics

Gunakan heuristik ini:

- write path > read path
- data owner > folder owner
- runtime boundary > module boundary
- invariant > entity name
- contract edge > helper call graph
- deploy reality > package layout
- observed side effect > stated responsibility

Red flags:

- multiple modules write same business state
- shared DB dipakai sebagai integration shortcut
- service split but shared transaction remains
- context names muncul tapi ownership tidak jelas
- package names imply architecture not supported by deploy/runtime

---

## 10. Quality Gates

Reconstruction dianggap layak kalau:

- major runtime units identified
- Stage A–D coverage ledger complete for discovered weight 5–4 items
- runtime coverage >= 80% for primary executable units, or gap explicitly accepted
- behavior coverage >= 70% for top write-paths, or gap explicitly accepted
- data ownership coverage >= 70% for core entities, or gap explicitly accepted
- build/test/check viability recorded as Pass/Fail/Blocked
- top business write flows traced end-to-end
- main business entities have ownership candidate
- cross-boundary contracts inventoried
- main components trace to code
- contradictions explicitly logged
- final reference design statement distinguishes verified vs unresolved
- coverage verdict and readiness verdict separated when Stage I runs
- jika Stage J dijalankan, root/child `AGENTS.md` target repo valid, ringkas, dan sinkron dengan artifacts

Major-change readiness dianggap layak kalau:

- Stage I loop selesai untuk selected area
- selected area critical coverage >= 90%
- no `Unknown` weight-5 in selected area
- no unresolved `Contradicted` in selected area
- no unresolved `Covered with Critical Risk` in selected area
- changed data owner/writer list complete
- changed flow failure path traced
- build/check/test viability proven for affected runtime or explicitly risk-accepted
- if max loop reached before target, status = `Not Ready` unless explicit risk acceptance recorded

Reconstruction dianggap belum layak kalau:

- hanya berupa folder inventory
- terlalu bergantung pada naming
- tidak ada ownership analysis
- tidak ada coverage ledger
- weight 5–4 gaps tidak ditandai
- tidak ada citations
- verified reference design dan unresolved area tercampur

Major-change readiness belum layak kalau:

- Stage I not run for selected high-risk area
- max loop reached and stop condition unmet
- coverage passes but unresolved `Covered with Critical Risk` remains
- high-risk gap remains hidden outside drift/ambiguity report
- build/check/test viability is failing or unknown for affected runtime
- code change plan ignores `Not Ready` gap status

---

## 11. Operating Maxim

Gunakan kalimat kerja ini:

- evidence decides
- scan runtime before naming domains
- trace writes before drawing boundaries
- prove ownership before declaring contexts
- derive components after runtime and domain are stable
