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

Example:

```text
Coverage Verdict: Pass
Readiness Verdict: Not Ready
Reason: unresolved RLS critical risk + build viability fail
```
