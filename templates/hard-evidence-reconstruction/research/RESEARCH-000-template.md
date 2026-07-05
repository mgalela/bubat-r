---
date: "[YYYY-MM-DDTHH:MM:SSZ]"
repository: "[repo name or target path]"
topic: "[research topic]"
mode: broad-first-pass | targeted-gap | question-driven
related_gap: none
related_artifacts:
  - reconstruction/02-coverage-ledger.md
  - reconstruction/12-drift-ambiguity-report.md
status: complete
---

# Research — [Topic]

## Research Question

- `[exact question]`

## Scope

- Main area: `[area]`
- Why now: `[reason]`
- Expected evidence types: `[runtime / write-path / schema / tests / config / contracts]`
- Success condition: `[what this memo should prove or narrow]`

## Filename Convention

```text
reconstruction/research/YYYY-MM-DD-<topic>.md
```

Examples:

```text
reconstruction/research/2026-07-05-who-writes-order-status.md
reconstruction/research/2026-07-05-how-checkout-posts-ledger.md
reconstruction/research/2026-07-05-tenant-event-consumers.md
```

Rules:
- use lowercase kebab-case topic
- keep topic concrete and question-shaped if possible
- if tied to gap, optionally append gap slug

Optional gap-tied examples:

```text
reconstruction/research/2026-07-05-order-ownership-who-writes-order-status.md
reconstruction/research/2026-07-05-checkout-ledger-how-checkout-posts-ledger.md
```

## Search Plan

### Research lanes

| Lane | Goal | Primary tools | Notes |
|---|---|---|---|
| Locator | `[find files/routes/jobs/symbols]` | `ast-index file/search/symbol` | `[notes]` |
| Analyzer | `[trace exact path]` | `ast-index refs/usages/callers/call-tree` | `[notes]` |
| Pattern | `[find similar implementations]` | `ast-index search`, `rg` | `[notes]` |
| Counter-evidence | `[find conflicting owner/writer/path]` | `ast-index refs/usages`, `rg` | `[notes]` |

### Initial commands

```bash
ast-index search "[term]"
ast-index refs "[Symbol]"
ast-index callers "[Function]"
rg -n "[literal|raw SQL|config key]" .
```

## Parallel Lanes

### Lane: Locator
- Search targets:
- Findings:
- Candidate citations:
- Confidence:

### Lane: Analyzer
- Search targets:
- Findings:
- Candidate citations:
- Confidence:

### Lane: Pattern
- Search targets:
- Findings:
- Candidate citations:
- Confidence:

### Lane: Counter-evidence
- Search targets:
- Findings:
- Candidate citations:
- Confidence:

## Consolidated Findings

| Candidate | Type | Source lane | Citation | Confidence | Counter-evidence | Next verification step |
|---|---|---|---|---|---|---|
| `[finding]` | route/runtime/write-path/owner/contract/test/config | `[lane]` | `path:line` | Observed/Inferred/Unknown | `none or path:line` | `[next step]` |

## Candidate Evidence Packet

Map each candidate into canonical artifacts.

| Candidate | Target artifact | Why |
|---|---|---|
| `[finding]` | `01-evidence-catalog.md` | `[reason]` |
| `[finding]` | `05-behavior-spine.md` | `[reason]` |
| `[finding]` | `06-ownership-map.md` | `[reason]` |
| `[finding]` | `12-drift-ambiguity-report.md` | `[reason]` |

## Counter-Evidence

| Hypothesis | Counter-evidence sought | Result | Citation |
|---|---|---|---|
| `[hypothesis]` | `[what could falsify it]` | found / not found / partial | `path:line or none` |

## Open Questions

- `[question]`
- `[question]`

## Required Main-Artifact Updates

Only after exact source verification.

- [ ] `01-evidence-catalog.md`
- [ ] `02-coverage-ledger.md`
- [ ] `04-runtime-map.md`
- [ ] `05-behavior-spine.md`
- [ ] `06-ownership-map.md`
- [ ] `12-drift-ambiguity-report.md`
- [ ] `gaps/GAP-xxx-<area>.md`

## Final Note

Memo status:
- `candidate evidence only until canonical artifacts updated`
