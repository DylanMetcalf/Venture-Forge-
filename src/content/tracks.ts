// Capability tracks: the long-term curriculum architecture.
//
// Tracks are interconnected, not sequential courses. Each belongs to one of the
// five daily pillars, owns a set of skills, and lays out modules from foundation
// to advanced. Daily sessions (src/content/days) exercise skills; a module's
// progress is derived from the evidence recorded against its skills, and the
// adaptive engine revisits modules rather than assuming one session = mastery.
import type { PillarId, SkillId } from "./types";

export type ModuleLevel = "foundation" | "core" | "advanced";

export interface TrackModule {
  id: string;
  title: string;
  level: ModuleLevel;
  skills: SkillId[];
}

export interface Track {
  id: string;
  name: string;
  pillar: PillarId;
  summary: string;
  skills: SkillId[];
  modules: TrackModule[];
  /** Words in check-ins or captured context that make this track relevant today. */
  keywords: string[];
}

const m = (id: string, title: string, level: ModuleLevel, skills: SkillId[]): TrackModule => ({ id, title, level, skills });

export const TRACKS: Track[] = [
  {
    id: "psychology", name: "Founder Psychology", pillar: "mind",
    summary: "Self-command under pressure: attention, composure, discipline and honest self-assessment.",
    skills: ["responsibility", "focus", "discipline", "habits", "composure", "emotional-regulation", "self-awareness", "resilience", "courage", "reflection"],
    modules: [
      m("ownership", "Ownership and self-trust", "foundation", ["responsibility", "self-awareness"]),
      m("attention", "Attention and deep work", "foundation", ["focus", "discipline"]),
      m("habits", "Habits and environment design", "core", ["habits", "discipline"]),
      m("composure", "Composure under pressure", "core", ["composure", "emotional-regulation"]),
      m("resilience", "Resilience and courage", "advanced", ["resilience", "courage"]),
    ],
    keywords: ["stress", "anxious", "tired", "focus", "procrastinat", "distract", "motivation", "overwhelm", "discipline", "habit", "burnout", "nervous"],
  },
  {
    id: "business", name: "Business Mastery", pillar: "business",
    summary: "How businesses create value, make money, operate and scale.",
    skills: ["business-models", "value-creation", "markets", "operations", "process-design", "scaling"],
    modules: [
      m("models", "Business models and value exchange", "foundation", ["business-models", "value-creation"]),
      m("markets", "Markets and customers", "foundation", ["markets"]),
      m("operations", "Operations and systems", "core", ["operations", "process-design"]),
      m("scaling", "Scaling without breaking", "advanced", ["scaling", "process-design"]),
    ],
    keywords: ["business", "operations", "process", "system", "scale", "margin", "company", "workflow"],
  },
  {
    id: "finance", name: "Finance", pillar: "business",
    summary: "Reading and running the numbers: P&L, cash, margins, pricing, capital.",
    skills: ["financial-statements", "cash-flow", "gross-margin", "unit-economics", "pricing", "forecasting", "capital-allocation", "valuation"],
    modules: [
      m("statements", "Revenue, profit and cash", "foundation", ["financial-statements", "cash-flow"]),
      m("unit", "Margins and unit economics", "core", ["gross-margin", "unit-economics"]),
      m("pricing", "Pricing", "core", ["pricing"]),
      m("forecast", "Forecasting and cash planning", "core", ["forecasting", "cash-flow"]),
      m("capital", "Capital allocation and valuation", "advanced", ["capital-allocation", "valuation"]),
    ],
    keywords: ["price", "pricing", "cash", "money", "revenue", "profit", "cost", "budget", "invoice", "finance", "investment", "valuation", "funding"],
  },
  {
    id: "sales", name: "Sales", pillar: "influence",
    summary: "Finding buyers, understanding them, and closing honest deals.",
    skills: ["prospecting", "customer-discovery", "qualification", "offers", "objections", "negotiation", "closing", "sales"],
    modules: [
      m("discovery", "Discovery conversations", "foundation", ["customer-discovery", "qualification"]),
      m("prospecting", "Prospecting and outreach", "foundation", ["prospecting"]),
      m("offers", "Offers and objections", "core", ["offers", "objections"]),
      m("negotiation", "Negotiation", "core", ["negotiation"]),
      m("closing", "Closing and retention", "advanced", ["closing", "sales"]),
    ],
    keywords: ["sale", "sell", "customer", "client", "prospect", "lead", "deal", "close", "pitch", "outreach", "negotiat", "quote", "proposal"],
  },
  {
    id: "marketing", name: "Marketing", pillar: "influence",
    summary: "Positioning, distribution and the psychology of why people buy.",
    skills: ["positioning", "branding", "content", "distribution", "acquisition", "customer-psychology", "funnels"],
    modules: [
      m("positioning", "Positioning", "foundation", ["positioning"]),
      m("psychology", "Customer psychology", "foundation", ["customer-psychology"]),
      m("content", "Content and brand", "core", ["content", "branding"]),
      m("distribution", "Distribution and acquisition", "core", ["distribution", "acquisition"]),
      m("funnels", "Funnels and conversion", "advanced", ["funnels", "acquisition"]),
    ],
    keywords: ["marketing", "brand", "content", "audience", "ads", "social", "post", "traffic", "landing page", "growth", "signup", "launch"],
  },
  {
    id: "communication", name: "Communication", pillar: "influence",
    summary: "Listening, asking, reading people and rooms, persuading and presenting.",
    skills: ["listening", "questioning", "reading-people", "reading-rooms", "persuasion", "storytelling", "public-speaking", "conflict"],
    modules: [
      m("listening", "Listening and questions", "foundation", ["listening", "questioning"]),
      m("reading", "Reading people and rooms", "core", ["reading-people", "reading-rooms"]),
      m("persuasion", "Persuasion and storytelling", "core", ["persuasion", "storytelling"]),
      m("presence", "Presenting and hard conversations", "advanced", ["public-speaking", "conflict"]),
    ],
    keywords: ["meeting", "presentation", "present", "talk", "conversation", "conflict", "persuade", "speak", "pitch", "email", "argument"],
  },
  {
    id: "leadership", name: "Leadership", pillar: "influence",
    summary: "Multiplying yourself through people: hiring, delegation, feedback, accountability.",
    skills: ["communication", "delegation", "feedback", "hiring", "accountability", "management", "culture"],
    modules: [
      m("delegation", "Delegation", "foundation", ["delegation", "communication"]),
      m("feedback", "Feedback and accountability", "core", ["feedback", "accountability"]),
      m("hiring", "Hiring", "core", ["hiring"]),
      m("management", "Management and culture", "advanced", ["management", "culture"]),
    ],
    keywords: ["team", "hire", "hiring", "delegate", "staff", "employee", "manage", "feedback", "contractor", "freelancer"],
  },
  {
    id: "product", name: "Product", pillar: "build",
    summary: "Finding real problems and shaping products people keep using.",
    skills: ["problem-discovery", "validation", "product-thinking", "ux", "mvps", "product-market-fit", "retention"],
    modules: [
      m("problems", "Problem discovery", "foundation", ["problem-discovery", "validation"]),
      m("mvp", "MVPs and scoping", "core", ["mvps", "product-thinking"]),
      m("ux", "UX fundamentals", "core", ["ux"]),
      m("pmf", "Product-market fit and retention", "advanced", ["product-market-fit", "retention"]),
    ],
    keywords: ["product", "feature", "mvp", "user", "ux", "design", "validate", "prototype", "roadmap", "feedback", "retention", "saas"],
  },
  {
    id: "software", name: "Software", pillar: "build",
    summary: "Building, shipping and securing real software.",
    skills: ["how-the-web-works", "programming", "git", "frontend", "backend", "apis", "databases", "architecture", "testing", "debugging", "deployment", "security"],
    modules: [
      m("web", "How the web works", "foundation", ["how-the-web-works"]),
      m("tools", "Git and programming fundamentals", "foundation", ["git", "programming"]),
      m("frontend", "Frontend", "core", ["frontend"]),
      m("backend", "Backends, APIs and data", "core", ["backend", "apis", "databases"]),
      m("quality", "Testing and debugging", "core", ["testing", "debugging"]),
      m("ship", "Architecture, deployment and security", "advanced", ["architecture", "deployment", "security"]),
    ],
    keywords: ["code", "coding", "bug", "deploy", "app", "api", "database", "frontend", "backend", "react", "server", "github", "build", "software", "website"],
  },
  {
    id: "ai", name: "AI", pillar: "build",
    summary: "Using and building with AI: prompting, agents, RAG, automation and evaluation.",
    skills: ["llm-fundamentals", "ai-assisted-development", "prompting", "agents", "rag", "automation", "ai-product-design", "evaluation"],
    modules: [
      m("llms", "How LLMs work", "foundation", ["llm-fundamentals"]),
      m("ai-dev", "AI-assisted development", "foundation", ["ai-assisted-development", "prompting"]),
      m("automation", "Automation and workflows", "core", ["automation"]),
      m("agents", "Agents and RAG", "core", ["agents", "rag"]),
      m("ai-product", "AI product design and evaluation", "advanced", ["ai-product-design", "evaluation"]),
    ],
    keywords: ["ai", "claude", "gpt", "llm", "prompt", "agent", "automat", "rag", "model", "chatbot"],
  },
  {
    id: "strategy", name: "Strategy", pillar: "judgement",
    summary: "Choosing where to play and how to win: competition, moats, leverage, optionality.",
    skills: ["strategy", "competitive-analysis", "market-selection", "moats", "leverage", "optionality"],
    modules: [
      m("competition", "Competitive analysis", "foundation", ["competitive-analysis"]),
      m("markets", "Market selection", "core", ["market-selection"]),
      m("moats", "Moats and leverage", "core", ["moats", "leverage"]),
      m("options", "Strategic thinking and optionality", "advanced", ["strategy", "optionality"]),
    ],
    keywords: ["competitor", "competition", "strategy", "market", "niche", "moat", "position", "opportunity", "direction", "pivot"],
  },
  {
    id: "decisions", name: "Decision Making", pillar: "judgement",
    summary: "Thinking clearly: first principles, probabilities, second-order effects, biases.",
    skills: ["first-principles", "decision-making", "probabilistic-thinking", "second-order-thinking", "systems-thinking", "mental-models", "cognitive-biases"],
    modules: [
      m("decisions", "Decision quality", "foundation", ["decision-making"]),
      m("first-principles", "First principles", "foundation", ["first-principles"]),
      m("probability", "Probabilistic thinking and calibration", "core", ["probabilistic-thinking"]),
      m("systems", "Systems and second-order thinking", "core", ["second-order-thinking", "systems-thinking"]),
      m("biases", "Biases and mental models", "advanced", ["cognitive-biases", "mental-models"]),
    ],
    keywords: ["decide", "decision", "choose", "option", "uncertain", "risk", "unsure", "tradeoff", "bet"],
  },
];

export const TRACK_BY_ID = new Map(TRACKS.map((t) => [t.id, t]));

const SKILL_TRACK = new Map<SkillId, Track>();
for (const t of TRACKS) for (const s of t.skills) SKILL_TRACK.set(s, t);

export function trackForSkill(skill: SkillId): Track | undefined {
  return SKILL_TRACK.get(skill);
}
