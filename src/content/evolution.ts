// Evolution Log: every structural change to Venture Forge, human- or ATLAS-made.
// Rule for autonomous changes: each must be logged here, tested (CI green),
// reversible (a single revertible commit) and traceable (links to the commit/PR).
export interface EvolutionEvent {
  date: string;
  version: string;
  kind: "release" | "schema" | "curriculum" | "fix";
  author: "human" | "claude-code" | "atlas";
  summary: string;
  changes: string[];
  /** Commit, PR or tag this event can be traced (and reverted) to. */
  ref?: string;
}

export const EVOLUTION_LOG: EvolutionEvent[] = [
  {
    date: "2026-09-24", version: "0.3.0", kind: "release", author: "claude-code",
    summary: "Founder operating system MVP",
    changes: [
      "Schema v3: check-ins, experiments, opportunities, memory, weekly reviews, richer projects (auto-migrates v1/v2).",
      "Adaptive engine with visible reasons; evidence-based skill levels and founder scorecard.",
      "12 capability tracks; AI mentor (Claude, your own key); quick capture with dictation.",
      "Founder OS context-signal interface.",
    ],
  },
  {
    date: "2026-09-24", version: "0.2.0", kind: "release", author: "claude-code",
    summary: "Design base, personal-capability curriculum, installable app",
    changes: ["Five-pillar curriculum rewrite (Days 1–30).", "New design system; PWA with offline support; GitHub Pages deploy."],
  },
  {
    date: "2026-09-24", version: "0.1.0", kind: "release", author: "claude-code",
    summary: "Production rebuild of the prototype",
    changes: ["React + TypeScript; curriculum as data; tested domain rules; local-first storage with backups."],
  },
];
