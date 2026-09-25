# BUBAT-R Agent Instructions

Reconstruct architecture from existing codebases using hard evidence. No assumptions from naming.

## Evidence Priority

runtime behavior > write-path > schema/migrations > tests > deploy config > read-path > naming

## Stage Order

| Stage | Path        | Description                            |
| ----- | ----------- | -------------------------------------- |
| A     | `STAGES/A/` | Evidence Harvest                       |
| B     | `STAGES/B/` | Runtime Map                            |
| C     | `STAGES/C/` | Behavior Spine                         |
| D     | `STAGES/D/` | Ownership Map                          |
| E     | `STAGES/E/` | Domain Map                             |
| F     | `STAGES/F/` | Contract Map                           |
| G     | `STAGES/G/` | Component Map                          |
| H     | `STAGES/H/` | Reference Design                       |
| I     | `STAGES/I/` | Gap Deepening, when needed             |
| J     | `STAGES/J/` | AGENTS.md materialization, when needed |
| K     | `STAGES/K/` | Diagram Suite, when needed             |

## Rules

- Never derive boundary from folder/naming alone — require write-path or runtime evidence
- Mark unknown as Unknown, not assumed
- Every architecture conclusion needs file/symbol/migration citation
- Coverage verdict and readiness verdict always separate
- Stage G and H must not run before B+C+D are stable

## Command Entry

Every `bubat-r <command>` MUST read the corresponding `.bubat-r/commands/<command>.md` first before executing.

Available commands — reconstruction:

- `bubat-r run [path]` — first-pass hard-evidence reconstruction
- `bubat-r ask "<question>" [for <area>]` — answer from artifacts; offer research + write back if unknown
- `bubat-r research <question> [for <area>] [max-depth <n>]` — parallel research
- `bubat-r gap <area> max <n>` — critical gap deepening loop
- `bubat-r gap backfill <area>` — promote existing research into a formal `GAP-*.md` (no new loop)
- `bubat-r feed docs <path> for <area> max <n>` — late/stale docs feeding
- `bubat-r feed bubat` — feed reconstruction into BUBAT
- `bubat-r link <target-dir> [from <source-dir>]` — bidirectional link between BUBAT-R nodes
- `bubat-r status` — show reconstruction status
- `bubat-r verdict` — readiness verdict
- `bubat-r export [target-path] [to <output-dir>] [stages <A-K>]` — copy STAGES/ artifacts to output dir
- `bubat-r export docr [for <area>] [max-depth <n>]` — export hierarchical context docs

Available commands — refactoring SDLC:

- `bubat-r adr <title>` — create ADR sourced from artifacts
- `bubat-r plan <adr-id>` — generate refactor plan from ADR (issues mode: `--issues`)
- `bubat-r plan-detail <plan-id>` — split main plan into per-phase detail files
- `bubat-r test-plan <plan-id> [--phase <letter>]` — generate test plan companion to a plan
- `bubat-r impact <adr-id>` — identify stale artifacts after refactor done
- `bubat-r rerun [path] [--from-stage X] [--stages A,B,C] [--rewrite]` — re-run stages against existing artifacts when code changed

## Installer Commands

These are **shell commands** — run them in terminal, not as AI workflow steps.
Do NOT try to interpret or simulate these; just execute the shell command directly.

| Command | Shell command to run |
| ------- | -------------------- |
| `bubat-r version` | `npx github:mgalela/bubat-r version --dir .bubat-r` |
| `bubat-r install` | `npx github:mgalela/bubat-r install` |
| `bubat-r update` | `npx github:mgalela/bubat-r update --dir .bubat-r` |
| `bubat-r uninstall` | `npx github:mgalela/bubat-r uninstall --dir .bubat-r` |
| `bubat-r integrate --tool <name>` | `npx github:mgalela/bubat-r integrate --tool <name> --dir .bubat-r` |

`version` shows installed version, source (git/npx), integrations, and update status.
