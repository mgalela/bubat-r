# DOCR Materialization Overlay

Status: draft overlay  
Scope: materialize and maintain hierarchical context docs in analyzed target repo  
Companion docs: `bubat-r/workflow.md`, `bubat-r/docs/RFC-docr-target-repo.md`

## 1. Purpose

Main workflow reconstructs architecture into centralized artifacts.

This overlay answers:
- when local context docs should be created
- which subtrees deserve child `AGENTS.md`
- how to keep root/child docs aligned with reconstruction
- how to refresh local docs after gaps close or contradictions change

Use this overlay when:
- reconstruction will be reused across sessions or agents
- target repo is large enough that repeated full scans are expensive
- certain subtrees are durable change boundaries
- takeover/handoff needs context close to code

---

## 2. How To Use With Main Workflow

Do not replace main workflow. Overlay materializes projection docs from it.

Combined order:

```text
Main A–H/I produces evidence, coverage, flows, ownership, contracts
+ `docr-candidates.md` accumulates subtree signals during A–H
→ D0 Boundary Selection
→ D1 Root Context Doc
→ D2 Child Context Docs
→ D3 Index and Link Refresh
→ D4 Drift / Freshness Review
```

Typical timing:

```text
Main H → DOCR overlay first pass
Main I → DOCR overlay refresh for touched area
handoff/takeover → DOCR overlay final refresh
```

Outputs:

```text
<target-repo>/
  AGENTS.md
  <subtree>/AGENTS.md
```

Optional managed strategy:
- full managed files, or
- marker blocks for BUBAT-R-owned sections

---

## 3. D0 — Boundary Selection

Tujuan:
- pilih subtree yang layak punya local context doc
- gunakan `docr-candidates.md` sebagai shortlist input bila tersedia
- cegah doc explosion

Create child doc when subtree has several of:
- executable/runtime boundary
- important write ownership
- contract surface
- high-risk ambiguity
- main-spine importance
- large or frequently changed surface
- meaningful child subtree chain

Avoid child doc when subtree is mostly:
- helper-only
- cosmetic grouping
- too small/thin
- low-value for future navigation

Suggested scoring:

| Signal | Score |
|---|---:|
| executable/runtime entrypoint | +5 |
| primary write-path ownership | +5 |
| major contract/integration surface | +4 |
| high-risk or contradicted area | +4 |
| large subtree complexity | +3 |
| frequent change hotspot | +3 |
| helper-only subtree | -4 |
| no clear purpose | -5 |

Hard override create:
- weight-5 area
- deployment-critical runtime
- contradiction material to future change
- takeover-critical subtree

Output:
- selected subtree list
- skipped subtree list with reason if relevant
- optional refresh back into `docr-candidates.md` status: `Materialized / Deferred / Rejected`

---

## 4. D1 — Root Context Doc

Tujuan:
- create/update root `AGENTS.md` in target repo
- give fast repo-wide orientation

Root doc should summarize:
- repo purpose
- top runtime units
- main spine areas
- global contracts
- high-risk/ambiguous areas
- child index

Rules:
- stay brief
- point downward to child docs
- do not duplicate full reconstruction narrative
- keep uncertainty visible

---

## 5. D2 — Child Context Docs

Tujuan:
- create/update subtree docs for durable boundaries

Child doc should capture:
- purpose
- runtime role
- key entrypoints
- owned/primary data
- important flows
- contracts/integrations
- invariants/risks
- evidence anchors
- child index

Rules:
- nearest child doc should be enough to orient next investigation
- if ownership is unresolved, say `Unknown` or `Contradicted`
- do not claim final bounded context if evidence still partial
- prefer compact bullets and anchors over prose

---

## 6. D3 — Index and Link Refresh

Tujuan:
- keep root and child indexes navigable
- keep local docs tied back to reconstruction

Refresh when:
- new child doc appears
- subtree removed from selection
- contradiction resolved
- major gap closes
- owner/runtime/contract understanding changes materially

Minimum checks:
- child listed in parent index
- listed child file exists
- evidence anchors still point to real files/symbols
- stale links removed

---

## 7. D4 — Drift / Freshness Review

Tujuan:
- detect when local docs are likely stale
- keep projection docs from drifting away from reconstruction

Treat local doc as stale candidate when:
- reconstruction artifact changed materially but local doc did not
- gap loop changed ownership/flow/contract conclusion
- late-doc verification contradicted local statement
- subtree structure changed enough to break index usefulness

Status suggestions:
- `Current`
- `Needs Refresh`
- `Partially Stale`
- `Stale`

If stale:
- refresh local doc
- refresh parent index if needed
- remove contradictory old claims

---

## 8. Update Triggers

Refresh relevant DOCR docs after:
- `bubat-r gap <area> max <n>` closes or reclassifies gap
- `bubat-r feed docs ...` verifies or contradicts important claim
- ownership map changes for core entity
- runtime map changes for main unit
- contract map changes for major integration
- reference design changes for selected subtree

No refresh needed for:
- typo-only change
- low-impact helper edit
- non-architectural formatting/refactor without contract impact

---

## 9. Managed File Policy

Two modes:

### Full managed
- BUBAT-R owns whole `AGENTS.md`
- deterministic
- best for generated-only repos/workspaces

### Marker block managed
- BUBAT-R owns only marked sections
- safer when humans also edit local context docs

Recommended default:
- marker blocks for real target repos

Example:

```md
<!-- BEGIN BUBAT-R DOCR -->
...
<!-- END BUBAT-R DOCR -->
```

---

## 10. Verification

Before considering DOCR export valid:
- root doc exists
- selected child docs exist
- indexes are navigable
- no claim stronger than source confidence
- material unknowns/contradictions remain visible
- local docs stay concise enough for quick re-read

---

## 11. Command Pairing

Primary command:

```text
bubat-r export docr [target-path] [for <area>] [max-depth N]
```

Recommended pairing:

```text
bubat-r gap <area> max <n>
bubat-r export docr [for <area>]
```

Or after stable first pass:

```text
bubat-r run
bubat-r export docr
```

---

## 12. Operating Maxims

- evidence decides, local docs summarize
- create fewer docs, but make each one useful
- nearest context doc should accelerate next investigation
- local docs must preserve ambiguity, not erase it
- refresh after durable understanding changes
