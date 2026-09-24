// Pure state transitions for settings, evidence, skills, decisions,
// opportunities, memory and the mentor transcript. Each takes the current state
// and returns a new one, or throws DomainError with a user-facing message.
import { ALL_SKILLS } from "../content/curriculum";
import type { SkillId } from "../content/types";
import {
  DomainError,
  EVIDENCE_KINDS,
  MAX_CONFIDENCE,
  MEMORY_CATEGORIES,
  OPPORTUNITY_STATUSES,
  type AppState,
  type EvidenceKind,
  type MemoryCategory,
  type MentorMessage,
  type Opportunity,
  type Theme,
} from "./types";
import { isBlank, localDate, newId } from "./util";

const KNOWN = new Set(ALL_SKILLS);
export const knownSkills = (xs: SkillId[]) => [...new Set(xs.filter((s) => KNOWN.has(s)))];

// ---- Settings ----

export function setTheme(state: AppState, theme: Theme): AppState {
  return { ...state, settings: { ...state.settings, theme } };
}

export function setName(state: AppState, name: string): AppState {
  return { ...state, settings: { ...state.settings, name: name.trim().slice(0, 60) } };
}

export function setMentorModel(state: AppState, model: string): AppState {
  if (isBlank(model)) throw new DomainError("Choose a model.");
  return { ...state, settings: { ...state.settings, mentorModel: model.trim() } };
}

// ---- Evidence ----

export function addManualEvidence(
  state: AppState,
  input: { title: string; note: string; kind: EvidenceKind; skills: SkillId[]; projectId?: string },
  now: Date,
): AppState {
  if (isBlank(input.title)) throw new DomainError("Give the evidence a title.");
  if (isBlank(input.note)) throw new DomainError("Describe what happened, specifically.");
  if (!(input.kind in EVIDENCE_KINDS) || input.kind === "session") throw new DomainError("Choose what kind of evidence this is.");
  return {
    ...state,
    evidence: [
      ...state.evidence,
      {
        id: newId(),
        createdAt: now.toISOString(),
        date: localDate(now),
        kind: input.kind,
        title: input.title.trim(),
        note: input.note.trim(),
        skills: knownSkills(input.skills),
        ...(input.projectId ? { projectId: input.projectId } : {}),
        source: { kind: "manual" },
      },
    ],
  };
}

export function deleteEvidence(state: AppState, id: string): AppState {
  const item = state.evidence.find((e) => e.id === id);
  if (item && item.source.kind !== "manual") {
    throw new DomainError("This evidence follows its session or experiment. Edit that instead.");
  }
  return { ...state, evidence: state.evidence.filter((e) => e.id !== id) };
}

// ---- Skills (self-rated confidence) ----

export function rateConfidence(state: AppState, skill: SkillId, level: number, note: string, now: Date): AppState {
  if (!KNOWN.has(skill)) throw new DomainError(`Unknown skill: ${skill}`);
  if (!Number.isInteger(level) || level < 0 || level > MAX_CONFIDENCE) throw new DomainError("Invalid confidence level.");
  const current = state.skills[skill] ?? { level: 0, history: [] };
  if (level === current.level) return state;
  if (level > current.level && isBlank(note)) {
    throw new DomainError("Say what you can point to that justifies more confidence.");
  }
  return {
    ...state,
    skills: {
      ...state.skills,
      [skill]: { level, history: [...current.history, { level, note: note.trim(), at: now.toISOString() }] },
    },
  };
}

// ---- Decisions ----

export function addDecision(
  state: AppState,
  input: { decision: string; context: string; options: string; confidence: number; projectId?: string },
  now: Date,
): AppState {
  if (isBlank(input.decision)) throw new DomainError("Describe the decision first.");
  const confidence = Math.round(input.confidence);
  if (!(confidence >= 1 && confidence <= 10)) throw new DomainError("Confidence must be between 1 and 10.");
  return {
    ...state,
    decisions: [
      ...state.decisions,
      {
        id: newId(), date: localDate(now), decision: input.decision.trim(), context: input.context.trim(),
        options: input.options.trim(), confidence, outcomeNote: "",
        ...(input.projectId ? { projectId: input.projectId } : {}),
      },
    ],
  };
}

export function reviewDecision(state: AppState, id: string, outcomeNote: string, now: Date): AppState {
  return {
    ...state,
    decisions: state.decisions.map((d) => {
      if (d.id !== id) return d;
      const { reviewedAt: _, ...rest } = d;
      return isBlank(outcomeNote) ? { ...rest, outcomeNote: "" } : { ...rest, outcomeNote: outcomeNote.trim(), reviewedAt: now.toISOString() };
    }),
  };
}

// ---- Opportunity Vault ----

export function addOpportunity(state: AppState, input: { title: string; problem?: string }, now: Date): AppState {
  if (isBlank(input.title)) throw new DomainError("Name the opportunity first.");
  const at = now.toISOString();
  const opp: Opportunity = {
    id: newId(), title: input.title.trim(), problem: input.problem?.trim() ?? "", customer: "", solution: "", market: "",
    evidence: "", alternatives: "", model: "", risks: "", unknowns: "", validation: "", status: "Captured", createdAt: at, updatedAt: at,
  };
  return { ...state, opportunities: [...state.opportunities, opp] };
}

export type OpportunityPatch = Partial<Omit<Opportunity, "id" | "createdAt" | "updatedAt">>;

export function updateOpportunity(state: AppState, id: string, patch: OpportunityPatch, now: Date): AppState {
  if (patch.status && !OPPORTUNITY_STATUSES.includes(patch.status)) throw new DomainError("Invalid status.");
  if (patch.title !== undefined && isBlank(patch.title)) throw new DomainError("An opportunity needs a name.");
  return {
    ...state,
    opportunities: state.opportunities.map((o) => (o.id === id ? { ...o, ...patch, updatedAt: now.toISOString() } : o)),
  };
}

export function deleteOpportunity(state: AppState, id: string): AppState {
  return { ...state, opportunities: state.opportunities.filter((o) => o.id !== id) };
}

// ---- Founder memory ----

export function addMemory(state: AppState, input: { category: MemoryCategory; text: string; pinned?: boolean }, now: Date): AppState {
  if (isBlank(input.text)) throw new DomainError("Write what should be remembered.");
  if (!(input.category in MEMORY_CATEGORIES)) throw new DomainError("Choose a category.");
  const at = now.toISOString();
  return {
    ...state,
    memory: [...state.memory, { id: newId(), category: input.category, text: input.text.trim(), pinned: !!input.pinned, createdAt: at, updatedAt: at }],
  };
}

export function updateMemory(state: AppState, id: string, patch: Partial<{ text: string; category: MemoryCategory; pinned: boolean }>, now: Date): AppState {
  if (patch.text !== undefined && isBlank(patch.text)) throw new DomainError("A memory can't be empty. Delete it instead.");
  return {
    ...state,
    memory: state.memory.map((m) => (m.id === id ? { ...m, ...patch, text: (patch.text ?? m.text).trim(), updatedAt: now.toISOString() } : m)),
  };
}

export function deleteMemory(state: AppState, id: string): AppState {
  return { ...state, memory: state.memory.filter((m) => m.id !== id) };
}

// ---- Mentor transcript ----

export const MENTOR_HISTORY_LIMIT = 100;

export function appendMentorMessages(state: AppState, messages: Omit<MentorMessage, "at">[], now: Date): AppState {
  const at = now.toISOString();
  const next = [...state.mentor.messages, ...messages.filter((m) => !isBlank(m.content)).map((m) => ({ ...m, at }))];
  return { ...state, mentor: { messages: next.slice(-MENTOR_HISTORY_LIMIT) } };
}

export function clearMentor(state: AppState): AppState {
  return { ...state, mentor: { messages: [] } };
}
