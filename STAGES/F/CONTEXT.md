# Stage F — Contract Surface Map

Tujuan:

- petakan semua hubungan antar-boundary yang bersifat kontraktual

Termasuk:

- REST/GraphQL/RPC
- events/messages
- projection/read-model contracts
- webhooks
- shared DB access
- file exchange
- auth claims/tokens
- feature flags/config contracts

Output:

- `Workflow Status` updated for Stage F
- `DOCR Candidates` updated with contract-boundary candidates
- `Contract Map`

Isi minimum:

- producer
- consumer
- contract type
- schema/source
- versioning status
- break risk

Exit criteria:

- semua interaction penting sudah punya contract surface
- shortcut/shared-db coupling terdeteksi

## Working Files

Write output to this stage directory first:

- `STAGES/F/08-contract-map.md`

After stage done, copy to target repo:

```bash
cp STAGES/F/08-contract-map.md <target>/reconstruction/
```

## AST Index Commands

```bash
ast-index search "Query"               # universal structural search
ast-index refs "Symbol"                # definitions + usages by name
ast-index usages "Symbol"              # usage sites
ast-index api "module"                 # public API surface
ast-index imports path/to/file         # import/dependency clues
```
