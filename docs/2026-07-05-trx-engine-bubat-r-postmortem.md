# Post-Mortem — BUBAT-R test on `../../kdmp/jiel/tools/trx-engine`

Date: `2026-07-05`

## 1. Goal

Evaluate actual run behavior vs expected BUBAT-R workflow.

## 2. Expected Workflow

Expected path for fuller BUBAT-R evaluation:

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

Optional overlays:
- `R` research orchestration
- `L` late docs feed
- takeover overlay
- DOCR overlay refresh

## 3. What Actually Ran

Executed:
- created `.ast-index.yaml`
- `ast-index rebuild`
- copied reconstruction templates
- static first-pass discovery
- partial takeover viability checks
- `go build ./...`
- `go test ./engine/... ./handler/... ./client/... -count=1`
- wrote:
  - `00-takeover-viability.md`
  - `01-evidence-catalog.md`
  - `02-coverage-ledger.md`
  - `03-main-spine.md`
  - `04-runtime-map.md`

Not executed:
- Stage C
- Stage D
- Stage E
- Stage F
- Stage G
- Stage H
- Stage I
- Stage J
- research overlay command
- gap command
- export docr command

## 4. Stage-by-Stage Status

| Stage | Expected | Actual | Verdict |
|---|---|---|---|
| T0 | viability check | partial | Partial |
| A | evidence harvest | ran | Done-ish first pass |
| B | runtime map | ran | Done-ish first pass |
| C | behavior spine | not run | Missing |
| D | ownership map | not run | Missing |
| E | domain reconstruction | not run | Missing |
| F | contract map | not run | Missing |
| G | component decomposition | not run | Missing |
| H | reference design | not run | Missing |
| I | gap deepening | not run | Missing |
| J | DOCR | not run | Missing |
| R | research memo overlay | not run | Missing |

## 5. Questions raised by evaluation

### Q1. Did BUBAT-R create structured DOCR?
No.

Reason:
- Stage J not run
- `bubat-r export docr` not run
- no root/child `AGENTS.md` generated in target repo

### Q2. Did BUBAT-R perform codebase research?
Yes, but only first-pass discovery research.

What happened:
- structural scan via `ast-index`
- targeted grep for runtime/routes/queue points
- reads on core files
- synthesis into evidence/runtime artifacts

What did not happen:
- dedicated `reconstruction/research/*.md` memo
- parallel research orchestration overlay
- focused question-driven deepening

### Q3. Why no GAP docs?
Because Stage I not run.

Important distinction:
- gap signals existed in `02-coverage-ledger.md`
- formal gap dossiers under `gaps/GAP-*.md` were not created

## 6. Gaps that already existed but were not promoted

Observed gap candidates from coverage ledger:
- exact dispatch path for `/v1/transactions`
- webhook → correlation → settle write path
- flow saga writer ownership
- accrual runtime role
- broker contract semantics

These were valid Stage I candidates.

## 7. What worked

- first-pass template copy worked
- `ast-index` workflow fit repo shape well
- runtime units discovered quickly
- major persistence surfaces discovered quickly
- build viability proven
- sample unit/build test viability proven
- centralized artifacts written to target repo as designed

## 8. What did not work well

- no explicit stage status tracker; easy to over-read progress
- no formal signal in target repo showing run stopped at Stage B
- no automatic promotion from coverage gap list to formal `GAP-*.md`
- no research memo artifact, so discovery work looked informal
- no DOCR output, which can be mistaken as missing capability instead of not-yet-run stage

## 9. Root process issue

Main issue not in evidence model.
Main issue in **run-state visibility**.

BUBAT-R has strong workflow model, but test run lacked explicit artifact saying:
- which stages ran
- which stages did not run
- which optional overlays did not run
- why some outputs are absent by design

This caused ambiguity:
- absence of DOCR looked like feature gap
- absence of GAP docs looked like missed analysis
- absence of research memo looked like no research happened

## 10. Corrective change chosen

Added workflow-stage checklist template:
- `templates/hard-evidence-reconstruction/00-workflow-status.md`

Purpose:
- track stage progress explicitly
- show highest completed stage
- show overlay usage
- show why outputs are absent

## 11. Recommended next product improvements

High priority:
1. always initialize `00-workflow-status.md` on run
2. update it whenever stage advances or stops
3. mark optional overlays `Not Run` explicitly
4. if behavior coverage stays low, recommend `bubat-r gap` explicitly in status artifact

Medium priority:
1. auto-create stub `reconstruction/research/` memo when discovery is substantial
2. auto-create candidate GAP rows or starter files when weight-5 partial gaps remain after Stage B/C
3. surface “DOCR not run yet” in status output

## 12. Final verdict

BUBAT-R test on `trx-engine` proved:
- Stage A/B first-pass workflow works
- codebase discovery works
- runtime mapping works
- artifact writing works

BUBAT-R test on `trx-engine` did **not** yet prove:
- behavior/ownership reconstruction quality
- gap deepening loop behavior
- structured DOCR generation
- research overlay behavior
- reference design closure

So evaluation verdict:
- **workflow partially exercised**
- **core discovery path validated**
- **later-stage workflow still untested in this run**
