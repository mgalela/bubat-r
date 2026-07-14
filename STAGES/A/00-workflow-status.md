# Workflow Status

Project: `[PROJECT]`  
Date: `[YYYY-MM-DD]`  
Run mode: `first-pass / takeover / gap-deepening / docr-refresh / mixed`

## Overall Status

- Current highest completed stage: `None / A / B / C / D / E / F / G / H / I / J`
- Coverage verdict: `Pass / Fail / Not Run`
- Readiness verdict: `Ready / Yellow / Not Ready / Not Run`
- DOCR status: `Not Run / Partial / Complete`
- Research overlay used: `Yes / No`
- Gap loop used: `Yes / No`
- Late docs overlay used: `Yes / No`
- Late docs target-design-only claims: `N / Not Run`

## Stage Checklist

| Stage | Name | Status | Output Exists | Notes / Blocker |
|---|---|---|---|---|
| T0 | Takeover Viability | Not Run / In Progress / Done / Blocked | `00-takeover-viability.md` | |
| A | Evidence Harvest | Not Run / In Progress / Done / Blocked | `01-evidence-catalog.md`, `02-coverage-ledger.md`, `03-main-spine.md` | |
| B | Runtime Map | Not Run / In Progress / Done / Blocked | `04-runtime-map.md` | |
| C | Behavior Spine | Not Run / In Progress / Done / Blocked | `05-behavior-spine.md` | |
| D | Ownership Map | Not Run / In Progress / Done / Blocked | `06-ownership-map.md` | |
| E | Domain Reconstruction | Not Run / In Progress / Done / Blocked | `07-domain-map.md` | |
| F | Contract Surface Map | Not Run / In Progress / Done / Blocked | `08-contract-map.md` | |
| G | Component Decomposition | Not Run / In Progress / Done / Blocked | `09-component-map.md`, `10-code-trace-map.md` | |
| H | Reference Design Decision | Not Run / In Progress / Done / Blocked | `11-reference-design.md`, `12-drift-ambiguity-report.md` | |
| I | Critical Gap Deepening | Not Run / In Progress / Done / Blocked | `gaps/GAP-*.md`, `13-readiness-verdict.md` | contradiction summary must be reflected in verdict when present |
| J | Hierarchical Context Docs | Not Run / In Progress / Done / Blocked | `AGENTS.md`, child `AGENTS.md`, `docr-export-report.md` | |
| R | Research Orchestration Overlay | Not Run / In Progress / Done / Blocked | `research/*.md` | optional |
| L | Late Docs Feed Overlay | Not Run / In Progress / Done / Blocked | `docs-feed/*.md` | optional |
| D0-D4 | DOCR Overlay Refresh Steps | Not Run / In Progress / Done / Blocked | root/child `AGENTS.md` refreshed | optional |

## Completion Rules

Mark stage `Done` only when:
- required artifact exists
- artifact has real content, not untouched template
- coverage/gap implications recorded where required

Mark stage `In Progress` when:
- artifact exists but still template-heavy or partial
- stage started but exit criteria not met

Mark stage `Blocked` when:
- runtime, secrets, infra, or access missing
- verification path cannot continue

## Coverage Snapshot

| Dimension | Value | Source |
|---|---:|---|
| Runtime coverage | `NN%` | `02-coverage-ledger.md` |
| Behavior coverage | `NN%` | `02-coverage-ledger.md` |
| Data ownership coverage | `NN%` | `02-coverage-ledger.md` |
| Integration coverage | `NN%` | `02-coverage-ledger.md` |
| Critical coverage | `NN%` | `02-coverage-ledger.md` / `13-readiness-verdict.md` |

## Active Gaps

| Gap | Status | Weight | Next Action |
|---|---|---:|---|
| `[gap]` | Open / Partial / Covered / Contradicted / Blocked | 5 | `[next]` |

## Next Recommended Step

- `[next command or stage]`
