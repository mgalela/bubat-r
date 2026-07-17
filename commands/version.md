# bubat-r version

Show installed version, source, and update status.

## This is a shell command

Run directly in terminal — do NOT simulate or interpret this as a workflow step.

```bash
npx github:mgalela/bubat-r version --dir .bubat-r
```

## Output

```
bubat-r @ .bubat-r
  version:       v0.1.0
  ref:           package/0.1.0
  source:        npx
  installed:     7/17/2026, 10:55:13 AM
  updated:       7/17/2026, 10:55:13 AM
  integrations:  claude, opencode
```

For git-installed:

```
bubat-r @ .bubat-r
  ref:           branch/main
  commit:        a6b4566
  source:        git
  ...
  Up to date.
```

## Related installer commands

```bash
npx github:mgalela/bubat-r update --dir .bubat-r      # update framework files
npx github:mgalela/bubat-r install --force --dir .bubat-r  # full reinstall
npx github:mgalela/bubat-r integrate --tool claude --dir .bubat-r
```
