# Venture Forge

A private training ground for becoming a capable founder.
**Learn → Think → Apply → Build → Reflect → Prove → Improve.**

Venture Forge runs a 365-day programme that trains five capabilities, interleaved
through every week:

| Pillar | Trains |
| --- | --- |
| **Mind** | Self-command: attention, composure, discipline |
| **Business** | How money, value and companies actually work |
| **Build** | AI and software: making real things that run |
| **Influence** | Reading people and rooms; moving them honestly |
| **Judgement** | Thinking clearly and deciding well |

Weekly rhythm: Mind · Business · Build · Influence · Judgement · field mission · review.
Each day has an objective, a time estimate and a definition of done. A day counts
as *demonstrated* only when real work is recorded; otherwise it's *consumed*.

## What's in it

| Area | What it does |
| --- | --- |
| **Dashboard** | What matters today: your priorities, today's session, a short *Focus* list chosen by the adaptive engine (each item says why), what you're building, momentum, recent evidence. |
| **Check-in** | Morning: plan, up to three priorities, what's hard, what to improve. Evening: questions that adapt to what actually happened. |
| **Session** | Objective → Learn → Think → Apply → Build/Evidence → Reflect → Improve, with a morning promise. |
| **Mentor** | A demanding, honest founder coach (Claude) that sees your check-in, projects, experiments, evidence, scorecard and memory. Uses your own API key. |
| **Projects / Experiments / Opportunity Vault / Decisions** | Real work, hypothesis-driven tests (a concluded experiment becomes evidence), ideas captured without chasing them, and decisions reviewed against outcomes. |
| **Skills & Scorecard** | 94 skills across 12 tracks. Levels (Developing → Highly capable) are derived from evidence, real-world evidence weighted; the scorecard shows facts, not one number. |
| **Reviews** | Weekly review built from the week's real records, ending in next week's focus. |
| **Memory** | Structured, searchable goals, context, preferences, lessons, patterns and commitments. |
| **Capture** | One tap from anywhere (text or dictation) into today's plan, the vault, evidence or memory. |

**Live app:** https://dylanmetcalf.github.io/Venture-Forge-/ (after the one-time setup below).

## Use it on your phone

1. Open the live app link in **Safari** (iPhone) or **Chrome** (Android).
2. iPhone: Share → **Add to Home Screen**. Android: ⋮ → **Add to Home screen / Install app**.
3. Open it from the home-screen icon from then on. It runs full-screen and works offline.

Data is stored on the device, inside that home-screen app. Export a backup from
**Settings** weekly until sync exists.

## Hosting (GitHub Pages, free)

Every push to `main` runs `.github/workflows/deploy.yml`, which tests, builds and
publishes the site. One-time setup in the GitHub repository:

1. **Settings → General → Default branch** → switch to `main`.
2. **Settings → Pages → Build and deployment → Source** → **GitHub Actions**.
3. **Actions → Deploy to GitHub Pages → Run workflow** (or push to `main`).

## Run it

Requires Node 20+.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (Vitest)
npm run typecheck
npm run build      # static site in dist/
npm run preview    # serve the production build
```

The build is a static site with relative asset paths, so any static host works
(GitHub Pages, Netlify, Cloudflare Pages, or opening it from a local server).

## Where things live

| Path | What |
| --- | --- |
| `src/content/` | Curriculum as typed data: phases, skills, formats, days, knowledge library. **Add content here, never in components.** |
| `src/domain/` | Plain functions holding the business rules (sessions, evidence, skills, streaks, migration). No UI, no storage. |
| `src/storage/` | The persistence boundary (`Repository`), plus backup export/import. |
| `src/store/` | A small store that applies domain actions and persists them. |
| `src/app/`, `src/views/`, `src/components/` | React UI. |
| `docs/` | Architecture, decisions, roadmap, and the original prototype for reference. |

## Status

- **Curriculum:** Days 1–30 are written (Foundation, Month 1). Days 31–365 are
  visible on the roadmap but deliberately not filled with placeholder content.
- **Data:** stored in this browser only (`localStorage`). There's no account or
  sync yet, so **use Settings → Export backup regularly.**
- See [`docs/ROADMAP.md`](docs/ROADMAP.md) for what's next and
  [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how it fits together.

## Adding curriculum

1. Add a file under `src/content/days/` exporting `CurriculumDay[]`.
2. Append it to `DAYS` in `src/content/curriculum.ts`.
3. Run `npm test`. The integrity tests check that days are contiguous, formats
   and skills are valid, and every day has an objective, estimate and definition of done.
