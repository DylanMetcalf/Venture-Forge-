import type { CurriculumDay, FormatId, Phase, SkillId } from "./types";
import { PHASE1_MONTH1 } from "./days/phase1-month1";

export const PROGRAM_LENGTH = 365;

export const PHASES: Phase[] = [
  { id: 1, name: "Foundation", range: [1, 52], stage: "Operator",
    focus: "Personal responsibility, attention, discipline, self-management, business fundamentals, money, cash flow, basic finance, decision-making, thinking clearly, understanding value, understanding markets." },
  { id: 2, name: "Commercial Capability", range: [53, 104], stage: "Operator",
    focus: "Sales, customer psychology, marketing, positioning, pricing, negotiation, offers, customer discovery, market research, communication, persuasion, distribution." },
  { id: 3, name: "Builder", range: [105, 156], stage: "Builder",
    focus: "Product thinking, problem discovery, software, AI, automation, UX, MVPs, prototyping, testing, data, digital products, technical literacy." },
  { id: 4, name: "Operator", range: [157, 208], stage: "Systems Thinker",
    focus: "Operations, systems, SOPs, KPIs, project management, quality control, documentation, automation, delegation, process design, hiring fundamentals, infrastructure." },
  { id: 5, name: "Leader", range: [209, 260], stage: "Leader",
    focus: "Leadership, communication, management, feedback, conflict, hiring, culture, influence, negotiation, strategic communication, relationship building, networking." },
  { id: 6, name: "Owner", range: [261, 312], stage: "Owner",
    focus: "Ownership, recurring revenue, business models, unit economics, capital allocation, investment fundamentals, valuation, risk, governance, acquisitions, portfolio thinking, founder independence." },
  { id: 7, name: "Integration", range: [313, 365], stage: "Investor",
    focus: "Strategy, complex decisions, business building, capital allocation, leadership, systems, product, sales, technology, ownership, personal freedom, life design." },
];

export const SKILL_CATEGORIES: Record<string, SkillId[]> = {
  Business: ["business-models", "economics", "markets", "strategy", "positioning", "pricing", "competitive-analysis", "customer-research"],
  Sales: ["prospecting", "discovery", "questioning", "objections", "negotiation", "closing", "follow-up", "relationship-selling"],
  Marketing: ["messaging", "copywriting", "content", "distribution", "acquisition", "retention", "brand"],
  Finance: ["revenue", "costs", "gross-margin", "cash-flow", "pnl", "budgeting", "unit-economics", "forecasting", "valuation", "capital-allocation"],
  Operations: ["sops", "kpis", "process-design", "project-management", "documentation", "quality", "delegation", "automation"],
  Technology: ["ai", "software", "apis", "databases", "ux", "architecture", "data", "cybersecurity", "cloud"],
  Product: ["problem-discovery", "customer-interviews", "mvps", "experimentation", "product-market-fit", "prioritization"],
  Leadership: ["communication", "hiring", "management", "feedback", "conflict", "accountability", "culture"],
  Thinking: ["first-principles", "systems-thinking", "critical-thinking", "probability", "decision-theory", "mental-models", "second-order-effects"],
  "Human Behaviour": ["psychology", "behavioral-economics", "incentives", "cognitive-biases", "persuasion", "social-dynamics"],
  "Personal Capability": ["discipline", "focus", "consistency", "resilience", "self-awareness", "courage", "responsibility", "delayed-gratification", "reflection"],
  Network: ["networking", "relationships", "mentors", "partnerships", "reputation"],
  Ownership: ["recurring-revenue", "business-structures", "governance", "capital", "portfolio-thinking", "risk-management", "owner-independence"],
};

export const ALL_SKILLS: SkillId[] = Object.values(SKILL_CATEGORIES).flat();

/** Self-assessed levels. Index 0 is the default for every skill. */
export const SKILL_LEVELS = ["Unknown", "Aware", "Learning", "Practising", "Competent", "Reliable", "Advanced", "Can Teach", "Can Systemise"] as const;
export const MAX_SKILL_LEVEL = SKILL_LEVELS.length - 1;

const SKILL_LABEL_OVERRIDES: Record<SkillId, string> = {
  pnl: "P&L", ai: "AI", apis: "APIs", ux: "UX", sops: "SOPs", kpis: "KPIs", mvps: "MVPs",
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
export const DAYS: CurriculumDay[] = [...PHASE1_MONTH1];

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
