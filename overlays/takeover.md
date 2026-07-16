# Takeover Overlay for Hard-Evidence Architecture Reconstruction

Status: draft overlay  
Scope: tim baru takeover existing codebase tanpa dokumentasi
Companion doc: `bubat-r/workflow.md`

## 1. Purpose

Dokumen utama menjawab:

- bagaimana merekonstruksi arsitektur dari hard evidence
- bagaimana mengukur coverage
- bagaimana membentuk reference design

Overlay ini menjawab:

- bagaimana takeover sistem secara aman
- bagaimana tahu sistem bisa dijalankan, dites, dan diubah
- bagaimana memprioritaskan risiko operasional dan delivery
- bagaimana memakai hasil rekonstruksi untuk mulai bekerja tanpa merusak sistem

Gunakan overlay ini bila konteksnya bukan hanya dokumentasi arsitektur, tapi juga:

- tim baru masuk belakangan
- owner lama tidak tersedia / knowledge hilang
- production masih berjalan
- perubahan bisnis akan segera diminta
- risiko deploy/rollback/testing belum jelas

---

## 2. How To Use With Main Workflow

Jangan ganti workflow utama. Overlay ini membungkus workflow utama.

Urutan gabungan:

```text
T0 Takeover Viability Check
→ Main A Evidence Harvest
→ Main Coverage Ledger + Main Spine
→ Main B Runtime Map
→ Main C Behavior Spine
→ Main D Data Ownership Map
→ T1 Risk Register
→ Main E Domain Reconstruction
→ Main F Contract Surface Map
→ Main G Component Decomposition
→ Main H Reference Design
→ Main J Hierarchical Context Docs Materialization
→ T2 Safe Change Readiness
```

Mapping:

| Overlay Step                | Kapan                        | Input                                                                           | Output                     | Dipakai oleh             |
| --------------------------- | ---------------------------- | ------------------------------------------------------------------------------- | -------------------------- | ------------------------ |
| T0 Takeover Viability Check | sebelum Main A               | repo, env hints, scripts                                                        | `takeover-viability.md`    | Main A–D confidence      |
| T1 Risk Register            | setelah Main D, update terus | coverage gaps, runtime, flows, ownership                                        | `risk-register.md`         | Main E–H priority        |
| T2 Safe Change Readiness    | setelah Main H/J             | reference design, risk register, coverage ledger, local context docs if present | `safe-change-readiness.md` | planning, implementation |

Aturan:

- Main workflow tetap menghasilkan reference design
- Main J/DOCR dapat materialize local context docs near code for handoff speed
- Overlay menghasilkan takeover readiness
- `00-workflow-status.md` should track whether T0, T1, and T2 already ran, are in progress, blocked, or not run
- Jangan campur risk decision dengan architecture evidence
- Risk boleh memengaruhi prioritas, bukan memalsukan evidence

---

## 3. T0 — Takeover Viability Check

Tujuan:

- tahu sistem bisa dibuild, dijalankan, dites, dan dideploy atau tidak
- tahu gap operasional sebelum terlalu jauh menganalisis arsitektur

Waktu ideal:

- 0.5–1 hari pertama

Output:

- `takeover-viability.md`
- `00-workflow-status.md` updated with `T0` status

Checklist minimum:

### Repository

- repo bisa clone bersih
- branch utama jelas
- dependency manager jelas
- lockfile ada/tidak
- monorepo/submodule/worktree jelas

### Build

- dependency install berhasil
- build berhasil/gagal
- artifact build jelas
- generated code step jelas

### Run local

- local run command ditemukan
- required env vars ditemukan
- missing secrets/config dicatat
- external dependencies diketahui
- local DB/cache/queue requirement diketahui

### Test

- test command ditemukan
- unit/integration/e2e dipisah
- test bisa jalan/gagal
- failure karena env atau real bug dibedakan

### Deploy / Release

- deploy scripts/pipeline ditemukan
- target environment diketahui
- rollback path ada/tidak
- migration deploy order diketahui/tidak
- feature flag mechanism ada/tidak

### Ops

- logs/tracing/metrics ditemukan
- healthcheck ditemukan
- alert/dashboard ditemukan
- incident/runbook tidak ada dicatat sebagai gap

Template:

```markdown
# Takeover Viability

## Summary

- Build: Pass/Fail/Unknown
- Local run: Pass/Fail/Unknown
- Tests: Pass/Fail/Unknown
- Deploy path: Known/Unknown
- Rollback path: Known/Unknown
- Observability: Known/Partial/Unknown

## Commands Tried

| Command | Result | Notes |
| ------- | ------ | ----- |

## Required Environment

| Var/Secret | Source | Required For | Status |
| ---------- | ------ | ------------ | ------ |

## Blocking Gaps

| Gap | Impact | Next Action |
| --- | ------ | ----------- |

## Confidence Impact

How this affects evidence confidence in Main A–D.
```

How it feeds main workflow:

- missing run/build lowers confidence for runtime behavior
- missing tests lowers behavior confidence
- missing deploy config lowers runtime/container confidence
- missing env/secrets highlights external integrations for Stage A
- if T0 stops early, status doc should explain why later stages may remain `Not Run` or `Blocked`

---

## 4. T1 — Risk Register

Tujuan:

- ubah evidence gaps dan contradictions menjadi risk yang bisa diprioritaskan
- bedakan architectural uncertainty dari operational danger

Waktu:

- mulai setelah Main D
- update setiap ada temuan baru

Output:

- `risk-register.md`
- `00-workflow-status.md` updated with `T1` status

Risk categories:

- data integrity
- security/auth
- deploy/rollback
- migration/schema
- external dependency
- concurrency/idempotency
- observability
- test gap
- ownership ambiguity
- performance/scalability
- compliance/audit

Scoring:

| Score | Impact                                        | Likelihood              |
| ----- | --------------------------------------------- | ----------------------- |
| 5     | outage/data loss/security breach/revenue loss | likely/already observed |
| 4     | major user/business impact                    | plausible from evidence |
| 3     | moderate impact                               | possible                |
| 2     | local/minor impact                            | unlikely                |
| 1     | nuisance                                      | rare                    |

Priority formula:

```text
risk_score = impact * likelihood
```

Risk levels:

- `Critical`: 20–25
- `High`: 12–19
- `Medium`: 6–11
- `Low`: 1–5

Template:

```markdown
# Risk Register

| ID    | Risk                                 | Category       | Evidence                 | Impact | Likelihood | Score | Level    | Mitigation                              | Owner/Next Step                  |
| ----- | ------------------------------------ | -------------- | ------------------------ | ------ | ---------- | ----- | -------- | --------------------------------------- | -------------------------------- |
| R-001 | Multiple writers update order status | data integrity | `ownership-map.md#Order` | 5      | 4          | 20    | Critical | add tests, isolate writer, audit writes | investigate before order changes |
```

Rules:

- every `Contradicted` weight 5–4 item becomes a risk
- every `Unknown` weight 5 item becomes at least Medium risk until resolved
- every missing rollback/deploy path becomes operational risk
- risk score may prioritize deeper reconstruction for specific areas

How it feeds main workflow:

- Main E domain reconstruction focuses high-risk ownership boundaries first
- Main F contract map focuses high-risk integration edges first
- Main G component map traces risky components first
- Main H reference design must mention unresolved High/Critical risks

---

## 5. T2 — Safe Change Readiness

Tujuan:

- jawab apakah tim boleh mulai mengubah sistem
- tentukan area aman, area perlu guardrail, area dilarang disentuh dulu

Waktu:

- setelah Main H reference design v0.1
- sebelum implementation/change planning besar

Output:

- `safe-change-readiness.md`
- `00-workflow-status.md` updated with `T2` status

Readiness levels:

| Level  | Meaning                              | Allowed Work                                |
| ------ | ------------------------------------ | ------------------------------------------- |
| Green  | evidence cukup, tests/rollback cukup | normal feature/refactor with review         |
| Yellow | evidence cukup sebagian, risk known  | small changes + extra tests + rollback plan |
| Red    | evidence lemah atau risk tinggi      | no change before investigation/guardrail    |

Template:

```markdown
# Safe Change Readiness

## Summary

- Overall readiness: Green/Yellow/Red
- Critical risks open: N
- Weight-5 coverage: NN%
- Test confidence: High/Medium/Low
- Rollback confidence: High/Medium/Low

## Area Readiness

| Area               | Coverage | Risk Level | Readiness | Required Guardrail                                  |
| ------------------ | -------- | ---------- | --------- | --------------------------------------------------- |
| Checkout           | 82%      | High       | Yellow    | add e2e, verify idempotency, deploy with flag       |
| Reporting          | 60%      | Low        | Yellow    | read-only change OK                                 |
| Payment settlement | 45%      | Critical   | Red       | no change until ownership + retry behavior verified |

## Required Before First Significant Change

- [ ] test coverage for top write flow
- [ ] rollback plan verified
- [ ] migration safety reviewed
- [ ] observability signal identified
- [ ] owner approval / business validation for ambiguous behavior
```

Rules:

- `Red` area cannot receive architecture-significant change
- `Yellow` area requires explicit guardrails
- `Green` still requires normal engineering discipline
- High/Critical risk must have mitigation or explicit acceptance

How it feeds delivery:

- feature planning uses readiness level
- refactor planning starts with Green/Yellow low-risk areas
- Red areas become investigation or stabilization tasks first

---

## 6. Critical Coverage Metric

Main workflow already has weighted coverage. Overlay adds critical coverage.

Formula:

```text
critical_coverage = sum(weight for Covered weight-5 + 0.5 * weight for Partial weight-5) / sum(weight for all non-N/A weight-5)
```

Target for takeover:

- critical coverage >= 90% before major change
- runtime coverage >= 80% before deploy ownership
- behavior coverage >= 70% before feature change
- data ownership coverage >= 70% before data model/migration change

If target not met:

- allowed: read-only work, docs/reference updates, tests, observability, investigation
- not allowed without explicit risk acceptance: schema change, payment/auth/order changes, destructive migration, large refactor

---

## 7. Production Reality Evidence

If available, production evidence outranks static code for current behavior.

Collect:

- logs
- traces
- metrics
- dashboards
- healthchecks
- deploy history
- incident history
- feature flags
- actual DB schema
- queue/topic runtime config

Use carefully:

- do not expose secrets or PII
- sample enough to confirm flow, not dump data
- cite dashboard/query/log source without sensitive payload

How to merge with main workflow:

- production traces validate Stage C Behavior Spine
- actual DB schema validates Stage D Ownership Map
- deploy history validates Stage B Runtime Map
- incident history feeds T1 Risk Register

---

## 8. Suggested Takeover Timeline

### Day 0–1

- T0 Takeover Viability
- ast-index rebuild/update
- Main A Evidence Harvest
- first Coverage Ledger
- first Main Spine

### Day 2–3

- Main B Runtime Map
- Main C Behavior Spine for top 3–5 write flows
- Main D Ownership Map for top entities
- T1 Risk Register v0.1

### Day 4–5

- Main E Domain Reconstruction
- Main F Contract Surface Map
- Main G Component Decomposition for critical areas
- update risks + coverage

### End of Week 1

- Main H Reference Design v0.1
- T2 Safe Change Readiness
- decide first safe work package

---

## 9. Operating Rules For Lead

- Do not promise change velocity before T0 + critical coverage pass.
- Do not treat build success as architecture understanding.
- Do not treat architecture map as operational readiness.
- Prioritize weight-5 write paths over broad inventory.
- Convert uncertainty into explicit risk, not hidden assumptions.
- Prefer small safe changes after readiness, not big refactor.
- Use reference design as working contract, not historical museum.

---

## 10. Deliverables Added By This Overlay

```text
reconstruction/
  00-workflow-status.md
  00-takeover-viability.md
  13-risk-register.md
  14-safe-change-readiness.md
```

These supplement, not replace, main workflow artifacts:

```text
reconstruction/
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
```

Use main workflow to understand and model system.
Use overlay to operate, prioritize risk, and decide safe change readiness.
