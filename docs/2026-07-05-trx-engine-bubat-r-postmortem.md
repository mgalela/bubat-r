# Post-Mortem — BUBAT-R test on `../../kdmp/jiel/tools/trx-engine`

Date: `2026-07-05`

## 1. Goal

Evaluate full BUBAT-R workflow against real target repo, including:
- main reconstruction stages
- Stage I gap deepening
- Stage J DOCR export
- late-doc feed overlay

## 2. Expected Workflow

Expected path:

```text
T0 optional takeover viability
→ A Evidence Harvest
→ B Runtime Map
→ C Behavior Spine
→ D Ownership Map
→ E Domain Reconstruction
→ F Contract Surface Map
→ G Component Decomposition
→ H Reference Design Decision
→ I Gap Deepening when needed
→ J DOCR materialization when needed
```

Optional overlays exercised in this test:
- `R` research orchestration
- `L` late docs feed
- takeover overlay
- DOCR overlay refresh

## 3. What Actually Ran

Executed:
- created `.ast-index.yaml`
- `ast-index rebuild` / stats / structural search
- copied reconstruction templates
- static discovery + targeted source reads
- takeover viability first pass
- Stage A–H artifacts
- Stage I loop on transaction dispatch and flow outcome semantics
- research memos under `reconstruction/research/`
- late-doc feed for:
  - `doc/panduan-integrasi.md`
  - `doc/upstream-contract-matrix.md`
  - `doc/runbook/asyncq-performance-tuning.md`
- Stage J DOCR export into target repo root/selected subtrees
- sample tests:
  - `go test ./handler/... ./registration/... ./requestlog/... -count=1`
  - `go test ./requestlog/... ./internal/txnasynq/... -count=1`
  - `go test ./engine/broker/... -count=1`

Wrote / updated:
- full `reconstruction/00..13`
- `reconstruction/gaps/GAP-001-transaction-dispatch.md`
- `reconstruction/research/*.md`
- `reconstruction/docs-feed/*.md`
- target-repo `AGENTS.md` root + selected child docs

## 4. Final Stage Status

| Stage | Actual | Verdict |
|---|---|---|
| T0 | ran | Done |
| A | ran | Done |
| B | ran | Done |
| C | ran | Done |
| D | ran | Done |
| E | ran | Done |
| F | ran | Done |
| G | ran | Done |
| H | ran | Done |
| I | ran | Done |
| J | ran | Done |
| R | ran | Done |
| L | ran | Done |
| D0-D4 | ran as part of J refresh | Done |

Source of truth:
- `../../kdmp/jiel/tools/trx-engine/reconstruction/00-workflow-status.md`

## 5. What BUBAT-R proved in this run

### Q1. Did BUBAT-R create structured DOCR?
Yes.

Generated:
- `AGENTS.md`
- `handler/AGENTS.md`
- `worker/flat/AGENTS.md`
- `worker/flow/AGENTS.md`
- `internal/outbox/AGENTS.md`
- `internal/txnasynq/AGENTS.md`
- `requestlog/AGENTS.md`
- `engine/broker/AGENTS.md`

Why these only:
- they scored as durable boundaries
- they are runtime / ownership / contract / contradiction-heavy areas
- lower-value or thin entrypoint areas were deferred

### Q2. Did BUBAT-R perform codebase research?
Yes.

Produced focused memos:
- `reconstruction/research/2026-07-05-how-v1-transactions-dispatches.md`
- `reconstruction/research/2026-07-05-flow-outcome-semantics-and-requestlog.md`
- `reconstruction/research/2026-07-05-requestlog-read-model-and-archive.md`

Research was not only discovery.
It progressed into targeted contradiction deepening.

### Q3. Did BUBAT-R perform formal gap deepening?
Yes.

Produced:
- `reconstruction/gaps/GAP-001-transaction-dispatch.md`

Gap loop reached stop condition with durable contradiction, not missing evidence only.

### Q4. Did late docs override reconstruction?
No.

Late docs were handled as claim feeds.
Result:
- strengthened route/auth/runtime confidence
- one normative claim stayed target-design only
- no hard-evidence contradiction was erased

## 6. Most important finding

Main repo-level contradiction found:
- flow compensated/partial outcomes can end with parent outbox `settled`
- request-log reconciler maps `settled -> applied`
- hot read API and cold archive read API return stored status directly
- flow timeout path returns HTTP `pending` but no matching `requestlog.Pending` emit was found

Impact:
- request-log/read-model can surface `applied` for compensated/degraded flow outcomes
- readiness verdict stays `Not Ready`

This was strong result for BUBAT-R test because workflow did not stop at inventory; it found cross-subtree semantic drift.

## 7. Final verdict on target repo

From `13-readiness-verdict.md`:

```text
Coverage Verdict: Fail
Readiness Verdict: Not Ready
```

Reason:
- unresolved contradiction in flow request-log/read-model semantics

This means run reached real architectural decision value, not only documentation output.

## 8. What worked well

- Stage tracker solved prior run-state ambiguity
- full A–H flow is workable on real Go service repo
- Stage I can isolate and close on contradiction, not only unknowns
- Stage J DOCR export useful and selective, not doc explosion
- late-doc overlay preserved evidence-first discipline
- root + child docs carry ambiguity forward instead of hiding it
- target repo got durable local context near code

## 9. What still did not work perfectly

- critical coverage summary still coarse; contradiction dominates but metric presentation stays simple
- Stage J remains manual/materialized, not auto-triggered policy
- docs-feed artifacts are useful but can still be verbose for small doc sets
- provider-specific broker semantics still outside repo boundary; workflow can only mark partial, not close
- deploy-manifest/prod-topology proof remained partial in this repo-focused run

## 10. Product/process lessons

### Confirmed good decisions
1. `00-workflow-status.md` mandatory
2. Stage I gap dossier formalization mandatory
3. DOCR export should stay selective by boundary scoring
4. late docs must stay claim-by-claim, never narrative-trust mode

### New evidence from this run
1. distributed `AGENTS.md` becomes high-value when contradiction spans multiple subtrees
2. request-log / read-model areas deserve child docs even when initially deferred if Stage I raises them into critical path
3. thin entrypoint folders like `cmd/trx-flow-worker/` do not always need child docs if parent runtime doc already carries context well

## 11. Recommended BUBAT-R improvements after this fuller run

High priority:
1. generate Stage I contradiction summary block automatically into readiness verdict
2. add explicit Stage J export report showing selected vs deferred subtrees and why
3. add docs-feed claim aggregation helper when multiple docs hit same area
4. surface “target design only” claims clearly in docs-feed summary and maybe root status output

Medium priority:
1. compute critical coverage more formally when contradiction exists
2. auto-suggest candidate child docs after Stage H based on `docr-candidates.md`
3. add artifact for “selection rationale” during DOCR export

## 12. Final evaluation of BUBAT-R from this run

BUBAT-R test on `trx-engine` proved:
- discovery path works
- later-stage workflow works
- gap deepening works
- DOCR export works
- late-doc overlay works
- evidence-first model can find meaningful repo-level contradiction

So evaluation verdict:
- **workflow fully exercised through Stage J + overlays**
- **core reconstruction path validated**
- **gap/deepening and DOCR capabilities validated**
- **late-doc feeding model validated**
- **remaining issue is target-system contradiction, not BUBAT-R workflow incompleteness**
