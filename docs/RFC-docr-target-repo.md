# RFC V2 — DOCR-style Hierarchical Context Docs for Target Repositories

## 1. Summary

BUBAT-R perlu menambah kemampuan untuk menghasilkan **dokumen hirarkis dekat code** di **repo target yang sedang dianalisa**:

- root doc memberi peta global repo
- child docs memberi context lokal per subtree penting
- doc terdekat menjadi ringkasan utama untuk area itu
- semua isi diturunkan dari hard evidence, bukan asumsi

Tujuan utama: **distribusi context existing code** agar rekonstruksi berikutnya lebih cepat, lebih lokal, lebih hemat context window, dan lebih durable lintas agent/sesi.

---

## 2. Problem Statement

Saat ini BUBAT-R kuat untuk menghasilkan artifact terpusat di:

```text
reconstruction/
```

Masalah:

- context tetap terkonsentrasi di satu lokasi
- agent berikutnya masih perlu scan ulang repo besar
- boundary lokal tidak punya ringkasan dekat code
- deepening untuk area tertentu masih mahal secara context
- pengetahuan durable tentang subtree penting belum “menempel” ke subtree itu sendiri

Diperlukan layer baru:

- bukan mengganti artifact utama
- tapi mematerialisasi **context terkompresi per subtree**

---

## 3. Goals

### 3.1 Primary goals

- hasilkan root + child docs di repo target
- isi docs berupa context existing code per scope direktori
- pilih hanya subtree yang benar-benar durable boundary
- pastikan isi docs evidence-backed
- sinkronkan docs dengan hasil rekonstruksi BUBAT-R

### 3.2 Secondary goals

- bantu takeover
- bantu next-agent continuity
- bantu scoped major change analysis
- bantu gap deepening per area
- bantu navigasi monorepo besar

---

## 4. Non-Goals

Fitur ini tidak bertujuan untuk:

- mengubah repo target menjadi governance framework penuh
- mengganti `reconstruction/*` sebagai artifact utama
- menulis panduan coding generic
- membuat `AGENTS.md` di semua folder
- menyatakan certainty palsu pada area ambiguous
- mengganti evidence hierarchy BUBAT-R

---

## 5. Terminology

### 5.1 Target repo

Repo existing project yang sedang dianalisa BUBAT-R.

### 5.2 Context doc

Dokumen lokal yang menjelaskan existing code dalam scope folder tertentu.

### 5.3 Root context doc

`AGENTS.md` di root target repo. Ringkasan global.

### 5.4 Child context doc

`AGENTS.md` di subtree tertentu. Ringkasan lokal.

### 5.5 Durable boundary

Folder/subtree yang cukup stabil dan bermakna untuk punya context sendiri:

- runtime boundary
- domain boundary
- ownership boundary
- contract boundary
- high-risk change area

---

## 6. Core Design Principle

**Struktur distribusi context**.

Aturan intinya:

- root doc = global orientation
- child doc = local context contract
- nearest doc = entrypoint context tercepat
- parent tetap memberi framing global
- child tidak boleh mengklaim lebih kuat dari evidence

---

## 7. Output Model

## 7.1 Existing output remains

BUBAT-R tetap menghasilkan:

```text
reconstruction/
  01-evidence-catalog.md
  02-coverage-ledger.md
  ...
  12-drift-ambiguity-report.md
  13-readiness-verdict.md
```

## 7.2 New optional output

BUBAT-R juga dapat menghasilkan:

```text
<target-repo>/
  AGENTS.md
  apps/AGENTS.md
  apps/api/AGENTS.md
  packages/AGENTS.md
  packages/billing/AGENTS.md
```

Ini bukan pengganti `reconstruction/`.
Ini layer tambahan untuk **localized durable context**.

---

## 8. Source-of-Truth Rules

Semua context doc harus tunduk pada evidence hierarchy BUBAT-R:

1. runtime behavior / observed operation
2. write-path code
3. schema / migrations / contract definitions
4. representative tests
5. deploy / infra / ops config
6. read-path code
7. naming / comments

Rules:

- docs turunan dari evidence
- docs tidak boleh override evidence
- docs tidak boleh menutup contradiction
- docs boleh menandai unknown
- docs boleh menandai inferred, tapi harus jelas

---

## 9. Doc Creation Policy

## 9.1 Create docs only for meaningful boundaries

Jangan generate doc untuk semua folder.

## 9.2 Create criteria

Child context doc layak dibuat bila folder punya beberapa ciri berikut:

- executable entrypoint
- deploy/runtime role jelas
- write ownership penting
- external/internal contract surface
- subtree besar/kompleks
- bounded context candidate
- risk tinggi
- area prioritas main spine
- change hotspot
- child subtrees bermakna

## 9.3 Avoid criteria

Jangan buat child doc bila folder:

- hanya helper kecil
- hanya pengelompokan kosmetik
- tidak punya responsibility stabil
- terlalu tipis
- value context rendah
- cepat basi tanpa manfaat

---

## 10. Boundary Selection Heuristic

BUBAT-R sebaiknya memakai scoring untuk memilih subtree.

### 10.1 Suggested score factors

- executable/runtime entrypoint: +5
- write-path ownership: +5
- external/internal contract surface: +4
- high-risk/critical area: +4
- many dependents: +3
- large subtree complexity: +3
- major-change likelihood: +3
- projection/read-model only but important: +2
- helper-only: -4
- no clear purpose: -5

### 10.2 Threshold behavior

- score tinggi → create child doc
- score sedang → inherit parent only
- score rendah → no local doc

### 10.3 Hard override

Walau score moderat, tetap buat doc bila:

- area weight-5
- contradiction material
- takeover critical
- frequent change hotspot
- deployment-critical runtime

---

## 11. Required Document Shapes

## 11.1 Root doc format

Path:

```text
<target-repo>/AGENTS.md
```

### Required sections

- Purpose
- Repo Shape
- Top Runtime Units
- Main Spine Areas
- Global Contracts
- High-Risk / Ambiguous Areas
- Evidence Posture
- Child DOCR Index

### Intent

Doc ini menjawab:

- repo ini sistem apa
- runtime utamanya apa
- area kritisnya mana
- subtree pentingnya apa
- harus lanjut baca child doc mana

## 11.2 Child doc format

Path example:

```text
<target-repo>/apps/api/AGENTS.md
```

### Required sections

- Purpose
- Runtime Role
- Key Entrypoints
- Owned / Primary Data
- Important Flows
- Contracts / Integrations
- Invariants / Risks
- Evidence Anchors
- Child DOCR Index

### Optional sections

- Deploy Notes
- Test Signals
- Known Gaps
- Related Reconstruction Artifacts

### Intent

Doc ini menjawab:

- folder ini berfungsi untuk apa
- flow penting apa lewat sini
- data apa yang ditulis/dipegang
- contract penting apa
- risk/ambiguity apa
- subtree bawah mana yang perlu dibaca lagi

---

## 12. Section Semantics

## 12.1 Purpose

Ringkasan tanggung jawab subtree dari evidence.

Harus:

- konkret
- behavior/data oriented

Jangan:

- slogan umum
- “contains business logic”

## 12.2 Repo Shape

Untuk root doc:

- top-level apps/packages/services
- runtime clusters
- major boundaries only

## 12.3 Top Runtime Units

Daftar unit deploy/executable utama:

- API
- web app
- worker
- scheduler
- queue consumer runtime
- CLI runtime

## 12.4 Main Spine Areas

Area top weight 5–4:

- write flows utama
- owner entities
- integration kritis
- change hotspots

## 12.5 Global Contracts

Aturan lintas repo hasil observasi:

- auth model
- tenant model
- event routing
- shared schema assumptions
- config/runtime coupling

## 12.6 Runtime Role

Untuk child doc:

- api
- worker
- domain package
- adapter
- projection layer
- UI
- shared infrastructure module

## 12.7 Key Entrypoints

Masukkan:

- route files
- handlers
- consumers
- cron jobs
- CLI commands
- main exported orchestration symbols

## 12.8 Owned / Primary Data

Masukkan:

- entity/table owner candidate
- primary writers
- caches/projections vs authoritative store
- ambiguity jika belum final

## 12.9 Important Flows

Flow lokal yang penting:

- trigger
- write
- event
- side effect
- outbound call
- failure path singkat

## 12.10 Contracts / Integrations

Masukkan:

- APIs
- events/messages
- queues
- webhooks
- shared DB coupling
- external SaaS
- auth claims/config dependencies

## 12.11 Invariants / Risks

Masukkan:

- invariants yang tampak
- critical risk
- unknown
- contradicted facts
- ownership ambiguity

## 12.12 Evidence Anchors

Harus pointer konkret:

- file path
- symbol
- route
- migration
- config file
- `reconstruction/*` link

Bukan narasi panjang.

## 12.13 Child DOCR Index

Daftar subtree bawahan yang punya doc sendiri.

---

## 13. Confidence / Status Vocabulary

Context docs harus pakai vocabulary konsisten dengan BUBAT-R:

- `Observed`
- `Inferred`
- `Unknown`
- `Contradicted`
- `Assumed`

Rules:

- `Observed` untuk fakta langsung
- `Inferred` untuk sintesis kuat
- `Unknown` bila bukti kurang
- `Contradicted` bila bukti konflik
- `Assumed` seminimal mungkin

Context doc tidak boleh menaikkan confidence tanpa evidence baru.

---

## 14. Relationship to Reconstruction Artifacts

Context docs adalah **compressed projection** dari artifact besar.

### Mapping

- `01-evidence-catalog.md` → Evidence Anchors
- `02-coverage-ledger.md` → Evidence Posture / risk posture
- `03-main-spine.md` → Main Spine Areas
- `04-runtime-map.md` → Runtime Role / Top Runtime Units
- `05-behavior-spine.md` → Important Flows
- `06-ownership-map.md` → Owned / Primary Data
- `07-domain-map.md` → subtree/domain framing
- `08-contract-map.md` → Contracts / Integrations
- `11-reference-design.md` → verified-current-state framing
- `12-drift-ambiguity-report.md` → Invariants / Risks / contradictions
- `gaps/*.md` → Known Gaps / next deepening hints

### Resolution rule

Jika child doc dan reconstruction artifact berbeda:

- artifact evidence-backed menang
- child doc harus diupdate

---

## 15. New Workflow Stage

Tambahkan stage opsional baru.

# Stage J — Hierarchical Context Materialization

## 15.1 Goal

Materialize evidence-backed local context docs into target repo.

## 15.2 Recommended entry point

Stage J berjalan setelah minimal:

- Stage A
- Stage B
- Stage C
- Stage D

Ideal setelah:

- Stage H

Best refresh point:

- setelah Stage I deepening di area penting

## 15.3 Inputs

Minimal:

- `02-coverage-ledger.md`
- `03-main-spine.md`
- `04-runtime-map.md`
- `05-behavior-spine.md`
- `06-ownership-map.md`

Preferred:

- `07-domain-map.md`
- `08-contract-map.md`
- `11-reference-design.md`
- `12-drift-ambiguity-report.md`

## 15.4 Outputs

- root `AGENTS.md`
- selected child `AGENTS.md`
- optional doc links back to `reconstruction/*`

## 15.5 Exit criteria

- top-weight subtree boundaries covered locally where useful
- root index complete
- no false certainty introduced
- contradictions preserved where material
- docs concise enough for fast re-read

---

## 16. Command Contract Proposal

Tambahkan command baru.

## 16.1 Recommended command

```text
bubat-r export docr [target-path] [for <area>] [max-depth N]
```

## 16.2 Alternative names

- `bubat-r materialize context`
- `bubat-r scaffold agents`

Recommended tetap:

- `export docr`

karena paling jelas soal intent.

## 16.3 Examples

```text
bubat-r export docr .
bubat-r export docr . for checkout
bubat-r export docr . for tenant-isolation max-depth 3
```

## 16.4 Behavior

Command harus:

1. baca reconstruction artifacts
2. pilih subtree boundaries
3. generate/update root doc
4. generate/update selected child docs
5. isi hanya evidence-backed content
6. preserve unknown/contradiction
7. refresh child indexes

---

## 17. Managed File Strategy

Ada dua opsi.

## 17.1 Option A — Full managed

BUBAT-R overwrite seluruh file `AGENTS.md`.

### Pros

- deterministic
- simple

### Cons

- berisiko menimpa catatan manusia

## 17.2 Option B — Marker block managed

BUBAT-R hanya mengelola blok tertentu.

Example:

```md
<!-- BEGIN BUBAT-R -->

...

<!-- END BUBAT-R -->
```

### Pros

- aman untuk repo yang juga diedit manusia
- local manual notes tetap hidup

### Cons

- parsing lebih kompleks
- potensi drift antar block

## 17.3 Recommendation

Gunakan **marker block strategy** sebagai default untuk target repo riil.

---

## 18. Update Policy

Context docs perlu diupdate bila ada perubahan durable dalam pemahaman:

- runtime boundary clarified
- ownership clarified
- contract surface found
- main spine reprioritized
- critical gap resolved
- new contradiction found
- subtree proven as durable boundary
- late-doc claim verified and materially useful

Tidak perlu update untuk:

- typo
- helper leaf changes
- low-impact internal refactor
- non-architectural edits

---

## 19. Interaction with Stage I Gap Deepening

Setelah `bubat-r gap <area> max <n>`:

- update affected reconstruction artifacts
- update nearest relevant child context doc
- create child doc jika area sekarang terbukti boundary mandiri
- carry forward unresolved unknowns
- remove stale claims from doc
- update parent child index jika subtree baru muncul

Stage I menjadi trigger utama refresh context docs.

---

## 20. Interaction with Late/ Stale Docs Feed

Saat `bubat-r feed docs ...` dijalankan:

- late docs tidak langsung mengubah context docs
- hanya claim `Verified` atau `Partially Verified` yang boleh memengaruhi local docs
- `Contradicted` harus ditulis sebagai drift/risk note
- `Historical Intent` boleh dicatat singkat bila berguna
- `Target Design Only` tidak boleh dipresentasikan sebagai current state

Rule tetap:

- docs feed hypotheses, evidence decides

---

## 21. Verification Rules

Sebelum hasil Stage J dianggap valid:

- referenced path benar ada
- symbol/file anchors valid
- subtree scope sesuai lokasi doc
- root child index sesuai docs aktual
- no stronger claim than available confidence
- high-risk ambiguity tidak hilang
- top weight 5–4 areas punya local coverage bila boundary-worthy
- docs tetap ringkas dan usable

---

## 22. Suggested Templates

## 22.1 Root template

```md
# AGENTS.md

## Purpose

- <repo purpose from evidence>

## Repo Shape

- <top-level layout and boundary summary>

## Top Runtime Units

- `<path>` — <role>
- `<path>` — <role>

## Main Spine Areas

- `<area>` — <why critical>
- `<area>` — <why critical>

## Global Contracts

- <shared auth/tenant/event/schema/runtime rules>

## High-Risk / Ambiguous Areas

- `<area>` — <risk or contradiction>
- `<area>` — <unknown>

## Evidence Posture

- Verified: <areas>
- Partial: <areas>
- Unknown: <areas>

## Child DOCR Index

- `apps/AGENTS.md` — <scope>
- `apps/api/AGENTS.md` — <scope>
- `packages/billing/AGENTS.md` — <scope>
```

## 22.2 Child template

```md
# AGENTS.md

## Purpose

- <subtree purpose>

## Runtime Role

- <api/worker/ui/domain package/adapter/etc>

## Key Entrypoints

- `<path or symbol>` — <role>
- `<path or route>` — <role>

## Owned / Primary Data

- `<entity/table>` — <owner status>
- `<projection/cache>` — <secondary role>

## Important Flows

- `<flow>` — <trigger -> write -> side effect>
- `<flow>` — <trigger -> event -> consumer>

## Contracts / Integrations

- `<contract or integration>` — <role>

## Invariants / Risks

- <invariant>
- <unknown>
- <contradiction>

## Evidence Anchors

- `<path>`
- `<path>#<symbol>`
- `reconstruction/<file>.md`

## Child DOCR Index

- `subdir/AGENTS.md` — <scope>
```

---

## 23. Phased Adoption Plan

## Phase 1 — Minimal viable

- tambah spec resmi
- tambah templates root/child
- tambah command `export docr`
- generate root + few child docs for weight-5 areas only

## Phase 2 — Boundary intelligence

- boundary scoring
- area-specific export
- root/child linking to gaps and drift
- selective refresh after Stage I

## Phase 3 — Durable maintenance

- marker block management
- partial updates
- smarter subtree creation
- optional freshness markers / last-generated metadata

---

## 24. Success Criteria

Fitur dianggap berhasil bila:

- agent berikutnya bisa mulai dari root/child docs lalu deep dive terarah
- high-value subtrees punya local context docs
- repo target punya context map dekat code
- repeated full-repo scanning berkurang
- ambiguity tetap terlihat
- docs kecil, cepat dibaca, tetap berguna
- BUBAT-R reconstruction menjadi lebih repeatable lintas sesi

---

## 25. Open Design Questions

Masih perlu diputuskan:

1. nama command final:
   - `export docr`
   - `materialize context`
   - lain

2. mode default:
   - full overwrite
   - marker blocks

3. nama file:
   - `AGENTS.md`
   - atau nama lain khusus BUBAT-R

4. kapan Stage J jalan:
   - otomatis setelah Stage H
   - manual only
   - atau hybrid

5. apakah child docs boleh menyimpan “next recommended deepening”
   - ya / tidak

---

## 26. Final Position

BUBAT-R sebaiknya mengadopsi **mekanisme materialisasi context hirarkis di repo target**.
