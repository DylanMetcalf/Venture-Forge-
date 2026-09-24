import type { CurriculumDay, FormatId, Phase, PillarId, SkillId } from "./types";
import { FOUNDATION_MONTH1 } from "./days/foundation-month1";

export const PROGRAM_LENGTH = 365;

export const PHASES: Phase[] = [
  { id: 1, name: "Foundation", range: [1, 52],
    focus: "Self-command, seeing clearly, how businesses make money, how software works, listening and reading people, and deciding well under uncertainty." },
  { id: 2, name: "Commercial Edge", range: [53, 104],
    focus: "Selling, pricing, negotiation, persuasion, positioning and the financial literacy to know whether a deal is actually good." },
  { id: 3, name: "Builder", range: [105, 156],
    focus: "Shipping real software with AI: web apps, APIs, databases, agents, automation, testing, deployment and product judgement." },
  { id: 4, name: "Presence", range: [157, 208],
    focus: "High-stakes communication, status and power dynamics, conflict, storytelling and composure when the room is against you." },
  { id: 5, name: "Strategist", range: [209, 260],
    focus: "Strategy, competitive advantage, reading industries, capital allocation and second-order thinking on real decisions." },
  { id: 6, name: "Leader", range: [261, 312],
    focus: "Leverage through people and systems: hiring, delegation, feedback, management and turning yourself into a multiplier." },
  { id: 7, name: "Integration", range: [313, 365],
    focus: "Everything at once: complex deals, owning outcomes, capital, and designing the life the capability is for." },
];

export interface Pillar {
  id: PillarId;
  name: string;
  /** One line on what the pillar trains. */
  tagline: string;
}

export const PILLARS: Record<PillarId, Pillar> = {
  mind: { id: "mind", name: "Mind", tagline: "Self-command: attention, composure, discipline." },
  business: { id: "business", name: "Business", tagline: "How money, value and companies actually work." },
  build: { id: "build", name: "Build", tagline: "AI and software: making real things that run." },
  influence: { id: "influence", name: "Influence", tagline: "Reading people and rooms; moving them honestly." },
  judgement: { id: "judgement", name: "Judgement", tagline: "Thinking clearly and deciding well." },
  field: { id: "field", name: "Field", tagline: "Real-world missions and reviews that combine everything." },
};

export const SKILL_CATEGORIES: Record<string, SkillId[]> = {
  Mind: ["responsibility", "focus", "discipline", "composure", "emotional-regulation", "self-awareness", "resilience", "courage", "reflection"],
  Business: ["business-models", "value-creation", "markets", "positioning", "pricing", "customer-discovery", "strategy", "competitive-analysis"],
  Finance: ["financial-statements", "cash-flow", "unit-economics", "gross-margin", "capital-allocation", "valuation", "forecasting"],
  "Build · AI & Software": ["how-the-web-works", "programming", "git", "databases", "apis", "architecture", "debugging", "testing", "deployment", "ai-assisted-development", "prompting", "agents", "automation", "product-thinking"],
  Influence: ["listening", "questioning", "reading-people", "reading-rooms", "persuasion", "negotiation", "storytelling", "sales", "public-speaking", "conflict"],
  Judgement: ["first-principles", "decision-making", "probabilistic-thinking", "second-order-thinking", "systems-thinking", "mental-models", "cognitive-biases"],
  Leadership: ["communication", "delegation", "feedback", "hiring", "accountability", "management"],
};

export const ALL_SKILLS: SkillId[] = Object.values(SKILL_CATEGORIES).flat();

/** Self-assessed levels. Index 0 is the default for every skill. */
export const SKILL_LEVELS = ["Unknown", "Aware", "Learning", "Practising", "Competent", "Reliable", "Advanced", "Can Teach", "Can Systemise"] as const;
export const MAX_SKILL_LEVEL = SKILL_LEVELS.length - 1;

const SKILL_LABEL_OVERRIDES: Record<SkillId, string> = {
  apis: "APIs", git: "Git", "ai-assisted-development": "AI-Assisted Development", "how-the-web-works": "How the Web Works",
};
export function skillLabel(id: SkillId): string {
  return SKILL_LABEL_OVERRIDES[id] ?? id.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export const FORMATS: Record<FormatId, string> = {
  lesson: "Lesson", case_study: "Case Study", scenario: "Scenario", simulation: "Simulation",
  financial_exercise: "Financial Exercise", sales_challenge: "Sales Challenge", roleplay: "Roleplay",
  writing_exercise: "Writing Exercise", technical_challenge: "Technical Challenge", research: "Research",
  field_mission: "Field Mission", decision_exercise: "Decision Exercise", reflection: "Reflection",
  teardown: "Teardown", weekly_review: "Founder Review", monthly_review: "Monthly Capability Review",
};

export function isReviewFormat(format: FormatId): boolean {
  return format === "weekly_review" || format === "monthly_review";
}

/**
 * Every authored day, in order. To publish more of the programme, add a new
 * file under ./days and append it here; nothing else needs to change.
 */
export const DAYS: CurriculumDay[] = [...FOUNDATION_MONTH1];

const DAY_INDEX = new Map(DAYS.map((d) => [d.day, d]));

export function getDay(day: number): CurriculumDay | undefined {
  return DAY_INDEX.get(day);
}
export function isAuthored(day: number): boolean {
  return DAY_INDEX.has(day);
}
/** Highest authored day. Days are contiguous from 1 (enforced by tests). */
export const LAST_AUTHORED_DAY = DAYS.length === 0 ? 0 : Math.max(...DAYS.map((d) => d.day));

export function phaseForDay(day: number): Phase {
  return PHASES.find((p) => day >= p.range[0] && day <= p.range[1]) ?? PHASES[PHASES.length - 1]!;
}
export function weekForDay(day: number): number {
  return Math.ceil(day / 7);
}
