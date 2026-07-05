# Hard-Evidence Architecture Reconstruction Workflow

Status: draft operating model  
Scope: existing codebase only, tanpa dokumentasi apa pun

## 1. Goal

Workflow ini dipakai saat kondisi seperti berikut:

- hanya ada existing code
- tidak ada dokumentasi arsitektur, bisnis, konteks, atau operasional
- target akhir:
  - business/system understanding
  - domain boundaries
  - runtime/container boundaries
  - contract surfaces
  - component map
  - code traceability
  - baseline untuk change planning

Prinsip inti:

- reference design tidak diasumsikan dari nama folder, komentar, atau struktur repo permukaan
- reference design dibentuk dari hard evidence yang dapat ditelusuri
- runtime behavior, write-path, schema, contracts, deploy config lebih kuat daripada naming
- komponen arsitektur diturunkan belakangan, setelah boundary runtime, flow, dan ownership cukup stabil

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

Install / lifecycle:

```bash
ast-index version
ast-index rebuild   # first baseline from project root
ast-index update    # after branch switch / edits / pull
ast-index stats     # verify index health
```

Monorepo:

```bash
AST_INDEX_WALK_UP=1 ast-index stats
ast-index --walk-up search "Checkout"
```

Config recommended untuk repo JS/large:

```yaml
# .ast-index.yaml
exclude:
  - node_modules
  - .svelte-kit
  - build
  - dist
  - coverage
  - generated
  - vendor
```

Config optional untuk monorepo scoped analysis:

```yaml
# .ast-index.yaml
include:
  - apps
  - packages
exclude:
  - node_modules
  - generated
  - vendor
```

Rule:

- create/update `.ast-index.yaml` before first `rebuild` when repo has dependency/generated folders
- if `ast-index map` is dominated by dependencies, rebuild with excludes before scoring coverage

Peran `ast-index` dalam workflow:

- kurangi broad grep
- temukan symbol, file, usage, caller, implementation, import, module dependency cepat
- hasilkan context kecil dan struktural untuk evidence catalog
- bantu trace write-path dan contract edge tanpa baca seluruh file

Batasan:

- `refs/usages` berbasis nama, bukan resolusi semantik penuh lintas bahasa
- hasil index tetap harus diverifikasi dengan baca source pada titik keputusan penting
- string literal, config non-source, runtime logs, SQL mentah, dan generated edge mungkin tetap butuh grep/manual scan

Core commands:

```bash
ast-index map --limit 50              # compact project map
ast-index conventions                 # framework / architecture hints
ast-index search "Query"              # universal structural search
ast-index file "pattern"              # locate files
ast-index symbol "Name"               # locate symbols
ast-index class "Name"                # locate classes/interfaces/structs
ast-index outline path/to/file         # file structure before reading file
ast-index imports path/to/file         # import/dependency clues
ast-index refs "Symbol"               # definitions + usages by name
ast-index usages "Symbol"             # usage sites
ast-index callers "functionName"      # call sites
ast-index call-tree "functionName"    # call hierarchy tree
ast-index implementations "Interface" # implementations/subtypes
ast-index module ""                   # module inventory
ast-index deps "module"               # module dependencies
ast-index dependents "module"         # reverse dependencies
ast-index module-route --from A --to B # dependency path
ast-index api "module"                # public API surface
ast-index changed --base main          # changed symbols
ast-index query "SQL"                 # raw SQLite index query
ast-index db-path                     # index DB location
```

Stage command map:

| Stage                       | Primary `ast-index` commands                                       |
| --------------------------- | ------------------------------------------------------------------ |
| A Evidence Harvest          | `stats`, `map`, `conventions`, `file`, `search`, `symbol`, `query` |
| B Runtime Map               | `file`, `map`, `module`, `deps`, `dependents`, `imports`           |
| C Behavior Spine            | `search`, `refs`, `usages`, `callers`, `call-tree`, `outline`      |
| D Ownership Map             | `refs`, `usages`, `callers`, `outline`, `query`                    |
| E Domain Reconstruction     | `module`, `deps`, `dependents`, `module-route`, `api`              |
| F Contract Surface Map      | `search`, `refs`, `usages`, `api`, `imports`, `agrep`              |
| G Component Decomposition   | `outline`, `symbol`, `class`, `implementations`, `hierarchy`       |
| H Reference Design Decision | `query`, source citations, selective source reads                  |
| I Critical Gap Deepening    | `refs`, `usages`, `callers`, `call-tree`, `query`, targeted `rg`   |
| J Hierarchical Context Docs | `map`, `module`, `deps`, `dependents`, `api`, targeted `outline`   |

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
| ------- | ----------- | ------------- | -----: | ------- | ---------- | ------------------------------- | -------------------------- |
| Runtime | API service | executable    |      5 | Covered | Observed   | `package.json`, `src/server.ts` | main inbound HTTP          |
| Flow    | Checkout    | write-path    |      5 | Partial | Inferred   | `routes/checkout.ts`            | payment failure not traced |
| Data    | Order       | table/entity  |      5 | Covered | Observed   | `migrations/*orders*`           | owner candidate found      |

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
| -----: | ------------------------------ | ------------------------------------------------------------------- |
|      5 | Critical architecture spine    | main executable, top write flow, core entity, external payment/auth |
|      4 | High business/technical impact | major worker, important integration, shared table, core API         |
|      3 | Normal feature surface         | secondary flow, normal module, non-core entity                      |
|      2 | Supporting concern             | admin utility, reporting read path, helper adapter                  |
|      1 | Low architectural impact       | leaf helper, rare path, isolated script                             |

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

## 6. Reconstruction Stages

## Stage A — Evidence Harvest

Tujuan:

- kumpulkan fakta mentah
- belum simpulkan desain

Cari minimal:

- repo topology
- executable entrypoints
- routes / RPC / CLI / cron / workers
- schema / migrations / ORM models
- message queues / topics / event producers / consumers
- outbound HTTP / SDK integrations
- env vars / secrets names
- deployment manifests / docker / k8s / wrangler / terraform / CI
- tests: integration, e2e, contract, unit yang relevan
- tooling/build viability: dependency install state, typecheck, build, test commands
- observability config: logs, tracing, metrics

Output:

- `Workflow Status` updated: Stage A = `In Progress` then `Done/Blocked`
- `DOCR Candidates` updated with early subtree candidates
- `Evidence Catalog`
- `Coverage Ledger` initial
- `Main Spine` draft

Struktur minimum per evidence item:

- id
- evidence type
- location
- observed fact
- confidence
- notes

Contoh row:

| ID     | Type        | Location                                   | Fact                                             | Confidence |
| ------ | ----------- | ------------------------------------------ | ------------------------------------------------ | ---------- |
| EV-001 | route       | `apps/api/src/routes/checkout.ts`          | exposes `POST /checkout`                         | Observed   |
| EV-014 | migration   | `db/migrations/20260110_create_orders.sql` | table `orders` created with status + customer_id | Observed   |
| EV-033 | integration | `src/services/payment/client.ts`           | outbound calls to Stripe                         | Observed   |

Exit criteria:

- major entrypoints teridentifikasi
- major persistence surfaces teridentifikasi
- major external dependencies teridentifikasi
- build/test/check commands identified and attempted or marked blocked
- all discovered items diberi weight 1–5
- weight 5–4 items ditandai `Covered`, `Covered with Risk`, `Covered with Critical Risk`, `Partial`, `Uncovered`, `Unknown`, `Contradicted`, atau `Accepted Gap`

---

## Stage B — Runtime Map

Tujuan:

- identifikasi boundary runtime/deployable paling nyata

Cari:

- frontend
- API/service
- background worker
- scheduler/cron
- websocket gateway
- db
- cache
- queue
- blob/search/vector storage
- external SaaS

Aturan:

- runtime boundary > package boundary
- jangan samakan folder dengan container
- deploy together vs deploy separately wajib dicatat

Output:

- `Workflow Status` updated for Stage B
- `DOCR Candidates` updated with runtime-boundary candidates
- `Runtime Map`
- updated `Coverage Ledger`

Isi minimum:

- runtime unit
- responsibility sementara
- inbound interfaces
- outbound dependencies
- sync/async relation
- read/write role

Exit criteria:

- semua executable/deployable utama masuk peta
- communication edges utama sudah terpetakan
- runtime coverage dihitung
- uncovered runtime units weight 5–4 dicatat eksplisit

---

## Stage C — Behavior Spine

Tujuan:

- petakan end-to-end behavior inti sistem

Metode:

- pilih 5–10 flow bernilai tertinggi
- prioritaskan write-path
- sertakan failure path utama

Sumber:

- routes/controllers/handlers
- application services/use-cases
- queue consumers
- scheduled jobs
- integration/e2e tests

Format flow:

- trigger
- actor
- preconditions
- steps
- writes
- side effects
- outbound calls
- emitted events
- failure paths
- EventStorming evidence: commands, events, policies, aggregates, read models/projections, hotspots, citations
- candidate `.es`

Output:

- `Workflow Status` updated for Stage C
- `DOCR Candidates` updated with flow/hotspot candidates
- `Behavior Spine`
- updated `Coverage Ledger`

Contoh pendek:

1. `POST /checkout`
2. validate cart + actor
3. reserve inventory
4. create order
5. initiate payment
6. publish `order.created`
7. return checkout result

Exit criteria:

- flow inti bisnis sudah tercakup
- alur create/update state utama sudah jelas
- behavior coverage dihitung
- partial flow punya missing segment jelas: trigger, write, side effect, event, atau failure path

---

## Stage D — Data Ownership Map

Tujuan:

- tentukan siapa benar-benar memiliki data dan invariant

Cari:

- siapa menulis entity/table/collection
- siapa enforce invariant
- siapa reference owner / authoritative writer
- siapa hanya read/projection/cache
- siapa owns/publishes events
- siapa owns/refreshes projections/read models
- cross-module writes
- shared table access
- transaction boundaries

Aturan:

- write owner > read user
- invariant owner > DTO owner
- shared database tidak otomatis berarti shared ownership

Output:

- `Workflow Status` updated for Stage D
- `DOCR Candidates` updated with ownership-boundary candidates
- `Ownership Map`
- updated `Coverage Ledger`
- event/projection ownership evidence

Struktur minimum:

- entity/data object
- owner candidate
- write paths
- invariants
- dependents/readers
- conflicts/ambiguity

Exit criteria:

- entity bisnis utama punya owner candidate
- area shared ownership terdeteksi eksplisit
- data ownership coverage dihitung
- uncovered/ambiguous owner untuk entity weight 5–4 masuk gap list

---

## Stage E — Domain Reconstruction

Tujuan:

- bentuk candidate bounded contexts dari behavior + ownership, bukan dari folder names

Teknik grouping:

- rule bisnis berubah bersama
- data dengan owner sama
- vocabulary yang muncul konsisten di code paths penting
- command/event surface konsisten
- transactional boundary nyata

Pisahkan:

- decision-making zone
- read/projection zone
- integration/translation zone

Output:

- `Workflow Status` updated for Stage E
- `DOCR Candidates` updated with context-boundary candidates
- `Domain Map`

Isi minimum per context:

- name sementara atau final
- responsibility
- owned entities
- commands
- emitted/consumed events
- policies/process rules
- read models/projections
- upstream/downstream relations
- ambiguity notes

Exit criteria:

- capability inti sudah terkelompok dalam context masuk akal
- cross-context relation sudah terlihat

---

## Stage F — Contract Surface Map

Tujuan:

- petakan semua hubungan antar-boundary yang bersifat kontraktual

Termasuk:

- REST/GraphQL/RPC
- events/messages
- projection/read-model contracts
- webhooks
- shared DB access
- file exchange
- auth claims/tokens
- feature flags/config contracts

Output:

- `Workflow Status` updated for Stage F
- `DOCR Candidates` updated with contract-boundary candidates
- `Contract Map`

Isi minimum:

- producer
- consumer
- contract type
- schema/source
- versioning status
- break risk

Exit criteria:

- semua interaction penting sudah punya contract surface
- shortcut/shared-db coupling terdeteksi

---

## Stage G — Component Decomposition

Tujuan:

- turunkan komponen arsitektur di dalam runtime/container/context yang sudah jelas

Komponen tipikal:

- controller/handler
- application service / use-case
- domain service / policy
- repository
- adapter/gateway
- consumer/worker
- mapper/translator
- orchestrator

Aturan:

- komponen didefinisikan oleh responsibility
- file list bukan komponen
- helper teknis murni tidak otomatis jadi komponen arsitektur
- Stage G tidak boleh jalan sebelum Runtime Map, Behavior Spine, dan Ownership Map cukup stabil

Output:

- `Workflow Status` updated for Stage G
- `DOCR Candidates` updated with component-locality hints where useful
- `Component Map`
- `Code Trace Map`

Isi minimum:

- component
- responsibility
- depends on
- owned contracts or policies
- file/symbol/line trace
- drift notes

Exit criteria:

- tiap runtime/container utama punya decomposition yang dapat dijelaskan
- trace ke code tersedia

---

## Stage H — Reference Design Decision

Tujuan:

- deklarasikan reference design arsitektur hasil rekonstruksi dari code yang ada sekarang

Pisahkan dua layer:

1. `Verified Current State`
2. `Unresolved / Ambiguous Areas`

Keputusan per area:

- accept current implementation as reference design
- mark ambiguity and require human validation
- mark contradiction antar bagian code dan perlu investigasi lanjut

Output:

- `Workflow Status` updated for Stage H
- `Architecture Reference Design`
- `Drift / Ambiguity Report`

Exit criteria:

- jelas mana verified reference design
- jelas mana area yang belum terbukti
- jelas mana konflik bukti yang perlu diselesaikan

---

## Stage I — Critical Gap Deepening Loop

Tujuan:

- ulangi investigasi pada gap critical sampai stop condition tercapai atau batas loop terlampaui
- naikkan coverage area yang akan diubah, bukan seluruh sistem
- ubah `Partial/Unknown/Contradicted` weight 5–4 menjadi `Covered` atau accepted gap eksplisit

Kapan dijalankan:

- setelah Stage H reference design v0.1, atau
- langsung setelah Stage D bila gap critical sudah jelas, atau
- sebelum major change pada area tertentu

Input:

- `02-coverage-ledger.md`
- `11-reference-design.md`
- `12-drift-ambiguity-report.md`
- intended change area, bila ada

Output:

- `Workflow Status` updated for Stage I
- `gaps/GAP-xxx-*.md`
- updated `02-coverage-ledger.md`
- updated affected maps: behavior, ownership, contract, component, code trace
- updated `11-reference-design.md`
- updated `12-drift-ambiguity-report.md`

Loop instruction format:

```text
run critical deepening for <area> until <stop-condition> or max <N> loops
```

Examples:

```text
run critical deepening for checkout-ledger until critical coverage >= 90% or max 3 loops
run critical deepening for inventory ownership until no Unknown weight-5 or max 5 loops
run critical deepening for tenant isolation until all tenant API routes classified or max 4 loops
```

Per-loop protocol:

1. Select top gap by weight, risk, and intended change relevance.
2. Create/update `gaps/GAP-xxx-*.md`.
3. Write search plan before searching.
4. Run structural search with `ast-index` first.
5. Run targeted `rg` only for literals/config/ORM write patterns.
6. Read exact files/symbols for decision points.
7. Record evidence and counter-evidence.
8. Update status: `Covered`, `Partial`, `Unknown`, `Contradicted`, or `Accepted Gap`.
9. Update coverage numbers.
10. Decide continue/stop.

Stop condition options:

- selected area critical coverage `>= 90%`
- no `Unknown` weight-5 item remains
- no unresolved `Contradicted` item remains
- no unresolved `Covered with Critical Risk` remains for selected area
- all writers for selected data object mapped
- all failure paths for selected flow traced
- all external contract request/response/failure semantics traced
- route/API guard classification complete for auth/tenant/security areas
- build/check/test viability proven for change-bearing runtime, or explicitly blocked
- max loop count reached
- blocked by missing runtime/secret/access; create blocker note

Default stop condition for major change:

```text
critical coverage >= 90%
AND no Unknown weight-5
AND no unresolved Contradicted
AND no unresolved Covered with Critical Risk
AND owner/writer list complete for changed data
AND failure path traced for changed flow
AND build/check/test viability proven or explicitly risk-accepted
```

Per-loop verdict format:

```text
Coverage Verdict: Pass/Fail
Readiness Verdict: Ready/Yellow/Not Ready
Reason: <blocking risks or accepted gaps>
Next Loop: <gap-id or stop>
```

Exit criteria:

- every loop leaves artifacts in repo
- coverage delta recorded
- readiness verdict recorded separately from coverage verdict
- unresolved gaps explicitly remain in drift/ambiguity report
- if max loop reached without meeting target, Stage I returns `Not Ready` for selected area
- if coverage passes but critical risk remains, Stage I returns `Coverage Pass / Readiness Not Ready`

---

## Stage J — Hierarchical Context Docs Materialization

Tujuan:

- materialize context docs hirarkis dekat code di repo target
- distribusikan hasil rekonstruksi ke subtree penting agar next run lebih lokal dan hemat context
- pertahankan unknown/contradiction sebagai context lokal, bukan menyapu ambiguity

Kapan dijalankan:

- setelah Stage H untuk baseline global, atau
- setelah Stage I pada area yang akan sering disentuh, atau
- sebelum handoff ke agent/tim berikutnya

Input minimum:

- `02-coverage-ledger.md`
- `03-main-spine.md`
- `04-runtime-map.md`
- `05-behavior-spine.md`
- `06-ownership-map.md`

Input preferred:

- `07-domain-map.md`
- `08-contract-map.md`
- `11-reference-design.md`
- `12-drift-ambiguity-report.md`

Output:

- `Workflow Status` updated for Stage J
- root `AGENTS.md` pada repo target
- selected child `AGENTS.md` pada subtree durable boundary
- refreshed parent/child index untuk docs yang dimaterialisasi

Aturan:

- jangan generate `AGENTS.md` di semua folder
- pilih subtree dengan runtime, ownership, contract, risk, atau main-spine significance yang jelas
- isi doc harus evidence-backed; tidak boleh lebih kuat dari confidence yang ada
- child doc adalah projection ringkas dari artifacts, bukan source of truth baru
- marker-block management direkomendasikan bila repo target juga diedit manusia

Exit criteria:

- root context doc ada dan menunjuk subtree penting
- area weight 5–4 yang boundary-worthy punya context lokal
- no false certainty introduced
- contradictions/unknowns material tetap terlihat

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

## 9. Recommended Execution Order

Urutan wajib:

0. Initialize `00-workflow-status.md`
1. A Evidence Harvest
2. B Runtime Map
3. C Behavior Spine
4. D Ownership Map
5. E Domain Reconstruction
6. F Contract Surface Map
7. G Component Decomposition
8. H Reference Design Decision
9. I Critical Gap Deepening Loop, when critical coverage target not met or before major change
10. J Hierarchical Context Docs Materialization, when local durable context near code is useful

Aturan:

- jangan lompat ke component decomposition di awal
- boleh scan komponen sejak awal untuk riset, tapi belum boleh dijadikan output arsitektur final
- domain naming final ditetapkan setelah ownership dan behavior cukup kuat
- jika Stage H menghasilkan critical coverage di bawah target, jalankan Stage I loop sebelum major change
- jika hasil rekonstruksi akan dipakai ulang lintas sesi/agent, jalankan Stage J untuk materialize context docs dekat code

---

## 10. Timeboxed First Pass

### First 60–90 minutes

Target:

- entrypoints
- runtime units
- schema surfaces
- outbound integrations
- jobs/events

Deliver:

- first `Evidence Catalog`
- first `Coverage Ledger`
- draft `Main Spine`
- draft `Runtime Map`

### Next 2–4 hours

Target:

- 3–5 write flows
- entity ownership candidates

Deliver:

- first `Behavior Spine`
- first `Ownership Map`
- updated coverage scores for runtime, behavior, data ownership

### Next 2–4 hours

Target:

- domain grouping
- contracts
- component decomposition

Deliver:

- `Domain Map`
- `Contract Map`
- `Component Map`

---

## 11. Heuristics

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

## 12. Quality Gates

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

## 13. Operating Maxim

Gunakan kalimat kerja ini:

- evidence decides
- scan runtime before naming domains
- trace writes before drawing boundaries
- prove ownership before declaring contexts
- derive components after runtime and domain are stable

---

## 14. Minimal Template Index

```text
reconstruction/
  00-workflow-status.md
  01-evidence-catalog.md
  02-coverage-ledger.md
  03-main-spine.md
  04-runtime-map.md
  05-behavior-spine.md
  06-ownership-map.md
  07-domain-map.md
  08-contract-map.md
  09-component-map.md
  10-code-trace-map.md
  11-reference-design.md
  12-drift-ambiguity-report.md
  13-readiness-verdict.md        # optional, when Stage I/readiness decision runs
  docr-candidates.md
  gaps/
    GAP-001-example.md
```

Optional Stage J target-repo output:

```text
AGENTS.md
apps/AGENTS.md
packages/AGENTS.md
services/<area>/AGENTS.md
```
