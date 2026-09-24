import { useState } from "react";
import { useAction, useAppState, useStore } from "../app/context";
import { href, navigate } from "../app/router";
import { EditableText } from "../components/Editable";
import { ProjectSelect, SkillPicker } from "../components/pickers";
import { BackLink, Empty, TextInput, formatDate } from "../components/ui";
import { addExperiment, concludeExperiment, deleteExperiment, startBlockers, startExperiment, updateExperiment, type ExperimentPatch } from "../domain/projects";
import { EXPERIMENT_OUTCOMES, type Experiment } from "../domain/types";

const STATUS_LABEL = { planned: "Planned", running: "Running", concluded: "Concluded" } as const;

export function ExperimentsView({ param }: { param?: string }) {
  const state = useAppState();
  if (param) {
    const x = state.experiments.find((e) => e.id === param);
    return x ? <ExperimentDetail x={x} /> : <Empty>That experiment doesn't exist. <a href={href("experiments")}>All experiments</a></Empty>;
  }
  return <ExperimentList />;
}

function ExperimentList() {
  const state = useAppState();
  const store = useStore();
  const run = useAction();
  const [title, setTitle] = useState("");
  const groups = (["running", "planned", "concluded"] as const).map((st) => ({ st, items: state.experiments.filter((x) => x.status === st) }));

  return (
    <div className="stack">
      <p className="muted" style={{ margin: 0 }}>
        Operate through evidence, not assumptions. State what you believe, test it cheaply, measure honestly, and decide what
        happens next. A concluded experiment becomes evidence.
      </p>
      <form className="card" onSubmit={(e) => {
        e.preventDefault();
        if (run((s, now) => addExperiment(s, { title }, now))) navigate("experiments", store.getState().experiments.at(-1)!.id);
      }}>
        <TextInput label="New experiment" value={title} onChange={setTitle} placeholder="e.g. Test a R400 price with the next 10 leads" />
        <button className="btn primary" style={{ marginTop: 12 }} type="submit" disabled={!title.trim()}>Design it</button>
      </form>
      {state.experiments.length === 0 && <Empty>No experiments yet. What do you currently believe about your work that you've never tested?</Empty>}
      {groups.filter((g) => g.items.length).map((g) => (
        <section key={g.st}>
          <h2 className="section-title">{STATUS_LABEL[g.st]}</h2>
          <div className="card" style={{ padding: "6px 18px" }}>
            {g.items.map((x) => (
              <a key={x.id} className="item-row" href={href("experiments", x.id)}>
                <div style={{ minWidth: 0 }}>
                  <div className="item-title"><span className={`status-dot ${x.status}`} />{x.title}</div>
                  <div className="faint tiny" style={{ marginTop: 3 }}>
                    {x.outcome ? `${x.outcome} · ` : ""}{x.hypothesis || "No hypothesis yet"}
                  </div>
                </div>
                <span className="faint" aria-hidden="true">→</span>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ExperimentDetail({ x }: { x: Experiment }) {
  const state = useAppState();
  const run = useAction();
  const save = (patch: ExperimentPatch) => run((s, now) => updateExperiment(s, x.id, patch, now));
  const blockers = startBlockers(x);

  return (
    <div className="stack-lg">
      <div>
        <BackLink href={href("experiments")}>Experiments</BackLink>
        <div className="faint tiny" style={{ textTransform: "uppercase", letterSpacing: ".06em" }}>
          <span className={`status-dot ${x.status}`} />{STATUS_LABEL[x.status]}{x.outcome ? ` · ${x.outcome}` : ""}
          {x.startedAt && ` · started ${formatDate(x.startedAt)}`}{x.concludedAt && ` · concluded ${formatDate(x.concludedAt)}`}
        </div>
        <EditableText label="Experiment" value={x.title} onSave={(v) => save({ title: v })} multiline={false} />
      </div>

      <section className="stack">
        <h2 className="section-title" style={{ marginBottom: 0 }}>Design</h2>
        <EditableText label="Hypothesis — what do you believe?" value={x.hypothesis} onSave={(v) => save({ hypothesis: v })} placeholder="If I …, then … because …" />
        <EditableText label="Why it matters" value={x.why} onSave={(v) => save({ why: v })} placeholder="What decision depends on this?" />
        <EditableText label="Test — what will you do?" value={x.test} onSave={(v) => save({ test: v })} placeholder="The smallest action that could prove you wrong" />
        <EditableText label="Measure — what determines success?" value={x.measure} onSave={(v) => save({ measure: v })} placeholder="Set the bar before you see the result, e.g. ≥3 of 10 reply" />
        <div className="form-grid">
          <ProjectSelect projects={state.projects} value={x.projectId ?? ""} onChange={(v) => save({ projectId: v || null })} />
          <div className="full"><SkillPicker label="Skills this tests" value={x.skills} onChange={(skills) => save({ skills })} /></div>
        </div>
        {x.status === "planned" && (
          <div>
            {blockers.length > 0 && <ul className="blockers">{blockers.map((b) => <li key={b}>{b}</li>)}</ul>}
            <button className="btn primary" style={{ marginTop: 10 }} disabled={blockers.length > 0}
              onClick={() => run((s, now) => startExperiment(s, x.id, now), "Experiment running. Go test it.")}>Start experiment</button>
          </div>
        )}
      </section>

      {x.status !== "planned" && (
        <section className="stack">
          <h2 className="section-title" style={{ marginBottom: 0 }}>Result</h2>
          <EditableText label="Result — what actually happened?" value={x.result} onSave={(v) => save({ result: v })} placeholder="Numbers, exact words, observations — not interpretation" />
          <EditableText label="Learning — what did you discover?" value={x.learning} onSave={(v) => save({ learning: v })} />
          <EditableText label="Decision — what happens next?" value={x.decision} onSave={(v) => save({ decision: v })} placeholder="Double down, change course, or run a follow-up" />
          {x.status === "running" && (
            <div>
              <div className="field-label">Conclude: was the hypothesis…</div>
              <div className="row">
                {EXPERIMENT_OUTCOMES.map((o) => (
                  <button key={o} className="btn sm" onClick={() => run((s, now) => concludeExperiment(s, x.id, o, now), "Concluded — logged as evidence.")}>
                    {o[0]!.toUpperCase() + o.slice(1)}
                  </button>
                ))}
              </div>
              <div className="hint">Needs a result and a decision. Concluding logs it as real-world evidence.</div>
            </div>
          )}
        </section>
      )}

      <div>
        <button className="link-btn tiny" style={{ color: "var(--text-3)" }} onClick={() => {
          if (confirm(`Delete “${x.title}”? Its evidence will be removed too.`)) { run((s) => deleteExperiment(s, x.id), "Deleted."); navigate("experiments"); }
        }}>Delete experiment</button>
      </div>
    </div>
  );
}
