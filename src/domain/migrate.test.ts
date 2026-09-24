import { describe, expect, it } from "vitest";
import { normalizeState } from "./migrate";
import { sessionStatus } from "./sessions";
import { SCHEMA_VERSION, defaultState } from "./types";

// Shape written by the prototype (docs/prototype/venture-forge.html).
const v1 = {
  theme: "light",
  currentDay: 3,
  days: {
    1: { morningPromise: "Call the supplier", morningDoneAt: Date.UTC(2026, 8, 20, 6), promiseKept: true, evAct: "Called the supplier and agreed 14-day terms.", evLearn: "Ask earlier.", evAvoid: "", evEvidence: "Terms confirmed by email", eveningDoneAt: Date.UTC(2026, 8, 20, 18) },
    2: { morningPromise: "Log hours", morningDoneAt: Date.UTC(2026, 8, 21, 6) },
  },
  skills: { focus: 3, "not-a-skill": 2, pricing: 0 },
  evidence: [
    { id: "a", date: "2026-09-20", day: 1, title: "Day 1 — first", note: "old", type: "daily" },
    { id: "b", date: "2026-09-20", day: 1, title: "Day 1 — dup", note: "new", type: "daily" },
    { id: "c", date: "2026-09-21", day: 2, title: "Manual thing", note: "n", type: "manual" },
  ],
  projects: [{ id: "p", name: "Butchery", why: "cash", stage: "Building", nextAction: "quotes", createdAt: 1726000000000 }],
  decisions: [{ id: "d", date: "2026-09-20", decision: "Raise prices", context: "", options: "", confidence: 7, outcomeNote: "" }],
  ideas: [{ id: "i", date: "2026-09-20", name: "Meat box", problem: "", stage: "Parked" }],
  freedom: { financial: 40, time: 30, business: 20, skill: 60, decision: 55 },
  reviews: [],
};

describe("v1 migration", () => {
  const s = normalizeState(structuredClone(v1));

  it("produces a current-version state", () => {
    expect(s.schemaVersion).toBe(SCHEMA_VERSION);
    expect(s.settings.theme).toBe("light");
    expect(s.currentDay).toBe(3);
  });

  it("maps the morning/evening record onto sessions", () => {
    expect(s.sessions[1]).toMatchObject({ commitment: "Call the supplier", commitmentKept: true, responses: { act: "Called the supplier and agreed 14-day terms.", build: "Terms confirmed by email" }, reflection: { learned: "Ask earlier." } });
    expect(sessionStatus(s.sessions[1])).toBe("demonstrated");
    expect(sessionStatus(s.sessions[2])).toBe("in_progress");
  });

  it("collapses the prototype's duplicate session evidence to the latest entry", () => {
    const day1 = s.evidence.filter((e) => e.source.kind === "session" && e.source.day === 1);
    expect(day1).toHaveLength(1);
    expect(day1[0]!.note).toBe("new");
    expect(day1[0]!.skills).toEqual(["responsibility", "self-awareness"]);
    expect(s.evidence.find((e) => e.id === "c")!.source).toEqual({ kind: "manual" });
  });

  it("keeps known non-zero self-ratings as confidence, with a note that they were unjustified", () => {
    expect(Object.keys(s.skills)).toEqual(["focus"]);
    expect(s.skills.focus!.level).toBe(2); // 3 on the old 0–8 scale → 2 on the 0–5 confidence scale
    expect(s.skills.focus!.history[0]!.note).toMatch(/Imported/);
  });

  it("carries over projects, decisions, ideas and freedom", () => {
    expect(s.projects[0]).toMatchObject({ name: "Butchery", stage: "Building" });
    expect(s.projects[0]!.createdAt).toMatch(/^\d{4}-/);
    expect(s.decisions).toHaveLength(1);
    expect(s.opportunities).toMatchObject([{ id: "i", title: "Meat box", status: "Captured" }]);
    expect(s.freedom.financial).toBe(40);
  });
});

describe("v2 normalisation", () => {
  it("round-trips a valid state", () => {
    const s = defaultState();
    s.sessions[4] = { responses: { act: "x" }, reflection: {}, closedAt: "2026-09-24T18:00:00.000Z", closedOn: "2026-09-24" };
    expect(normalizeState(JSON.parse(JSON.stringify(s)))).toEqual(s);
  });

  it("drops malformed entries instead of crashing", () => {
    const s = normalizeState({
      schemaVersion: SCHEMA_VERSION,
      currentDay: 9999,
      settings: { theme: "neon" },
      sessions: { 1: "garbage", abc: {}, 2: { responses: { act: 5 } } },
      evidence: [null, { id: "x" }, { id: "y", title: "ok", skills: ["focus", 3, "bogus"] }],
      projects: [{ id: "p", name: "n", stage: "Exploding" }],
      freedom: { financial: 500, time: "high" },
    });
    expect(s.currentDay).toBe(365);
    expect(s.settings.theme).toBe("system");
    expect(Object.keys(s.sessions)).toEqual(["2"]);
    expect(s.sessions[2]!.responses).toEqual({});
    expect(s.evidence).toHaveLength(1);
    expect(s.evidence[0]!.skills).toEqual(["focus"]);
    expect(s.projects[0]!.stage).toBe("Active");
    expect(s.freedom.financial).toBe(100);
    expect(s.freedom.time).toBe(50);
  });

  it("rejects things that aren't save files, and files from newer versions", () => {
    expect(() => normalizeState(null)).toThrow();
    expect(() => normalizeState([])).toThrow();
    expect(() => normalizeState({ hello: 1 })).toThrow(/Not a Venture Forge/);
    expect(() => normalizeState({ schemaVersion: 99 })).toThrow(/newer version/);
  });
});
