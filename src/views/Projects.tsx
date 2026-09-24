import { useState } from "react";
import { useAction, useAppState } from "../app/context";
import { href } from "../app/router";
import { Empty, TextArea, TextInput } from "../components/ui";
import { addProject, updateProject } from "../domain/actions";
import { PROJECT_STAGES, type Project, type ProjectStage } from "../domain/types";

export function ProjectsView() {
  const state = useAppState();
  const [adding, setAdding] = useState(state.projects.length === 0);

  return (
    <div className="stack">
      <p className="muted small" style={{ margin: 0 }}>
        The real ventures your learning applies to. Link sessions and evidence to a project and you can see what the
        training has actually done for it.
      </p>
      {adding ? <NewProject onDone={() => setAdding(false)} canCancel={state.projects.length > 0} /> : (
        <button className="btn" onClick={() => setAdding(true)}>+ New project</button>
      )}
      {state.projects.length === 0 && !adding && <Empty>No projects yet.</Empty>}
      {[...state.projects].reverse().map((p) => <ProjectCard key={p.id} project={p} />)}
    </div>
  );
}

function NewProject({ onDone, canCancel }: { onDone: () => void; canCancel: boolean }) {
  const run = useAction();
  const [name, setName] = useState("");
  const [why, setWhy] = useState("");
  const [next, setNext] = useState("");
  return (
    <section className="card">
      <div className="eyebrow">New project</div>
      <TextInput label="Name" value={name} onChange={setName} placeholder="e.g. SiteGuard" />
      <TextArea label="Why does this matter?" value={why} onChange={setWhy} rows={2} />
      <TextInput label="Next action" value={next} onChange={setNext} placeholder="e.g. Book three customer interviews" />
      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn primary" onClick={() => { if (run((s, now) => addProject(s, { name, why, nextAction: next }, now), "Project created.")) onDone(); }}>
          Create project
        </button>
        {canCancel && <button className="btn ghost" onClick={onDone}>Cancel</button>}
      </div>
    </section>
  );
}

function ProjectCard({ project: p }: { project: Project }) {
  const state = useAppState();
  const run = useAction();
  const [editingNext, setEditingNext] = useState(false);
  const [next, setNext] = useState(p.nextAction);
  const evidence = state.evidence.filter((e) => e.projectId === p.id);
  const sessions = Object.values(state.sessions).filter((r) => r.projectId === p.id).length;

  return (
    <section className="card">
      <div className="between">
        <strong className="serif" style={{ fontSize: 17 }}>{p.name}</strong>
        <select className="inline" aria-label={`Stage for ${p.name}`} value={p.stage}
          onChange={(e) => run((s) => updateProject(s, p.id, { stage: e.target.value as ProjectStage }))}>
          {PROJECT_STAGES.map((st) => <option key={st}>{st}</option>)}
        </select>
      </div>
      {p.why && <div className="muted small pre" style={{ marginTop: 6 }}>{p.why}</div>}

      <div style={{ marginTop: 12 }}>
        <div className="eyebrow">Next action</div>
        {editingNext ? (
          <div className="row">
            <input type="text" aria-label="Next action" value={next} onChange={(e) => setNext(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
            <button className="btn sm primary" onClick={() => { run((s) => updateProject(s, p.id, { nextAction: next.trim() })); setEditingNext(false); }}>Save</button>
          </div>
        ) : (
          <div className="between">
            <span className={p.nextAction ? "" : "faint"}>{p.nextAction || "None set"}</span>
            <button className="link-btn tiny" onClick={() => setEditingNext(true)}>Edit</button>
          </div>
        )}
      </div>

      <div className="faint tiny" style={{ marginTop: 12 }}>
        {sessions} session{sessions === 1 ? "" : "s"} applied · {evidence.length} evidence
        {evidence.length > 0 && <> · <a href={href("evidence")}>view</a></>}
      </div>
    </section>
  );
}
