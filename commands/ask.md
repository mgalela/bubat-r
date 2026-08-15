# bubat-r ask

Answer a developer's question about the existing codebase **from reconstruction artifacts only**. Built for learning an unfamiliar system — handover, onboarding, takeover.

Core contract: answer from evidence, cite it, and when the artifacts don't know, say so plainly. Never invent architecture from naming. If the answer is missing, offer to run `bubat-r research`; run it only when the developer agrees, then record what was learned back into the artifacts.

## Intent

```text
bubat-r ask "<question>"
bubat-r ask "<question>" for <area>
bubat-r ask "<question>" --no-research
```

Examples:

```text
bubat-r ask "who writes order status?"
bubat-r ask "how does checkout post to the ledger?" for checkout-ledger
bubat-r ask "what triggers the nightly reconciliation job?"
```

| Flag | Meaning | Default |
|---|---|---|
| `for <area>` | Scope the lookup to one area/domain — narrows which artifacts are read. | all |
| `--no-research` | Never offer to run research. Answer from artifacts or return `Unknown` and stop. | off |
| `--yes` | Pre-approve the research fallback — skip the confirmation prompt if the answer is missing. | off |

## Path Resolution — Reads

Determine `${BUBATR_HOME}` — directory containing `bubat-r`.

Cheap-first, but **the cheapest first read depends on the question category** — a flow question is answered fastest by a diagram, a factual pointer by the evidence catalog, a risk question by the drift/annotation table. Read the minimum to answer — stop the moment the answer is cited. Do **not** scan the target source tree — `ask` reads reconstruction artifacts, not code. Source is touched only inside an approved `bubat-r research` run.

bubat-r has **no `shared/` manifest / ndjson index** — route by category, then open one artifact. Do not broad-grep every stage.

**Tier 0 — orient (always, cheap, ~3KB).**

1. `${BUBATR_HOME}/STAGES/A/00-workflow-status.md` — `## Stage Checklist` tells which stages are `Done` (which artifacts exist) and which are `Not Run`/`Blocked`; flags research/gap/late-doc overlays.
2. latest `02-coverage-ledger.md` (check `STAGES/I/` → `STAGES/D/` → `STAGES/C/` → `STAGES/B/` → `STAGES/A/`) — **coverage gate.** Map the question to a dimension row; `## Weighted Coverage by Critical Dimension` gives the exact `EV-NNN` range, and `## Critical Gaps` + `## Uncovered / Unknown` settle the Answer Mode (`Covered`/`Open`/`Accepted Gap`/`Contradicted`/`Unknown`) before any deep read.

**Tier 1 — classify the question, open the cheapest answering artifact for that category.** One read, targeted section:

| Category | Question signals | Cheap-first read | Escalate to |
|---|---|---|---|
| **Pointer / factual** | "which port?", "who exposes route X?", "what writes table Y?" | grep `A/01-evidence-catalog.md` by routed `EV-NNN` / keyword / `type` / path — pre-cited facts | the stage artifact below |
| **Flow / behavior** | "how does upload work?", "request lifecycle", "what happens when…" | `K/diagrams/README.md` → the topic `.puml` (evidence-cited, per-topic); **surface the matching `png/lakeside-<name>.png` so the developer can view it** | `C/05-behavior-spine.md` for branch/failure detail |
| **Architecture shape** | "how is it structured?", "what talks to what?", "how many services?" | `A/03-main-spine.md` boundary diagram + `K/diagrams/c4-container.puml`(+png) | `B/04-runtime-map.md`, `G/09-component-map.md` |
| **Ownership / data** | "who owns table Y?", "which service writes it?" | `D/06-ownership-map.md` (routed via catalog EV) | — |
| **Contract / API** | "what endpoints?", "request/response of X?" | `F/08-contract-map.md` | `K/diagrams/c4-component-<svc>.puml` |
| **Domain** | "bounded contexts?", "domain model?" | `E/07-domain-map.md` | — |
| **Risk / safety** | "safe to change?", "known risks?", "is auth enforced?" | `K/diagrams/README.md` `## ⚠️ Security & Risk Annotations` table (risk→status→affected diagram→ADR) + `H/12-drift-ambiguity-report.md` | `I/gaps/GAP-*.md` |
| **Why / decision** | "why X?", "why not Y?", "what replaced Z?" | `overlays/adrs/ADR-*.md` — the ledger gap row or the diagram README `Resolved` tables name the ADR directly | `overlays/research/*.md` (`## Canonical Summary` first) |
| **Coverage / status** | "what's covered?", "what's still Unknown?", "which stages ran?" | answer directly from Tier 0 (ledger + workflow-status) | — |

Always also check `${BUBATR_HOME}/STAGES/overlays/qa/ASK-log.md` — prior answers; reuse to stay consistent and skip re-derivation.

**Diagram-first for handover.** `ask` exists to help a human learn the system. When the answer is a flow or a shape, prefer surfacing the rendered `STAGES/K/diagrams/png/lakeside-<name>.png` — a diagram teaches faster than prose. Diagrams are evidence-backed (Stage K generates them from artifacts 03/04/05/09/10/12) and per-topic navigable. Cite facts from the `.puml` source (it carries `file:line` refs); point the developer at the `.png` to view.

If no reconstruction artifacts exist at all (no `00-workflow-status.md`): stop. Reply `Belum ada artefak reconstruction. Jalankan bubat-r run dulu.` and do not attempt to answer.

## Protocol

1. Determine `${BUBATR_HOME}`. Run **Tier 0** — orient with workflow-status + coverage-ledger (scope with `for <area>` when given).
2. **Settle the mode from the ledger first.** The dimension's verdict + gap status decides the Answer Mode (see below) before deep reads. `Unknown`/`Uncovered` → jump to step 5. `Contradicted`/`Covered with Critical Risk` → Contested. `Covered` → proceed to answer.
3. **Classify the question and open the category's cheap-first read** (Tier 1 table); escalate to the one listed artifact only if it underspecifies. For flow/shape questions, surface the matching diagram `.png`. Every factual claim carries a citation: `artifact` + `EV-NNN` / `file:line` / `symbol` / `.puml` / migration. No citation available → the claim is not made.
4. **Label confidence** from the source: catalog `Observed` + ledger `Covered` → ✅; single-artifact inference or `Partial` → 🟡. Do not upgrade a mode without a citation.
5. **On Unknown / Uncovered / Contested** — the ledger has no `Covered` evidence, or flags `Contradicted` / critical risk:
   - State plainly what is known and what is missing. Do not guess the gap.
   - Unless `--no-research`: offer to fill it — `Belum ada evidence di artefak. Jalankan bubat-r research "<question>" [for <area>]? (y/N)`.
   - Run research **only** if the developer approves (or `--yes` was passed). On decline: leave the answer as `Unknown` and stop — record nothing new.
6. **Approved research fallback:** invoke `bubat-r research "<question>" [for <area>]` per [`research.md`](./research.md). It saves a memo under `overlays/research/` with a `## Canonical Summary`. Re-answer step 3 from that memo.
7. **Writeback** (see Writeback) — record the exchange so the next `ask` is cheaper and the artifacts grow.
8. Return the answer with: confidence label, citations, any diagram `.png` path worth viewing, and — if research ran — the memo path and recommended canonical updates.

## Answer Modes

Every answer is labelled with exactly one. Modes map onto the coverage-ledger verdict — don't invent a parallel scale:

| Mode | Ledger verdict / source signal | Shape |
|---|---|---|
| ✅ **Answered** | `Covered`, backed by `Observed` evidence in the catalog. | Answer + citations (`EV-NNN`, `file:line`). |
| 🟡 **Partial** | `Partial`, `Accepted Gap`, or answer requires inference across two artifacts. | Answer + what's covered + what's not + citations; state the inference explicitly. |
| 🟠 **Contested** | `Contradicted` or `Covered with Critical Risk`. | Present both sides + cite `12-drift-ambiguity-report.md` / the gap. Do not pick a winner without evidence. |
| ❔ **Unknown** | `Uncovered` / `Unknown`, or dimension absent from ledger. | Say so. Offer research (unless `--no-research`). No fabricated answer. |

Honesty rule overrides completeness: a short `Unknown` beats a confident guess. Never upgrade a mode without a citation to justify it.

## Examples per Category

Grounded in the `lakeside/dwhcp-housekeeping` reconstruction. Each shows the cheap-first read and the shape of a good answer.

**Pointer / factual** — `bubat-r ask "what port does ducklake-service listen on?"`
> Reads: `A/01-evidence-catalog.md` (grep `ducklake` / `port`).
> ✅ **Answered.** `8092` on host, `8080` internal — `EV-023` (`docker-compose.yml`). Metrics on `:9091` (`02-coverage-ledger.md`, Observability row).

**Flow / behavior** — `bubat-r ask "how does the ingest pipeline run a job?"`
> Reads: `K/diagrams/README.md` → `write-path-sequence-pipeline.puml`.
> ✅ **Answered.** pipeline-worker polls `pipeline_jobs` with `SKIP LOCKED`, ingests CSV/XLSX via DuckDB `httpfs`, propagates W3C trace context across the async boundary. See `write-path-sequence-pipeline.puml`. **View:** `STAGES/K/diagrams/png/lakeside-write-path-sequence-pipeline.png`.

**Architecture shape** — `bubat-r ask "how many services and how are they wired?"`
> Reads: `A/03-main-spine.md` + `K/diagrams/c4-container.puml`.
> ✅ **Answered.** 4 app runtime units (storage-service, ducklake-service, pipeline-worker, lakehouse-ui) + 4 infra (postgres, seaweedfs, otel-collector, s3-init) behind nginx gateway `:9080`. **View:** `png/lakeside-c4-container.png`.

**Ownership / data** — `bubat-r ask "who writes pipeline_jobs.trace_context?"`
> Reads: `D/06-ownership-map.md` (routed via catalog EV).
> 🟡 **Partial.** Shared ownership — ducklake-service sets trace_context on enqueue, pipeline-worker reads/clears on execute (`06-ownership-map.md`). Column added in ADR-006; no single owner.

**Contract / API** — `bubat-r ask "what endpoints does ducklake expose?"`
> Reads: `F/08-contract-map.md`.
> ✅ **Answered.** 48 routes across 6 handler files (catalogs, query, parquet, ext-connections, managed-tables, pipeline), all unversioned v0 (`08-contract-map.md`). Per-component view: `c4-component-ducklake.puml`.

**Domain** — `bubat-r ask "what bounded contexts exist?"`
> Reads: `E/07-domain-map.md`.
> ✅ **Answered.** 9 contexts; #9 Observability added per ADR-006 (`07-domain-map.md`).

**Risk / safety** — `bubat-r ask "is it safe to change the query endpoint?"`
> Reads: `K/diagrams/README.md` ⚠️ table + `H/12-drift-ambiguity-report.md`.
> 🟠 **Contested / risk.** Open risk: no query timeout / row limit on ducklake query path (`12-drift-ambiguity-report.md`; affects `c4-component-ducklake`, `write-path-sequence-query`). Contracts are v0/unversioned — breaking-change risk. Auth is enforced (JWT+RBAC, ADR-002).

**Why / decision** — `bubat-r ask "why PostgreSQL instead of ClickHouse for the DWH?"`
> Reads: `overlays/adrs/ADR-20260804-004-replace-clickhouse-with-postgresql-for-dwh.md` (named by the diagram README `Resolved` table).
> ✅ **Answered.** ADR-004: ClickHouse never deployed; PostgreSQL DWH + DuckDB analytical engine chosen. See ADR for tradeoffs.

**Coverage / status** — `bubat-r ask "what's still unknown about this system?"`
> Reads: Tier 0 only — `02-coverage-ledger.md` + `00-workflow-status.md`.
> ✅ **Answered.** No uncovered critical dimensions; ~97% overall. Open (non-critical): API versioning (unversioned). Accepted gap: `PARSER_SERVICE_URL` empty (optional parser). All prior gaps CLOSED (GAP-009 observability).

**Unknown → research offer** — `bubat-r ask "what's the p99 latency of the query endpoint?"`
> Reads: Tier 0 — ledger has no performance/runtime-metrics dimension for latency.
> ❔ **Unknown.** Artifacts cover the metrics *surface* (RED metrics exist) but no measured p99. `Belum ada evidence di artefak. Jalankan bubat-r research "p99 latency query endpoint"? (y/N)` → on approval, run research, then re-answer and write back.

## Writeback

Only records evidence-backed knowledge. Never writes guesses.

1. **Q&A log** — append every answered/partial/contested exchange to `${BUBATR_HOME}/STAGES/overlays/qa/ASK-log.md` (create if absent). Idempotent — if the same question was logged, update its row instead of duplicating.
   ```markdown
   ## Q&A Log

   | Date | Question | Mode | Answer (1-line) | Sources | Research |
   |---|---|---|---|---|---|
   | 2026-08-15 | who writes order status? | ✅ | OrderService.markPaid() + webhook handler | `06-ownership-map.md`; `order_service.go:88` | — |
   | 2026-08-15 | nightly reconciliation trigger? | ❔→✅ | cron in deploy/reconcile.yaml | — | `RES-20260815-002.md` |
   ```
2. **Research memo** — when research ran, the memo under `overlays/research/` is the primary durable record. Cite its filename in the log `Research` column.
3. **Canonical update recommendation** — if research resolved an `Unknown`/gap that belongs in a canonical artifact, do **not** silently edit it. Recommend the exact update (e.g. `update 02-coverage-ledger.md: <area> Unknown → Covered, cite RES-...`) and let the developer / `bubat-r gap backfill` promote it. `ask` owns the log, not the canon.

## Rule

```text
answer from evidence or say Unknown — never invent architecture from naming
```

`ask` reads and reasons over artifacts; it does not reconstruct. New truth enters the artifacts only through `bubat-r research` (approved) and the canonical stages — `ask` records the question, the cited answer, and the pointer.
