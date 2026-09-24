# Architecture

```
content (data) ──► domain (plain-function rules) ──► store ──► React views
                          ▲                          │
                          └──── storage (Repository) ◄┘
```

- **Content** (`src/content`) is static, typed data. Nothing in it knows about users.
- **Domain** (`src/domain`) holds every rule as a plain function: `(state, args, now) → newState`,
  or a DomainError with a user-facing message. Read-only questions live in `selectors.ts`.
  Everything here is unit-tested and has no browser dependency.
- **Store** (`src/store`) holds the current state, runs actions, persists the result and
  notifies React (`useSyncExternalStore`). A failed save leaves the change in memory and shows a banner.
- **Storage** (`src/storage`) implements `Repository`. Today it's `localStorage` (on-device), or memory if storage
  is blocked. Every load and import goes through `normalizeState`, which validates the data field by field and migrates the
  prototype's v1 shape.

## Key rules

| Rule | Where |
| --- | --- |
| A closed session is **demonstrated** only with ≥ 20 characters of real work under Apply or Build; otherwise it's **consumed**. | `domain/sessions.ts` |
| Closing needs something written and, if a promise was made, the promise graded. | `closeBlockers` |
| Each session has at most one evidence item, kept in step with its work, skills and project. | `syncSessionEvidence` |
| Streak = consecutive **local** calendar days with a closed session. | `selectors.ts#streak` |
| Raising a skill's self-rating needs a justification; all changes are kept as history. | `actions.ts#assessSkill` |

## State shape

`AppState` in `src/domain/types.ts` (`schemaVersion: 2`). Sessions are keyed by curriculum day
and hold the promise, responses (think/act/build), reflection, linked project and close timestamps.
Bump `SCHEMA_VERSION` and add a migration step in `migrate.ts` for any breaking change.

## Integration boundaries (Founder OS / JARVIS / ATLAS)

Not built, but the seams exist:

- **Read access:** `progressSummary`, `skillStats` and `reviewEntries` in `domain/selectors.ts` answer
  "how is Dylan progressing?" from real recorded behaviour. An API would just expose these.
- **Curriculum changes:** because content is data validated by tests, "adapt the upcoming sessions"
  means editing `src/content` and getting a green test run, with no UI changes. Moving content to a database is a
  later step, only once it's edited at runtime.
- **Sync:** a server-backed `Repository` (or a background sync behind the local one) can be added
  without touching the domain or UI.
- **AI:** there is no AI layer. When one is added, it should sit behind its own interface
  (provider-agnostic) and read and write only through domain actions.
