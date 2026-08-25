# bubat-r rerun

Re-run one or more BUBAT-R stages against existing artifacts. Use when code has changed and prior reconstruction outputs are stale.

## Path Convention

Uses `${BUBATR_HOME}` — replace with actual location (default: `.bubat-r/`).

## Intent

```text
bubat-r rerun [target-path] [--from-stage X] [--stages A,B,C] [--rewrite]
```

Examples:

```text
bubat-r rerun
bubat-r rerun ./apps/api
bubat-r rerun --from-stage B
bubat-r rerun --stages A,G,H
bubat-r rerun --from-stage A --rewrite
```

| Arg | Required | Notes |
|---|---|---|
| `[target-path]` | no | Same resolution as `bubat-r run`. Defaults to current repo. |
| `--from-stage X` | no | Re-run stage X and all Done downstream stages (cascade). |
| `--stages A,B,C` | no | Re-run only these stages (in dependency order). |
| `--rewrite` | no | Full re-generation per stage. Default: patch mode. |

Mutually exclusive: `--from-stage` and `--stages`.

## Update Modes

| Mode | Trigger | Behavior |
|---|---|---|
| `patch` (default) | no flag | Read existing artifact → identify stale entries → add new evidence → patch in place |
| `rewrite` | `--rewrite` | Full re-run of stage protocol → overwrite artifact completely |

Use `patch` for routine code changes. Use `--rewrite` when structure changed significantly (major refactor, renamed modules, changed framework).

## Path Resolution

1. Determine `${BUBATR_HOME}`.
2. Read `${BUBATR_HOME}/STAGES/A/00-workflow-status.md`.
3. Run Status vs Filesystem Reconciliation (see Pre-flight step 2) — always before scope determination.
4. Determine scope using reconciled stage map:
   - `--from-stage X` → cascade: X plus all reconciled-valid Done/In-Progress stages downstream.
   - `--stages A,B,C` → exactly those stages if reconciled-valid; skip and warn any that are not.
   - no flag → show reconciled stage map to user, then prompt scope.

## Protocol

### Pre-flight

1. Read `${BUBATR_HOME}/STAGES/A/00-workflow-status.md`. Extract:
   - Stage checklist: claimed status + expected output artifacts per stage
   - Coverage snapshot: baseline percentages (runtime%, behavior%, critical%, etc.)
   - Active Gaps: open/in-progress gaps — cross-check during per-stage loop
   - Notes per stage: last `Updated: YYYY-MM-DD` if present
   - Overlays used: research, gap loop, late docs — flag if relevant stages in scope
   - DOCR status: if Partial/Complete, flag AGENTS.md as potentially stale when A/B/C/D/G in scope

2. **Status vs Filesystem Reconciliation** — run before scope determination:

   For each stage in checklist, cross-check claimed status against filesystem:

   | Claimed Status | Artifact on disk | Reconciled Result |
   |---|---|---|
   | `Done` | missing | `invalid` — warn, exclude from scope |
   | `Done` | template only (placeholders `[PROJECT]`/`[YYYY-MM-DD]` still present, or <10 meaningful lines) | `invalid` — treat as Not Run, exclude |
   | `Done` | real content | `valid` — eligible for rerun |
   | `Not Run` | exists | `inconsistent` — flag, ask user whether to include |
   | `Blocked` | exists with partial content | `partial` — ask user whether to include |
   | `In Progress` | exists | `partial` — include with caution, patch from partial baseline |
   | `Not Run` / `Blocked` | missing | `skip` — exclude silently |

   Build **reconciled stage map**: `{ stage → reconciled_result }`.

3. If no flags: present reconciled stage map to user before asking scope:

   ```
   Reconciled stage state:
     A  Done     valid       — last updated: YYYY-MM-DD
     B  Done     valid       — last updated: YYYY-MM-DD
     C  Done     invalid     — artifact missing (claimed Done)
     D  Not Run  inconsistent — artifact found but status says Not Run
     ...

   Which stages to rerun? (all valid-Done / from-stage X / specific stages)
   ```

4. Build effective stage list from scope decision + reconciled stage map.
5. Warn user: downstream stages may be stale after update. Show final list. Ask confirmation before cascade affects more than user specified.
6. If Stage A is in scope: run `ast-index update` on target repo.
7. Set run mode in `00-workflow-status.md` header to `update`.

### Per-stage loop (for each stage in effective list, in order)

1. Read `${BUBATR_HOME}/STAGES/<X>/CONTEXT.md` for stage instructions.
2. Read existing artifacts for this stage.
3. **Patch mode** (default):
   a. For each evidence item referencing `location: path` or `path:line` → verify file/symbol exists in target repo.
   b. Mark stale entries: append `[STALE — file not found]` or `[STALE — symbol moved]` to that row. Do not delete — preserve for audit trail.
   c. Identify new code surfaces (new files, new routes, new schemas, new env vars) not yet in artifact.
   d. Append new evidence as new rows (new EV-IDs for catalog, new ledger rows, etc.).
   e. Re-score coverage for updated rows only.
   f. Write patched artifact in place.
4. **Rewrite mode** (`--rewrite`):
   a. Run full stage protocol as in `bubat-r run`.
   b. Overwrite artifact in place.
5. Mark stage as `Updated: <YYYY-MM-DD>` in `00-workflow-status.md` Notes column.

### Always-updated artifacts (regardless of scope)

After the per-stage loop, always update regardless of which stages ran:
- `02-coverage-ledger.md` — re-score all rows where evidence was marked stale or added.
- `12-drift-ambiguity-report.md` — add new contradictions found, mark resolved ones.
- `00-workflow-status.md` — update coverage snapshot section.

If Stage I (`13-readiness-verdict.md`) exists: update verdict to reflect new coverage scores.

### Post-run

1. Update `00-workflow-status.md`:
   - Coverage snapshot with new values.
   - Stage checklist: each updated stage shows `Done` status + `Updated: <YYYY-MM-DD>` in Notes.
   - Next Recommended Step.
2. If DOCR (`STAGES/J/`) exists and stages A, B, C, D, or G were updated: flag `AGENTS.md` as potentially stale. Do not auto-update — recommend `bubat-r export docr`.
3. Remind user to re-run `bubat-r export <target-path>` if reconstruction/ was previously exported.

## Staleness Detection Rules (patch mode)

| Evidence type | Check | Mark stale when |
|---|---|---|
| File reference (`path/to/file.ts`) | `find <target> -path "*<file>"` | File not found |
| Symbol/function reference (`path:line`) | `ast-index query <symbol>` or grep | Symbol not found in file |
| Route/endpoint | Search for route pattern in codebase | Route pattern not found |
| Schema/table | Search migration or ORM files | Table/model name not found |
| Env var | Search `.env.example`, config files | Var name not found |
| Integration/SDK | Search import/require | Import not found |

Stale entries keep their EV-ID — never renumber. New entries get next sequential EV-ID.

## Cascade Dependency Order

```
A → B → C → D → E → F → G → H → I → J → K
```

If `--from-stage B` specified: re-run B, C, D, E, F, G, H (skipping I, J, K unless already Done).
Stages not in scope and not downstream: untouched.

## Status Tracking in 00-workflow-status.md

Stage checklist Notes column format after update:

```
Updated: 2026-08-25 | prior: Done since 2026-07-01 | 3 stale, 5 new EV
```

Run mode header: change to `update` (from `first-pass`).

## Constraints

- Never renumber existing EV-IDs — stale entries stay with `[STALE]` suffix.
- Never delete artifacts — always overwrite in place.
- If artifact doesn't exist for a Done stage (inconsistent state): warn user, skip stage, suggest `bubat-r run --from-stage X` to regenerate from scratch.
- Do not auto-cascade beyond user-specified scope without explicit confirmation.
- If >60% of evidence items in a stage are stale in patch mode: stop and recommend `--rewrite` for that stage.

## Related Commands

- `bubat-r run [path]` — first-pass from scratch (no existing artifacts required)
- `bubat-r impact <adr-id>` — identify stale artifacts from a specific ADR (analysis only, no re-run)
- `bubat-r gap <area> max <n>` — gap deepening loop for a specific area
- `bubat-r export <target-path>` — materialize updated artifacts to reconstruction/
- `bubat-r export docr` — refresh AGENTS.md if J exists

> Note: `bubat-r update` (no other flags) is a framework installer command (shell, not AI workflow). Use `bubat-r rerun` for artifact refresh.
