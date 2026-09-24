import { useState } from "react";
import { skillLabel } from "../content/curriculum";
import { useAction, useAppState, useStore } from "../app/context";
import { href, navigate } from "../app/router";
import { EditableText } from "../components/Editable";
import { SkillPicker } from "../components/pickers";
import { BackLink, Empty, TextArea, TextInput, formatDate } from "../components/ui";
import { addExperiment, addMilestone, addProject, projectActivity, removeMilestone, toggleMilestone, updateProject } from "../domain/projects";
import { PROJECT_STAGES, type Project, type ProjectStage } from "../domain/types";

export function ProjectsView({ param }: { param?: string }) {
  const state = useAppState();
  if (param) {
    const p = state.projects.find((x) => x.id === param);
    return p ? <ProjectDetail project={p} /> : <Empty>That project doesn't exist. <a href={href("projects")}>All projects</a></Empty>;
  }
  return <ProjectList />;
}

function ProjectList() {
  const state = useAppState();
  const [adding, setAdding] = useState(state.projects.length === 0);
  const order = (p: Project) => (["Done", "Abandoned"].includes(p.stage) ? 2 : p.stage === "Parked" ? 1 : 0);
  const projects = [...state.projects].sort((a, b) => order(a) - order(b) || b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="stack">
      <p className="muted" style={{ margin: 0 }}>
        Real businesses and products. Link sessions, experiments, decisions and evidence to a project and you can see what the
        learning actually did for it.
      </p>
      {adding ? <NewProject onDone={() => setAdding(false)} canCancel={state.projects.length > 0} /> : (
        <div><button className="btn" onClick={() => setAdding(true)}>+ New project</button></div>
      )}
      {projects.map((p) => {
        const act = projectActivity(state, p.id);
        const open = p.milestones.filter((m) => !m.done).length;
        return (
          <a key={p.id} className="card list-card" href={href("projects", p.id)}>
            <div className="between">
              <span className="faint tiny"><span className={`status-dot ${p.stage}`} />{p.stage}</span>
              <span className="faint tiny">{act.evidence.length} evidence · {act.experiments.length} experiments</span>
            </div>
            <h3 className="serif">{p.name}</h3>
            {p.objective && <div className="muted small">{p.objective}</div>}
            {(p.nextAction || open > 0) && (
              <div className="faint tiny" style={{ marginTop: 8 }}>
                {p.nextAction ? `Next: ${p.nextAction}` : `${open} open milestone${open === 1 ? "" : "s"}`}
              </div>
            )}
          </a>
        );
      })}
    </div>
  );
}

function NewProject({ onDone, canCancel }: { onDone: () => void; canCancel: boolean }) {
  const store = useStore();
  const run = useAction();
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("");
  const [why, setWhy] = useState("");
  return (
    <section className="card">
      <div className="eyebrow">New project</div>
      <TextInput label="Name" value={name} onChange={setName} placeholder="e.g. SiteGuard" />
      <TextInput label="Objective — what does success look like?" value={objective} onChange={setObjective} placeholder="e.g. 10 paying customers by March" />
      <TextArea label="Why does it matter?" value={why} onChange={setWhy} rows={2} />
      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn primary" onClick={() => {
          // Actions append, and the store updates synchronously, so the new project is last.
          if (run((s, now) => addProject(s, { name, objective, why }, now), "Project created.")) {
            onDone();
            navigate("projects", store.getState().projects.at(-1)!.id);
          }
        }}>Create project</button>
        {canCancel && <button className="btn ghost" onClick={onDone}>Cancel</button>}
      </div>
    </section>
  );
}

function ProjectDetail({ project: p }: { project: Project }) {
  const state = useAppState();
  const store = useStore();
  const run = useAction();
  const [milestone, setMilestone] = useState("");
  const act = projectActivity(state, p.id);
  const save = (patch: Parameters<typeof updateProject>[2]) => run((s) => updateProject(s, p.id, patch));
  const done = p.milestones.filter((m) => m.done).length;

  return (
    <div className="stack-lg">
      <div>
        <BackLink href={href("projects")}>Projects</BackLink>
        <div className="between">
          <div className="kicker faint tiny" style={{ textTransform: "uppercase", letterSpacing: ".06em" }}>Project</div>
          <select className="inline" aria-label="Stage" value={p.stage} onChange={(e) => save({ stage: e.target.value as ProjectStage })}>
            {PROJECT_STAGES.map((st) => <option key={st}>{st}</option>)}
          </select>
        </div>
        <h1 className="serif" style={{ fontSize: 34, lineHeight: 1.1, margin: "8px 0 6px" }}>{p.name}</h1>
        <div className="faint small">Started {formatDate(p.createdAt)}</div>
      </div>

      <section className="stack">
        <EditableText label="Objective" value={p.objective} onSave={(v) => save({ objective: v })} multiline={false} placeholder="What does success look like, measurably?" />
        <EditableText label="Why it matters" value={p.why} onSave={(v) => save({ why: v })} />
        <EditableText label="Next action" value={p.nextAction} onSave={(v) => save({ nextAction: v })} multiline={false} placeholder="The very next physical step" />
        <SkillPicker label="Skills this project develops" value={p.skills} onChange={(skills) => save({ skills })} />
      </section>

      <section>
        <div className="between">
          <h2 className="section-title">Milestones</h2>
          {p.milestones.length > 0 && <span className="faint tiny">{done} of {p.milestones.length} done</span>}
        </div>
        {p.milestones.map((m) => (
          <div key={m.id} className="between" style={{ alignItems: "center" }}>
            <label className={`check ${m.done ? "done" : ""}`} style={{ flex: 1 }}>
              <input type="checkbox" checked={m.done} onChange={() => run((s, now) => toggleMilestone(s, p.id, m.id, now))} />
              <span>{m.title}{m.doneAt && <span className="faint tiny"> · {formatDate(m.doneAt)}</span>}</span>
            </label>
            <button className="link-btn tiny" style={{ color: "var(--text-3)" }} aria-label={`Remove ${m.title}`} onClick={() => run((s) => removeMilestone(s, p.id, m.id))}>Remove</button>
          </div>
        ))}
        <form className="row" style={{ marginTop: 8, flexWrap: "nowrap" }} onSubmit={(e) => { e.preventDefault(); if (run((s) => addMilestone(s, p.id, milestone))) setMilestone(""); }}>
          <input type="text" aria-label="New milestone" value={milestone} placeholder="Add a milestone or task" onChange={(e) => setMilestone(e.target.value)} />
          <button className="btn sm" type="submit" disabled={!milestone.trim()}>Add</button>
        </form>
      </section>

      <section>
        <div className="between">
          <h2 className="section-title">Experiments</h2>
          <button className="link-btn small" onClick={() => {
            if (run((s, now) => addExperiment(s, { title: `Test for ${p.name}`, projectId: p.id }, now))) {
              navigate("experiments", store.getState().experiments.at(-1)!.id);
            }
          }}>+ New experiment</button>
        </div>
        {act.experiments.length === 0 ? <p className="faint small">None yet. What do you believe about this project that you haven't tested?</p> : act.experiments.map((x) => (
          <a key={x.id} className="item-row" href={href("experiments", x.id)}>
            <div><div className="item-title"><span className={`status-dot ${x.status}`} />{x.title}</div><div className="faint tiny">{x.status}{x.outcome ? ` · ${x.outcome}` : ""}</div></div>
          </a>
        ))}
      </section>

      <section>
        <h2 className="section-title">Evidence</h2>
        {act.evidence.length === 0 ? <p className="faint small">Nothing linked yet. Link sessions at close-out, or log evidence against this project.</p> : act.evidence.map((e) => (
          <div key={e.id} className="item-row"><div><div>{e.title}</div><div className="faint tiny">{formatDate(e.date)}</div></div></div>
        ))}
        {(act.sessions.length > 0 || act.decisions.length > 0) && (
          <div className="faint small" style={{ marginTop: 10 }}>
            {act.sessions.length > 0 && <>Sessions applied: {act.sessions.map((s) => <a key={s.day} href={href("session", s.day)} style={{ marginRight: 8 }}>Day {s.day}</a>)}</>}
            {act.decisions.length > 0 && <div>Decisions: {act.decisions.map((d) => d.decision).join(" · ")}</div>}
          </div>
        )}
        {p.skills.length > 0 && <div className="faint tiny" style={{ marginTop: 8 }}>Develops: {p.skills.map(skillLabel).join(", ")}</div>}
      </section>

      <section className="stack">
        <h2 className="section-title" style={{ marginBottom: 0 }}>Record</h2>
        <EditableText label="Problems" value={p.problems} onSave={(v) => save({ problems: v })} placeholder="What's blocking or hard right now" />
        <EditableText label="Results" value={p.results} onSave={(v) => save({ results: v })} placeholder="Numbers and outcomes so far" />
        <EditableText label="Lessons learned" value={p.lessons} onSave={(v) => save({ lessons: v })} />
        <EditableText label="Retrospective" value={p.retrospective} onSave={(v) => save({ retrospective: v })} rows={4}
          hint="Write this when the project ends or pauses: what worked, what didn't, what you'd do differently." />
      </section>
    </div>
  );
}
