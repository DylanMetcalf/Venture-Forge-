// Projects (real work the learning applies to) and experiments (operating
// through evidence rather than assumptions).
import { getDay } from "../content/curriculum";
import { knownSkills } from "./actions";
import {
  DomainError,
  EXPERIMENT_OUTCOMES,
  PROJECT_STAGES,
  type AppState,
  type Evidence,
  type Experiment,
  type ExperimentOutcome,
  type Project,
} from "./types";
import { isBlank, localDate, newId } from "./util";

// ---- Projects ----

export function addProject(state: AppState, input: { name: string; objective?: string; why?: string; nextAction?: string }, now: Date): AppState {
  if (isBlank(input.name)) throw new DomainError("Name the project first.");
  const project: Project = {
    id: newId(), name: input.name.trim(), objective: input.objective?.trim() ?? "", why: input.why?.trim() ?? "",
    nextAction: input.nextAction?.trim() ?? "", stage: "Active", skills: [], milestones: [],
    problems: "", lessons: "", results: "", retrospective: "", createdAt: now.toISOString(),
  };
  return { ...state, projects: [...state.projects, project] };
}

export type ProjectPatch = Partial<Omit<Project, "id" | "createdAt" | "milestones">>;

export function updateProject(state: AppState, id: string, patch: ProjectPatch): AppState {
  if (patch.stage && !PROJECT_STAGES.includes(patch.stage)) throw new DomainError("Invalid stage.");
  if (patch.name !== undefined && isBlank(patch.name)) throw new DomainError("A project needs a name.");
  const clean = patch.skills ? { ...patch, skills: knownSkills(patch.skills) } : patch;
  return { ...state, projects: state.projects.map((p) => (p.id === id ? { ...p, ...clean } : p)) };
}

function withProject(state: AppState, id: string, fn: (p: Project) => Project): AppState {
  if (!state.projects.some((p) => p.id === id)) throw new DomainError("Project not found.");
  return { ...state, projects: state.projects.map((p) => (p.id === id ? fn(p) : p)) };
}

export function addMilestone(state: AppState, projectId: string, title: string): AppState {
  if (isBlank(title)) throw new DomainError("Describe the milestone.");
  return withProject(state, projectId, (p) => ({ ...p, milestones: [...p.milestones, { id: newId(), title: title.trim(), done: false }] }));
}

export function toggleMilestone(state: AppState, projectId: string, milestoneId: string, now: Date): AppState {
  return withProject(state, projectId, (p) => ({
    ...p,
    milestones: p.milestones.map((m) => {
      if (m.id !== milestoneId) return m;
      if (m.done) return { id: m.id, title: m.title, done: false };
      return { ...m, done: true, doneAt: now.toISOString() };
    }),
  }));
}

export function removeMilestone(state: AppState, projectId: string, milestoneId: string): AppState {
  return withProject(state, projectId, (p) => ({ ...p, milestones: p.milestones.filter((m) => m.id !== milestoneId) }));
}

/** Everything linked to a project, for its detail page and the mentor's context. */
export function projectActivity(state: AppState, projectId: string) {
  return {
    evidence: state.evidence.filter((e) => e.projectId === projectId),
    experiments: state.experiments.filter((x) => x.projectId === projectId),
    decisions: state.decisions.filter((d) => d.projectId === projectId),
    sessions: Object.entries(state.sessions)
      .filter(([, r]) => r.projectId === projectId)
      .map(([d]) => ({ day: Number(d), theme: getDay(Number(d))?.theme ?? `Day ${d}` })),
  };
}

// ---- Experiments ----

export function addExperiment(state: AppState, input: { title: string; hypothesis?: string; projectId?: string }, now: Date): AppState {
  if (isBlank(input.title)) throw new DomainError("Name the experiment first.");
  const x: Experiment = {
    id: newId(), title: input.title.trim(), hypothesis: input.hypothesis?.trim() ?? "", why: "", test: "", measure: "",
    result: "", learning: "", decision: "", status: "planned", skills: [], createdAt: now.toISOString(),
    ...(input.projectId ? { projectId: input.projectId } : {}),
  };
  return { ...state, experiments: [...state.experiments, x] };
}

export type ExperimentPatch = Partial<Pick<Experiment, "title" | "hypothesis" | "why" | "test" | "measure" | "result" | "learning" | "decision" | "skills">> & {
  projectId?: string | null;
};

export function updateExperiment(state: AppState, id: string, patch: ExperimentPatch, now: Date): AppState {
  if (patch.title !== undefined && isBlank(patch.title)) throw new DomainError("An experiment needs a name.");
  const next = structuredClone(state);
  const x = next.experiments.find((e) => e.id === id);
  if (!x) throw new DomainError("Experiment not found.");
  const { projectId, skills, ...rest } = patch;
  Object.assign(x, rest);
  if (skills) x.skills = knownSkills(skills);
  if (projectId === null) delete x.projectId;
  else if (projectId !== undefined) x.projectId = projectId;
  if (x.status === "concluded") syncExperimentEvidence(next, x, now);
  return next;
}

/** A test can start only once it's defined well enough to be judged. */
export function startBlockers(x: Experiment): string[] {
  const missing: string[] = [];
  if (isBlank(x.hypothesis)) missing.push("a hypothesis");
  if (isBlank(x.test)) missing.push("what you'll do to test it");
  if (isBlank(x.measure)) missing.push("how you'll measure success");
  return missing.length ? [`Define ${missing.join(", ")} before starting.`] : [];
}

export function startExperiment(state: AppState, id: string, now: Date): AppState {
  const x = state.experiments.find((e) => e.id === id);
  if (!x) throw new DomainError("Experiment not found.");
  const blockers = startBlockers(x);
  if (blockers.length) throw new DomainError(blockers[0]!);
  return { ...state, experiments: state.experiments.map((e) => (e.id === id ? { ...e, status: "running", startedAt: e.startedAt ?? now.toISOString() } : e)) };
}

/** Concluding requires a result and a decision: that's what makes it evidence, not a to-do. */
export function concludeExperiment(state: AppState, id: string, outcome: ExperimentOutcome, now: Date): AppState {
  if (!EXPERIMENT_OUTCOMES.includes(outcome)) throw new DomainError("Invalid outcome.");
  const x = state.experiments.find((e) => e.id === id);
  if (!x) throw new DomainError("Experiment not found.");
  if (x.status !== "running") throw new DomainError("Start the experiment before concluding it.");
  if (isBlank(x.result)) throw new DomainError("Record what actually happened first.");
  if (isBlank(x.decision)) throw new DomainError("Decide what happens next before concluding.");
  const next = structuredClone(state);
  const nx = next.experiments.find((e) => e.id === id)!;
  nx.status = "concluded";
  nx.outcome = outcome;
  nx.concludedAt = now.toISOString();
  syncExperimentEvidence(next, nx, now);
  return next;
}

export function deleteExperiment(state: AppState, id: string): AppState {
  return {
    ...state,
    experiments: state.experiments.filter((x) => x.id !== id),
    evidence: state.evidence.filter((e) => !(e.source.kind === "experiment" && e.source.experimentId === id)),
  };
}

function syncExperimentEvidence(state: AppState, x: Experiment, now: Date): void {
  const idx = state.evidence.findIndex((e) => e.source.kind === "experiment" && e.source.experimentId === x.id);
  const prev = idx >= 0 ? state.evidence[idx] : undefined;
  const item: Evidence = {
    id: prev?.id ?? newId(),
    createdAt: prev?.createdAt ?? now.toISOString(),
    date: prev?.date ?? localDate(now),
    kind: "experiment",
    title: `Experiment: ${x.title} (${x.outcome ?? "concluded"})`,
    note: [x.result && `Result: ${x.result}`, x.learning && `Learning: ${x.learning}`, x.decision && `Decision: ${x.decision}`].filter(Boolean).join("\n"),
    skills: [...x.skills],
    source: { kind: "experiment", experimentId: x.id },
  };
  if (x.projectId) item.projectId = x.projectId;
  if (idx >= 0) state.evidence[idx] = item;
  else state.evidence.push(item);
}
