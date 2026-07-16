# Docs Audit Report

## 1. Executive Summary

- Repo: `<name>`
- Audit date: `<YYYY-MM-DD>`
- Auditor: `bubat-r`
- Scope: `<repo-wide | selected areas>`
- Recommendation: `<repair | rebuild | hybrid>`

### Snapshot

- Docs found: `<n>`
- Valid: `<n>`
- Suspect: `<n>`
- Stale: `<n>`
- Orphan: `<n>`
- Missing critical docs: `<n>`

### Top Risks

1. `<risk>` — `<impact>`
2. `<risk>` — `<impact>`
3. `<risk>` — `<impact>`

---

## 2. Audit Scope

### Included inputs

- Docs: `<paths>`
- Code: `<paths>`
- Config: `<paths>`
- Tests: `<paths>`
- CI/CD: `<paths>`
- Infra: `<paths>`

### Excluded / blocked

- `<item>` — `<reason>`

---

## 3. Evidence Posture

### Source-of-truth order

1. Runtime behavior / observed operation
2. Write-path code
3. Schema / migrations / contracts
4. Representative tests
5. Deploy / infra / ops config
6. Read-path code
7. Existing docs, naming, comments

### Confidence legend

- `Observed`
- `Inferred`
- `Unknown`
- `Contradicted`
- `Assumed`

---

## 4. Doc Inventory

| Doc Path      | Type     | Scope     | Owner   | Last Signal | Status  | Notes     |
| ------------- | -------- | --------- | ------- | ----------- | ------- | --------- |
| `README.md`   | overview | repo-wide | unknown | `<signal>`  | suspect | `<notes>` |
| `docs/api.md` | API      | backend   | unknown | `<signal>`  | stale   | `<notes>` |

Status values:

- `valid`
- `suspect`
- `stale`
- `orphan`
- `missing`

---

## 5. Code-to-Docs Coverage Map

| Module / Area | Code Source          | Existing Docs  | Coverage | Confidence | Notes     |
| ------------- | -------------------- | -------------- | -------- | ---------- | --------- |
| Auth          | `src/auth/**`        | `docs/auth.md` | partial  | medium     | `<notes>` |
| Orders API    | `src/routes/orders*` | `docs/api.md`  | low      | low        | `<notes>` |
| Queue worker  | `src/workers/**`     | none           | none     | high       | `<notes>` |

Coverage values:

- `full`
- `partial`
- `low`
- `none`

Confidence values:

- `high`
- `medium`
- `low`

---

## 6. Scoring Per Doc

| Doc           | Accuracy | Coverage | Freshness | Verifiability | Usability | Total | Verdict |
| ------------- | -------: | -------: | --------: | ------------: | --------: | ----: | ------- |
| `README.md`   |        3 |        3 |         2 |             4 |         4 |   3.2 | risky   |
| `docs/api.md` |        2 |        3 |         1 |             4 |         3 |   2.6 | risky   |

Verdict bands:

- `4.5–5.0` — excellent
- `3.5–4.4` — usable
- `2.5–3.4` — risky
- `<2.5` — rebuild candidate

---

## 7. Mismatch / Gap Report

| ID    | Severity | Area  | Doc           | Evidence in Code         | Problem                | Fix                  |
| ----- | -------- | ----- | ------------- | ------------------------ | ---------------------- | -------------------- |
| D-001 | high     | setup | `README.md`   | `packageManager: pnpm`   | docs say `npm install` | update setup section |
| D-002 | high     | API   | `docs/api.md` | route path `/api/orders` | docs say `/v1/orders`  | repair endpoint docs |
| D-003 | medium   | ops   | none          | cron worker found        | scheduler docs missing | add ops doc          |

Severity:

- `high` — onboarding fail, wrong integration, incident risk
- `medium` — architecture or ops misunderstanding
- `low` — clarity / maintainability issue

Problem class:

- `incorrect`
- `outdated`
- `incomplete`
- `missing`
- `unverifiable`
- `duplicated/conflicting`

---

## 8. Domain-by-Domain Findings

### 8.1 Project overview

- Status: `<valid | suspect | stale | missing>`
- Findings:
  - `<finding>`
- Evidence:
  - `<path>`
- Action:
  - `<repair | rebuild | none>`

### 8.2 Setup / local development

- Status: `<...>`
- Findings:
  - `<finding>`
- Evidence:
  - `<path>`
- Action:
  - `<repair | rebuild | none>`

### 8.3 Architecture

- Status: `<...>`
- Findings:
  - `<finding>`
- Evidence:
  - `<path>`
- Action:
  - `<repair | rebuild | none>`

### 8.4 API / interface

- Status: `<...>`
- Findings:
  - `<finding>`
- Evidence:
  - `<path>`
- Action:
  - `<repair | rebuild | none>`

### 8.5 Data layer

- Status: `<...>`
- Findings:
  - `<finding>`
- Evidence:
  - `<path>`
- Action:
  - `<repair | rebuild | none>`

### 8.6 Deployment / operations

- Status: `<...>`
- Findings:
  - `<finding>`
- Evidence:
  - `<path>`
- Action:
  - `<repair | rebuild | none>`

### 8.7 Feature / module docs

- Status: `<...>`
- Findings:
  - `<finding>`
- Evidence:
  - `<path>`
- Action:
  - `<repair | rebuild | none>`

---

## 9. Code-Derived vs Human Docs Split

### Code-derived candidates

- API reference
- route map
- env var reference
- setup/build/test commands
- schema summary
- runtime/deploy inventory
- module map

### Human-input required

- business rationale
- ADR tradeoffs
- manual runbooks outside repo
- product intent
- exception processes

### Unverifiable claims

| Claim     | Current doc    | Why unverifiable        | Needed human input |
| --------- | -------------- | ----------------------- | ------------------ |
| `<claim>` | `docs/arch.md` | not represented in repo | `<owner/team>`     |

---

## 10. Recommendation

### Decision

- Overall: `<repair | rebuild | hybrid>`
- Reason:
  - `<reason 1>`
  - `<reason 2>`

### Repair now

- `<doc>` — `<change>`
- `<doc>` — `<change>`

### Rebuild

- `<doc or area>` — `<why>`

### Archive / deprecate

- `<doc>` — `<why>`

---

## 11. Target Docs Structure

```text
README.md
docs/
  architecture.md
  setup.md
  api.md
  deployment.md
  runbook.md
  modules/
    <area>.md
  decisions/
    ADR-xxx-<title>.md
```

Notes:

- `<structure rationale>`

---

## 12. Patch Plan 30 / 60 / 90

### 0–30

- fix high-severity setup/API/env mismatches
- remove or mark deprecated stale docs
- assign doc owners

### 31–60

- rebuild missing module/API/ops docs
- generate code-derived references
- link docs to source paths

### 61–90

- add PR/CI docs sync checks
- automate doc-impact detection
- schedule recurring audit

---

## 13. Governance Hooks

### PR triggers

Require docs review when changed files touch:

- routes / controllers
- schema / migrations
- env/config
- workers / schedulers
- auth / tenant / security flows
- deploy / infra / CI files

### PR checklist

- docs impact checked
- setup impact checked
- API impact checked
- env impact checked
- ops impact checked
- release-note impact checked

### CI checks

- changed-file to docs-area mapping
- fail if required docs untouched
- allow label/override for `docs-exempt` with reason

---

## 14. Appendix: Evidence Anchors

- `<path>` — `<fact>`
- `<path>#<symbol>` — `<fact>`
- `<config>` — `<fact>`
- `<test>` — `<fact>`
