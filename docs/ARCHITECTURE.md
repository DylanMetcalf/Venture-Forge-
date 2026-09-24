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
| Skill levels come from evidence (`capability.ts#levelFor`); self-rated confidence is separate, and raising it needs a justification. | `capability.ts`, `actions.ts#rateConfidence` |

## State shape

`AppState` in `src/domain/types.ts` (`schemaVersion: 3`). Sessions are keyed by curriculum day
and hold the promise, responses (think/act/build), reflection, linked project and close timestamps.
Bump `SCHEMA_VERSION` and add a migration step in `migrate.ts` for any breaking change.

## Layers added in v3

- `src/content/tracks.ts` — 12 capability tracks (curriculum architecture): skills, modules, relevance keywords.
- `src/domain/daily.ts` — morning/evening check-ins; `eveningQuestions` picks questions from what happened that day.
- `src/domain/projects.ts` — projects, milestones, experiments (concluding requires a result and a decision, and upserts one evidence item).
- `src/domain/capability.ts` — evidence-based skill levels (rule documented in `levelFor`), fading detection, founder scorecard.
- `src/domain/adaptive.ts` — prioritised recommendations, each with a visible reason.
- `src/domain/weekly.ts` — weekly facts from real records; next week's focus.
- `src/integrations/signals.ts` — `ContextProvider` interface; today: check-in and projects.
- `src/ai/` — provider-agnostic mentor interface, Claude implementation (official SDK, loaded lazily, called from the browser with the user's own key), and a pure context builder.
- `src/storage/secrets.ts` — the API key lives under its own storage key: never in `AppState`, never in backups.
- `src/content/evolution.ts` — the Evolution Log shown in Settings.

## Integration boundaries (Founder OS / JARVIS / ATLAS)

Not built, but the seams exist:

- **Read access:** `progressSummary`, `skillStats` and `reviewEntries` in `domain/selectors.ts` answer
  "how is Dylan progressing?" from real recorded behaviour. An API would just expose these.
- **Curriculum changes:** because content is data validated by tests, "adapt the upcoming sessions"
  means editing `src/content` and getting a green test run, with no UI changes. Moving content to a database is a
  later step, only once it's edited at runtime.
- **Sync:** a server-backed `Repository` (or a background sync behind the local one) can be added
  without touching the domain or UI.
- **Real-life context:** Founder OS plugs in as another `ContextProvider` in `src/integrations/signals.ts`
  (sync calendar/tasks/projects into local state, emit signals). The adaptive engine, UI and storage don't change.
- **AI:** `MentorProvider` in `src/ai/types.ts`. A Founder OS proxy (so the key lives server-side) is a drop-in provider.
- **Voice:** Capture already accepts dictation (Web Speech API where available) and routes "what I'm doing today"
  into the morning check-in. A future voice pipeline produces the same text and calls the same domain actions.
- **ATLAS / autonomous evolution:** every change must be a single revertible commit, pass CI (typecheck, tests, build),
  and add an entry to `src/content/evolution.ts` referencing the commit.
