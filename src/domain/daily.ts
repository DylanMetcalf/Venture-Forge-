// The daily founder loop outside the curriculum: morning check-in and an
// evening review whose questions adapt to what actually happened that day.
import { sessionStatus, isClosed } from "./sessions";
import { DomainError, type AppState, type DayLog, type EveningCheckIn, type LocalDate, type MorningCheckIn } from "./types";
import { isBlank } from "./util";

export function dayLog(state: AppState, date: LocalDate): DayLog {
  return state.days[date] ?? {};
}

export type MorningInput = Omit<MorningCheckIn, "at">;

export function saveMorning(state: AppState, date: LocalDate, input: MorningInput, now: Date): AppState {
  const priorities = input.priorities.map((p) => p.trim()).filter(Boolean).slice(0, 3);
  if (isBlank(input.plan) && priorities.length === 0) {
    throw new DomainError("Say what you're doing today, or name at least one priority.");
  }
  const projectIds = input.projectIds.filter((id) => state.projects.some((p) => p.id === id));
  const morning: MorningCheckIn = {
    at: now.toISOString(),
    plan: input.plan.trim(),
    priorities,
    workingOn: input.workingOn.trim(),
    difficulty: input.difficulty.trim(),
    focus: input.focus.trim(),
    projectIds,
  };
  return { ...state, days: { ...state.days, [date]: { ...dayLog(state, date), morning } } };
}

export type EveningInput = Omit<EveningCheckIn, "at">;

export function saveEvening(state: AppState, date: LocalDate, input: EveningInput, now: Date): AppState {
  const answered = Object.entries(input).some(([k, v]) =>
    k === "prioritiesMoved" ? Array.isArray(v) && v.some(Boolean) : k === "experimentNotes" ? Object.values(v ?? {}).some((n) => !isBlank(n as string)) : !isBlank(v as string),
  );
  if (!answered) throw new DomainError("Answer at least one question honestly.");
  const clean: EveningCheckIn = { at: now.toISOString() };
  for (const [k, v] of Object.entries(input)) {
    if (typeof v === "string") {
      if (!isBlank(v)) (clean as unknown as Record<string, string>)[k] = v.trim();
    } else if (v !== undefined) {
      (clean as unknown as Record<string, unknown>)[k] = v;
    }
  }
  return { ...state, days: { ...state.days, [date]: { ...dayLog(state, date), evening: clean } } };
}

// ---- Adaptive evening questions ----

export type EveningQuestionKey = Exclude<keyof EveningInput, "experimentNotes"> | `experiment:${string}`;

export interface EveningQuestion {
  key: EveningQuestionKey;
  prompt: string;
  /** Why this question is being asked today — shown so the adaptation is visible, not magic. */
  because?: string;
}

/**
 * Picks tonight's questions from what the day actually contained, so the review
 * doesn't become a repetitive form.
 */
export function eveningQuestions(state: AppState, date: LocalDate): EveningQuestion[] {
  const log = dayLog(state, date);
  const qs: EveningQuestion[] = [];
  const priorities = log.morning?.priorities ?? [];
  const sessionsClosedToday = Object.values(state.sessions).filter((r) => r.closedOn === date && isClosed(sessionStatus(r)));
  const evidenceToday = state.evidence.filter((e) => e.date === date);
  const decisionsToday = state.decisions.filter((d) => d.date === date);
  const running = state.experiments.filter((x) => x.status === "running");

  if (priorities.length) {
    qs.push({ key: "prioritiesMoved", prompt: "Which of this morning's priorities actually moved?", because: "You set priorities this morning." });
  }
  qs.push({ key: "accomplished", prompt: priorities.length ? "What else did you get done?" : "What did you actually accomplish today?" });
  qs.push({ key: "avoided", prompt: "What did you avoid — and what was the real reason?" });

  if (sessionsClosedToday.length === 0) {
    qs.push({ key: "learned", prompt: "What did you learn today, from anywhere?", because: "No session was closed today." });
  }
  qs.push({ key: "surprised", prompt: "What surprised you?" });

  if (decisionsToday.length === 0) {
    qs.push({ key: "decision", prompt: "What decision did you make (or put off)?", because: "No decision is logged for today." });
  }
  if (evidenceToday.length === 0) {
    qs.push({ key: "built", prompt: "What did you build or produce that someone else could see?", because: "No evidence has been recorded today." });
  }
  for (const x of running) {
    qs.push({ key: `experiment:${x.id}`, prompt: `Anything new on the experiment “${x.title}”?`, because: "It's still running." });
  }
  if (log.morning?.difficulty) {
    qs.push({ key: "carryForward", prompt: `This morning you said “${log.morning.difficulty}” was difficult. Where does that stand, and what carries forward?` });
  } else {
    qs.push({ key: "carryForward", prompt: "What should carry forward to tomorrow?" });
  }
  qs.push({ key: "changeTomorrow", prompt: "What will you do differently tomorrow?" });
  return qs;
}
