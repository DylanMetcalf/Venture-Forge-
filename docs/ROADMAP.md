# Roadmap

## Done — Milestone 1: a working daily loop on a solid base
- Typed curriculum data with integrity tests; objective, estimate and definition of done for Days 1–30.
- Session flow with evidence-based status, a single evidence item per session, links to projects.
- Skills tied to practice and evidence; justified self-assessment with history.
- Evidence, Projects, Decisions, Ideas, Library, Reviews, Freedom Index, Settings.
- Validated persistence, v1 prototype migration, JSON backup/restore.
- Responsive shell (rail on desktop, tab bar on mobile); light/dark/system theme.

## NOW — needs an owner decision
1. **Hosting + sync + login.** Pick where it runs and whether data syncs across devices
   (options and trade-offs below). Until then, back up from Settings.
2. **Curriculum context.** Days 1–30 assume three ventures (content, marketing services,
   a butchery) and South African Rand. Confirm how these map onto SiteGuard, Terram, Mea Creo and
   Creator Hub before Days 31–52 are written, so new content references the right ventures.

## NEXT
- Author Days 31–52 (rest of Phase 1) in the same style; grow the library alongside.
- Experiments: hypothesis → action → evidence → result → learning → next decision
  (own entity, linked to projects and evidence).
- Weekly review generated from the week's real data (sessions closed, promises kept, evidence, avoided items)
  rather than only free text.
- Browser smoke test (Playwright) in CI for the core loop.

## LATER
- File/image evidence (needs server storage).
- Adapting the curriculum based on recorded behaviour (skips, speed, avoided topics).
- Founder OS integration API (read: progress summary; write: curriculum adjustments).
- PWA / offline install on phone.

## Parking lot
- Pacing: should the app stop you from doing several days in one sitting? (Field missions assume 24 h.)
- Freedom Index history over time (currently only the latest value).
- Day 11 is labelled "Technical Challenge" but is a first-principles thinking exercise.
- Some prototype copy still says "this university" (from its earlier name, Founder's University).

## Hosting options (for the NOW decision)
| Option | Effort | Cost | Notes |
| --- | --- | --- | --- |
| Static host (GitHub Pages/Netlify), local-only | Minimal | Free | Today's app as is; data per device; manual backups. |
| Supabase (Postgres + auth) | Moderate | Free tier | Sync across devices, real login, row-level security. Adds an external dependency. |
| Small Node + SQLite server | Moderate | ~$5/mo VPS | Full control; you run it; natural home for a Founder OS API later. |
