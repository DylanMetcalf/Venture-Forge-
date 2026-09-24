# Venture Forge

A private training ground for becoming a capable founder.
**Learn → Think → Apply → Build → Reflect → Prove → Improve.**

Venture Forge runs a structured 365-day curriculum. Each day has an objective, a
time estimate and a clear definition of done. It records real work as evidence,
separates *consumed* days (read and reflected) from *demonstrated* ones (real
work recorded), and links that work to your actual projects.

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

- **Curriculum:** Days 1–30 are written (Phase 1, Month 1). Days 31–365 are
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
