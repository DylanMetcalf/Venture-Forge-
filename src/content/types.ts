// Curriculum content types. Content is data: the UI renders it and never
// hard-codes lesson text. Adding, reordering or replacing days means editing
// data files in src/content, not components.

export type FormatId =
  | "lesson"
  | "case_study"
  | "scenario"
  | "simulation"
  | "financial_exercise"
  | "sales_challenge"
  | "roleplay"
  | "writing_exercise"
  | "technical_challenge"
  | "research"
  | "field_mission"
  | "decision_exercise"
  | "reflection"
  | "teardown"
  | "weekly_review"
  | "monthly_review";

export type SkillId = string;

/**
 * The five capabilities the programme trains, interleaved through every week,
 * plus "field" days (real-world missions and reviews that combine them).
 */
export type PillarId = "mind" | "business" | "build" | "influence" | "judgement" | "field";

export interface Resource {
  type: "book" | "article" | "video" | "tool";
  title: string;
  author?: string;
  note?: string;
}

export interface CurriculumDay {
  day: number;
  format: FormatId;
  pillar: PillarId;
  theme: string;
  /** Today's objective: what you'll be able to do after this session. */
  capability: string;
  /** Honest estimate of focused time, in minutes. */
  minutes: number;
  /** What "done" actually means. Shown before you start and checked at close-out. */
  doneWhen: string;
  why: string;
  learn: string | null;
  think: string | null;
  act: string | null;
  build: string | null;
  skills: SkillId[];
  resource: Resource | null;
}

export interface Phase {
  id: number;
  name: string;
  range: [number, number];
  focus: string;
}

export interface LibraryEntry {
  id: string;
  term: string;
  short: string;
  medium: string;
  application: string;
  mistakes: string;
  /** Library entry ids or skill ids. Only resolvable library ids become links. */
  related: string[];
}
