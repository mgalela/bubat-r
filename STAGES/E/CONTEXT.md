# Stage E — Domain Reconstruction

Tujuan:

- bentuk candidate bounded contexts dari behavior + ownership, bukan dari folder names

Teknik grouping:

- rule bisnis berubah bersama
- data dengan owner sama
- vocabulary yang muncul konsisten di code paths penting
- command/event surface konsisten
- transactional boundary nyata

Pisahkan:

- decision-making zone
- read/projection zone
- integration/translation zone

Output:

- `Workflow Status` updated for Stage E
- `DOCR Candidates` updated with context-boundary candidates
- `Domain Map`

Isi minimum per context:

- name sementara atau final
- responsibility
- owned entities
- commands
- emitted/consumed events
- policies/process rules
- read models/projections
- upstream/downstream relations
- ambiguity notes

Exit criteria:

- capability inti sudah terkelompok dalam context masuk akal
- cross-context relation sudah terlihat

## Working Files

Write output to this stage directory first:

- `STAGES/E/07-domain-map.md`

After stage done, copy to target repo:

```bash
cp STAGES/E/07-domain-map.md <target>/reconstruction/
```

## AST Index Commands

```bash
ast-index module ""                    # module inventory
ast-index deps "module"                # module dependencies
ast-index dependents "module"          # reverse dependencies
ast-index module-route --from A --to B # dependency path
ast-index api "module"                 # public API surface
```
