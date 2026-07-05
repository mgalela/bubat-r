# Docs Feed Claim Aggregate

Project: `[PROJECT]`  
Date: `[YYYY-MM-DD]`

## Purpose

Use when multiple late docs hit same area.

Goal:
- merge duplicate or near-duplicate claims
- cluster competing claims
- verify once per claim cluster instead of once per document copy

## Claim Clusters

| Cluster ID | Area | Normalized Claim | Source Claims | Priority | Verification Owner |
|---|---|---|---|---|---|
| `AGG-001` | `[area]` | `[normalized claim]` | `DOC-001/CL-001`, `DOC-003/CL-004` | weight-5 / weight-4 / normal | `[name or role]` |

## Cluster Verification

| Cluster ID | Support Evidence | Counter-Evidence | Final Status | Impacted Artifacts |
|---|---|---|---|---|
| `AGG-001` | `path:line` | `path:line` | Verified / Partially Verified / Contradicted / Target Design Only / Historical Intent | `08-contract-map.md`, `12-drift-ambiguity-report.md` |

## Notes

- preserve per-doc claim files
- use aggregate only to reduce repeated verification work
- if claims differ materially, split cluster instead of forcing merge
