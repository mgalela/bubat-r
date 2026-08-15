# bubat-r plan — mode `--issues`

Companion ke [`commands/plan.md`](./plan.md). Section ini **hanya berlaku kalau `--issues` dipakai**. Tanpa flag itu, abaikan file ini — `plan` berjalan mode ADR murni.

Dua kasus:

- **Kasus 1 — ADR + `--issues`:** issues jadi evidence tambahan, plan tetap milik ADR.
- **Kasus 2 — `--issues` tanpa ADR:** issues jadi sumber berdiri sendiri.

Issue files (mis. output [`lint-to-issues`](~/.claude/skills/lint2i/SKILL.md)) adalah canonical input.

## Flags

```text
# ADR + issues (issues jadi evidence tambahan, plan tetap milik ADR)
bubat-r plan ADR-20260806-001 --issues docs/issues/INDEX.md

# Issues saja (tanpa ADR)
bubat-r plan --issues docs/issues/INDEX.md
bubat-r plan --issues docs/issues/
bubat-r plan --issues docs/issues/LI-20260806-007-errcheck.md
bubat-r plan --issues docs/issues/LI-20260806-00*.md
```

| Flag | Arti | Default |
|---|---|---|
| `--issues <path...>` | Sumber issue: index file, issue file, direktori, atau glob. Boleh multi-path. | — |
| `--filter <k=v,...>` | Filter issue: `severity=error`, `tool=eslint`, `lang=go`, `id=LI-20260806-007`, `status=open`. Multi-value pakai `\|`. | `status=open` |
| `--group-by <key>` | Grouping phase untuk issue: `tool`, `lang`, `severity`, `dir`, `fixable`. | `tool` |
| `--label <short>` | Suffix pendek untuk filename plan (≤30 char, no spaces). | — |
| `--force` | Tetap tulis walau ada issue yang sudah punya `plan:` pointer ke plan lain. | off |

## Issue Source Lookup

Urut, hentikan di match pertama per path:

1. Path adalah file index (`INDEX.md`) → baca tabel index, resolve tiap link relatif terhadap direktori index.
2. Path adalah file issue tunggal → pakai file itu.
3. Path adalah direktori → glob `<dir>/*.md`, buang `INDEX.md`, `README.md`, `CONTEXT.md`.
4. Path adalah glob → expand.

Multi-path: union hasil, dedupe by issue `id` (atau path absolut jika tidak ada `id`).

## Output Naming (issue-only)

Selama ada ADR, naming ikut [`plan.md`](./plan.md) (termasuk ADR + `--issues`). Hanya kalau sumbernya issue saja:

| Input | Filename |
|---|---|
| 1 issue | `PL-<issue-id>.md` — e.g. `PL-LI-20260806-007.md` |
| multi issue / index | `PL-ISS-YYYYMMDD-NNN-<slug>.md` — e.g. `PL-ISS-20260806-001-lint-backlog.md` |

`NNN` = scan `overlays/plans/PL-ISS-YYYYMMDD-*.md`, counter tertinggi + 1, default `001`.
`<slug>` diderive dari `--label`, atau dari tool/kategori dominan (mis. `lint-backlog`, `eslint-typescript`).

## Protocol Tambahan

### Kasus 1 — ADR + `--issues` (issues sebagai evidence tambahan)

Jalankan Protocol utama [`plan.md`](./plan.md) apa adanya, tambah:

- Setelah step 5: resolve + parse issue set (lihat [Issue Resolution & Parsing](#issue-resolution--parsing)).
- Issue yang lokasinya menyentuh file di `Shape Implementasi` ADR → merge ke `### Inventory being replaced / added`, tambah kolom `Sumber` = issue id.
- Issue yang lokasinya **di luar** scope ADR → jangan bikin phase baru. Tulis di section `## Out-of-scope issues` dengan saran `jalankan bubat-r plan --issues <ids> terpisah`.
- ADR tetap pemilik Goal, phases, dan naming plan. Issue tidak boleh menggeser keputusan ADR — hanya menambah target konkret dan gate.
- Writeback issue frontmatter (Step W) dilakukan hanya untuk issue yang masuk scope.

### Kasus 2 — `--issues` tanpa ADR

Ganti step 2–5 Protocol utama dengan:

1. Resolve semua issue file, parse, terapkan `--filter` (default `status=open`). Catat berapa yang dibuang.
2. Validasi pre-condition:
   - Set issue tidak kosong → lanjut. Jika kosong: tolak dengan `Tidak ada issue yang cocok filter. Cek --filter atau status issue.`
   - Tiap issue punya minimal satu lokasi konkret (`file` atau `file:line`). Issue tanpa lokasi tidak dibuang, tapi ditandai `[needs location]` dan task pertamanya wajib langkah lokalisasi.
   - Issue yang sudah punya frontmatter `plan:` menunjuk plan lain → skip + warning `<id> sudah dipetakan ke <plan>. Pakai --force untuk override.`
3. Verifikasi lokasi masih valid: untuk tiap `file:line`, cek file masih ada. File yang hilang → tandai `⚠️ stale (file tidak ada)`, keluarkan dari task, catat di `## Findings`. Jangan tulis task terhadap file yang tidak ada.
4. Mapping issue → section plan mengikuti tabel di [Issue Resolution & Parsing](#issue-resolution--parsing).

Step 6–12 Protocol utama tetap jalan, dengan penyesuaian:

- Step 6 (`<slug>`): derive dari `--label` atau kategori dominan.
- Step 9 (Phase A additive): versi issue = Phase A selalu **baseline & tooling**, bukan perbaikan kode (lihat [Phase Derivation](#phase-derivation)).
- Step 11 (workflow-status): tulis ke section `## Active Issue-Sourced Plans` (buat kalau belum ada), bukan `## Active Refactoring Cycles`. Kolom: plan-id, path plan, Sumber (index/file/dir), Jumlah issue, Status = `⏳ pending`.

Tambahan section di plan file: `## Source Issues` (lihat [Coverage Rule](#coverage-rule)) tepat setelah `## Goal`.

### Step W — Writeback (kedua kasus)

- Tambah/update frontmatter tiap issue yang masuk scope: `plan: "STAGES/overlays/plans/<plan-id>.md"` dan `plan_phase: "<letter>"`.
- Jangan ubah `status` issue — status milik issue tracker, bukan plan.
- Jika sumber punya `INDEX.md`: append/update section `## Plans` di akhir index. Idempotent — kalau section sudah ada, update rownya, jangan duplikat. Jangan sentuh tabel index yang sudah ada.
  ```markdown
  ## Plans

  | Plan | Sumber | Issue | Phase |
  |---|---|---|---|
  | [PL-ISS-20260806-001-lint-backlog](../../.bubat-r/STAGES/overlays/plans/PL-ISS-20260806-001-lint-backlog.md) | index | LI-20260806-007 | B |
  ```

## Issue Resolution & Parsing

Issue yang dihasilkan oleh skill [`lint-to-issues`](~/.claude/skills/lint2i/SKILL.md) memiliki frontmatter YAML dan section terstruktur. Format ini adalah canonical input untuk mode `--issues`.

Baca frontmatter YAML jika ada:

| Field | Dipakai untuk |
|---|---|
| `id` | Kunci dedupe + kolom `## Source Issues` |
| `title` | Judul task group |
| `status` | Filter (default hanya `open`) |
| `severity` | Urutan phase (`error` sebelum `warning` sebelum `info`) |
| `tool` | Grouping + pemilihan gate command |
| `language` | Grouping + pemilihan build/test gate |
| `rule` | Gate scoping (`--enable-only`, `--select`, `--only`) |
| `occurrences` | Angka acceptance criteria |
| `fixable` | Urutan phase (auto-fix duluan) + apakah task boleh pakai `--fix` |

Mapping section body:

| Section issue | Dipetakan ke |
|---|---|
| `## Ringkasan` | `## Goal` (diagregasi) + Summary phase |
| `## Contoh pesan` | Konteks di deskripsi task |
| `## Lokasi terdampak` (tabel) | `### Inventory being replaced / added` + target task |
| `## Saran perbaikan` | Aksi konkret di task |
| `## Acceptance criteria` | `### Acceptance` phase — **salin verbatim**, jangan diparafrase |
| `## Referensi` | Link di Notes phase |

Fallback kalau issue bukan format `lint-to-issues`:

- Tidak ada frontmatter → derive `id` dari filename, `title` dari heading `#` pertama.
- Tidak ada `## Lokasi terdampak` → scan body untuk pola `path:line` atau backtick path; kalau nihil, tandai `[needs location]`.
- Tidak ada `## Acceptance criteria` → generate dari gate command tool; kalau tool tidak diketahui: `build clean + test suite pass + grep target returns empty`.
- Tidak ada `severity`/`tool` → treat `severity=unknown`, group by direktori.

## Phase Derivation

Berlaku untuk Kasus 2 (issues tanpa ADR). Urutan phase deterministik:

1. **Phase A — baseline & tooling (selalu additive).**
   Isi: baca config linter yang ada di repo (`.golangci.yml`, `eslint.config.mjs`, `ruff.toml`, dst.), pin config tersebut, catat baseline count per rule dari hasil lint aktual, tambah CI job lint dalam mode **non-blocking**. Tidak ada perbaikan kode di Phase A.
   Gate: `<lint cmd>` jalan dan angka temuan == angka di `## Source Issues`. Kalau beda, plan sudah stale → stop, regenerate.
   Baseline count dicatat per-rule di `### Summary` phase, format: `Baseline: 17 typecheck, 7 errcheck, 2 mnd → total 26`.
   Config linter yang dibaca harus dicatat di `### Planned changes` sebagai referensi (`## Lint configuration`).

2. **Phase-phase perbaikan.** Bucket issue dengan `--group-by` (default `tool`), lalu urutkan bucket:
   1. `fixable: true` duluan (mekanis, blast radius kecil).
   2. lalu `severity: error`, `warning`, `info`.
   3. dalam severity sama: `occurrences` kecil → besar (menang cepat duluan).
   Satu bucket = satu phase. Bucket >12 task dipecah jadi phase berurutan (`C`, `D`, ...), pemecahan per direktori — bukan per occurrence acak.

3. **Phase terakhir — enforce gate.**
   Isi: naikkan CI lint jadi blocking, hapus baseline/suppression sementara yang ditambah di Phase A.
   Gate: `<lint cmd>` exit 0 tanpa allowlist.

Aturan tambahan:

- Issue `typecheck` / compile-error selalu naik ke phase paling awal setelah A — issue lain bisa jadi artefak dari kode yang tidak compile.
- Issue yang menyentuh file yang sama digabung ke phase yang sama walau beda tool — hindari dua phase menyentuh file yang sama (konflik merge).
- Issue `fixable: true` boleh punya task `jalankan <lint cmd> --fix pada <path scope>`, tapi wajib diikuti task review diff — gate: `git diff --stat` direview + test pass.
- Issue `[needs location]` masuk ke phase terakhir sebelum enforce gate; task pertamanya lokalisasi.

## Gate Command per Tool

Dipakai sebagai `gate:` di task dan acceptance untuk task turunan issue. Ganti `<rule>` dan `<paths>` sesuai issue.

| Tool | Gate command (harus return empty / exit 0) |
|---|---|
| golangci-lint | `golangci-lint run --enable-only <rule> ./...` |
| eslint | `npx eslint <paths> --rule '{"<rule>":"error"}' --max-warnings 0` |
| ruff | `ruff check --select <rule> <paths>` |
| clippy | `cargo clippy -- -D clippy::<rule>` |
| rubocop | `rubocop --only <rule> <paths>` |
| shellcheck | `shellcheck --include=<rule> <paths>` |

Gate build/test pendamping per bahasa — minimal satu wajib ada di tiap phase perbaikan:

| Language | Gate |
|---|---|
| go | `go build ./...` + `go test ./...` |
| typescript / javascript | `npm run build` + `npm test` (atau `tsc --noEmit` untuk issue typecheck) |
| python | `pytest` |
| rust | `cargo test` |

Kalau project target tidak punya command tersebut: pakai command yang benar-benar ada di `package.json` / `Makefile` / `CONTEXT.md`. Jangan tulis gate yang tidak bisa dijalankan.

## Lint Configuration & Acceptance Criteria

Ketika input issue berasal dari lint (tool = `golangci-lint`, `eslint`, `ruff`, dll.), plan **wajib** membaca config linter yang dipakai repo. Config ini menentukan rule mana yang aktif, severity, dan path exclusion — semua berdampak langsung ke acceptance criteria.

### Baca config linter dari repo

Sebelum menulis acceptance criteria, baca file config linter yang relevan:

| Tool | Config file (urut prioritas) |
|---|---|
| golangci-lint | `.golangci.yml`, `.golangci.yaml`, `.golangci.toml`, `.golangci.json` |
| ESLint | `eslint.config.mjs`, `eslint.config.js`, `eslint.config.cjs`, `eslint.config.ts`, `.eslintrc.*` |
| Ruff | `ruff.toml`, `.ruff.toml`, `pyproject.toml` (`[tool.ruff]`) |
| Clippy | `clippy.toml`, `Cargo.toml` (`[lints.clippy]`) |
| RuboCop | `.rubocop.yml` |
| ShellCheck | `.shellcheckrc` |

Yang perlu dicatat dari config:

- **Path ignores / exclude** — path yang tidak kena lint. Penting untuk Phase A baseline (angka temuan harus cocok dengan scope lint yang sebenarnya).
- **Rule severity override** — rule yang diubah severity-nya (mis. `error` jadi `warning`). Mempengaruhi gate: rule yang di-set `warning` di config tidak boleh dijadikan gate blocking.
- **Rule disabled** — rule yang dimatikan di config. Issue dengan rule yang disabled = stale (config sudah berubah setelah issue dibuat).

### Acceptance criteria wajib dari hasil lint

Setiap phase yang memperbaiki lint issue wajib punya acceptance criteria spesifik berdasarkan **hasil lint aktual**:

```markdown
### Acceptance

- [ ] `cd <service> && golangci-lint run --config ../.golangci.yml --enable-only errcheck ./...` returns 0 issues
- [ ] `cd <service> && go build ./...` clean
- [ ] `cd <service> && go test ./...` — all pass
```

Aturan:

1. **Gate command wajib pakai config asli repo.** Jangan tulis `golangci-lint run ./...` kalau repo punya `.golangci.yml` di parent directory — tulis lengkap `golangci-lint run --config ../.golangci.yml ./...`.
2. **Angka temuan di acceptance harus diverifikasi.** Kalau Phase A mencatat baseline "12 temuan errcheck", Phase C harus punya acceptance "0 temuan errcheck" — bukan sekadar "lint clean".
3. **Path scope di gate harus sama dengan path scope di task.** Kalau task hanya menyentuh `pipeline-worker/`, gate-nya `./pipeline-worker/...`, bukan `./...`.
4. **Build/test gate pendamping wajib.** Setiap phase perbaikan lint harus punya minimal satu gate build/test (lihat [Gate Command per Tool](#gate-command-per-tool)). Tanpa ini, perbaikan lint bisa bikin regresi fungsional.

### Baseline count di Phase A

Phase A (mode issues) wajib mencatat **baseline count aktual** dari menjalankan linter dengan config repo:

```markdown
### Tasks

- [ ] [target: `.golangci.yml`] catat baseline: `golangci-lint run --config .golangci.yml ./...` — gate: output menunjukkan tepat 29 temuan (17 typecheck + 12 lainnya)
```

Kalau angka tidak cocok dengan `occurrences` di issue: issue stale, lint sudah berubah sejak issue dibuat. Tulis peringatan di `## Findings`, tetap lanjutkan — tapi update acceptance criteria ke angka aktual.

### Verifikasi config tidak berubah

Di Phase terakhir (enforce gate), pastikan config linter **tidak berubah** dari baseline Phase A (kecuali perubahan yang disengaja seperti penambahan `ignores`):

```markdown
### Acceptance

- [ ] `.golangci.yml` identik dengan baseline Phase A (kecuali perubahan yang terdokumentasi)
- [ ] `eslint.config.mjs` hanya berubah di bagian `ignores` (penambahan `.svelte-kit/`)
```

## Coverage Rule

Setiap issue yang masuk scope wajib muncul di minimal satu task. Tulis tabel verifikasi di plan:

```markdown
## Source Issues

**Input:** `docs/issues/INDEX.md` · 24 issue · filter `status=open` · 0 dibuang

| Issue | Rule | Severity | Temuan | Phase | Tasks |
|---|---|---|---|---|---|
| [LI-20260806-003](../../../docs/issues/LI-20260806-003-typecheck.md) | `typecheck` | 🔴 error | 17 | B | 3 |
| [LI-20260806-007](../../../docs/issues/LI-20260806-007-errcheck.md) | `errcheck` | 🔴 error | 7 | C | 2 |
```

Ada issue in-scope tanpa phase → jangan tulis plan. Stop dan laporkan issue mana yang belum terpetakan.
Issue di `## Out-of-scope issues` (Kasus 1) dikecualikan dari aturan ini.
Angka `Temuan` harus identik dengan `occurrences` di issue file. Beda angka = issue stale, regenerate issue dulu.

## Task Granularity — tambahan issue

Aturan [Task Granularity](./plan.md#task-granularity-rules) di `plan.md` tetap berlaku. Khusus task turunan issue:

- **Satu task = satu file**, bukan satu occurrence. Occurrence di file yang sama digabung, baris disebut semua.
  - Contoh: `` - [ ] `pipeline-worker/executor.go:94,126` — cek return `resp.Body.Close()`, ganti ke `defer func() { _ = resp.Body.Close() }()` — gate: `golangci-lint run --enable-only errcheck ./pipeline-worker/...` returns empty ``
- Jangan tulis task "perbaiki semua temuan rule X" tanpa daftar file.
- Task suppression (`//nolint`, `eslint-disable`) hanya boleh kalau `## Saran perbaikan` di issue menyebutnya; wajib sertakan alasan eksplisit di task.
