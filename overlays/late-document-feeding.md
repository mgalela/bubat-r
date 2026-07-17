# Late Document Feeding Overlay

Status: draft overlay  
Scope: dokumen ditemukan setelah hard-evidence reconstruction berjalan  
Companion doc: `bubat-r/workflow.md`

## 1. Purpose

Overlay ini dipakai saat:

- reconstruction sudah punya `coverage-ledger.md`, `drift-ambiguity-report.md`, atau `gaps/GAP-*.md`
- user menemukan dokumen lama / semi-valid / mungkin stale
- dokumen ingin dipakai untuk memperbaiki rekonstruksi tanpa mengooptasi proses hard-evidence

Prinsip:

- dokumen masuk sebagai `hypothesis feed`, bukan reference design otomatis
- klaim dokumen harus diverifikasi terhadap hard evidence
- dokumen paling berguna untuk menutup gap, menjelaskan intent, dan menemukan search target baru
- verified code/runtime evidence tetap lebih kuat daripada narasi dokumen

---

## 2. How To Use With Main Workflow

Gunakan overlay ini setelah salah satu titik berikut:

```text
Stage D Ownership Map
Stage H Reference Design v0.1
Stage I Critical Gap Deepening Loop
```

Urutan gabungan:

```text
Main A–H/I produces coverage + gaps
→ L0 Register Late Docs
→ L1 Classify Docs
→ L2 Extract Atomic Claims
→ L3 Map Claims To Gaps
→ L4 Verify Claims Against Evidence
→ L5 Update Reconstruction Artifacts
→ L6 Decide Reference Design Impact
```

Output overlay:

```text
${BUBATR_HOME}/STAGES/overlays/docs-feed/
  DOC-001-register.md
  DOC-001-claims.md
  DOC-001-verification.md
  CLAIMS-AGGREGATE.md
  docs-feed-summary.md
```

Main artifacts updated only after verification:

- `01-evidence-catalog.md`
- `02-coverage-ledger.md`
- `05-behavior-spine.md`
- `06-ownership-map.md`
- `07-domain-map.md`
- `08-contract-map.md`
- `10-code-trace-map.md`
- `11-reference-design.md`
- `12-drift-ambiguity-report.md`
- `gaps/GAP-*.md`
- nearest relevant root/child `AGENTS.md` only after claim impact is verified and DOCR docs already exist

---

## 3. Evidence Rule

Dokumen dapat menaikkan confidence hanya bila:

- klaimnya atomic
- ada hard evidence pendukung
- tidak ada counter-evidence kuat
- status freshness jelas atau accepted as historical intent

Dokumen tidak boleh:

- langsung mengubah reference design
- menutup gap tanpa verification
- mengganti code/runtime evidence
- menghapus contradiction tanpa decision record

---

## 4. L0 — Register Late Docs

Tujuan:

- catat dokumen sebagai input baru
- jangan langsung baca sebagai kebenaran

Output:

- `${BUBATR_HOME}/STAGES/overlays/docs-feed/DOC-xxx-register.md`

Fields:

| Field               | Value                                                                        |
| ------------------- | ---------------------------------------------------------------------------- |
| Doc ID              | `DOC-001`                                                                    |
| Path/URL            | `[path]`                                                                     |
| Title               | `[title]`                                                                    |
| Date / version      | `[date/version/unknown]`                                                     |
| Owner / author      | `[owner/unknown]`                                                            |
| Source type         | internal doc / ADR / README / diagram / runbook / ticket / spec              |
| Suspected freshness | fresh / stale / unknown                                                      |
| Intended use        | close gap / explain intent / validate reference design / find search targets |

---

## 5. L1 — Classify Docs

Classify each doc or section:

| Class                 | Meaning                                          | How to Use                                                          |
| --------------------- | ------------------------------------------------ | ------------------------------------------------------------------- |
| `Normative`           | says how system should be                        | compare with implementation, possible target design                 |
| `Normative-Refactor`  | describes post-refactor state (code already changed) | verify claims vs code; then sweep artifacts for pre-refactor sections |
| `Descriptive`         | says how system currently works                  | verify against code/runtime                                         |
| `Historical`          | explains past decision                           | use as ADR/context, not current fact                                |
| `Operational`         | runbook/deploy/incident                          | verify runtime/deploy behavior                                      |
| `Speculative`         | proposal/draft                                   | use only as hypothesis                                              |
| `Generated`           | auto docs/diagrams                               | verify generator freshness                                          |

Also assign freshness:

- `Fresh`
- `Possibly Stale`
- `Stale`
- `Unknown`

**Post-refactor detection — two signals (use both):**

Signal A — explicit user flag:
```
bubat-r feed docs <path> --type post-refactor
```
When flag present, force class `Normative-Refactor`.

Signal B — agent prompt at L1 when class is ambiguous:
```
Doc ini mendeskripsikan state sebelum atau sesudah refactor?
→ Pre-refactor  → classify normal (Descriptive/Historical)
→ Post-refactor → classify Normative-Refactor
→ Tidak tahu   → classify Unknown freshness, trigger L4 artifact cross-check anyway
```

If neither signal available, proceed to L4 artifact cross-check — it will surface the gap structurally.

---

## 6. L2 — Extract Atomic Claims

Do not summarize document narrative. Extract atomic claims.

Good claims:

- `POS checkout posts ledger through outbox`
- `Inventory period lock applies to refunds`
- `orders and customers are protected by RLS`
- `BDS is authoritative for tenant/branch provisioning`

Bad claims:

- `Architecture is clean and event-driven`
- `Inventory module handles everything`
- `System follows DDD`

Claim table:

| Claim ID | Claim     | Doc Source | Section    | Class       | Freshness | Related Gap | Initial Status |
| -------- | --------- | ---------- | ---------- | ----------- | --------- | ----------- | -------------- |
| CL-001   | `[claim]` | `DOC-001`  | `#section` | Descriptive | Unknown   | `GAP-001`   | Unverified     |

---

## 7. L3 — Map Claims To Gaps

Prioritize claims that touch:

- weight 5–4 gap
- `Covered with Critical Risk`
- `Contradicted`
- `Unknown`
- major change area
- external contract
- data ownership
- failure/retry semantics

Mapping table:

| Claim    | Maps To                   | Why Useful               | Verification Query             |
| -------- | ------------------------- | ------------------------ | ------------------------------ |
| `CL-001` | `GAP-001-checkout-ledger` | doc says outbox intended | `rg createPosLedgerOutbox src` |

Claims not mapped to current gaps go to backlog, not immediate reconstruction.

If multiple docs hit same area:

- normalize duplicate/near-duplicate claims into `${BUBATR_HOME}/STAGES/overlays/docs-feed/CLAIMS-AGGREGATE.md`
- verify once per cluster where possible
- keep per-doc claim files for traceability

---

## 8. L4 — Verify Claims Against Evidence

For each prioritized claim:

1. Identify expected hard evidence.
2. Search structurally with `ast-index`.
3. Search targeted literals/config with `rg`.
4. Read exact files/symbols.
5. Record support and counter-evidence.
6. Assign final status.

Status values:

- `Verified`
- `Verified-Artifact-Stale` — claim matches code but existing artifact describes old state
- `Partially Verified`
- `Contradicted`
- `Unverified`
- `Historical Intent`
- `Target Design Only`
- `Obsolete`

**L4 artifact cross-check (always run after Verified):**

For each claim that reaches `Verified` vs code:
1. Grep affected STAGES/ artifacts for the old behavior this claim replaces.
2. If artifact still describes old behavior → status = `Verified-Artifact-Stale`.
3. Record: which artifact, which section, what old behavior conflicts.

This catches post-refactor docs even when user did not declare `--type post-refactor`.

Verification table:

| Claim ID | Support Evidence | Counter-Evidence | Artifact Conflict | Final Status             | Confidence | Impact                  |
| -------- | ---------------- | ---------------- | ----------------- | ------------------------ | ---------- | ----------------------- |
| `CL-001` | `[path:line]`    | `[path:line]`    | `[artifact:sec]`  | Verified-Artifact-Stale  | High       | sweep artifact sections |
| `CL-002` | `[path:line]`    | `[path:line]`    | none              | Verified                 | High       | update evidence catalog |

---

## 9. L5 — Update Reconstruction Artifacts

Update rules:

### If claim is `Verified`

- add doc as supporting evidence in `01-evidence-catalog.md`
- update affected map/artifact
- update nearest relevant root/child `AGENTS.md` if local context docs exist for touched area
- increase confidence only if hard evidence also supports it

### If claim is `Verified-Artifact-Stale`

- add doc as supporting evidence in `01-evidence-catalog.md`
- **sweep all flagged artifact sections** — replace pre-refactor descriptions with post-refactor state
- record each artifact section updated in `${BUBATR_HOME}/STAGES/overlays/docs-feed/docs-feed-summary.md` under "Refactor Propagation"
- update `STAGES/I/12-drift-ambiguity-report.md` (or `STAGES/H/` if Stage I not yet run) — note artifacts were stale due to refactor, now resolved
- update nearest relevant root/child `AGENTS.md`

### If claim is `Partially Verified`

- update gap dossier
- add missing evidence plan
- refresh local `AGENTS.md` only if doc must surface material ambiguity change
- keep status `Partial` or `Covered with Risk`

### If claim is `Contradicted`

- add to `STAGES/I/12-drift-ambiguity-report.md` (or `STAGES/H/` if Stage I not yet run)
- do not update reference design to match doc
- if affected DOCR docs exist, update them to preserve contradiction instead of stale certainty
- mark as doc drift or implementation drift after decision

### If claim is `Historical Intent`

- optionally add to reference design rationale
- do not treat as current state

### If claim is `Target Design Only`

- add to backlog/decision notes
- do not alter current reference design unless user chooses target design adoption

### If claim is `Obsolete`

- record as obsolete; no artifact change except docs-feed summary

---

## 10. L6 — Reference Design Impact Decision

Each verified/contradicted claim must end with decision:

| Decision                            | Meaning                                        |
| ----------------------------------- | ---------------------------------------------- |
| `Adopt as current reference design` | claim matches hard evidence                    |
| `Adopt as target design`            | doc describes desired future, not current code |
| `Reject as stale`                   | doc contradicted and not target                |
| `Keep as historical rationale`      | useful why, not current what                   |
| `Escalate`                          | conflict needs human/product/ops decision      |

Reference design must separate:

- current verified design
- target design candidates
- stale/contradicted docs
- open decisions

---

## 11. Looping Instruction

Use this command pattern:

```text
feed docs <path-or-url> into reconstruction for <gap-or-area> until all claims verified or max <N> loops
```

Examples:

```text
feed docs docs/LEDGER_DESIGN.md into reconstruction for checkout-ledger until all claims verified or max 3 loops
feed docs C4_ARCHITECTURE.md into reconstruction for runtime-map until no Contradicted weight-5 claims or max 2 loops
feed docs docs/RLS_PLAN.md into reconstruction for tenant-isolation until readiness verdict changes or max 3 loops
```

Per-loop protocol:

1. Register doc.
2. Extract atomic claims.
3. Pick highest-weight claim mapped to current gaps.
4. Verify against code/runtime/schema/config.
5. Update docs-feed verification table.
6. Update main artifacts only for verified impact.
7. Decide continue/stop.

Stop conditions:

- all high-priority claims verified/contradicted/obsolete
- no claim remains mapped to weight 5–4 unresolved gap
- readiness verdict changes and user stops
- max loop count reached
- blocked by inaccessible source/runtime

---

## 12. Practical Example

Current reconstruction says:

- checkout uses direct JIEL posting
- outbox exists but not wired to checkout

Late doc says:

- `checkout posts ledger via outbox`

Verification:

```bash
ast-index usages createPosLedgerOutbox
rg -n "createPosLedgerOutbox\(" src scripts
rg -n "postCheckoutToJiel" src/lib/server/services/pos/checkout.ts
```

Possible result:

- no production checkout caller for `createPosLedgerOutbox`
- direct `postCheckoutToJiel` found

Final status:

- claim = `Contradicted`
- doc = stale or target design candidate
- reference design remains direct-post current state
- drift report records doc/code mismatch

---

## 13. Deliverables

```text
${BUBATR_HOME}/STAGES/overlays/docs-feed/
  DOC-001-register.md
  DOC-001-claims.md
  DOC-001-verification.md
  docs-feed-summary.md
```

Optional final summary:

```markdown
# Docs Feed Summary

## Docs Processed

| Doc | Class | Freshness | Claims | Verified | Contradicted | Target Design Only | Historical Intent | Obsolete |
| --- | ----- | --------- | ------ | -------- | ------------ | ------------------ | ----------------- | -------- |

## Multi-Doc Aggregation

| Area | Aggregate Used? | Aggregate File | Notes |
| ---- | --------------- | -------------- | ----- |

## Refactor Propagation

| Claim | Artifact | Section | Old State | New State |
| ----- | -------- | ------- | --------- | --------- |

## Reconstruction Changes

| Artifact | Change | Reason |
| -------- | ------ | ------ |

## Target Design Only Claims

| Claim | Source | Why Not Current-State Fact | Revisit Trigger |
| ----- | ------ | -------------------------- | --------------- |

## Reference Design Impact

| Claim | Decision | Notes |
| ----- | -------- | ----- |
```

---

## 14. Operating Maxims

- docs feed hypotheses, evidence decides
- late docs can improve search, not bypass verification
- doc intent and current implementation are separate layers
- `Target Design Only` claims must stay visible and separate from current-state design
- stale docs are useful if they explain why drift exists
- claim-level verification prevents narrative capture
