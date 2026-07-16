# Stage A — Evidence Harvest

Tujuan:

- kumpulkan fakta mentah
- belum simpulkan desain

Cari minimal:

- repo topology
- executable entrypoints
- routes / RPC / CLI / cron / workers
- schema / migrations / ORM models
- message queues / topics / event producers / consumers
- outbound HTTP / SDK integrations
- env vars / secrets names
- deployment manifests / docker / k8s / wrangler / terraform / CI
- tests: integration, e2e, contract, unit yang relevan
- tooling/build viability: dependency install state, typecheck, build, test commands
- observability config: logs, tracing, metrics

Output:

- `Workflow Status` updated: Stage A = `In Progress` then `Done/Blocked`
- `DOCR Candidates` updated with early subtree candidates
- `Evidence Catalog`
- `Coverage Ledger` initial
- `Main Spine` draft

Struktur minimum per evidence item:

- id
- evidence type
- location
- observed fact
- confidence
- notes

Contoh row:

| ID     | Type        | Location                                   | Fact                                             | Confidence |
| ------ | ----------- | ------------------------------------------ | ------------------------------------------------ | ---------- |
| EV-001 | route       | `apps/api/src/routes/checkout.ts`          | exposes `POST /checkout`                         | Observed   |
| EV-014 | migration   | `db/migrations/20260110_create_orders.sql` | table `orders` created with status + customer_id | Observed   |
| EV-033 | integration | `src/services/payment/client.ts`           | outbound calls to Stripe                         | Observed   |

Exit criteria:

- major entrypoints teridentifikasi
- major persistence surfaces teridentifikasi
- major external dependencies teridentifikasi
- build/test/check commands identified and attempted or marked blocked
- all discovered items diberi weight 1–5
- weight 5–4 items ditandai `Covered`, `Covered with Risk`, `Covered with Critical Risk`, `Partial`, `Uncovered`, `Unknown`, `Contradicted`, atau `Accepted Gap`

## Working Files

Write output to this stage directory first:

- `STAGES/A/00-workflow-status.md`
- `STAGES/A/01-evidence-catalog.md`
- `STAGES/A/02-coverage-ledger.md`
- `STAGES/A/03-main-spine.md`
- `STAGES/A/docr-candidates.md`

After stage done, mark as `Done` in `00-workflow-status.md`.

## AST Index Commands

```bash
ast-index stats                        # verify index health
ast-index map --limit 50               # compact project map
ast-index conventions                  # framework / architecture hints
ast-index file "pattern"               # locate files
ast-index search "Query"               # universal structural search
ast-index symbol "Name"                # locate symbols
ast-index query "SQL"                  # raw SQLite index query
```
