# Roadmap

## Done — Milestone 1: a working daily loop on a solid base
- Typed curriculum data with integrity tests; objective, estimate and definition of done for Days 1–30.
- Session flow with evidence-based status, a single evidence item per session, links to projects.
- Skills tied to practice and evidence; justified self-assessment with history.
- Evidence, Projects, Decisions, Ideas, Library, Reviews, Freedom Index, Settings.
- Validated persistence, v1 prototype migration, JSON backup/restore.
- Responsive shell (rail on desktop, tab bar on mobile); light/dark/system theme.

## Done — Milestone 2: design base, refocus, deploy
- Five-pillar curriculum; Days 1–30 rewritten around personal capability.
- Redesigned UI (Today morning page, editorial session), self-hosted fonts.
- Installable PWA with offline support, deployed to GitHub Pages from `main`.

## Done — Milestone 3: founder operating system MVP
- Check-ins (adaptive evening), projects with milestones, experiments, opportunity vault, memory, weekly review.
- Evidence-based skill levels, scorecard, 12-track curriculum architecture, adaptive recommendations with reasons.
- AI mentor (Claude, own key), quick capture with dictation, Founder OS context-signal seam, evolution log.

## NOW
- Use it daily for a week and note friction: that feedback drives the next pass.

## NEXT
- Author Days 31–52 (rest of Foundation) in the same five-pillar rhythm; grow the library alongside.
- Mentor tools: let the mentor propose (not silently make) records — an experiment, a memory, a focus.
- Pattern detection over time: recurring avoided topics across weeks, not just within one.
- Browser smoke test (Playwright) in CI for the core loop.

## LATER
- File/image evidence (needs server storage).
- Reordering upcoming sessions from recorded behaviour (today the engine recommends; it doesn't reorder).
- Founder OS integration API (read: progress summary; write: curriculum adjustments).

## Parking lot
- Pacing: should the app stop you from doing several days in one sitting? (Field missions assume 24 h.)
- Freedom Index history over time (currently only the latest value).

## Later: moving to Supabase
Implement a Supabase-backed sync behind `Repository` (`src/storage/repository.ts`): keep the local
copy for offline use, push/pull in the background, add Supabase auth (magic link) and row-level security.
