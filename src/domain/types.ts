import type { SkillId } from "../content/types";

export const SCHEMA_VERSION = 3;

/** Local calendar date, YYYY-MM-DD. */
export type LocalDate = string;
/** ISO-8601 timestamp. */
export type Timestamp = string;

export type Theme = "system" | "light" | "dark";

// ─── Daily founder log ────────────────────────────────────────────────

/** Morning check-in: what the day actually holds, so the system can adapt to it. */
export interface MorningCheckIn {
  at: Timestamp;
  /** "What are you doing today?" — free text; also the future voice-capture target. */
  plan: string;
  /** Up to three priorities, in order. */
  priorities: string[];
  /** What you're currently working on (projects, products, deals). */
  workingOn: string;
  /** What's currently difficult. */
  difficulty: string;
  /** What Venture Forge should help you improve today. */
  focus: string;
  projectIds: string[];
}

/** Evening review. Fields are optional because the questions adapt to the day. */
export interface EveningCheckIn {
  at: Timestamp;
  accomplished?: string;
  /** Index-aligned with the morning's priorities: did each one move? */
  prioritiesMoved?: boolean[];
  avoided?: string;
  learned?: string;
  surprised?: string;
  decision?: string;
  built?: string;
  carryForward?: string;
  changeTomorrow?: string;
  /** Short notes on running experiments, keyed by experiment id. */
  experimentNotes?: Record<string, string>;
}

export interface DayLog {
  morning?: MorningCheckIn;
  evening?: EveningCheckIn;
}

// ─── Curriculum sessions ──────────────────────────────────────────────

export interface SessionRecord {
  startedAt?: Timestamp;
  /** The morning promise: one thing you will definitely do today. */
  commitment?: string;
  commitmentKept?: boolean;
  /** The actual work, answering the day's Think / Apply / Build prompts. */
  responses: { think?: string; act?: string; build?: string };
  reflection: { learned?: string; avoided?: string; improve?: string };
  /** The real project this session was applied to, if any. */
  projectId?: string;
  closedAt?: Timestamp;
  /** Local calendar date the session was closed (drives streaks). */
  closedOn?: LocalDate;
}

/**
 * consumed     = closed, but without recorded work (read and reflected only).
 * demonstrated = closed with recorded work in Apply or Build.
 */
export type SessionStatus = "not_started" | "in_progress" | "consumed" | "demonstrated";

// ─── Evidence ─────────────────────────────────────────────────────────

export const EVIDENCE_KINDS = {
  session: "Session work",
  conversation: "Customer / people conversation",
  sale: "Sales activity or revenue",
  shipped: "Software or product shipped",
  experiment: "Experiment result",
  decision: "Decision made",
  analysis: "Analysis or written work",
  process: "Process or system created",
  negotiation: "Negotiation",
  other: "Other real-world result",
} as const;
export type EvidenceKind = keyof typeof EVIDENCE_KINDS;

export type EvidenceSource =
  | { kind: "session"; day: number }
  | { kind: "experiment"; experimentId: string }
  | { kind: "manual" };

export interface Evidence {
  id: string;
  createdAt: Timestamp;
  date: LocalDate;
  kind: EvidenceKind;
  title: string;
  note: string;
  skills: SkillId[];
  projectId?: string;
  source: EvidenceSource;
}

/** Evidence produced outside the curriculum — the strongest signal of real capability. */
export function isRealWorld(e: Evidence): boolean {
  return e.source.kind !== "session";
}

// ─── Skills ───────────────────────────────────────────────────────────

/** Self-rated confidence. Shown next to the evidence-based level, never instead of it. */
export const CONFIDENCE_LEVELS = ["Not rated", "Shaky", "Unsure", "Okay", "Confident", "Very confident"] as const;
export const MAX_CONFIDENCE = CONFIDENCE_LEVELS.length - 1;

export interface SkillAssessment {
  level: number;
  note: string;
  at: Timestamp;
}
export interface SkillState {
  /** Self-rated confidence, 0–MAX_CONFIDENCE. */
  level: number;
  history: SkillAssessment[];
}

// ─── Projects & experiments ───────────────────────────────────────────

export const PROJECT_STAGES = ["Active", "Researching", "Validating", "Building", "Live", "Parked", "Done", "Abandoned"] as const;
export type ProjectStage = (typeof PROJECT_STAGES)[number];

export interface Milestone {
  id: string;
  title: string;
  done: boolean;
  doneAt?: Timestamp;
}

export interface Project {
  id: string;
  name: string;
  objective: string;
  why: string;
  nextAction: string;
  stage: ProjectStage;
  skills: SkillId[];
  milestones: Milestone[];
  problems: string;
  lessons: string;
  results: string;
  retrospective: string;
  createdAt: Timestamp;
}

export const EXPERIMENT_STATUSES = ["planned", "running", "concluded"] as const;
export type ExperimentStatus = (typeof EXPERIMENT_STATUSES)[number];
export const EXPERIMENT_OUTCOMES = ["supported", "refuted", "inconclusive"] as const;
export type ExperimentOutcome = (typeof EXPERIMENT_OUTCOMES)[number];

export interface Experiment {
  id: string;
  title: string;
  hypothesis: string;
  why: string;
  test: string;
  measure: string;
  result: string;
  learning: string;
  decision: string;
  status: ExperimentStatus;
  outcome?: ExperimentOutcome;
  projectId?: string;
  skills: SkillId[];
  createdAt: Timestamp;
  startedAt?: Timestamp;
  concludedAt?: Timestamp;
}

// ─── Decisions, opportunities, memory, reviews ────────────────────────

export interface Decision {
  id: string;
  date: LocalDate;
  decision: string;
  context: string;
  options: string;
  confidence: number;
  outcomeNote: string;
  projectId?: string;
  reviewedAt?: Timestamp;
}

export const OPPORTUNITY_STATUSES = ["Captured", "Investigating", "Validated", "Building", "Paused", "Rejected", "Commercialised"] as const;
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export interface Opportunity {
  id: string;
  title: string;
  problem: string;
  customer: string;
  solution: string;
  market: string;
  evidence: string;
  alternatives: string;
  model: string;
  risks: string;
  unknowns: string;
  validation: string;
  status: OpportunityStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const MEMORY_CATEGORIES = {
  goal: "Goals",
  context: "Context",
  preference: "Preferences",
  lesson: "Lessons",
  pattern: "Recurring patterns",
  commitment: "Commitments",
} as const;
export type MemoryCategory = keyof typeof MEMORY_CATEGORIES;

export interface MemoryItem {
  id: string;
  category: MemoryCategory;
  text: string;
  pinned: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WeeklyReview {
  /** Monday of the reviewed week. */
  weekStart: LocalDate;
  createdAt: Timestamp;
  moved: string;
  stalled: string;
  mistakes: string;
  opportunities: string;
  change: string;
  /** Next week's focus: at most three priorities. */
  focus: string[];
}

export interface MentorMessage {
  role: "user" | "assistant";
  content: string;
  at: Timestamp;
}

// Kept only so older backups round-trip; no longer shown in the UI.
export const FREEDOM_KEYS = ["financial", "time", "business", "skill", "decision"] as const;
export type FreedomKey = (typeof FREEDOM_KEYS)[number];
export type FreedomIndex = Record<FreedomKey, number> & { updatedAt?: Timestamp };

// ─── Root ─────────────────────────────────────────────────────────────

export interface AppState {
  schemaVersion: typeof SCHEMA_VERSION;
  settings: {
    theme: Theme;
    /** Used for the greeting on Today. */
    name: string;
    /** AI mentor model id. The API key is stored separately and never exported. */
    mentorModel: string;
  };
  currentDay: number;
  /** Keyed by local date. */
  days: Record<LocalDate, DayLog>;
  /** Keyed by curriculum day number. */
  sessions: Record<number, SessionRecord>;
  evidence: Evidence[];
  skills: Record<SkillId, SkillState>;
  projects: Project[];
  experiments: Experiment[];
  decisions: Decision[];
  opportunities: Opportunity[];
  memory: MemoryItem[];
  weeklyReviews: WeeklyReview[];
  mentor: { messages: MentorMessage[] };
  freedom: FreedomIndex;
}

export const DEFAULT_MENTOR_MODEL = "claude-opus-5";

export function defaultState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: { theme: "system", name: "", mentorModel: DEFAULT_MENTOR_MODEL },
    currentDay: 1,
    days: {},
    sessions: {},
    evidence: [],
    skills: {},
    projects: [],
    experiments: [],
    decisions: [],
    opportunities: [],
    memory: [],
    weeklyReviews: [],
    mentor: { messages: [] },
    freedom: { financial: 50, time: 50, business: 50, skill: 50, decision: 50 },
  };
}

export function emptySession(): SessionRecord {
  return { responses: {}, reflection: {} };
}

/** Thrown by actions when input breaks a business rule. The message is user-facing. */
export class DomainError extends Error {}
