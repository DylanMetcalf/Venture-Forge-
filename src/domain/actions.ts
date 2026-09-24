// Pure state transitions for everything outside the daily session.
// Each takes the current state and returns a new one, or throws DomainError.
import { ALL_SKILLS, MAX_SKILL_LEVEL } from "../content/curriculum";
import type { SkillId } from "../content/types";
import {
  DomainError,
  FREEDOM_KEYS,
  IDEA_STAGES,
  PROJECT_STAGES,
  type AppState,
  type FreedomKey,
  type IdeaStage,
  type ProjectStage,
  type Theme,
} from "./types";
import { isBlank, localDate, newId } from "./util";

export function setTheme(state: AppState, theme: Theme): AppState {
  return { ...state, settings: { ...state.settings, theme } };
}

export function setName(state: AppState, name: string): AppState {
  return { ...state, settings: { ...state.settings, name: name.trim().slice(0, 60) } };
}

// ---- Evidence ----

export function addManualEvidence(
  state: AppState,
  input: { title: string; note: string; skills: SkillId[]; projectId?: string },
  now: Date,
): AppState {
  if (isBlank(input.title)) throw new DomainError("Give the evidence a title.");
  if (isBlank(input.note)) throw new DomainError("Describe what happened, specifically.");
  const known = new Set(ALL_SKILLS);
  return {
    ...state,
    evidence: [
      ...state.evidence,
      {
        id: newId(),
        createdAt: now.toISOString(),
        date: localDate(now),
        title: input.title.trim(),
        note: input.note.trim(),
        skills: input.skills.filter((s) => known.has(s)),
        projectId: input.projectId || undefined,
        source: { kind: "manual" },
      },
    ],
  };
}

export function deleteEvidence(state: AppState, id: string): AppState {
  const item = state.evidence.find((e) => e.id === id);
  if (item?.source.kind === "session") {
    throw new DomainError("Session evidence follows the session. Edit the session's work instead.");
  }
  return { ...state, evidence: state.evidence.filter((e) => e.id !== id) };
}

// ---- Skills ----

/**
 * Self-assessment. Raising a level requires a note saying what you can point
 * to; every change is kept in the skill's history.
 */
export function assessSkill(state: AppState, skill: SkillId, level: number, note: string, now: Date): AppState {
  if (!ALL_SKILLS.includes(skill)) throw new DomainError(`Unknown skill: ${skill}`);
  if (!Number.isInteger(level) || level < 0 || level > MAX_SKILL_LEVEL) throw new DomainError("Invalid level.");
  const current = state.skills[skill] ?? { level: 0, history: [] };
  if (level === current.level) return state;
  if (level > current.level && isBlank(note)) {
    throw new DomainError("Say what you can point to that justifies the higher level.");
  }
  return {
    ...state,
    skills: {
      ...state.skills,
      [skill]: { level, history: [...current.history, { level, note: note.trim(), at: now.toISOString() }] },
    },
  };
}

// ---- Projects ----

export function addProject(state: AppState, input: { name: string; why: string; nextAction: string }, now: Date): AppState {
  if (isBlank(input.name)) throw new DomainError("Name the project first.");
  return {
    ...state,
    projects: [
      ...state.projects,
      { id: newId(), name: input.name.trim(), why: input.why.trim(), nextAction: input.nextAction.trim(), stage: "Active", createdAt: now.toISOString() },
    ],
  };
}

export function updateProject(
  state: AppState,
  id: string,
  patch: Partial<{ name: string; why: string; nextAction: string; stage: ProjectStage }>,
): AppState {
  if (patch.stage && !PROJECT_STAGES.includes(patch.stage)) throw new DomainError("Invalid stage.");
  if (patch.name !== undefined && isBlank(patch.name)) throw new DomainError("A project needs a name.");
  return { ...state, projects: state.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) };
}

// ---- Decisions ----

export function addDecision(
  state: AppState,
  input: { decision: string; context: string; options: string; confidence: number },
  now: Date,
): AppState {
  if (isBlank(input.decision)) throw new DomainError("Describe the decision first.");
  const confidence = Math.round(input.confidence);
  if (!(confidence >= 1 && confidence <= 10)) throw new DomainError("Confidence must be between 1 and 10.");
  return {
    ...state,
    decisions: [
      ...state.decisions,
      { id: newId(), date: localDate(now), decision: input.decision.trim(), context: input.context.trim(), options: input.options.trim(), confidence, outcomeNote: "" },
    ],
  };
}

export function reviewDecision(state: AppState, id: string, outcomeNote: string, now: Date): AppState {
  return {
    ...state,
    decisions: state.decisions.map((d) =>
      d.id === id ? { ...d, outcomeNote: outcomeNote.trim(), reviewedAt: isBlank(outcomeNote) ? undefined : now.toISOString() } : d,
    ),
  };
}

// ---- Ideas ----

export function addIdea(state: AppState, input: { name: string; problem: string }, now: Date): AppState {
  if (isBlank(input.name)) throw new DomainError("Name the idea first.");
  return {
    ...state,
    ideas: [...state.ideas, { id: newId(), date: localDate(now), name: input.name.trim(), problem: input.problem.trim(), stage: "Parked" }],
  };
}

export function setIdeaStage(state: AppState, id: string, stage: IdeaStage): AppState {
  if (!IDEA_STAGES.includes(stage)) throw new DomainError("Invalid stage.");
  return { ...state, ideas: state.ideas.map((i) => (i.id === id ? { ...i, stage } : i)) };
}

// ---- Freedom Index ----

export function setFreedom(state: AppState, key: FreedomKey, value: number, now: Date): AppState {
  if (!FREEDOM_KEYS.includes(key)) throw new DomainError("Invalid dimension.");
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return { ...state, freedom: { ...state.freedom, [key]: v, updatedAt: now.toISOString() } };
}
