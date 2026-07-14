# Stage C — Behavior Spine

Tujuan:

- petakan end-to-end behavior inti sistem

Metode:

- pilih 5–10 flow bernilai tertinggi
- prioritaskan write-path
- sertakan failure path utama

Sumber:

- routes/controllers/handlers
- application services/use-cases
- queue consumers
- scheduled jobs
- integration/e2e tests

Format flow:

- trigger
- actor
- preconditions
- steps
- writes
- side effects
- outbound calls
- emitted events
- failure paths
- EventStorming evidence: commands, events, policies, aggregates, read models/projections, hotspots, citations
- candidate `.es`

Output:

- `Workflow Status` updated for Stage C
- `DOCR Candidates` updated with flow/hotspot candidates
- `Behavior Spine`
- updated `Coverage Ledger`

Contoh pendek:

1. `POST /checkout`
2. validate cart + actor
3. reserve inventory
4. create order
5. initiate payment
6. publish `order.created`
7. return checkout result

Exit criteria:

- flow inti bisnis sudah tercakup
- alur create/update state utama sudah jelas
- behavior coverage dihitung
- partial flow punya missing segment jelas: trigger, write, side effect, event, atau failure path

## Working Files

Write output to this stage directory first:

- `STAGES/C/05-behavior-spine.md`
- `STAGES/C/02-coverage-ledger.md` (updated copy from Stage B)

After stage done, copy to target repo:

```bash
cp STAGES/C/05-behavior-spine.md <target>/reconstruction/
cp STAGES/C/02-coverage-ledger.md <target>/reconstruction/
```

## AST Index Commands

```bash
ast-index search "Query"               # universal structural search
ast-index refs "Symbol"                # definitions + usages by name
ast-index usages "Symbol"              # usage sites
ast-index callers "functionName"       # call sites
ast-index call-tree "functionName"     # call hierarchy tree
ast-index outline path/to/file         # file structure before reading file
```
