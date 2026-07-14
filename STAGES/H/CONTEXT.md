# Stage H — Reference Design Decision

Tujuan:

- deklarasikan reference design arsitektur hasil rekonstruksi dari code yang ada sekarang

Pisahkan dua layer:

1. `Verified Current State`
2. `Unresolved / Ambiguous Areas`

Keputusan per area:

- accept current implementation as reference design
- mark ambiguity and require human validation
- mark contradiction antar bagian code dan perlu investigasi lanjut

Output:

- `Workflow Status` updated for Stage H
- `Architecture Reference Design`
- `Drift / Ambiguity Report`

Exit criteria:

- jelas mana verified reference design
- jelas mana area yang belum terbukti
- jelas mana konflik bukti yang perlu diselesaikan

## Working Files

Write output to this stage directory first:

- `STAGES/H/11-reference-design.md`
- `STAGES/H/12-drift-ambiguity-report.md`

After stage done, copy to target repo:

```bash
cp STAGES/H/11-reference-design.md <target>/reconstruction/
cp STAGES/H/12-drift-ambiguity-report.md <target>/reconstruction/
```

## AST Index Commands

```bash
ast-index query "SQL"                  # raw SQLite index query
```

Stage H primarily uses source citations and selective source reads to validate reference design decisions, not broad structural search.
