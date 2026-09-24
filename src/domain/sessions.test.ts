import { describe, expect, it } from "vitest";
import { closeBlockers, closeSession, commit, goToDay, gradeCommitment, reopenSession, sessionFor, sessionStatus, updateSession } from "./sessions";
import { DomainError, defaultState } from "./types";

const NOW = new Date(2026, 8, 24, 20, 0);
const WORK = "Rewrote the butchery supplier problem as: what's my move on stock timing?";

describe("session status", () => {
  it("is not_started for an untouched day", () => {
    expect(sessionStatus(undefined)).toBe("not_started");
  });

  it("is in_progress once something is written", () => {
    const s = updateSession(defaultState(), 1, { responses: { think: "circumstances" } }, NOW);
    expect(sessionStatus(s.sessions[1])).toBe("in_progress");
  });

  it("is consumed when closed with only a reflection", () => {
    let s = updateSession(defaultState(), 1, { reflection: { learned: "Attention is upstream." } }, NOW);
    s = closeSession(s, 1, NOW);
    expect(sessionStatus(s.sessions[1])).toBe("consumed");
    expect(s.evidence).toHaveLength(0);
  });

  it("is demonstrated when closed with real work, which becomes evidence tagged with the day's skills", () => {
    let s = updateSession(defaultState(), 1, { responses: { act: WORK } }, NOW);
    s = closeSession(s, 1, NOW);
    expect(sessionStatus(s.sessions[1])).toBe("demonstrated");
    expect(s.evidence).toHaveLength(1);
    expect(s.evidence[0]).toMatchObject({ title: "Day 1 — The Operator's Contract", note: WORK, skills: ["responsibility", "self-awareness"], source: { kind: "session", day: 1 } });
  });

  it("does not count token answers as demonstrated work", () => {
    let s = updateSession(defaultState(), 1, { responses: { act: "done" } }, NOW);
    s = closeSession(s, 1, NOW);
    expect(sessionStatus(s.sessions[1])).toBe("consumed");
  });
});

describe("closing a session", () => {
  it("refuses to close an empty session", () => {
    expect(() => closeSession(defaultState(), 1, NOW)).toThrow(DomainError);
  });

  it("requires the morning promise to be graded", () => {
    let s = commit(defaultState(), 1, "Call the supplier", NOW);
    s = updateSession(s, 1, { responses: { act: WORK } }, NOW);
    expect(closeBlockers(sessionFor(s, 1))).toHaveLength(1);
    expect(() => closeSession(s, 1, NOW)).toThrow(/kept or not kept/);
    s = gradeCommitment(s, 1, false);
    expect(() => closeSession(s, 1, NOW)).not.toThrow();
  });

  it("re-closing updates the one evidence item instead of duplicating it (prototype bug)", () => {
    let s = updateSession(defaultState(), 1, { responses: { act: WORK } }, NOW);
    s = closeSession(s, 1, NOW);
    const id = s.evidence[0]!.id;
    s = updateSession(s, 1, { responses: { build: "Saved the reframe to my notes app." } }, NOW);
    s = closeSession(s, 1, NOW);
    s = closeSession(s, 1, NOW);
    expect(s.evidence).toHaveLength(1);
    expect(s.evidence[0]!.id).toBe(id);
    expect(s.evidence[0]!.note).toContain("Saved the reframe");
  });

  it("withdraws session evidence if the work is removed and the day re-closed", () => {
    let s = updateSession(defaultState(), 1, { responses: { act: WORK }, reflection: { learned: "x" } }, NOW);
    s = closeSession(s, 1, NOW);
    s = updateSession(s, 1, { responses: { act: "" } }, NOW);
    s = closeSession(s, 1, NOW);
    expect(s.evidence).toHaveLength(0);
    expect(sessionStatus(s.sessions[1])).toBe("consumed");
  });

  it("links evidence to the project the session was applied to", () => {
    let s = updateSession(defaultState(), 1, { responses: { act: WORK }, projectId: "p1" }, NOW);
    s = closeSession(s, 1, NOW);
    expect(s.evidence[0]!.projectId).toBe("p1");
  });

  it("records the local calendar date, not the UTC date", () => {
    const lateNight = new Date(2026, 8, 24, 23, 59);
    let s = updateSession(defaultState(), 1, { reflection: { learned: "x" } }, lateNight);
    s = closeSession(s, 1, lateNight);
    expect(s.sessions[1]!.closedOn).toBe("2026-09-24");
  });

  it("can be reopened without losing work", () => {
    let s = updateSession(defaultState(), 1, { responses: { act: WORK } }, NOW);
    s = closeSession(s, 1, NOW);
    s = reopenSession(s, 1);
    expect(sessionStatus(s.sessions[1])).toBe("in_progress");
    expect(s.sessions[1]!.responses.act).toBe(WORK);
  });

  it("does not mutate the previous state", () => {
    const before = defaultState();
    updateSession(before, 1, { responses: { act: WORK } }, NOW);
    expect(before.sessions).toEqual({});
  });
});

describe("navigation", () => {
  it("rejects unauthored days, except the one straight after the last authored day", () => {
    expect(goToDay(defaultState(), 30).currentDay).toBe(30);
    expect(goToDay(defaultState(), 31).currentDay).toBe(31);
    expect(() => goToDay(defaultState(), 32)).toThrow(DomainError);
  });

  it("rejects writing to unauthored days", () => {
    expect(() => commit(defaultState(), 40, "x", NOW)).toThrow(DomainError);
  });
});
