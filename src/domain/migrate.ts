// Turns any stored or imported blob into a valid AppState.
// - v3 (current): validated field by field; malformed entries are dropped.
// - v2: ideas become opportunities, projects/evidence gain their new fields.
// - v1 (the original single-file prototype, key "foundersUniversity.v1"):
//   mapped to the v2 shape, then upgraded like v2.
// Never trust stored data: it may be hand-edited, truncated or from an old build.
import { ALL_SKILLS, PROGRAM_LENGTH, getDay } from "../content/curriculum";
import {
  DEFAULT_MENTOR_MODEL,
  EVIDENCE_KINDS,
  EXPERIMENT_OUTCOMES,
  EXPERIMENT_STATUSES,
  FREEDOM_KEYS,
  MAX_CONFIDENCE,
  MEMORY_CATEGORIES,
  OPPORTUNITY_STATUSES,
  PROJECT_STAGES,
  SCHEMA_VERSION,
  defaultState,
  type AppState,
  type DayLog,
  type Decision,
  type EveningCheckIn,
  type Evidence,
  type EvidenceKind,
  type Experiment,
  type MemoryCategory,
  type MemoryItem,
  type MentorMessage,
  type Milestone,
  type MorningCheckIn,
  type Opportunity,
  type OpportunityStatus,
  type Project,
  type SessionRecord,
  type SkillState,
  type Theme,
  type WeeklyReview,
} from "./types";
import { localDate } from "./util";

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);
const text = (v: unknown): string => str(v) ?? "";
const num = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
const bool = (v: unknown): boolean | undefined => (typeof v === "boolean" ? v : undefined);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const strings = (v: unknown): string[] => arr(v).filter((x): x is string => typeof x === "string");
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const isDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(v as T) ? (v as T) : fallback;
const compact = <T>(xs: (T | undefined)[]): T[] => xs.filter((x): x is T => x !== undefined);
const KNOWN_SKILLS = new Set(ALL_SKILLS);
const skills = (v: unknown) => strings(v).filter((s) => KNOWN_SKILLS.has(s));
const EPOCH = new Date(0).toISOString();
const ts = (v: unknown): string => str(v) ?? (num(v) !== undefined ? new Date(v as number).toISOString() : EPOCH);

function stripUndefined<T extends object>(o: T): T {
  const rec = o as Record<string, unknown>;
  for (const k of Object.keys(rec)) if (rec[k] === undefined) delete rec[k];
  return o;
}

export function normalizeState(raw: unknown): AppState {
  if (!isObj(raw)) throw new Error("Not a Venture Forge save file.");
  if (raw.schemaVersion === SCHEMA_VERSION) return normalizeV3(raw);
  if (raw.schemaVersion === 2) return normalizeV3(upgradeV2(raw));
  if (raw.schemaVersion === undefined && isObj(raw.days)) return normalizeV3(upgradeV2(v1ToV2(raw)));
  if (typeof raw.schemaVersion === "number" && raw.schemaVersion > SCHEMA_VERSION) {
    throw new Error("This save file is from a newer version of Venture Forge.");
  }
  throw new Error("Not a Venture Forge save file.");
}

// ─── v3 ───────────────────────────────────────────────────────────────

function normalizeSession(v: unknown): SessionRecord | undefined {
  if (!isObj(v)) return undefined;
  const r = isObj(v.responses) ? v.responses : {};
  const f = isObj(v.reflection) ? v.reflection : {};
  return stripUndefined({
    startedAt: str(v.startedAt),
    commitment: str(v.commitment),
    commitmentKept: bool(v.commitmentKept),
    responses: stripUndefined({ think: str(r.think), act: str(r.act), build: str(r.build) }),
    reflection: stripUndefined({ learned: str(f.learned), avoided: str(f.avoided), improve: str(f.improve) }),
    projectId: str(v.projectId),
    closedAt: str(v.closedAt),
    closedOn: isDate(v.closedOn) ? v.closedOn : undefined,
  });
}

function normalizeMorning(v: unknown): MorningCheckIn | undefined {
  if (!isObj(v)) return undefined;
  return {
    at: ts(v.at),
    plan: text(v.plan),
    priorities: strings(v.priorities).slice(0, 3),
    workingOn: text(v.workingOn),
    difficulty: text(v.difficulty),
    focus: text(v.focus),
    projectIds: strings(v.projectIds),
  };
}

function normalizeEvening(v: unknown): EveningCheckIn | undefined {
  if (!isObj(v)) return undefined;
  const notes: Record<string, string> = {};
  if (isObj(v.experimentNotes)) for (const [k, n] of Object.entries(v.experimentNotes)) if (typeof n === "string") notes[k] = n;
  return stripUndefined({
    at: ts(v.at),
    accomplished: str(v.accomplished),
    prioritiesMoved: Array.isArray(v.prioritiesMoved) ? v.prioritiesMoved.map((b) => b === true) : undefined,
    avoided: str(v.avoided),
    learned: str(v.learned),
    surprised: str(v.surprised),
    decision: str(v.decision),
    built: str(v.built),
    carryForward: str(v.carryForward),
    changeTomorrow: str(v.changeTomorrow),
    experimentNotes: Object.keys(notes).length ? notes : undefined,
  });
}

function normalizeEvidence(v: unknown): Evidence | undefined {
  if (!isObj(v) || !str(v.id) || !str(v.title)) return undefined;
  const src = isObj(v.source) ? v.source : {};
  const day = num(src.day);
  const source: Evidence["source"] =
    src.kind === "session" && day !== undefined ? { kind: "session", day }
      : src.kind === "experiment" && str(src.experimentId) ? { kind: "experiment", experimentId: src.experimentId as string }
        : { kind: "manual" };
  return stripUndefined<Evidence>({
    id: v.id as string,
    createdAt: ts(v.createdAt),
    date: isDate(v.date) ? v.date : "1970-01-01",
    kind: oneOf(v.kind, Object.keys(EVIDENCE_KINDS) as EvidenceKind[], source.kind === "session" ? "session" : "other"),
    title: v.title as string,
    note: text(v.note),
    skills: skills(v.skills),
    projectId: str(v.projectId),
    source,
  });
}

function normalizeSkills(v: unknown): Record<string, SkillState> {
  const out: Record<string, SkillState> = {};
  if (!isObj(v)) return out;
  for (const [id, s] of Object.entries(v)) {
    if (!KNOWN_SKILLS.has(id) || !isObj(s)) continue;
    const level = num(s.level);
    if (level === undefined) continue;
    out[id] = {
      level: clamp(Math.round(level), 0, MAX_CONFIDENCE),
      history: arr(s.history).flatMap((h) =>
        isObj(h) && num(h.level) !== undefined ? [{ level: clamp(h.level as number, 0, MAX_CONFIDENCE), note: text(h.note), at: text(h.at) }] : [],
      ),
    };
  }
  return out;
}

function normalizeMilestone(v: unknown): Milestone | undefined {
  if (!isObj(v) || !str(v.id) || !str(v.title)) return undefined;
  return stripUndefined({ id: v.id as string, title: v.title as string, done: v.done === true, doneAt: str(v.doneAt) });
}

function normalizeProject(v: unknown): Project | undefined {
  if (!isObj(v) || !str(v.id) || !str(v.name)) return undefined;
  return {
    id: v.id as string,
    name: v.name as string,
    objective: text(v.objective),
    why: text(v.why),
    nextAction: text(v.nextAction),
    stage: oneOf(v.stage, PROJECT_STAGES, "Active"),
    skills: skills(v.skills),
    milestones: compact(arr(v.milestones).map(normalizeMilestone)),
    problems: text(v.problems),
    lessons: text(v.lessons),
    results: text(v.results),
    retrospective: text(v.retrospective),
    createdAt: ts(v.createdAt),
  };
}

function normalizeExperiment(v: unknown): Experiment | undefined {
  if (!isObj(v) || !str(v.id) || !str(v.title)) return undefined;
  return stripUndefined<Experiment>({
    id: v.id as string,
    title: v.title as string,
    hypothesis: text(v.hypothesis),
    why: text(v.why),
    test: text(v.test),
    measure: text(v.measure),
    result: text(v.result),
    learning: text(v.learning),
    decision: text(v.decision),
    status: oneOf(v.status, EXPERIMENT_STATUSES, "planned"),
    outcome: EXPERIMENT_OUTCOMES.includes(v.outcome as never) ? (v.outcome as Experiment["outcome"]) : undefined,
    projectId: str(v.projectId),
    skills: skills(v.skills),
    createdAt: ts(v.createdAt),
    startedAt: str(v.startedAt),
    concludedAt: str(v.concludedAt),
  });
}

function normalizeDecision(v: unknown): Decision | undefined {
  if (!isObj(v) || !str(v.id) || !str(v.decision)) return undefined;
  return stripUndefined({
    id: v.id as string,
    date: isDate(v.date) ? v.date : "1970-01-01",
    decision: v.decision as string,
    context: text(v.context),
    options: text(v.options),
    confidence: clamp(Math.round(num(v.confidence) ?? 5), 1, 10),
    outcomeNote: text(v.outcomeNote),
    projectId: str(v.projectId),
    reviewedAt: str(v.reviewedAt),
  });
}

function normalizeOpportunity(v: unknown): Opportunity | undefined {
  if (!isObj(v) || !str(v.id) || !str(v.title)) return undefined;
  const createdAt = ts(v.createdAt);
  return {
    id: v.id as string,
    title: v.title as string,
    problem: text(v.problem),
    customer: text(v.customer),
    solution: text(v.solution),
    market: text(v.market),
    evidence: text(v.evidence),
    alternatives: text(v.alternatives),
    model: text(v.model),
    risks: text(v.risks),
    unknowns: text(v.unknowns),
    validation: text(v.validation),
    status: oneOf(v.status, OPPORTUNITY_STATUSES, "Captured"),
    createdAt,
    updatedAt: str(v.updatedAt) ?? createdAt,
  };
}

function normalizeMemory(v: unknown): MemoryItem | undefined {
  if (!isObj(v) || !str(v.id) || !str(v.text)) return undefined;
  const createdAt = ts(v.createdAt);
  return {
    id: v.id as string,
    category: oneOf(v.category, Object.keys(MEMORY_CATEGORIES) as MemoryCategory[], "context"),
    text: v.text as string,
    pinned: v.pinned === true,
    createdAt,
    updatedAt: str(v.updatedAt) ?? createdAt,
  };
}

function normalizeWeekly(v: unknown): WeeklyReview | undefined {
  if (!isObj(v) || !isDate(v.weekStart)) return undefined;
  return {
    weekStart: v.weekStart,
    createdAt: ts(v.createdAt),
    moved: text(v.moved),
    stalled: text(v.stalled),
    mistakes: text(v.mistakes),
    opportunities: text(v.opportunities),
    change: text(v.change),
    focus: strings(v.focus).slice(0, 3),
  };
}

function normalizeMentorMessage(v: unknown): MentorMessage | undefined {
  if (!isObj(v) || (v.role !== "user" && v.role !== "assistant") || !str(v.content)) return undefined;
  return { role: v.role, content: v.content as string, at: ts(v.at) };
}

function normalizeFreedom(v: unknown): AppState["freedom"] {
  const out = defaultState().freedom;
  if (!isObj(v)) return out;
  for (const k of FREEDOM_KEYS) {
    const n = num(v[k]);
    if (n !== undefined) out[k] = clamp(Math.round(n), 0, 100);
  }
  if (str(v.updatedAt)) out.updatedAt = v.updatedAt as string;
  return out;
}

function normalizeV3(raw: Obj): AppState {
  const state = defaultState();
  const settings = isObj(raw.settings) ? raw.settings : {};
  state.settings.theme = oneOf<Theme>(settings.theme, ["system", "light", "dark"], "system");
  state.settings.name = text(settings.name).slice(0, 60);
  state.settings.mentorModel = str(settings.mentorModel)?.trim() || DEFAULT_MENTOR_MODEL;
  state.currentDay = clamp(Math.round(num(raw.currentDay) ?? 1), 1, PROGRAM_LENGTH);
  if (isObj(raw.days)) {
    for (const [date, v] of Object.entries(raw.days)) {
      if (!isDate(date) || !isObj(v)) continue;
      const log: DayLog = stripUndefined({ morning: normalizeMorning(v.morning), evening: normalizeEvening(v.evening) });
      if (log.morning || log.evening) state.days[date] = log;
    }
  }
  if (isObj(raw.sessions)) {
    for (const [k, v] of Object.entries(raw.sessions)) {
      const day = Number(k);
      const rec = normalizeSession(v);
      if (Number.isInteger(day) && day >= 1 && day <= PROGRAM_LENGTH && rec) state.sessions[day] = rec;
    }
  }
  state.evidence = compact(arr(raw.evidence).map(normalizeEvidence));
  state.skills = normalizeSkills(raw.skills);
  state.projects = compact(arr(raw.projects).map(normalizeProject));
  state.experiments = compact(arr(raw.experiments).map(normalizeExperiment));
  state.decisions = compact(arr(raw.decisions).map(normalizeDecision));
  state.opportunities = compact(arr(raw.opportunities).map(normalizeOpportunity));
  state.memory = compact(arr(raw.memory).map(normalizeMemory));
  state.weeklyReviews = compact(arr(raw.weeklyReviews).map(normalizeWeekly));
  state.mentor.messages = compact(arr(isObj(raw.mentor) ? raw.mentor.messages : []).map(normalizeMentorMessage)).slice(-100);
  state.freedom = normalizeFreedom(raw.freedom);
  return state;
}

// ─── v2 → v3 ──────────────────────────────────────────────────────────

const IDEA_TO_STATUS: Record<string, OpportunityStatus> = {
  Parked: "Captured", Researching: "Investigating", Validating: "Investigating",
  Building: "Building", Live: "Commercialised", Abandoned: "Rejected",
};

function upgradeV2(raw: Obj): Obj {
  const opportunities = arr(raw.ideas).flatMap((i) => {
    if (!isObj(i) || !str(i.id) || !str(i.name)) return [];
    const at = isDate(i.date) ? new Date(`${i.date}T12:00:00`).toISOString() : EPOCH;
    return [{ id: i.id, title: i.name, problem: text(i.problem), status: IDEA_TO_STATUS[text(i.stage)] ?? "Captured", createdAt: at, updatedAt: at }];
  });
  // v2 self-ratings used a 0–8 capability scale; keep them as confidence, capped.
  const skillsIn = isObj(raw.skills) ? raw.skills : {};
  const skillsOut: Obj = {};
  for (const [id, s] of Object.entries(skillsIn)) {
    if (!isObj(s) || num(s.level) === undefined) continue;
    skillsOut[id] = { ...s, level: Math.min(MAX_CONFIDENCE, Math.ceil(((s.level as number) * MAX_CONFIDENCE) / 8)) };
  }
  return { ...raw, schemaVersion: SCHEMA_VERSION, days: {}, opportunities, skills: skillsOut };
}

// ─── v1 → v2 shape ────────────────────────────────────────────────────

const msToIso = (v: unknown) => (num(v) !== undefined ? new Date(v as number).toISOString() : undefined);
const msToLocalDate = (v: unknown) => (num(v) !== undefined ? localDate(new Date(v as number)) : undefined);

/** The prototype's shape: see docs/prototype/venture-forge.html, defaultState(). */
function v1ToV2(raw: Obj): Obj {
  const sessions: Record<number, unknown> = {};
  for (const [k, v] of Object.entries(raw.days as Obj)) {
    if (!isObj(v)) continue;
    sessions[Number(k)] = {
      startedAt: msToIso(v.morningDoneAt),
      commitment: v.morningPromise,
      commitmentKept: v.promiseKept,
      responses: { act: v.evAct, build: v.evEvidence },
      reflection: { learned: v.evLearn, avoided: v.evAvoid },
      closedAt: msToIso(v.eveningDoneAt),
      closedOn: msToLocalDate(v.eveningDoneAt),
    };
  }

  // v1 appended a new evidence item every time a day was re-closed; keep the latest per day.
  const evidence: unknown[] = [];
  const sessionEvidenceIndex = new Map<number, number>();
  for (const e of arr(raw.evidence)) {
    if (!isObj(e)) continue;
    const day = num(e.day);
    const fromSession = e.type === "daily" && day !== undefined;
    const item = {
      id: e.id,
      createdAt: isDate(e.date) ? new Date(`${e.date}T12:00:00`).toISOString() : undefined,
      date: e.date,
      title: e.title,
      note: e.note,
      skills: fromSession ? (getDay(day!)?.skills ?? []) : [],
      source: fromSession ? { kind: "session", day } : { kind: "manual" },
    };
    if (fromSession && sessionEvidenceIndex.has(day!)) evidence[sessionEvidenceIndex.get(day!)!] = item;
    else {
      if (fromSession) sessionEvidenceIndex.set(day!, evidence.length);
      evidence.push(item);
    }
  }

  const skillsOut: Record<string, unknown> = {};
  if (isObj(raw.skills)) {
    for (const [id, lvl] of Object.entries(raw.skills)) {
      if (num(lvl) === undefined || lvl === 0) continue;
      skillsOut[id] = { level: lvl, history: [{ level: lvl, note: "Imported from the prototype (self-rated; no justification recorded).", at: "" }] };
    }
  }

  return {
    schemaVersion: 2,
    settings: { theme: raw.theme === "light" ? "light" : raw.theme === "dark" ? "dark" : "system" },
    currentDay: raw.currentDay,
    sessions,
    evidence,
    skills: skillsOut,
    projects: raw.projects,
    decisions: raw.decisions,
    ideas: raw.ideas,
    freedom: raw.freedom,
  };
}
