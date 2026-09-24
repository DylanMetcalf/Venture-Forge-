import type { SkillId } from "../content/types";

export const SCHEMA_VERSION = 2;

/** Local calendar date, YYYY-MM-DD. */
export type LocalDate = string;
/** ISO-8601 timestamp. */
export type Timestamp = string;

export type Theme = "system" | "light" | "dark";

export interface SessionRecord {
  startedAt?: Timestamp;
  /** The morning promise: one thing you will definitely do today. */
  commitment?: string;
  commitmentKept?: boolean;
  /** The actual work, answering the day's Think / Act / Build prompts. */
  responses: { think?: string; act?: string; build?: string };
  reflection: { learned?: string; avoided?: string };
  /** The real project this session was applied to, if any. */
  projectId?: string;
  closedAt?: Timestamp;
  /** Local calendar date the session was closed (drives streaks). */
  closedOn?: LocalDate;
}

/**
 * consumed     = closed, but without recorded work (read and reflected only).
 * demonstrated = closed with recorded work in Act or Build.
 */
export type SessionStatus = "not_started" | "in_progress" | "consumed" | "demonstrated";

export type EvidenceSource = { kind: "session"; day: number } | { kind: "manual" };

export interface Evidence {
  id: string;
  createdAt: Timestamp;
  date: LocalDate;
  title: string;
  note: string;
  skills: SkillId[];
  projectId?: string;
  source: EvidenceSource;
}

export interface SkillAssessment {
  level: number;
  note: string;
  at: Timestamp;
}
export interface SkillState {
  level: number;
  history: SkillAssessment[];
}

export const PROJECT_STAGES = ["Active", "Researching", "Validating", "Building", "Live", "Parked", "Abandoned"] as const;
export type ProjectStage = (typeof PROJECT_STAGES)[number];

export interface Project {
  id: string;
  name: string;
  why: string;
  nextAction: string;
  stage: ProjectStage;
  createdAt: Timestamp;
}

export interface Decision {
  id: string;
  date: LocalDate;
  decision: string;
  context: string;
  options: string;
  confidence: number;
  outcomeNote: string;
  reviewedAt?: Timestamp;
}

export const IDEA_STAGES = ["Parked", "Researching", "Validating", "Building", "Live", "Abandoned"] as const;
export type IdeaStage = (typeof IDEA_STAGES)[number];

export interface Idea {
  id: string;
  date: LocalDate;
  name: string;
  problem: string;
  stage: IdeaStage;
}

export const FREEDOM_KEYS = ["financial", "time", "business", "skill", "decision"] as const;
export type FreedomKey = (typeof FREEDOM_KEYS)[number];
export type FreedomIndex = Record<FreedomKey, number> & { updatedAt?: Timestamp };

export interface AppState {
  schemaVersion: typeof SCHEMA_VERSION;
  settings: { theme: Theme };
  currentDay: number;
  /** Keyed by curriculum day number. */
  sessions: Record<number, SessionRecord>;
  evidence: Evidence[];
  skills: Record<SkillId, SkillState>;
  projects: Project[];
  decisions: Decision[];
  ideas: Idea[];
  freedom: FreedomIndex;
}

export function defaultState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: { theme: "system" },
    currentDay: 1,
    sessions: {},
    evidence: [],
    skills: {},
    projects: [],
    decisions: [],
    ideas: [],
    freedom: { financial: 50, time: 50, business: 50, skill: 50, decision: 50 },
  };
}

export function emptySession(): SessionRecord {
  return { responses: {}, reflection: {} };
}

/** Thrown by actions when input breaks a business rule. The message is user-facing. */
export class DomainError extends Error {}
