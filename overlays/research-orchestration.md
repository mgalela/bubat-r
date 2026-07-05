# Research Orchestration Overlay

Status: draft overlay  
Scope: parallelized codebase research to improve discovery breadth and targeted deepening without weakening hard-evidence rules  
Companion docs: `bubat-r/workflow.md`, `bubat-r/commands/run.md`, `bubat-r/commands/gap.md`

## 1. Purpose

Main workflow already defines how BUBAT-R reconstructs architecture from evidence.

Overlay ini menjawab:
- bagaimana memecah research question jadi sub-questions
- bagaimana menjalankan discovery paralel tanpa mengganti evidence hierarchy
- bagaimana menyimpan research memo per pertanyaan
- bagaimana memakai hasil research untuk memperkuat Stage A atau Stage I

Use overlay ini saat:
- repo besar dan breadth discovery mahal bila serial
- ada pertanyaan arsitektur spesifik yang butuh trace lintas banyak area
- ada high-risk gap yang perlu deepening cepat
- takeover butuh map cepat sebelum synthesis penuh

Prinsip:
- research memo membantu discovery, bukan source of truth final
- sub-task findings tetap candidate evidence sampai diverifikasi
- breadth acceleration tidak boleh menurunkan anti-bias discipline
- `coverage-ledger.md` dan `drift-ambiguity-report.md` tetap canonical untuk status

---

## 2. How To Use With Main Workflow

Do not replace main workflow. Overlay ini membungkus discovery/deepening tertentu.

Recommended placement:

```text
T0 optional takeover viability
→ R0 Frame Research Question
→ R1 Decompose Research Areas
→ R2 Parallel Discovery Sweep
→ R3 Consolidate Candidate Evidence
→ Main Stage A–D or Main Stage I verification/update
→ R4 Save Research Memo
```

Typical usage modes:

### Mode A — broad first pass

```text
bubat-r run
+ use research orchestration during Stage A
```

Best for:
- monorepo besar
- first 60–90 minute inventory
- quick main-spine candidate discovery

### Mode B — targeted deepening

```text
bubat-r gap <area> max <n>
+ use research orchestration inside each loop before final verification
```

Best for:
- owner/writer ambiguity
- auth/tenant classification
- external integration trace
- failure path tracing

### Mode C — user question driven

```text
bubat-r research <question>
```

Best for:
- “how checkout posts ledger?”
- “who writes order status?”
- “what runtimes consume tenant events?”

---

## 3. Non-Replacement Rule

Overlay ini **tidak** mengganti:
- evidence hierarchy
- coverage ledger
- ownership-first reasoning
- counter-evidence rule
- Stage H reference design decision
- Stage I stop conditions

Research memo boleh menyatakan:
- observed candidate evidence
- inferred candidate relationships
- open questions
- search plan and search results

Research memo tidak boleh langsung menyatakan:
- final bounded context
- final owner
n- final reference design
- readiness verdict

Semua keputusan final tetap masuk artifact utama setelah verification.

---

## 4. R0 — Frame Research Question

Tujuan:
- ubah intent user/operator jadi pertanyaan investigasi yang bisa diverifikasi
- batasi scope supaya search tidak liar

Inputs:
- user question atau change area
- existing `02-coverage-ledger.md` bila ada
- existing `12-drift-ambiguity-report.md` bila ada
- related `gaps/GAP-*.md` bila ada

Output:
- one research topic
- initial scope
- success condition

Examples:
- `who are all writers of order status?`
- `how does checkout create financial side effects?`
- `which runtime owns tenant provisioning?`

Question framing template:

```markdown
## Research Frame
- Topic:
- Why now:
- Main area:
- Expected evidence types:
- Success condition:
```

---

## 5. R1 — Decompose Research Areas

Tujuan:
- pecah pertanyaan menjadi sub-questions komposabel
- pilih mana yang bisa dicari paralel

Sub-question classes:
- locator: where files/routes/jobs/symbols live
- analyzer: how exact write path / runtime edge works
- pattern finder: where same pattern appears elsewhere
- contract finder: where request/event/schema edges are defined
- ownership finder: who writes/enforces invariant

Decomposition example for `who writes order status?`:
- locate order entity/table/model
- locate direct writes to `order.status`
- locate repository/service update methods
- locate consumers/jobs changing order state
- locate tests covering transitions
- locate migrations/constraints related to allowed states

Rule:
- decompose by evidence type, not by folder names only
- include counter-evidence tasks for likely competing owners/writers

---

## 6. R2 — Parallel Discovery Sweep

Tujuan:
- cari candidate evidence paralel untuk breadth dan speed
- hasilkan shortlists, not final truth

Parallel lanes:
1. file/component location
2. symbol/write-path tracing
3. contract/integration lookup
4. tests/examples lookup
5. deploy/runtime config lookup
6. counter-evidence lookup

Preferred search order per lane:
1. `ast-index` structural commands
2. targeted `rg` for literals/config/raw SQL/generated edges
3. exact source reads for decision points

Lane output format:

```markdown
## Lane Result
- Lane:
- Search targets:
- Findings:
- Candidate citations:
- Counter-evidence:
- Confidence:
- Needs verification:
```

Rule:
- lane may report `Observed`, `Inferred`, `Unknown`, `Contradicted`
- lane must not upgrade confidence without direct anchor

---

## 7. R3 — Consolidate Candidate Evidence

Tujuan:
- gabungkan hasil paralel
- dedupe findings
- convert into candidate evidence packet for main workflow

Consolidation table:

| Candidate | Type | Source lane | Citation | Confidence | Counter-evidence | Next verification step |
|---|---|---|---|---|---|---|
| `POST /checkout` enters `CheckoutController` | route | locator | `apps/api/...` | Observed | none | trace write path |
| `OrderStatusUpdater` writes `orders.status` | write-path | analyzer | `src/...` | Inferred | consumer also updates status | inspect callers |

Rules:
- merge overlapping lane results
- preserve contradiction
- attach next verification step
- map each candidate to Stage A/B/C/D/I target artifact

Mapping example:
- route/runtime candidate → `01-evidence-catalog.md`, `04-runtime-map.md`
- write-path candidate → `05-behavior-spine.md`
- owner candidate → `06-ownership-map.md`
- contradiction → `12-drift-ambiguity-report.md`
- unresolved area → `gaps/GAP-*.md`

---

## 8. R4 — Save Research Memo

Tujuan:
- persist question-specific research so next run does not repeat expensive framing
- keep memo subordinate to canonical reconstruction artifacts

Output location:

```text
reconstruction/research/
  YYYY-MM-DD-<topic>.md
```

Required frontmatter:

```yaml
---
date: <ISO timestamp>
repository: <repo name or target path>
topic: "<research topic>"
mode: broad-first-pass | targeted-gap | question-driven
related_gap: <gap-id-or-none>
related_artifacts:
  - reconstruction/02-coverage-ledger.md
  - reconstruction/12-drift-ambiguity-report.md
status: complete
---
```

Required sections:
- Research Question
- Scope
- Search Plan
- Parallel Lanes
- Consolidated Findings
- Candidate Evidence Packet
- Counter-Evidence
- Open Questions
- Required Main-Artifact Updates

Rule:
- memo links to canonical artifacts
- canonical status still lives in coverage/gap/reference docs

---

## 9. Verification Handoff To Main Workflow

After memo saved, BUBAT-R must still perform main-artifact verification.

### If used in Stage A
- add verified facts to `01-evidence-catalog.md`
- update `02-coverage-ledger.md`
- draft/update `03-main-spine.md`

### If used in Stage B–D
- update affected runtime/behavior/ownership maps only after exact source verification

### If used in Stage I
- add or update `gaps/GAP-*.md`
- update coverage delta
- record verdict separately from memo

Memo itself must never be sole basis for:
- reference design acceptance
- readiness pass
- contradiction closure

---

## 10. Metadata Policy

Unlike generic research flow, BUBAT-R should capture metadata aligned with reconstruction.

Recommended metadata fields:
- date
- target path
- branch if available
- commit if available
- topic
- related gap
- related runtime/flow/entity
- researcher/agent

Recommended but optional:
- GitHub permalinks
- linked AGENTS.md if Stage J exists

---

## 11. Integration With Coverage Model

Research orchestration improves **discovery breadth**, not direct coverage score.

Coverage changes only when candidate findings are verified and recorded in canonical artifacts.

Allowed effects:
- faster discovery of weight 5–4 items
- fewer missed runtime units / flows / entities / contracts
- better targeting for gap loops

Disallowed effect:
- marking item `Covered` from memo alone

Safe status flow:

```text
memo finding → candidate evidence
candidate evidence + source verification → artifact update
artifact update → coverage status change
```

---

## 12. Integration With Stage I Gap Deepening

This overlay fits best inside Stage I loop.

Recommended per-loop insertion:

```text
1. Select gap
2. Write search plan
3. Run parallel discovery sweep
4. Consolidate candidate evidence
5. Verify exact decision points
6. Update gap + coverage + artifacts
7. Decide continue/stop
```

Benefits in Stage I:
- parallel writer hunt
- faster failure-path enumeration
- easier cross-runtime contract tracing
- explicit counter-evidence lane prevents premature closure

---

## 13. Command Contract Proposal

## 13.1 Primary command

```text
bubat-r research <question>
bubat-r research <question> for <area>
bubat-r research <question> for <area> max-depth <n>
```

Examples:

```text
bubat-r research "who writes order status?"
bubat-r research "how checkout posts ledger" for checkout-ledger
bubat-r research "which runtimes consume tenant events" for tenant-isolation max-depth 3
```

## 13.2 Behavior

Command should:
1. read existing canonical artifacts if present
2. frame question
3. decompose research areas
4. run parallel discovery lanes
5. consolidate candidate evidence
6. save research memo under `reconstruction/research/`
7. recommend exact main-artifact updates or next `bubat-r gap`

## 13.3 Pairing

```text
bubat-r run
bubat-r research "how auth claims propagate"

bubat-r gap order-ownership max 3
bubat-r research "who writes order status" for order-ownership
```

---

## 14. Adoption Guidance

High-value pieces to adopt from generic `research_codebase.md`:
- question framing
- decomposition into focused sub-questions
- parallel research lanes
- persistent research memo
- follow-up append model
- metadata discipline

Pieces to adapt before adoption:
- save under `reconstruction/research/`, not `shared/research/`
- map findings into coverage/gap/reference workflow
- require counter-evidence lane
- forbid memo from becoming source of truth

Pieces not to import as-is:
- generic documentation narrative as final artifact
- research doc as standalone truth
- omission of ownership/coverage/readiness model

---

## 15. Operating Maxims

- parallelize search, not truth
- memo discovers, artifacts decide
- breadth first, verification second
- candidate evidence is not final evidence
- preserve contradiction until closed in canonical artifacts
