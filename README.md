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

- `docs/workflow.md` — hard-evidence reconstruction workflow
- `overlays/takeover.md` — takeover readiness overlay
- `overlays/late-document-feeding.md` — late/stale docs feeding overlay
- `overlays/docr-materialization.md` — DOCR materialization/update overlay for target repos
- `overlays/research-orchestration.md` — parallel research/deepening overlay for Stage A and Stage I
- `docs/RFC-docr-target-repo.md` — RFC for hierarchical context docs in analyzed target repos
- `templates/hard-evidence-reconstruction/` — artifact templates
- `templates/hierarchical-context-docr/` — root/child `AGENTS.md` starter templates for target repos
- `templates/docs-audit-framework/` — docs audit report, scoring rubric, PR sync check templates

## Install

### Via npx (recommended)

Install into any project directory. Default target: `.bubat-r/`.

```bash
# Install from main branch
npx github:mgalela/bubat-r install

# Install + wire into agent config files
npx github:mgalela/bubat-r install --tool claude
npx github:mgalela/bubat-r install --tool claude,opencode,codex,pi

# Install specific release
npx github:mgalela/bubat-r install --tag v1.0.0

# Custom target dir
npx github:mgalela/bubat-r install --dir .bubat-r

# HTTPS instead of SSH
npx github:mgalela/bubat-r install --https
```

**Update:**

```bash
npx github:mgalela/bubat-r update
npx github:mgalela/bubat-r update --tag v1.1.0
npx github:mgalela/bubat-r update --branch develop
```

Update is **artifact-safe** — only framework files are replaced:

| What gets updated | What is preserved |
|---|---|
| `STAGES/*/CONTEXT.md` (stage instructions) | `STAGES/*/01-13.md` (your artifacts) |
| `commands/`, `overlays/`, `docs/` | `STAGES/J/root-AGENTS.md`, `*-AGENTS.md` |
| `skills/`, `templates/` | `.claude/settings.local.json` |
| Root `CONTEXT.md`, `README.md` | Any file unique to your project |

To replace everything including artifacts (destructive):

```bash
npx github:mgalela/bubat-r install --force --dir .bubat-r
```

**Version check:**

```bash
bubat-r version
bubat-r version --dir .bubat-r
```

**Uninstall** (removes dir and cleans config files):

```bash
bubat-r uninstall
```

**Integrate with coding agents** (after install):

```bash
bubat-r integrate --tool claude          # CLAUDE.md → @.bubat-r/CONTEXT.md
bubat-r integrate --tool opencode        # CONTEXT.md
bubat-r integrate --tool codex           # AGENTS.md
bubat-r integrate --tool pi              # SYSTEM.md
bubat-r integrate --tool all
```

Integrations are idempotent — re-run safely. Markers (`<!-- bubat-r:start/end -->`) allow clean update and removal.

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

Config recommended untuk repo JS/large:

```yaml
# .ast-index.yaml
exclude:
  - node_modules
  - .svelte-kit
  - build
  - dist
  - coverage
  - generated
  - vendor
```

Config optional untuk monorepo scoped analysis:

```yaml
# .ast-index.yaml
include:
  - apps
  - packages
exclude:
  - node_modules
  - generated
  - vendor
```

Build index:

```bash
cd /path/to/project
ast-index rebuild   # first baseline from project root
ast-index update    # after branch switch / edits / pull
ast-index stats     # verify index health
```

Use `ast-index update` after edits, pulls, or branch switches.

Stage command map:

| Stage                       | Primary `ast-index` commands                                       |
| --------------------------- | ------------------------------------------------------------------ |
| A Evidence Harvest          | `stats`, `map`, `conventions`, `file`, `search`, `symbol`, `query` |
| B Runtime Map               | `file`, `map`, `module`, `deps`, `dependents`, `imports`           |
| C Behavior Spine            | `search`, `refs`, `usages`, `callers`, `call-tree`, `outline`      |
| D Ownership Map             | `refs`, `usages`, `callers`, `outline`, `query`                    |
| E Domain Reconstruction     | `module`, `deps`, `dependents`, `module-route`, `api`              |
| F Contract Surface Map      | `search`, `refs`, `usages`, `api`, `imports`, `agrep`              |
| G Component Decomposition   | `outline`, `symbol`, `class`, `implementations`, `hierarchy`       |
| H Reference Design Decision | `query`, source citations, selective source reads                  |
| I Critical Gap Deepening    | `refs`, `usages`, `callers`, `call-tree`, `query`, targeted `rg`   |
| J Hierarchical Context Docs | `map`, `module`, `deps`, `dependents`, `api`, targeted `outline`   |
| K Diagram Suite             | `symbol`, `outline`, `refs`, targeted `rg` (verify only)          |
| L Late Docs Feed Overlay    | `file`, `search`, `refs`, `query`, targeted `rg`                   |

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

Related docs-audit templates:

```text
bubat-r/templates/docs-audit-framework/docs-audit-report.md
bubat-r/templates/docs-audit-framework/docs-audit-rubric.yaml
bubat-r/templates/docs-audit-framework/docs-sync-pr-check.yml
```

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
