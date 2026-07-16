# RFC: Multi-Directory BUBAT-R Federation

Status: accepted  
Scope: multi-dir reconstruction runs yang perlu cross-referencing antar direktori

---

## Problem

User menjalankan `bubat-r run` di beberapa direktori terpisah (e.g. root, backend, frontend) untuk analisis mandiri per direktori. Setiap run menghasilkan `00-workflow-status.md` sendiri yang terisolasi. Ketika user query lintas-direktori, tidak ada jalur untuk menemukan artifact di direktori lain.

---

## Solution

Dua mekanisme:

1. **Node identity + Cross-Dir Links** — tambah section ke `00-workflow-status.md` (template)
2. **`bubat-r link` command** — sambungkan dua node secara bidirectional; root node auto-maintain Federation Index

Tidak ada file baru. Semua informasi tinggal di `00-workflow-status.md` masing-masing direktori.

---

## Extension: `00-workflow-status.md`

### Section `## Node` (semua direktori)

Ditambah setelah header, sebelum `## Overall Status`:

```markdown
## Node
- node_id: `[label unik, e.g. root | backend | frontend | worker]`
- scope_topics: `[comma-separated topics yg di-cover dir ini]`
- dir_path: `[path relatif dari federation root, e.g. . atau ./backend]`
- federation_root: `[path relatif ke root node, e.g. ../ atau ./]`
```

### Section `## Cross-Dir Links` (semua direktori)

Ditambah setelah `## Active Gaps`:

```markdown
## Cross-Dir Links
| linked_node | status_path | shared_topics |
|-------------|-------------|---------------|
| `[node_id]` | `[relative path ke 00-workflow-status.md node lain]` | `[topics]` |
```

- `status_path` selalu relatif dari direktori file ini
- Setiap baris = satu link ke node lain
- Bidirectional: kedua file punya baris satu sama lain

### Section `## Federation Index` (root node saja)

Ditambah setelah `## Cross-Dir Links` di root node:

```markdown
## Federation Index
| node_id | status_path | scope_topics | readiness |
|---------|-------------|--------------|-----------|
| `[id]`  | `[rel path]` | `[topics]`  | `[Ready / Yellow / Not Ready / Not Run]` |
```

- Root node = node dengan `federation_root: ./` atau `dir_path: .`
- `readiness` diambil dari `Readiness verdict` field di status file target
- Update otomatis ketika `bubat-r link` dijalankan dari atau ke root

---

## Command: `bubat-r link`

### Intent

```text
bubat-r link <target-dir> [from <source-dir>]
```

Default `source-dir`: direktori saat ini.

### Contoh

```text
bubat-r link ./backend
bubat-r link ./frontend from ./backend
bubat-r link ./frontend                    # dari root, frontend ke root
```

### Protocol

1. Resolve `source-dir` (default: `.`) dan `target-dir`.
2. Baca `source-dir/STAGES/A/00-workflow-status.md` — ambil `node_id`, `scope_topics`.
3. Baca `target-dir/STAGES/A/00-workflow-status.md` — ambil `node_id`, `scope_topics`.
4. Hitung `shared_topics`:
   - Intersection dari kedua `scope_topics`.
   - Jika kosong: tulis `general` sebagai placeholder.
5. Tulis baris baru di `## Cross-Dir Links` source file (pointing ke target):
   - Jika baris untuk `linked_node` sudah ada: update `shared_topics`, jangan duplikat.
6. Tulis baris baru di `## Cross-Dir Links` target file (pointing ke source):
   - Sama, idempotent.
7. Deteksi root node: cek `federation_root: ./` atau `dir_path: .` di salah satu node.
   - Jika source = root: update `## Federation Index` di source dengan baris target.
   - Jika target = root: update `## Federation Index` di target dengan baris source.
   - Jika keduanya bukan root: tidak ada Federation Index update.
8. Report: `Linked [source_node_id] ↔ [target_node_id] (shared: [topics])`.

### Idempotency

Jalankan `link` dua kali dengan argumen sama: hasil identik, tidak duplikat baris.

---

## Query Resolution Protocol

Ketika user tanya lintas-direktori dari suatu node:

```
1. Buka node saat ini: 00-workflow-status.md
2. Cari topic di ## Cross-Dir Links
3. Jika tidak ada match → buka federation_root/STAGES/A/00-workflow-status.md
4. Buka ## Federation Index → cari topic → primary node
5. Buka primary node's 00-workflow-status.md → ## Stage Checklist → artifact file
6. Return artifact paths (relatif dari primary node's dir)
```

---

## Contoh Struktur Hasil

```
/project/
  .bubat-r/STAGES/A/00-workflow-status.md     ← root node
    ## Node
      node_id: root
      scope_topics: overview, deploy, shared-infra
      dir_path: .
      federation_root: ./

    ## Cross-Dir Links
    | backend  | ../../backend/.bubat-r/STAGES/A/00-workflow-status.md  | auth, API-contract |
    | frontend | ../../frontend/.bubat-r/STAGES/A/00-workflow-status.md | API-contract |

    ## Federation Index
    | node_id  | status_path                                             | scope_topics                    | readiness |
    | root     | ./STAGES/A/00-workflow-status.md                        | overview, deploy, shared-infra  | Ready     |
    | backend  | ../../backend/.bubat-r/STAGES/A/00-workflow-status.md   | auth, DB, REST-API, business    | Yellow    |
    | frontend | ../../frontend/.bubat-r/STAGES/A/00-workflow-status.md  | UI, state, routing, API-consume | Not Run   |

  backend/.bubat-r/STAGES/A/00-workflow-status.md      ← backend node
    ## Node
      node_id: backend
      scope_topics: auth, DB, REST-API, business-logic
      dir_path: ./backend
      federation_root: ../../

    ## Cross-Dir Links
    | root     | ../../.bubat-r/STAGES/A/00-workflow-status.md           | auth, API-contract |
    | frontend | ../../frontend/.bubat-r/STAGES/A/00-workflow-status.md  | API-contract |
```

---

## Affected Files

| File | Change |
|------|--------|
| `templates/hard-evidence-reconstruction/00-workflow-status.md` | Tambah `## Node` dan `## Cross-Dir Links` section |
| `commands/link.md` | File baru — command spec |
| `docs/workflow.md` | Tambah section 5.8 tentang multi-dir federation |
