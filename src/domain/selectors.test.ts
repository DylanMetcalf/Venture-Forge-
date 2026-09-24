import { describe, expect, it } from "vitest";
import { assessSkill } from "./actions";
import { progressSummary, reviewEntries, skillStats, streak } from "./selectors";
import { closeSession, commit, gradeCommitment, updateSession } from "./sessions";
import { DomainError, defaultState, type AppState } from "./types";

const at = (d: number, h = 20) => new Date(2026, 8, d, h, 0);
const WORK = "Logged every block of the day as founder, operator or recoverable time.";

function closeDay(s: AppState, day: number, when: Date, work = true): AppState {
  s = updateSession(s, day, work ? { responses: { act: WORK } } : { reflection: { learned: "noted" } }, when);
  return closeSession(s, day, when);
}

describe("streak", () => {
  it("counts consecutive calendar days with a closed session", () => {
    let s = defaultState();
    s = closeDay(s, 1, at(21));
    s = closeDay(s, 2, at(22));
    s = closeDay(s, 3, at(23));
    expect(streak(s, "2026-09-23")).toBe(3);
  });

  it("stays alive after advancing to a new day that isn't done yet (prototype bug)", () => {
    let s = defaultState();
    s = closeDay(s, 1, at(22));
    s = closeDay(s, 2, at(23));
    s = { ...s, currentDay: 3 };
    expect(streak(s, "2026-09-24")).toBe(2);
  });

  it("breaks after a missed calendar day", () => {
    let s = closeDay(defaultState(), 1, at(20));
    s = closeDay(s, 2, at(22));
    expect(streak(s, "2026-09-22")).toBe(1);
    expect(streak(s, "2026-09-24")).toBe(0);
  });

  it("counts several sessions on one date once", () => {
    let s = closeDay(defaultState(), 1, at(23, 9));
    s = closeDay(s, 2, at(23, 21));
    expect(streak(s, "2026-09-23")).toBe(1);
  });
});

describe("progress summary", () => {
  it("separates demonstrated from consumed and tracks promises", () => {
    let s = commit(defaultState(), 1, "Ship it", at(24, 8));
    s = gradeCommitment(s, 1, true);
    s = closeDay(s, 1, at(24));
    s = closeDay(s, 2, at(24), false);
    const p = progressSummary(s, "2026-09-24");
    expect(p).toMatchObject({ closed: 2, demonstrated: 1, consumed: 1, evidenceCount: 1, commitmentsGraded: 1, commitmentsKept: 1, streak: 1 });
    expect(p.skillsWithEvidence).toBe(2);
  });
});

describe("skills", () => {
  it("derives practice and evidence counts from real sessions", () => {
    const s = closeDay(defaultState(), 2, at(24));
    const st = skillStats(s);
    expect(st.get("focus")).toMatchObject({ practised: 1, evidence: 1, level: 0 });
    expect(st.get("pricing")).toMatchObject({ practised: 0, evidence: 0 });
  });

  it("requires a justification to raise a level, and keeps history", () => {
    const s0 = defaultState();
    expect(() => assessSkill(s0, "focus", 2, "  ", at(24))).toThrow(DomainError);
    const s1 = assessSkill(s0, "focus", 2, "Held three 90-minute focus blocks this week", at(24));
    const s2 = assessSkill(s1, "focus", 1, "", at(25));
    expect(s2.skills.focus).toMatchObject({ level: 1 });
    expect(s2.skills.focus!.history).toHaveLength(2);
  });
});

describe("reviews", () => {
  it("lists closed review days, newest first", () => {
    let s = closeDay(defaultState(), 7, at(20));
    s = closeDay(s, 14, at(21));
    s = closeDay(s, 8, at(22));
    expect(reviewEntries(s).map((r) => r.day)).toEqual([14, 7]);
  });
});
