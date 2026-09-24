// Integration boundary for real-life context.
//
// The adaptive engine never reads Founder OS, calendars or email directly. It
// consumes ContextSignals: short pieces of text describing what's actually
// happening. Today the only providers are local (the morning check-in and your
// active projects). A Founder OS provider will implement the same interface —
// syncing tasks, calendar and project data into signals — without the engine,
// UI or storage changing.
import type { AppState, LocalDate } from "../domain/types";

export interface ContextSignal {
  /** Where the signal came from, e.g. "check-in", "project", "founder-os:calendar". */
  source: string;
  /** Human-readable text the engine matches against (and can show back as the reason). */
  text: string;
  projectId?: string;
}

export interface ContextProvider {
  id: string;
  /** Must be cheap and synchronous: remote providers cache into local state first. */
  signals(state: AppState, today: LocalDate): ContextSignal[];
}

export const checkInProvider: ContextProvider = {
  id: "check-in",
  signals(state, today) {
    const m = state.days[today]?.morning;
    if (!m) return [];
    return [m.plan, ...m.priorities, m.workingOn, m.difficulty, m.focus]
      .filter((t) => t.trim())
      .map((text) => ({ source: "check-in", text }));
  },
};

export const projectProvider: ContextProvider = {
  id: "projects",
  signals(state) {
    return state.projects
      .filter((p) => !["Parked", "Done", "Abandoned"].includes(p.stage))
      .flatMap((p) => [p.objective, p.nextAction, p.problems].filter((t) => t.trim()).map((text) => ({ source: "project", text, projectId: p.id })));
  },
};

/** Registered providers. Founder OS plugs in here. */
export const CONTEXT_PROVIDERS: ContextProvider[] = [checkInProvider, projectProvider];

export function collectSignals(state: AppState, today: LocalDate, providers = CONTEXT_PROVIDERS): ContextSignal[] {
  return providers.flatMap((p) => p.signals(state, today));
}
