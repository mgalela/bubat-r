# Hard-Evidence Architecture Reconstruction Templates

Templates for `bubat-r/workflow.md`.

Copy folder into target workspace:

```bash
cp -R bubat-r/templates/hard-evidence-reconstruction reconstruction
```

Recommended output set:

```text
reconstruction/
  01-evidence-catalog.md
  02-coverage-ledger.md
  03-main-spine.md
  04-runtime-map.md
  05-behavior-spine.md
  06-ownership-map.md
  07-domain-map.md
  08-contract-map.md
  09-component-map.md
  10-code-trace-map.md
  11-reference-design.md
  12-drift-ambiguity-report.md
  13-readiness-verdict.md
  gaps/
    GAP-000-template.md
```

Workflow:
1. Run `ast-index rebuild` or `ast-index update`.
2. Fill `01–06` first.
3. In `05-behavior-spine.md`, capture EventStorming evidence and candidate `.es` draft for main flows.
4. Compute coverage in `02-coverage-ledger.md`.
5. Use coverage gaps to guide `07–10`, including event ownership and projection contracts.
6. Publish `11-reference-design.md` only for verified/covered areas.
7. Put unresolved gaps in `12-drift-ambiguity-report.md`.
8. If critical coverage target not met, or coverage passes but critical risk remains, copy `gaps/GAP-000-template.md` into `gaps/GAP-001-<area>.md` and run Stage I deepening loops.
9. Record final coverage/readiness split in `13-readiness-verdict.md`.

Loop command pattern:

```text
run critical deepening for <area> until <stop-condition> or max <N> loops
```

Default major-change stop condition:

```text
critical coverage >= 90%
AND no Unknown weight-5
AND no unresolved Contradicted
AND no unresolved Covered with Critical Risk
AND owner/writer list complete for changed data
AND failure path traced for changed flow
AND build/check/test viability proven or explicitly risk-accepted
```
