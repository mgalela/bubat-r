# Readiness Verdict

Project: `[PROJECT]`  
Date: `[YYYY-MM-DD]`  
Scope / Change Area: `[area]`

## Verdict Summary

```text
Coverage Verdict: Pass/Fail
Readiness Verdict: Ready/Yellow/Not Ready
Reason: [blocking risks or accepted gaps]
Next Loop: [gap-id or stop]
```

## Coverage Gates

| Gate | Target | Current | Status |
|---|---:|---:|---|
| Critical coverage | `>= 90%` | `NN%` | Pass/Fail |
| Unknown weight-5 | `0` | `N` | Pass/Fail |
| Unresolved Contradicted | `0` | `N` | Pass/Fail |
| Unresolved Critical Risk | `0` | `N` | Pass/Fail |
| Changed data writers mapped | yes | yes/no | Pass/Fail |
| Changed flow failure paths traced | yes | yes/no | Pass/Fail |
| Build/check/test viability | pass or accepted risk | pass/fail/blocked | Pass/Fail/Accepted Risk |

## Blocking Risks

| Risk | Status | Evidence | Required Action |
|---|---|---|---|
| `[risk]` | Covered with Critical Risk / Contradicted / Unknown | `path or GAP` | `[action]` |

## Accepted Gaps

| Gap | Accepted By | Reason | Expiry / Revisit Trigger |
|---|---|---|---|
| `[gap]` | `[owner]` | `[reason]` | `[trigger]` |

## Safe Change Decision

| Area | Readiness | Allowed Work | Forbidden Work | Required Guardrails |
|---|---|---|---|---|
| `[area]` | Ready/Yellow/Not Ready | `[allowed]` | `[forbidden]` | `[guardrails]` |

## Next Action

- `[next action]`
