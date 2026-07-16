# Runtime Map

Project: `[PROJECT]`  
Date: `[YYYY-MM-DD]`

## Coverage Summary

- Weighted coverage: `NN%`
- Covered weight-5 items: `X/Y`
- Partial items: `[list]`
- Uncovered high-weight items: `[list]`
- Unknowns requiring validation: `[list]`

## Runtime Units

| Unit    | Type                                 | Responsibility (Observed/Inferred) | Entrypoint  | Deploy Evidence | Status                  | Weight |
| ------- | ------------------------------------ | ---------------------------------- | ----------- | --------------- | ----------------------- | -----: |
| `[api]` | API/service/worker/frontend/db/queue | `[responsibility]`                 | `path:line` | `path`          | Covered/Partial/Unknown |      5 |

## Communication Edges

| From     | To              | Mode       | Protocol/Mechanism  | Evidence    | Read/Write | Notes |
| -------- | --------------- | ---------- | ------------------- | ----------- | ---------- | ----- |
| `[unit]` | `[unit/system]` | sync/async | HTTP/event/DB/queue | `path:line` | read/write |       |

## Deployment / Operation Notes

| Area             | Evidence | Status  | Notes |
| ---------------- | -------- | ------- | ----- |
| Build artifact   | `path`   | Unknown |       |
| Deploy pipeline  | `path`   | Unknown |       |
| Runtime env vars | `path`   | Unknown |       |
| Healthcheck      | `path`   | Unknown |       |

## Ambiguities

| Ambiguity     | Evidence | Impact     | Next Step |
| ------------- | -------- | ---------- | --------- |
| `[ambiguity]` | `EV-...` | `[impact]` | `[next]`  |
