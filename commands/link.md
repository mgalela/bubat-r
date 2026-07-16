# bubat-r link

Link dua BUBAT-R nodes secara bidirectional untuk cross-directory artifact navigation.

## Intent

```text
bubat-r link <target-dir> [from <source-dir>]
```

Default `source-dir`: direktori saat ini.

## Examples

```text
bubat-r link ./backend
bubat-r link ./frontend
bubat-r link ./frontend from ./backend
```

## Path Resolution

Determine `${BUBATR_HOME}` for both source and target:

- `<source-dir>/.bubat-r/` — source BUBATR_HOME
- `<target-dir>/.bubat-r/` — target BUBATR_HOME
- Status files: `${BUBATR_HOME}/STAGES/A/00-workflow-status.md`

## Protocol

1. Resolve `source-dir` (default: `.`) dan `target-dir`.
2. Locate source status file: `<source-dir>/.bubat-r/STAGES/A/00-workflow-status.md`.
   - If missing: abort with `Error: source status file not found. Run 'bubat-r run' in source-dir first.`
3. Locate target status file: `<target-dir>/.bubat-r/STAGES/A/00-workflow-status.md`.
   - If missing: abort with `Error: target status file not found. Run 'bubat-r run' in target-dir first.`
4. Read source status file — extract:
   - `node_id` from `## Node` section
   - `scope_topics` from `## Node` section
   - `dir_path` and `federation_root` from `## Node` section
5. Read target status file — extract same fields.
6. Compute `shared_topics`:
   - Intersection of source `scope_topics` and target `scope_topics` (case-insensitive).
   - If intersection empty: use `general`.
7. Compute `status_path` values:
   - From source pointing to target: relative path from source status file to target status file.
   - From target pointing to source: relative path from target status file to source status file.
8. Update `## Cross-Dir Links` in source status file:
   - If row with `linked_node = target.node_id` already exists: update `shared_topics` column only.
   - Else: append new row.
   - Remove placeholder row `*(none — ...)` if present.
9. Update `## Cross-Dir Links` in target status file:
   - Same logic, reverse direction.
10. Detect root node:
    - Root = node where `dir_path: .` or `federation_root: ./`.
    - Check both source and target.
11. If source is root node:
    - Upsert row for target in `## Federation Index` of source status file.
    - `readiness` = value of `Readiness verdict` from target status file.
    - Add `## Federation Index` section if not present (after `## Cross-Dir Links`).
    - Ensure source itself has a row in its own Federation Index.
12. If target is root node:
    - Upsert row for source in `## Federation Index` of target status file.
    - Same upsert logic.
13. Report:
    ```
    Linked [source_node_id] ↔ [target_node_id]
    Shared topics: [topics]
    Source Cross-Dir Links: updated
    Target Cross-Dir Links: updated
    Federation Index: [updated at root_node_id | not applicable]
    ```

## Federation Index Section Format

Add to root node's status file after `## Cross-Dir Links`:

```markdown
## Federation Index
| node_id | status_path | scope_topics | readiness |
|---------|-------------|--------------|-----------|
| `[id]` | `[rel path from this file]` | `[topics]` | `[Ready / Yellow / Not Ready / Not Run]` |
```

- `readiness` sourced from `Readiness verdict:` line in target `## Overall Status`.
- Re-run `bubat-r link` after target readiness changes to refresh this value.

## Idempotency Rule

Running `bubat-r link` twice with same arguments must produce identical result — no duplicate rows, no duplicate sections.

## Notes

- `bubat-r link` does NOT copy or move artifacts. It only writes cross-reference metadata into status files.
- After linking, `bubat-r status` will show cross-dir links when reporting on the current node.
- Query resolution: read `## Cross-Dir Links` → follow `status_path` → read target's `## Stage Checklist` → find artifact.
- For root-level overview: read `## Federation Index` → lookup topic → navigate to primary node.
