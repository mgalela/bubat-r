# Code Trace Map

Project: `[PROJECT]`  
Date: `[YYYY-MM-DD]`

## Trace Table

| Architecture Item | Type                         | Runtime Unit | Component/Context | File   | Symbol   | Lines   | Confidence | Notes |
| ----------------- | ---------------------------- | ------------ | ----------------- | ------ | -------- | ------- | ---------- | ----- |
| `[item]`          | flow/data/component/contract | `[unit]`     | `[component]`     | `path` | `symbol` | `Lx-Ly` | Observed   |       |

## Flow Trace

| Flow     | Step | File   | Symbol   | Lines   | Evidence ID |
| -------- | ---: | ------ | -------- | ------- | ----------- |
| `[flow]` |    1 | `path` | `symbol` | `Lx-Ly` | `EV-...`    |

## Data Trace

| Data Object | Operation                 | File   | Symbol   | Lines   | Evidence ID |
| ----------- | ------------------------- | ------ | -------- | ------- | ----------- |
| `[entity]`  | create/update/read/delete | `path` | `symbol` | `Lx-Ly` | `EV-...`    |

## Contract Trace

| Contract     | File   | Symbol/Definition | Lines   | Evidence ID |
| ------------ | ------ | ----------------- | ------- | ----------- |
| `[contract]` | `path` | `[symbol]`        | `Lx-Ly` | `EV-...`    |

## Stale / Weak Trace

| Item     | Issue                | Impact     | Next Step |
| -------- | -------------------- | ---------- | --------- |
| `[item]` | no symbol/line exact | `[impact]` | `[next]`  |
