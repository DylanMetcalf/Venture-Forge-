// Turns any stored or imported blob into a valid AppState.
// - v2 (current): validated field by field; malformed entries are dropped.
// - v1 (the original single-file prototype, key "foundersUniversity.v1"):
//   migrated to v2.
// Never trust stored data: it may be hand-edited, truncated or from an old build.
import { ALL_SKILLS, MAX_SKILL_LEVEL, PROGRAM_LENGTH, getDay } from "../content/curriculum";
import {
  FREEDOM_KEYS,
  IDEA_STAGES,
  PROJECT_STAGES,
  SCHEMA_VERSION,
  defaultState,
  type AppState,
  type Decision,
  type Evidence,
  type Idea,
  type Project,
  type SessionRecord,
  type SkillState,
  type Theme,
} from "./types";
import { localDate } from "./util";

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);
const num = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
const bool = (v: unknown): boolean | undefined => (typeof v === "boolean" ? v : undefined);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const isDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(v as T) ? (v as T) : fallback;
const KNOWN_SKILLS = new Set(ALL_SKILLS);

function stripUndefined<T extends object>(o: T): T {
  const rec = o as Record<string, unknown>;
  for (const k of Object.keys(rec)) if (rec[k] === undefined) delete rec[k];
  return o;
}

export function normalizeState(raw: unknown): AppState {
  if (!isObj(raw)) throw new Error("Not a Venture Forge save file.");
  if (raw.schemaVersion === SCHEMA_VERSION) return normalizeV2(raw);
  if (raw.schemaVersion === undefined && isObj(raw.days)) return migrateV1(raw);
  if (typeof raw.schemaVersion === "number" && raw.schemaVersion > SCHEMA_VERSION) {
    throw new Error("This save file is from a newer version of Venture Forge.");
  }
  throw new Error("Not a Venture Forge save file.");
}

function normalizeSession(v: unknown): SessionRecord | undefined {
  if (!isObj(v)) return undefined;
  const r = isObj(v.responses) ? v.responses : {};
  const f = isObj(v.reflection) ? v.reflection : {};
  return stripUndefined({
    startedAt: str(v.startedAt),
    commitment: str(v.commitment),
    commitmentKept: bool(v.commitmentKept),
    responses: stripUndefined({ think: str(r.think), act: str(r.act), build: str(r.build) }),
    reflection: stripUndefined({ learned: str(f.learned), avoided: str(f.avoided) }),
    projectId: str(v.projectId),
    closedAt: str(v.closedAt),
    closedOn: isDate(v.closedOn) ? v.closedOn : undefined,
  });
}

function normalizeEvidence(v: unknown): Evidence | undefined {
  if (!isObj(v) || !str(v.id) || !str(v.title)) return undefined;
  const src = isObj(v.source) ? v.source : {};
  const day = num(src.day);
  return stripUndefined<Evidence>({
    id: v.id as string,
    createdAt: str(v.createdAt) ?? new Date(0).toISOString(),
    date: isDate(v.date) ? v.date : "1970-01-01",
    title: v.title as string,
    note: str(v.note) ?? "",
    skills: arr(v.skills).filter((s): s is string => typeof s === "string" && KNOWN_SKILLS.has(s)),
    projectId: str(v.projectId),
    source: src.kind === "session" && day !== undefined ? { kind: "session", day } : { kind: "manual" },
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
      level: clamp(Math.round(level), 0, MAX_SKILL_LEVEL),
      history: arr(s.history).flatMap((h) =>
        isObj(h) && num(h.level) !== undefined ? [{ level: h.level as number, note: str(h.note) ?? "", at: str(h.at) ?? "" }] : [],
      ),
    };
  }
  return out;
}

function normalizeProject(v: unknown): Project | undefined {
  if (!isObj(v) || !str(v.id) || !str(v.name)) return undefined;
  return {
    id: v.id as string,
    name: v.name as string,
    why: str(v.why) ?? "",
    nextAction: str(v.nextAction) ?? "",
    stage: oneOf(v.stage, PROJECT_STAGES, "Active"),
    createdAt: str(v.createdAt) ?? (num(v.createdAt) !== undefined ? new Date(v.createdAt as number).toISOString() : new Date(0).toISOString()),
  };
}

function normalizeDecision(v: unknown): Decision | undefined {
  if (!isObj(v) || !str(v.id) || !str(v.decision)) return undefined;
  return stripUndefined({
    id: v.id as string,
    date: isDate(v.date) ? v.date : "1970-01-01",
    decision: v.decision as string,
    context: str(v.context) ?? "",
    options: str(v.options) ?? "",
    confidence: clamp(Math.round(num(v.confidence) ?? 5), 1, 10),
    outcomeNote: str(v.outcomeNote) ?? "",
    reviewedAt: str(v.reviewedAt),
  });
}

function normalizeIdea(v: unknown): Idea | undefined {
  if (!isObj(v) || !str(v.id) || !str(v.name)) return undefined;
  return {
    id: v.id as string,
    date: isDate(v.date) ? v.date : "1970-01-01",
    name: v.name as string,
    problem: str(v.problem) ?? "",
    stage: oneOf(v.stage, IDEA_STAGES, "Parked"),
  };
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

const compact = <T>(xs: (T | undefined)[]): T[] => xs.filter((x): x is T => x !== undefined);

function normalizeV2(raw: Obj): AppState {
  const state = defaultState();
  const settings = isObj(raw.settings) ? raw.settings : {};
  state.settings.theme = oneOf<Theme>(settings.theme, ["system", "light", "dark"], "system");
  state.currentDay = clamp(Math.round(num(raw.currentDay) ?? 1), 1, PROGRAM_LENGTH);
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
  state.decisions = compact(arr(raw.decisions).map(normalizeDecision));
  state.ideas = compact(arr(raw.ideas).map(normalizeIdea));
  state.freedom = normalizeFreedom(raw.freedom);
  return state;
}

const msToIso = (v: unknown) => (num(v) !== undefined ? new Date(v as number).toISOString() : undefined);
const msToLocalDate = (v: unknown) => (num(v) !== undefined ? localDate(new Date(v as number)) : undefined);

/** The prototype's shape: see docs/prototype/venture-forge.html, defaultState(). */
function migrateV1(raw: Obj): AppState {
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

  const skills: Record<string, unknown> = {};
  if (isObj(raw.skills)) {
    for (const [id, lvl] of Object.entries(raw.skills)) {
      if (num(lvl) === undefined || lvl === 0) continue;
      skills[id] = { level: lvl, history: [{ level: lvl, note: "Imported from the prototype (self-rated; no justification recorded).", at: "" }] };
    }
  }

  return normalizeV2({
    schemaVersion: SCHEMA_VERSION,
    settings: { theme: raw.theme === "light" ? "light" : raw.theme === "dark" ? "dark" : "system" },
    currentDay: raw.currentDay,
    sessions,
    evidence,
    skills,
    projects: raw.projects,
    decisions: raw.decisions,
    ideas: raw.ideas,
    freedom: raw.freedom,
  });
}
