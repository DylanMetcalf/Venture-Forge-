import { describe, expect, it } from "vitest";
import { buildMentorContext } from "../ai/context";
import { collectSignals } from "../integrations/signals";
import { addManualEvidence, addMemory, addOpportunity, appendMentorMessages, deleteEvidence, updateOpportunity, MENTOR_HISTORY_LIMIT } from "./actions";
import { recommendations, relevantTracks } from "./adaptive";
import { levelFor, scorecard, skillCapabilities } from "./capability";
import { eveningQuestions, saveEvening, saveMorning } from "./daily";
import { normalizeState } from "./migrate";
import { addExperiment, addMilestone, addProject, concludeExperiment, startExperiment, toggleMilestone, updateExperiment } from "./projects";
import { closeSession, updateSession } from "./sessions";
import { DomainError, SCHEMA_VERSION, defaultState, type AppState } from "./types";
import { currentFocus, saveWeeklyReview, weekFacts, weekStartOf } from "./weekly";

const TODAY = "2026-09-24"; // a Thursday
const at = (d: string, h = 9) => new Date(`${d}T${String(h).padStart(2, "0")}:00:00`);
const morning = (overrides: Partial<Parameters<typeof saveMorning>[2]> = {}) => ({
  plan: "Ship the onboarding flow and call two prospects",
  priorities: ["Ship onboarding", "Call two prospects", ""],
  workingOn: "SaaS onboarding",
  difficulty: "Getting customers to reply",
  focus: "Sales outreach",
  projectIds: [],
  ...overrides,
});

describe("morning check-in", () => {
  it("saves trimmed priorities (max three) and drops unknown projects", () => {
    const s = saveMorning(defaultState(), TODAY, morning({ projectIds: ["nope"] }), at(TODAY));
    expect(s.days[TODAY]!.morning).toMatchObject({ priorities: ["Ship onboarding", "Call two prospects"], projectIds: [] });
  });
  it("refuses an empty check-in", () => {
    expect(() => saveMorning(defaultState(), TODAY, morning({ plan: " ", priorities: [] }), at(TODAY))).toThrow(DomainError);
  });
});

describe("evening questions adapt to the day", () => {
  it("asks about priorities, learning, decisions and evidence only when relevant", () => {
    let s = saveMorning(defaultState(), TODAY, morning(), at(TODAY));
    let keys = eveningQuestions(s, TODAY).map((q) => q.key);
    expect(keys).toContain("prioritiesMoved");
    expect(keys).toContain("learned");
    expect(keys).toContain("built");
    expect(keys).toContain("decision");

    s = updateSession(s, 1, { responses: { act: "Rewrote the stuck problem as my next move and did it." } }, at(TODAY, 20));
    s = closeSession(s, 1, at(TODAY, 20));
    keys = eveningQuestions(s, TODAY).map((q) => q.key);
    expect(keys).not.toContain("learned"); // the session captured it
    expect(keys).not.toContain("built"); // session evidence exists today
  });

  it("asks about each running experiment and quotes the morning's difficulty", () => {
    let s = saveMorning(defaultState(), TODAY, morning(), at(TODAY));
    s = addExperiment(s, { title: "Cold email subject lines", hypothesis: "Short subjects get more replies" }, at(TODAY));
    const id = s.experiments[0]!.id;
    s = updateExperiment(s, id, { test: "Send 20 of each", measure: "Reply rate" }, at(TODAY));
    s = startExperiment(s, id, at(TODAY));
    const qs = eveningQuestions(s, TODAY);
    expect(qs.map((q) => q.key)).toContain(`experiment:${id}`);
    expect(qs.find((q) => q.key === "carryForward")!.prompt).toContain("Getting customers to reply");
  });

  it("saves only answered fields and refuses an empty review", () => {
    expect(() => saveEvening(defaultState(), TODAY, { accomplished: " " }, at(TODAY, 21))).toThrow(DomainError);
    const s = saveEvening(defaultState(), TODAY, { accomplished: "Shipped onboarding", avoided: "", prioritiesMoved: [true, false] }, at(TODAY, 21));
    expect(s.days[TODAY]!.evening).toMatchObject({ accomplished: "Shipped onboarding", prioritiesMoved: [true, false] });
    expect(s.days[TODAY]!.evening!.avoided).toBeUndefined();
  });
});

describe("projects and experiments", () => {
  it("tracks milestones with completion dates", () => {
    let s = addProject(defaultState(), { name: "SiteGuard", objective: "10 paying customers" }, at(TODAY));
    const pid = s.projects[0]!.id;
    s = addMilestone(s, pid, "Landing page live");
    const mid = s.projects[0]!.milestones[0]!.id;
    s = toggleMilestone(s, pid, mid, at(TODAY));
    expect(s.projects[0]!.milestones[0]).toMatchObject({ done: true, doneAt: at(TODAY).toISOString() });
    s = toggleMilestone(s, pid, mid, at(TODAY));
    expect(s.projects[0]!.milestones[0]!.doneAt).toBeUndefined();
  });

  it("won't start an experiment that can't be judged, or conclude one without a result and decision", () => {
    let s = addExperiment(defaultState(), { title: "Price test" }, at(TODAY));
    const id = s.experiments[0]!.id;
    expect(() => startExperiment(s, id, at(TODAY))).toThrow(/hypothesis/);
    s = updateExperiment(s, id, { hypothesis: "R400 converts as well as R300", test: "Show R400 to next 10 leads", measure: "≥3 of 10 buy" }, at(TODAY));
    s = startExperiment(s, id, at(TODAY));
    expect(() => concludeExperiment(s, id, "supported", at(TODAY))).toThrow(/what actually happened/);
    s = updateExperiment(s, id, { result: "4 of 10 bought", learning: "Price wasn't the objection", skills: ["pricing", "bogus"] }, at(TODAY));
    expect(() => concludeExperiment(s, id, "supported", at(TODAY))).toThrow(/Decide/);
    s = updateExperiment(s, id, { decision: "Move list price to R400" }, at(TODAY));
    s = concludeExperiment(s, id, "supported", at(TODAY));
    expect(s.experiments[0]).toMatchObject({ status: "concluded", outcome: "supported", skills: ["pricing"] });
    // Concluding creates one piece of real-world evidence, kept in step with later edits.
    expect(s.evidence).toHaveLength(1);
    expect(s.evidence[0]).toMatchObject({ kind: "experiment", skills: ["pricing"], source: { kind: "experiment", experimentId: id } });
    s = updateExperiment(s, id, { learning: "Price wasn't the objection; trust was" }, at(TODAY));
    expect(s.evidence).toHaveLength(1);
    expect(s.evidence[0]!.note).toContain("trust was");
    expect(() => deleteEvidence(s, s.evidence[0]!.id)).toThrow(DomainError);
  });
});

describe("evidence-based capability", () => {
  it("follows the stated level rule", () => {
    expect(levelFor(0, 0, 0)).toBe(0);
    expect(levelFor(0, 0, 1)).toBe(1);
    expect(levelFor(3, 0, 0)).toBe(2);
    expect(levelFor(6, 1, 0)).toBe(2); // needs 2 real-world for Competent
    expect(levelFor(6, 2, 0)).toBe(3);
    expect(levelFor(12, 4, 0)).toBe(4);
    expect(levelFor(20, 8, 0)).toBe(5);
  });

  it("derives levels from evidence and flags fading skills", () => {
    let s = defaultState();
    for (let i = 0; i < 3; i++) {
      s = addManualEvidence(s, { title: `Call ${i}`, note: "Ran a discovery call", kind: "conversation", skills: ["customer-discovery"] }, at("2026-07-01"));
    }
    const caps = skillCapabilities(s, TODAY);
    expect(caps.get("customer-discovery")).toMatchObject({ level: 2, evidence: 3, realWorld: 3, fading: true });
    expect(caps.get("pricing")!.level).toBe(0);
  });

  it("scorecard reports facts, not a single number", () => {
    const card = scorecard(defaultState(), TODAY);
    expect(card.map((c) => c.id)).toEqual(["learning", "execution", "consistency", "sales", "product", "systems", "leadership", "finance", "strategy", "technical"]);
    expect(card.every((c) => c.status === "none" && c.facts.length > 0)).toBe(true);
  });
});

describe("adaptive engine", () => {
  it("maps real context to relevant tracks, with the reason", () => {
    const s = saveMorning(defaultState(), TODAY, morning(), at(TODAY));
    const rel = relevantTracks(collectSignals(s, TODAY));
    expect(rel[0]!.track.id).toBe("sales");
    expect(rel[0]!.signal.source).toBe("check-in");
  });

  it("prioritises the check-in in the morning, and the evening review at night", () => {
    const morningRecs = recommendations(defaultState(), TODAY, at(TODAY, 8));
    expect(morningRecs[0]!.kind).toBe("checkin");
    const s = saveMorning(defaultState(), TODAY, morning(), at(TODAY));
    const eveningRecs = recommendations(s, TODAY, at(TODAY, 19));
    expect(eveningRecs[0]!.kind).toBe("evening");
    expect(eveningRecs.some((r) => r.kind === "relevant" && r.id === "relevant:sales" && /check-in/.test(r.reason))).toBe(true);
  });

  it("forces application when a skill is studied but never used for real", () => {
    let s: AppState = defaultState();
    for (const day of [8, 14]) {
      // both exercise "discipline"
      s = updateSession(s, day, { responses: { act: "Wrote my standards and graded myself honestly." } }, at("2026-09-20", 20));
      s = closeSession(s, day, at("2026-09-20", 20));
    }
    expect(recommendations(s, TODAY, at(TODAY, 12)).some((r) => r.id === "apply:discipline")).toBe(true);
  });

  it("revisits sessions that were read but not applied", () => {
    let s = updateSession(defaultState(), 3, { reflection: { learned: "Requests and responses" } }, at("2026-09-20", 20));
    s = closeSession(s, 3, at("2026-09-20", 20));
    expect(recommendations(s, TODAY, at(TODAY, 12)).some((r) => r.id === "revisit:3")).toBe(true);
  });
});

describe("weekly review", () => {
  it("finds the Monday of the week", () => {
    expect(weekStartOf("2026-09-24")).toBe("2026-09-21");
    expect(weekStartOf("2026-09-27")).toBe("2026-09-21"); // Sunday
    expect(weekStartOf("2026-09-21")).toBe("2026-09-21");
  });

  it("gathers the week's facts, including stalled projects and priorities moved", () => {
    let s = addProject(defaultState(), { name: "Terram" }, at("2026-09-21"));
    s = addProject(s, { name: "Creator Hub" }, at("2026-09-21"));
    s = saveMorning(s, "2026-09-22", morning(), at("2026-09-22"));
    s = saveEvening(s, "2026-09-22", { prioritiesMoved: [true, false], avoided: "Cold calls" }, at("2026-09-22", 21));
    s = addManualEvidence(s, { title: "Signed pilot", note: "Terram pilot signed", kind: "sale", skills: ["closing"], projectId: s.projects[0]!.id }, at("2026-09-23"));
    const f = weekFacts(s, "2026-09-21");
    expect(f.prioritiesMoved).toEqual({ moved: 1, set: 2 });
    expect(f.realWorldEvidence).toBe(1);
    expect(f.avoided).toEqual(["Cold calls"]);
    expect(f.stalledProjects).toEqual(["Creator Hub"]);
  });

  it("requires a focus and surfaces it the following week", () => {
    const base = { moved: "", stalled: "", mistakes: "", opportunities: "", change: "" };
    expect(() => saveWeeklyReview(defaultState(), "2026-09-14", { ...base, focus: [" "] }, at("2026-09-20"))).toThrow(DomainError);
    const s = saveWeeklyReview(defaultState(), "2026-09-14", { ...base, focus: ["Close two pilots", "Ship billing"] }, at("2026-09-20"));
    expect(currentFocus(s, TODAY)!.focus).toEqual(["Close two pilots", "Ship billing"]);
  });
});

describe("opportunities, memory and mentor", () => {
  it("captures opportunities without turning them into projects", () => {
    let s = addOpportunity(defaultState(), { title: "AI receptionist for clinics" }, at(TODAY));
    s = updateOpportunity(s, s.opportunities[0]!.id, { status: "Investigating", customer: "Private GP practices" }, at(TODAY));
    expect(s.opportunities[0]).toMatchObject({ status: "Investigating", customer: "Private GP practices" });
    expect(s.projects).toHaveLength(0);
  });

  it("caps the mentor transcript", () => {
    let s = defaultState();
    for (let i = 0; i < MENTOR_HISTORY_LIMIT + 10; i++) s = appendMentorMessages(s, [{ role: "user", content: `m${i}` }], at(TODAY));
    expect(s.mentor.messages).toHaveLength(MENTOR_HISTORY_LIMIT);
    expect(s.mentor.messages.at(-1)!.content).toBe(`m${MENTOR_HISTORY_LIMIT + 9}`);
  });

  it("builds mentor context from real records", () => {
    let s = saveMorning(defaultState(), TODAY, morning(), at(TODAY));
    s = addProject(s, { name: "SiteGuard", objective: "10 paying customers", nextAction: "Email 5 site managers" }, at(TODAY));
    s = addMemory(s, { category: "goal", text: "Become a capable AI software founder" }, at(TODAY));
    const ctx = buildMentorContext(s, TODAY);
    expect(ctx).toContain("Getting customers to reply");
    expect(ctx).toContain("SiteGuard [Active]");
    expect(ctx).toContain("Become a capable AI software founder");
    expect(ctx).toContain("Needs attention");
  });
});

describe("v2 → v3 migration", () => {
  it("turns ideas into opportunities and fills new fields", () => {
    const v2 = {
      schemaVersion: 2,
      settings: { theme: "dark", name: "Dylan" },
      currentDay: 4,
      sessions: {},
      evidence: [{ id: "e", date: "2026-09-01", title: "Manual", note: "n", skills: ["focus"], source: { kind: "manual" } }],
      skills: { focus: { level: 8, history: [] } },
      projects: [{ id: "p", name: "SiteGuard", why: "", nextAction: "", stage: "Building", createdAt: "2026-09-01T00:00:00.000Z" }],
      decisions: [],
      ideas: [{ id: "i", date: "2026-09-01", name: "Clinic bot", problem: "Missed calls", stage: "Validating" }],
      freedom: {},
    };
    const s = normalizeState(v2);
    expect(s.schemaVersion).toBe(SCHEMA_VERSION);
    expect(s.settings).toMatchObject({ theme: "dark", name: "Dylan", mentorModel: "claude-opus-5" });
    expect(s.opportunities[0]).toMatchObject({ title: "Clinic bot", problem: "Missed calls", status: "Investigating" });
    expect(s.projects[0]).toMatchObject({ name: "SiteGuard", stage: "Building", milestones: [], objective: "" });
    expect(s.evidence[0]!.kind).toBe("other");
    expect(s.skills.focus!.level).toBe(5);
    expect(s.days).toEqual({});
  });

  it("round-trips a full v3 state", () => {
    let s = saveMorning(defaultState(), TODAY, morning(), at(TODAY));
    s = saveEvening(s, TODAY, { accomplished: "x", experimentNotes: { a: "b" } }, at(TODAY, 21));
    s = addExperiment(s, { title: "t", hypothesis: "h" }, at(TODAY));
    s = addMemory(s, { category: "pattern", text: "Avoids cold calls", pinned: true }, at(TODAY));
    s = appendMentorMessages(s, [{ role: "user", content: "hi" }, { role: "assistant", content: "Hello." }], at(TODAY));
    expect(normalizeState(JSON.parse(JSON.stringify(s)))).toEqual(s);
  });
});
