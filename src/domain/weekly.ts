// Weekly review: facts gathered from the week's real records, then your judgement
// on top, ending in next week's focus (at most three priorities).
import { getDay } from "../content/curriculum";
import { isClosed, sessionStatus } from "./sessions";
import { DomainError, isRealWorld, type AppState, type Evidence, type LocalDate, type WeeklyReview } from "./types";
import { addDays, isBlank } from "./util";

/** Monday of the week containing `date`. */
export function weekStartOf(date: LocalDate): LocalDate {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  const dow = new Date(y, m - 1, d).getDay(); // 0 = Sunday
  return addDays(date, -((dow + 6) % 7));
}

const inWeek = (date: string | undefined, start: LocalDate) => !!date && date >= start && date <= addDays(start, 6);

export interface WeekFacts {
  weekStart: LocalDate;
  sessionsClosed: { day: number; theme: string; demonstrated: boolean }[];
  evidence: Evidence[];
  realWorldEvidence: number;
  checkIns: { mornings: number; evenings: number };
  promises: { kept: number; graded: number };
  prioritiesMoved: { moved: number; set: number };
  experimentsStarted: string[];
  experimentsConcluded: string[];
  decisions: string[];
  milestonesDone: string[];
  avoided: string[];
  skillsTouched: string[];
  /** Active projects with no evidence, milestones or linked sessions this week. */
  stalledProjects: string[];
}

export function weekFacts(state: AppState, weekStart: LocalDate): WeekFacts {
  const sessions = Object.entries(state.sessions)
    .filter(([, r]) => inWeek(r.closedOn, weekStart) && isClosed(sessionStatus(r)))
    .map(([d, r]) => ({ day: Number(d), theme: getDay(Number(d))?.theme ?? `Day ${d}`, demonstrated: sessionStatus(r) === "demonstrated", rec: r }));
  const evidence = state.evidence.filter((e) => inWeek(e.date, weekStart));
  const days = Object.entries(state.days).filter(([date]) => inWeek(date, weekStart)).map(([, l]) => l);

  let moved = 0;
  let set = 0;
  for (const l of days) {
    const n = l.morning?.priorities.length ?? 0;
    set += n;
    moved += (l.evening?.prioritiesMoved ?? []).slice(0, n).filter(Boolean).length;
  }
  const graded = sessions.filter((s) => s.rec.commitmentKept !== undefined);
  const avoided = [
    ...sessions.map((s) => s.rec.reflection.avoided),
    ...days.map((l) => l.evening?.avoided),
  ].filter((a): a is string => !isBlank(a));

  const milestonesDone = state.projects.flatMap((p) => p.milestones.filter((m) => m.done && inWeek(m.doneAt?.slice(0, 10), weekStart)).map((m) => `${p.name}: ${m.title}`));
  const active = state.projects.filter((p) => !["Parked", "Done", "Abandoned"].includes(p.stage));
  const stalledProjects = active
    .filter((p) =>
      !evidence.some((e) => e.projectId === p.id) &&
      !p.milestones.some((m) => inWeek(m.doneAt?.slice(0, 10), weekStart)) &&
      !sessions.some((s) => s.rec.projectId === p.id),
    )
    .map((p) => p.name);

  return {
    weekStart,
    sessionsClosed: sessions.map(({ day, theme, demonstrated }) => ({ day, theme, demonstrated })),
    evidence,
    realWorldEvidence: evidence.filter(isRealWorld).length,
    checkIns: { mornings: days.filter((l) => l.morning).length, evenings: days.filter((l) => l.evening).length },
    promises: { kept: graded.filter((s) => s.rec.commitmentKept).length, graded: graded.length },
    prioritiesMoved: { moved, set },
    experimentsStarted: state.experiments.filter((x) => inWeek(x.startedAt?.slice(0, 10), weekStart)).map((x) => x.title),
    experimentsConcluded: state.experiments.filter((x) => inWeek(x.concludedAt?.slice(0, 10), weekStart)).map((x) => x.title),
    decisions: state.decisions.filter((d) => inWeek(d.date, weekStart)).map((d) => d.decision),
    milestonesDone,
    avoided,
    skillsTouched: [...new Set(evidence.flatMap((e) => e.skills))],
    stalledProjects,
  };
}

export type WeeklyInput = Omit<WeeklyReview, "createdAt" | "weekStart">;

export function saveWeeklyReview(state: AppState, weekStart: LocalDate, input: WeeklyInput, now: Date): AppState {
  const focus = input.focus.map((f) => f.trim()).filter(Boolean).slice(0, 3);
  if (focus.length === 0) throw new DomainError("Set at least one focus for next week.");
  const review: WeeklyReview = {
    weekStart,
    createdAt: now.toISOString(),
    moved: input.moved.trim(),
    stalled: input.stalled.trim(),
    mistakes: input.mistakes.trim(),
    opportunities: input.opportunities.trim(),
    change: input.change.trim(),
    focus,
  };
  return { ...state, weeklyReviews: [...state.weeklyReviews.filter((r) => r.weekStart !== weekStart), review] };
}

/** The focus set in the most recent review of an earlier week — this week's priorities. */
export function currentFocus(state: AppState, today: LocalDate): WeeklyReview | undefined {
  const thisWeek = weekStartOf(today);
  return [...state.weeklyReviews].filter((r) => r.weekStart < thisWeek).sort((a, b) => b.weekStart.localeCompare(a.weekStart))[0];
}
