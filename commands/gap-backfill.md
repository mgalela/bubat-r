# bubat-r gap backfill

Create formal `GAP-*.md` file from an existing research overlay, without running a new deepening loop.

## Problem Solved

`bubat-r research` produces `RES-*.md` docs that resolve gap questions with real code citations.
But no `GAP-*.md` file is created — so `bubat-r gap <area>` starts from scratch, ignoring existing evidence.
`bubat-r gap backfill` bridges the two: promote research evidence into a formal gap file.

## Intent

```text
bubat-r gap backfill <gap-id> <area> from <res-slug>
bubat-r gap backfill <gap-id> <area> from <res-slug> status <override-status>
```

Examples:

```text
bubat-r gap backfill C09 audit-log from RES-audit-log-write-read-pipeline
bubat-r gap backfill C08 accrual from RES-accrual-scheduler status Covered
bubat-r gap backfill C22 dwh-reporting from RES-dwh-reporting status Covered
```

Arguments:

| Arg | Required | Notes |
|---|---|---|
| `<gap-id>` | yes | Ledger row key: `C09`, `C08`, `C22`, etc. |
| `<area>` | yes | Slug used in output filename: `audit-log`, `accrual`, etc. |
| `from <res-slug>` | yes | Filename stem (no path, no `.md`) under `STAGES/overlays/research/` |
| `status <override>` | no | Force gap status. Valid: `In Progress`, `Covered`, `Covered with Risk`, `Accepted Gap`. Default: inferred from RES doc open questions. |

## Path Resolution

Determine `${BUBATR_HOME}` — directory containing `bubat-r` marker file.

- RES source: `${BUBATR_HOME}/STAGES/overlays/research/<res-slug>.md`
  - If not found, search all `*.md` in that dir for filename containing `<res-slug>` (partial match, case-insensitive).
- Gap output: `${BUBATR_HOME}/STAGES/I/gaps/GAP-<gap-id>-<area>.md`
- Coverage ledger: latest `02-coverage-ledger.md` per standard resolution rule (I → D → C → B → A).
- Workflow status: `${BUBATR_HOME}/STAGES/A/00-workflow-status.md`
- Readiness verdict: `${BUBATR_HOME}/STAGES/I/13-readiness-verdict.md` (if exists)

## Pre-flight Checks

1. Abort if RES source file not found — list available RES files for user.
2. Abort if `GAP-<gap-id>-<area>.md` already exists — show path, say use `bubat-r gap <area>` to continue.
   - Exception: if existing file is named differently (e.g. `GAP-accrual.md` vs `GAP-C08-accrual.md`), warn and ask user to confirm rename or skip.
3. Warn (do not abort) if `<gap-id>` not found in coverage ledger — continue with user-supplied metadata.

## Protocol

### Step 1 — Read source artifacts

- Read `<res-slug>.md` in full.
- Read coverage ledger row for `<gap-id>`: weight, current status, evidence IDs, notes.
- Read `00-workflow-status.md`: current Stage I state.
- Read `13-readiness-verdict.md` if present: check if gap-id appears with inconsistent status.

### Step 2 — Extract from RES doc

Map RES doc sections → gap file sections:

| RES doc section | Gap file section |
|---|---|
| Research Question + Scope | § 1 Gap Statement |
| Consolidated Findings table | § 2 Current Evidence (rows with Observed/Inferred confidence) |
| Open Questions | § 3 Missing Evidence (each open question = one missing item) |
| Parallel Lanes findings + citations | § 5 Trace Results |
| Candidate Evidence Packet — Writers | § 6 Writer / Caller / Failure Map — Writers |
| Counter-Evidence table | § 5 counter-evidence column |
| Required Main-Artifact Updates checklist | § 8 Decision — Required follow-up |

Rules:
- Preserve all `path:line` citations verbatim — do not paraphrase.
- If RES doc has no "Open Questions" or all are answered → infer status `Covered`.
- If RES doc has unanswered open questions → infer status `In Progress`.
- `status` arg overrides inference.
- Backfill marker must appear at top of gap file (see template below).

### Step 3 — Write gap file

Create `${BUBATR_HOME}/STAGES/I/gaps/GAP-<gap-id>-<area>.md` using:

```markdown
# GAP-<gap-id>: <Area Title> — Backfilled from Research

> **Backfill source:** `STAGES/overlays/research/<res-slug>.md`
> **Backfilled:** <YYYY-MM-DD>
> **No deepening loop run.** Evidence pre-populated from research overlay.
> To run deepening loop: `bubat-r gap <area> max <n>`

**Weight:** <weight from ledger or Unknown>
**Loop:** 0/0 (research-backed, no loop)
**Status:** `<Covered | In Progress | Covered with Risk | Accepted Gap>`
**Date:** <YYYY-MM-DD>

## 1. Gap Statement

Question:
- <from RES Research Question>

Why critical:
- <from RES Scope — why-now>

Stop condition for this gap:
- <derived from RES success condition or open questions>

## 2. Current Evidence

<populated from RES Consolidated Findings — Observed/Inferred rows only>

## 3. Missing Evidence

<populated from RES Open Questions — each question becomes one row with weight TBD>
<empty if no open questions>

## 4. Search Plan

> Research already conducted. Re-run searches below only if deepening.

<populate from RES initial commands / search plan>

## 5. Trace Results

<populated from RES Consolidated Findings — all rows>

## 6. Writer / Caller / Failure Map

<populated from RES Candidate Evidence Packet writers, or empty sections if not present>

## 7. Coverage Delta

Before:
- Critical coverage: <from ledger — status before this backfill>

After:
- Critical coverage: <unchanged — backfill does not change coverage; run gap loop to update>

Changed ledger rows:
- <gap-id>: no change — backfill only. Run `bubat-r gap <area>` to close.

## 8. Decision

Coverage Verdict:
- <Pass if status Covered, Pending if In Progress>

Readiness Verdict:
- <Ready if Covered, Yellow if In Progress or open questions remain>

Decision:
- <mirror Status field>

Rationale:
- Promoted from research overlay `<res-slug>`. <N> citations, <M> open questions.
  <If Covered: "All questions answered in research — no loop required.">
  <If In Progress: "Open questions remain — run `bubat-r gap <area> max N` to close.">

Safe-change implication:
- <Green if Covered, Yellow if In Progress>

Required follow-up:
- <from RES Required Main-Artifact Updates — unchecked items only>

## 9. Loop Control

Loop result:
- research-backfill only — no loop run

Next loop target:
- <If In Progress: "run `bubat-r gap <area> max N`">
- <If Covered: "none">
```

### Step 4 — Fix verdict inconsistency (if applicable)

If `13-readiness-verdict.md` exists and contains `<gap-id>`:

1. Compare gap file status (just written) vs verdict table status.
2. If inconsistent:
   - Update Gap Resolution Summary row: align status with gap file status.
   - If status changed to `In Progress` or `Accepted Gap` → move row from "Closed" to appropriate section, or add note.
   - If verdict says `Covered` but gap file is `In Progress` → downgrade verdict row, update Blocking Risks table.
3. Print diff of changed verdict lines.
4. Do NOT change overall readiness verdict — that requires a full `bubat-r verdict` run.

### Step 5 — Update workflow status

Append to `00-workflow-status.md` under Stage I row or "Gap Loop Activity":

```markdown
| GAP-<gap-id>-<area> | Backfilled | `<res-slug>` | <YYYY-MM-DD> | Status: <status>. No loop run. <N> citations, <M> open questions. |
```

### Step 6 — Report to user

Print summary:

```text
Backfill complete.
  Gap file:  STAGES/I/gaps/GAP-<gap-id>-<area>.md
  Status:    <status>
  Evidence:  <N> citations from <res-slug>
  Open:      <M> open questions

  <If In Progress:>
  Run: bubat-r gap <area> max <n>   ← continues from existing evidence

  <If verdict was fixed:>
  Verdict updated: 13-readiness-verdict.md (Gap Resolution row <gap-id> changed from <old> → <new>)

  <If verdict is still inconsistent (overall verdict not touched):>
  Warning: overall readiness verdict not re-evaluated. Run: bubat-r verdict
```

## Constraints

- Never delete or overwrite an existing `GAP-*.md`.
- Never change ledger coverage status — only gap loop (`bubat-r gap`) does that.
- Never change overall readiness verdict status — only `bubat-r verdict` does that.
- Preserve all citations verbatim from RES doc.
- Backfill marker block at top of gap file is mandatory — marks file as research-promoted, not loop-produced.

## Related Commands

- `bubat-r research <question>` — produces RES-* docs that feed this command
- `bubat-r gap <area> max <n>` — runs deepening loop (reads existing gap file if present)
- `bubat-r verdict` — re-evaluates overall readiness after gaps change
