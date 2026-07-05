# Hierarchical Context DOCR Templates

Templates for Stage J context-doc materialization into analyzed target repos.

Use when BUBAT-R needs durable local context near code, not only centralized `reconstruction/` artifacts.

Recommended output shape:

```text
<target-repo>/
  AGENTS.md
  apps/AGENTS.md
  packages/AGENTS.md
  services/<area>/AGENTS.md
```

Template files:

- `root-AGENTS.md` — root repo context doc starter
- `child-AGENTS.md` — subtree context doc starter

Rules:
1. Fill only from verified or explicitly marked inferred evidence.
2. Keep `Unknown` and `Contradicted` visible when material.
3. Create child docs only for durable boundaries.
4. Keep docs concise and index-driven.
