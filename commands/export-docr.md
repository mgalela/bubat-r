# bubat-r export docr

Materialize hierarchical context docs in target repo from verified reconstruction artifacts.

## Intent

```text
bubat-r export docr [target-path] [for <area>] [max-depth N]
```

Examples:

```text
bubat-r export docr .
bubat-r export docr . for checkout
bubat-r export docr . for tenant-isolation max-depth 3
```

## Protocol

1. Read reconstruction artifacts, minimum:
   - `reconstruction/02-coverage-ledger.md`
   - `reconstruction/03-main-spine.md`
   - `reconstruction/04-runtime-map.md`
   - `reconstruction/05-behavior-spine.md`
   - `reconstruction/06-ownership-map.md`
2. Prefer also reading:
   - `reconstruction/07-domain-map.md`
   - `reconstruction/08-contract-map.md`
   - `reconstruction/11-reference-design.md`
   - `reconstruction/12-drift-ambiguity-report.md`
3. Select only durable subtree boundaries.
4. Create or update root `AGENTS.md` in target repo.
5. Create or update child `AGENTS.md` only for selected subtrees.
6. Preserve `Unknown` and `Contradicted` where material.
7. Refresh parent/child indexes.
8. If repo is human-edited, prefer managed marker blocks.

## Outputs

- `<target>/AGENTS.md`
- `<target>/<subtree>/AGENTS.md`

## Rules

- Do not generate docs for every folder.
- Docs are compressed local context, not new source of truth.
- Evidence-backed claims only.
- If local docs conflict with reconstruction artifacts, artifacts win and docs must be updated.
