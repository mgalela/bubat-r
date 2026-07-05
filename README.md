# BUBAT-R

BUBAT-R reconstructs architecture from existing codebases, especially when docs are missing, stale, or untrusted.

## Purpose

Use BUBAT-R for:

- code-only architecture reconstruction
- takeover readiness assessment
- hard-evidence reference design
- weighted coverage scoring
- critical gap deepening loops
- late document feeding and verification

## Core Docs

- `workflow.md` — hard-evidence reconstruction workflow
- `overlays/takeover.md` — takeover readiness overlay
- `overlays/late-document-feeding.md` — late/stale docs feeding overlay
- `overlays/docr-materialization.md` — DOCR materialization/update overlay for target repos
- `overlays/research-orchestration.md` — parallel research/deepening overlay for Stage A and Stage I
- `docs/RFC-docr-target-repo.md` — RFC for hierarchical context docs in analyzed target repos
- `templates/hard-evidence-reconstruction/` — artifact templates
- `templates/hierarchical-context-docr/` — root/child `AGENTS.md` starter templates for target repos

## Install

### Inside this workspace

No install needed. Use files directly:

```bash
ls bubat-r
```

### Required tool: ast-index

BUBAT-R assumes `ast-index` for structural code navigation.

Install on macOS/Linux:

```bash
brew tap defendend/ast-index
brew install ast-index
```

Or npm:

```bash
npm install -g @ast-index/cli
```

Verify:

```bash
ast-index version
```

Recommended project config before first rebuild:

```yaml
# /path/to/project/.ast-index.yaml
exclude:
  - node_modules
  - .svelte-kit
  - build
  - dist
  - coverage
  - generated
  - vendor
```

Build index:

```bash
cd /path/to/project
ast-index rebuild
```

Use `ast-index update` after edits, pulls, or branch switches.

## Use Cases

### 1. Code-only reconstruction

Use when project has code but no usable docs.

```text
bubat-r run
```

Manual equivalent:

```bash
cp -R bubat-r/templates/hard-evidence-reconstruction /path/to/project/reconstruction
cd /path/to/project
ast-index rebuild
```

Then fill artifacts in order:

```text
01-evidence-catalog
02-coverage-ledger
03-main-spine
04-runtime-map
05-behavior-spine
06-ownership-map
...
11-reference-design
12-drift-ambiguity-report
```

### 2. Takeover assessment

Use when new team inherits existing system and must know if safe to change.

Read:

```text
bubat-r/overlays/takeover.md
```

Primary outputs:

```text
reconstruction/00-takeover-viability.md
reconstruction/13-risk-register.md
reconstruction/14-safe-change-readiness.md
```

### 3. Critical gap deepening

Use when initial reconstruction finds high-risk partial/unknown area.

```text
bubat-r gap checkout-ledger max 3
bubat-r gap inventory-ownership max 3
bubat-r gap tenant-isolation max 3
```

Manual equivalent:

```bash
mkdir -p reconstruction/gaps
cp bubat-r/templates/hard-evidence-reconstruction/gaps/GAP-000-template.md \
  reconstruction/gaps/GAP-001-<area>.md
```

Then run Stage I loop from `workflow.md`.

### 4. Late/stale docs feeding

Use when user finds docs after coverage/gaps exist.

```text
bubat-r feed docs docs/ARCHITECTURE.md for checkout-ledger max 3
```

Read:

```text
bubat-r/overlays/late-document-feeding.md
```

Docs are treated as claims to verify, not truth.

### 5. Readiness verdict before change

Use before major code work.

```text
bubat-r verdict for checkout-ledger
```

Output:

```text
reconstruction/13-readiness-verdict.md
```

Verdict separates:

```text
Coverage Verdict: Pass/Fail
Readiness Verdict: Ready/Yellow/Not Ready
```

### 6. Feed reconstruction into BUBAT

Use after BUBAT-R stabilizes reference design.

```text
bubat-r feed bubat
```

### 7. Materialize hierarchical context docs in target repo

Use after Stage A–H or after targeted Stage I deepening when next runs need local context near code.

```text
bubat-r export docr
bubat-r export docr for checkout max-depth 3
```

Read:

```text
bubat-r/docs/RFC-docr-target-repo.md
bubat-r/overlays/docr-materialization.md
```

## Suggested Commands

```text
bubat-r run
bubat-r gap <area> max <n>
bubat-r feed docs <path> for <area> max <n>
bubat-r status
bubat-r verdict
bubat-r research <question> [for <area>] [max-depth <n>]
bubat-r feed bubat
bubat-r export docr [for <area>] [max-depth <n>]
```

`bubat-r run` and `bubat-r feed bubat` are wired through BUBAT trigger routing. `bubat-r research` is proposed as overlay command contract. Other commands above remain command contracts for now.

## Output Location

BUBAT-R writes output into target project:

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
    GAP-xxx-*.md
  docs-feed/
    DOC-xxx-*.md
```

Optional Stage J / DOCR output additionally writes hierarchical context docs near code:

```text
AGENTS.md
apps/AGENTS.md
packages/AGENTS.md
services/<area>/AGENTS.md
```

EventStorming support additionally uses:

- `05-behavior-spine.md` for candidate `.es` flows, commands, events, policies, read models, and hotspots
- `06-ownership-map.md` for aggregate/event/projection ownership
- `07-domain-map.md` for bounded-context event ownership
- `08-contract-map.md` for event/projection/API contract surfaces
