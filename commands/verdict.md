# bubat-r verdict

Produce final coverage/readiness split.

## Intent

```text
bubat-r verdict [target-path] [for <area>]
```

## Output

Writes or updates:

```text
reconstruction/13-readiness-verdict.md
```

## Rule

Coverage pass does not imply readiness pass.
If Stage I produced contradictions, summarize them directly in `13-readiness-verdict.md` instead of leaving them only in gap/drift artifacts.

Example:

```text
Coverage Verdict: Pass
Readiness Verdict: Not Ready
Reason: unresolved RLS critical risk + build viability fail
```
