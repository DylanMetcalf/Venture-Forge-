import { useState } from "react";
import { skillLabel } from "../content/curriculum";
import { ProjectSelect, SkillPicker } from "../components/pickers";
import { EVIDENCE_KINDS, type EvidenceKind } from "../domain/types";
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
  const [kindFilter, setKindFilter] = useState<EvidenceKind | "" | "real">("");
  const projectName = new Map(state.projects.map((p) => [p.id, p.name]));

  const items = state.evidence
    .filter((e) => !projectFilter || e.projectId === projectFilter)
    .filter((e) => !skillFilter || e.skills.includes(skillFilter))
    .filter((e) => !kindFilter || (kindFilter === "real" ? e.source.kind !== "session" : e.kind === kindFilter))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  const usedSkills = [...new Set(state.evidence.flatMap((e) => e.skills))].sort();

  return (
    <div className="stack">
      <p className="muted small" style={{ margin: 0 }}>
        Your record of actual founder capability. Session work and concluded experiments land here automatically; log
        real-world results — calls, sales, shipped software, negotiations — by hand. Real-world evidence counts most.
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
          <select className="inline" aria-label="Filter by kind" value={kindFilter} onChange={(e) => setKindFilter(e.target.value as EvidenceKind | "" | "real")}>
            <option value="">All kinds</option>
            <option value="real">Real-world only</option>
            {Object.entries(EVIDENCE_KINDS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
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
                  {` · ${EVIDENCE_KINDS[e.kind]}`}
                  {e.projectId && projectName.has(e.projectId) && ` · ${projectName.get(e.projectId)}`}
                  {e.skills.length > 0 && ` · ${e.skills.map(skillLabel).join(", ")}`}
                </div>
              </div>
              {e.source.kind === "manual" && ( // session/experiment evidence follows its source
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
  const [kind, setKind] = useState<EvidenceKind>("conversation");
  const [skills, setSkills] = useState<SkillId[]>([]);
  const [projectId, setProjectId] = useState("");

  return (
    <section className="card">
      <div className="eyebrow">Log real-world evidence</div>
      <label className="field-label" htmlFor="ev-kind">What kind?</label>
      <select id="ev-kind" value={kind} onChange={(e) => setKind(e.target.value as EvidenceKind)}>
        {Object.entries(EVIDENCE_KINDS).filter(([k]) => k !== "session").map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
      <TextInput label="Title" value={title} onChange={setTitle} placeholder="e.g. First paid SiteGuard pilot signed" />
      <TextArea label="What happened, specifically?" value={note} onChange={setNote} hint="Numbers, names, outcomes. Something you could verify later." />
      <SkillPicker label="Skills this demonstrates" value={skills} onChange={setSkills} />
      <ProjectSelect projects={state.projects} value={projectId} onChange={setProjectId} />
      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn primary" onClick={() => { if (run((s, now) => addManualEvidence(s, { title, note, kind, skills, projectId }, now), "Evidence logged.")) onDone(); }}>
          Add to record
        </button>
        <button className="btn ghost" onClick={onDone}>Cancel</button>
      </div>
    </section>
  );
}
