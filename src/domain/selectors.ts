// Read-only derivations from state. These are the questions the app (and,
// later, Founder OS integrations like JARVIS) can ask about progress.
import { ALL_SKILLS, LAST_AUTHORED_DAY, getDay, isReviewFormat } from "../content/curriculum";
import type { PillarId, SkillId } from "../content/types";
import { isClosed, sessionStatus } from "./sessions";
import { FREEDOM_KEYS, type AppState, type LocalDate, type SessionRecord } from "./types";
import { addDays } from "./util";

function sessionEntries(state: AppState): [number, SessionRecord][] {
  return Object.entries(state.sessions).map(([d, rec]) => [Number(d), rec]);
}

/**
 * Consecutive calendar days, ending today (or yesterday, if today isn't done
 * yet), on which at least one session was closed.
 */
export function streak(state: AppState, today: LocalDate): number {
  const dates = new Set(sessionEntries(state).map(([, r]) => r.closedOn).filter(Boolean));
  let cursor = dates.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (dates.has(cursor)) {
    n++;
    cursor = addDays(cursor, -1);
  }
  return n;
}

export interface ProgressSummary {
  currentDay: number;
  lastAuthoredDay: number;
  closed: number;
  demonstrated: number;
  consumed: number;
  evidenceCount: number;
  streak: number;
  commitmentsGraded: number;
  commitmentsKept: number;
  skillsWithEvidence: number;
  freedomComposite: number;
}

export function progressSummary(state: AppState, today: LocalDate): ProgressSummary {
  let demonstrated = 0;
  let consumed = 0;
  let graded = 0;
  let kept = 0;
  for (const [, rec] of sessionEntries(state)) {
    const s = sessionStatus(rec);
    if (s === "demonstrated") demonstrated++;
    if (s === "consumed") consumed++;
    if (rec.commitmentKept !== undefined) {
      graded++;
      if (rec.commitmentKept) kept++;
    }
  }
  return {
    currentDay: state.currentDay,
    lastAuthoredDay: LAST_AUTHORED_DAY,
    closed: demonstrated + consumed,
    demonstrated,
    consumed,
    evidenceCount: state.evidence.length,
    streak: streak(state, today),
    commitmentsGraded: graded,
    commitmentsKept: kept,
    skillsWithEvidence: new Set(state.evidence.flatMap((e) => e.skills)).size,
    freedomComposite: freedomComposite(state),
  };
}

export function freedomComposite(state: AppState): number {
  return Math.round(FREEDOM_KEYS.reduce((sum, k) => sum + state.freedom[k], 0) / FREEDOM_KEYS.length);
}

export interface SkillStats {
  id: SkillId;
  level: number;
  /** Closed sessions that exercised this skill. */
  practised: number;
  /** Evidence items tagged with this skill. */
  evidence: number;
}

export function skillStats(state: AppState): Map<SkillId, SkillStats> {
  const stats = new Map<SkillId, SkillStats>(
    ALL_SKILLS.map((id) => [id, { id, level: state.skills[id]?.level ?? 0, practised: 0, evidence: 0 }]),
  );
  for (const [day, rec] of sessionEntries(state)) {
    if (!isClosed(sessionStatus(rec))) continue;
    for (const s of getDay(day)?.skills ?? []) {
      const st = stats.get(s);
      if (st) st.practised++;
    }
  }
  for (const e of state.evidence) {
    for (const s of e.skills) {
      const st = stats.get(s);
      if (st) st.evidence++;
    }
  }
  return stats;
}

export interface ReviewEntry {
  day: number;
  kind: "weekly" | "monthly";
  theme: string;
  closedOn?: LocalDate;
  body: string;
  learned: string;
  avoided: string;
}

/** Closed weekly/monthly review sessions, newest first. */
export function reviewEntries(state: AppState): ReviewEntry[] {
  return sessionEntries(state)
    .filter(([day, rec]) => {
      const c = getDay(day);
      return c && isReviewFormat(c.format) && isClosed(sessionStatus(rec));
    })
    .sort((a, b) => b[0] - a[0])
    .map(([day, rec]) => {
      const c = getDay(day)!;
      return {
        day,
        kind: c.format === "monthly_review" ? "monthly" : "weekly",
        theme: c.theme,
        closedOn: rec.closedOn,
        body: [rec.responses.think, rec.responses.act].filter(Boolean).join("\n\n"),
        learned: rec.reflection.learned ?? "",
        avoided: rec.reflection.avoided ?? "",
      };
    });
}

export interface PillarStat {
  pillar: PillarId;
  closed: number;
  demonstrated: number;
}

/** Closed and demonstrated sessions per pillar — how balanced the training is. */
export function pillarStats(state: AppState): Record<PillarId, PillarStat> {
  const out = {} as Record<PillarId, PillarStat>;
  for (const p of ["mind", "business", "build", "influence", "judgement", "field"] as PillarId[]) out[p] = { pillar: p, closed: 0, demonstrated: 0 };
  for (const [day, rec] of sessionEntries(state)) {
    const c = getDay(day);
    if (!c) continue;
    const status = sessionStatus(rec);
    if (isClosed(status)) out[c.pillar].closed++;
    if (status === "demonstrated") out[c.pillar].demonstrated++;
  }
  return out;
}
