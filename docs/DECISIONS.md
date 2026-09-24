# Decision log

Newest last. Record decisions that are costly to reverse or would otherwise be re-litigated.

### 2026-09-24 — Rebuild the prototype as Vite + React + TypeScript
The prototype (`docs/prototype/`) built HTML strings, attached handlers with `setTimeout` and redrew
everything on every change. That caused real bugs (lost headings, a slider breaking mid-drag, duplicate
evidence) and would get worse as the app grows. React + TS is widely known (including by AI coding
agents that will maintain it), type-checks the curriculum data, and needs no heavy framework.
No router library, no CSS framework and no state library: each would add more than it saves at this size.

### 2026-09-24 — Local-first; no backend yet
A backend needs decisions only the owner can make (hosting, cost, login provider, whether the data
should ever leave the device). Until then, data lives in `localStorage` behind a `Repository` interface,
with JSON export/import as the safety net. Adding sync later should not touch the UI or domain.

### 2026-09-24 — "Demonstrated" vs "Consumed" is derived, not a button
A day's status comes from what was recorded (≥ 20 characters of work under Apply/Build), not from
pressing Complete. The threshold is deliberately low: it filters out "done" without judging quality.

### 2026-09-24 — Curriculum stays in code (typed data), not a database
Content is edited by the author or ATLAS, then validated by tests. Moving it into a database only makes sense
once it needs editing at runtime (e.g. JARVIS-driven adaptation).

### 2026-09-24 — Added objective / minutes / doneWhen to every day
The prototype's day schema lacked the brief's "Objective", "Estimated time" and "Completion criteria".
All 30 days now have them. The original lesson text is unchanged.
