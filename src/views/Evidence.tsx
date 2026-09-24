import { useState } from "react";
import { ALL_SKILLS, skillLabel } from "../content/curriculum";
import type { SkillId } from "../content/types";
import { useAction, useAppState } from "../app/context";
import { href } from "../app/router";
import { Empty, TextArea, TextInput, formatDate } from "../components/ui";
import { addManualEvidence, deleteEvidence } from "../domain/actions";

export function EvidenceView() {
  const state = useAppState();
  const run = useAction();
  const [adding, setAdding] = useState(false);
  const [projectFilter, setProjectFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const projectName = new Map(state.projects.map((p) => [p.id, p.name]));

  const items = state.evidence
    .filter((e) => !projectFilter || e.projectId === projectFilter)
    .filter((e) => !skillFilter || e.skills.includes(skillFilter))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  const usedSkills = [...new Set(state.evidence.flatMap((e) => e.skills))].sort();

  return (
    <div className="stack">
      <p className="muted small" style={{ margin: 0 }}>
        What you've actually proven. Closing a session with real work adds it here automatically; log anything else you do
        in the real world by hand.
      </p>
      {adding ? <NewEvidence onDone={() => setAdding(false)} /> : <button className="btn" onClick={() => setAdding(true)}>+ Log evidence</button>}

      {state.evidence.length > 0 && (
        <div className="row">
          {state.projects.length > 0 && (
            <select className="inline" aria-label="Filter by project" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
              <option value="">All projects</option>
              {state.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <select className="inline" aria-label="Filter by skill" value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)}>
            <option value="">All skills</option>
            {usedSkills.map((s) => <option key={s} value={s}>{skillLabel(s)}</option>)}
          </select>
          <span className="faint tiny">{items.length} item{items.length === 1 ? "" : "s"}</span>
        </div>
      )}

      {items.length === 0 ? (
        <Empty>{state.evidence.length ? "Nothing matches these filters." : "Nothing here yet. Evidence builds as you close sessions with real work and log real outcomes."}</Empty>
      ) : (
        <section className="card">
          {items.map((e) => (
            <div className="item-row" key={e.id}>
              <div style={{ minWidth: 0 }}>
                <div>
                  {e.source.kind === "session" ? <a href={href("session", e.source.day)}>{e.title}</a> : e.title}
                </div>
                <div className="muted small pre" style={{ marginTop: 4 }}>{e.note}</div>
                <div className="faint tiny" style={{ marginTop: 6 }}>
                  {formatDate(e.date)}
                  {e.source.kind === "manual" && " · logged by hand"}
                  {e.projectId && projectName.has(e.projectId) && ` · ${projectName.get(e.projectId)}`}
                  {e.skills.length > 0 && ` · ${e.skills.map(skillLabel).join(", ")}`}
                </div>
              </div>
              {e.source.kind === "manual" && (
                <button className="link-btn tiny" style={{ color: "var(--text-faint)" }}
                  onClick={() => { if (confirm(`Delete "${e.title}"?`)) run((s) => deleteEvidence(s, e.id), "Deleted."); }}>
                  Delete
                </button>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function NewEvidence({ onDone }: { onDone: () => void }) {
  const state = useAppState();
  const run = useAction();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [skills, setSkills] = useState<SkillId[]>([]);
  const [projectId, setProjectId] = useState("");

  return (
    <section className="card">
      <div className="eyebrow">Log evidence</div>
      <TextInput label="Title" value={title} onChange={setTitle} placeholder="e.g. First paid SiteGuard pilot signed" />
      <TextArea label="What happened, specifically?" value={note} onChange={setNote} hint="Numbers, names, outcomes. Something you could verify later." />

      <label className="field-label" htmlFor="ev-skill">Skills this demonstrates</label>
      <select id="ev-skill" value="" onChange={(e) => e.target.value && setSkills([...skills, e.target.value])}>
        <option value="">Add a skill…</option>
        {ALL_SKILLS.filter((s) => !skills.includes(s)).map((s) => <option key={s} value={s}>{skillLabel(s)}</option>)}
      </select>
      {skills.length > 0 && (
        <div className="chips" style={{ marginTop: 8 }}>
          {skills.map((s) => (
            <button key={s} className="pill chip-btn" aria-label={`Remove ${skillLabel(s)}`} onClick={() => setSkills(skills.filter((x) => x !== s))}>
              {skillLabel(s)} ×
            </button>
          ))}
        </div>
      )}

      {state.projects.length > 0 && (
        <>
          <label className="field-label" htmlFor="ev-project">Project</label>
          <select id="ev-project" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">None</option>
            {state.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </>
      )}

      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn primary" onClick={() => { if (run((s, now) => addManualEvidence(s, { title, note, skills, projectId }, now), "Evidence logged.")) onDone(); }}>
          Add to timeline
        </button>
        <button className="btn ghost" onClick={onDone}>Cancel</button>
      </div>
    </section>
  );
}
