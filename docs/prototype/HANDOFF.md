# Venture Forge — Handoff Brief for Claude Code

A 365-day personal capability & business development web app, built as a single
self-contained HTML file (no build step, no dependencies to install). This
brief is so an AI assistant (or a human dev) picking it up in Claude Code has
full context without re-deriving it from the code.

## What this is

A structured, data-driven daily curriculum system (business, finance, sales,
leadership, systems, ownership) plus supporting tools: a skill tracker,
evidence timeline, project tracker, decision journal, idea vault, searchable
knowledge library, and a "Freedom Index." Full spec intent: capability over
completion — the app tracks what the user can actually *do*, backed by
evidence, not just what they've read.

## File structure right now

- `venture-forge.html` — everything: markup, CSS (custom, CSS variables for
  theming), and two inlined `<script>` blocks:
  1. **Curriculum data** (`PHASES`, `DAYS`, `SKILL_CATEGORIES`, `SKILL_LEVELS`,
     `FORMATS`, `LIBRARY`, plus helper functions like `phaseForDay()`).
  2. **App logic** (state, router, all view renderers).

This was built inside a Claude.ai artifact, so everything had to be one file
with no external local imports (only Google Fonts + Tailwind/jsDelivr/cdnjs
script hosts are reachable from that sandbox). **First thing worth doing in
Claude Code:** split this into real files — `data.js` (or `data.json` +
loader), `app.js`, `index.html`, `styles.css` — now that you're not
constrained to a single file. The code was already written with that seam in
mind (data and logic are cleanly separated inside the two script blocks).

## Data model (source of truth: the `DAYS` array)

```js
{
  day: 1,                 // 1–365
  format: "lesson",        // see FORMATS map — lesson, case_study, scenario,
                            // simulation, financial_exercise, sales_challenge,
                            // roleplay, writing_exercise, technical_challenge,
                            // research, field_mission, decision_exercise,
                            // reflection, teardown, weekly_review, monthly_review
  theme: "The Operator's Contract",
  why: "...",               // why it matters
  learn: "...",             // the actual lesson content (nullable for pure-action days)
  think: "...",             // reflection question (nullable)
  act: "...",               // concrete action (nullable)
  build: "...",             // tangible output / evidence prompt (nullable)
  skills: ["responsibility","self-awareness"], // skill ids, see SKILL_CATEGORIES
  resource: { type:"book", title:"...", author:"...", note:"..." } // nullable, real sources only
}
```

`PHASES` maps day ranges to the 7-phase progression (Foundation → Commercial
Capability → Builder → Operator → Leader → Owner → Integration).
`phaseForDay(day)`, `weekForDay(day)`, `monthForDay(day)` are pure helpers.

## Current content status — be honest about this

- **Days 1–30 are fully authored** (Phase 1, Month 1: personal responsibility,
  attention, discipline, business fundamentals, value, cash flow, markets).
  Format rotates deliberately (lesson/case study/scenario/simulation/field
  mission/etc.) and difficulty increases across the month.
- **Days 31–365 do not exist yet.** The roadmap UI shows them as real,
  visible slots (per the original spec: "the whole year visible from day
  one") but the app explicitly tells the user they're unauthored rather than
  faking content. `LAST_AUTHORED_DAY = 30` in `app.js` is the single switch
  controlling this — bump it up as more days get written.
- **Do not bulk-generate all 335 remaining days in one shot.** The spec this
  was built from is explicit that generating everything at once produces
  shallow, repetitive filler. Write it in phase-sized or month-sized batches,
  with the same interleaving (business/sales/finance/psych/tech/leadership
  mixed within a week, not siloed by quarter) and format rotation the first
  30 days establish. Days 22–30 (financial exercises, case studies) are a
  good reference for the target depth per day.
- `LIBRARY` (knowledge base / "Explain This") currently has 4 seed concepts.
  Grow this alongside the curriculum — every new financial/business term
  introduced in a lesson is a candidate library entry.

## App architecture

- Vanilla JS, no framework. Hash-based router (`#/home`, `#/learn`,
  `#/roadmap`, `#/skills`, `#/evidence`, `#/projects`, `#/decisions`,
  `#/ideas`, `#/library`, `#/freedom`, `#/reviews`, `#/more`).
- One state object (`STATE`), one `localStorage` key (`foundersUniversity.v1`
  — rename this constant if you want a clean break, but that'll reset any
  existing saved progress). `save()`/`load()` wrap all persistence.
- `render()` is the only thing that touches the DOM tree structure; each
  view is a pure-ish function returning a DOM node (`viewHome()`,
  `viewLearn()`, etc.) built via the `el()` template-string helper.
- Morning/Evening daily loop lives in `viewLearn()` + `morningBlock()` /
  `eveningBlock()` / `wireMorningEvening()`. This is the heart of the daily
  ritual: commit a promise in the morning, close out with a real reflection
  in the evening, evidence optionally flows into the Evidence Timeline.

## Known limitations to fix in Claude Code

1. **Persistence is per-browser `localStorage` only.** No account, no sync
   across devices, no backup. This was a deliberate constraint of building
   inside a Claude artifact. Priority #1 for a real deployment: a backend
   (even something lightweight — Supabase, a small Node/Express + SQLite
   API, etc.) with the same data shape, so progress survives a device change
   and isn't one browser-storage-clear away from gone.
2. **No auth.** Fine for a single user (Dylan) running it locally/on one
   device; not fine the moment more than one person or device is involved.
3. **No tests.** Logic is simple enough that it's been fine by hand-review,
   but once this grows past ~30 authored days and more features, add at
   least basic tests around `save()/load()`, day-completion logic, and the
   evidence/skill derivations.
4. **Styling is hand-rolled CSS**, not a framework. Intentional (see the
   frontend-design principles it was built against — avoiding generic
   SaaS-card/Tailwind-default aesthetics), but worth knowing before reaching
   for a component library that would fight the existing token system
   (`--ink`, `--panel`, `--brass`, `--sage`, `--clay`, etc. as CSS variables,
   with light/dark handled via `[data-theme]` + `prefers-color-scheme`).

## Suggested next steps, roughly in order

1. Split the single file into `index.html` / `app.js` / `data.js` / `styles.css`.
2. Stand up real persistence (backend + API) behind the same `STATE` shape.
3. Author Days 31–52 (rest of Phase 1) in the same style, then Phase 2.
4. Grow the Knowledge Library alongside new curriculum.
5. Add auth once there's a reason to (multi-device, more than one user).
