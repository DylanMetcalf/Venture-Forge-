import { useState } from "react";
import { useAction, useAppState } from "../app/context";
import { Empty, TextArea, TextInput, formatDate } from "../components/ui";
import { addDecision, reviewDecision } from "../domain/actions";
import type { Decision } from "../domain/types";

export function DecisionsView() {
  const state = useAppState();
  const [adding, setAdding] = useState(false);
  const pending = state.decisions.filter((d) => !d.outcomeNote).length;

  return (
    <div className="stack">
      <p className="muted small" style={{ margin: 0 }}>
        Record real decisions when you make them, then come back and record what happened. Separating a bad decision from a
        bad outcome is how judgement improves.
      </p>
      {adding ? <NewDecision onDone={() => setAdding(false)} /> : <button className="btn" onClick={() => setAdding(true)}>+ Record a decision</button>}
      {state.decisions.length === 0 ? <Empty>No decisions logged yet.</Empty> : (
        <>
          {pending > 0 && <div className="faint tiny">{pending} awaiting an outcome review</div>}
          {[...state.decisions].reverse().map((d) => <DecisionCard key={d.id} decision={d} />)}
        </>
      )}
    </div>
  );
}

function NewDecision({ onDone }: { onDone: () => void }) {
  const run = useAction();
  const [decision, setDecision] = useState("");
  const [context, setContext] = useState("");
  const [options, setOptions] = useState("");
  const [confidence, setConfidence] = useState(7);
  return (
    <section className="card">
      <div className="eyebrow">Record a decision</div>
      <TextInput label="The decision" value={decision} onChange={setDecision} placeholder="e.g. Raise Terram prices 8% from next month" />
      <TextArea label="Context" value={context} onChange={setContext} rows={2} />
      <TextArea label="Options considered" value={options} onChange={setOptions} rows={2} />
      <label className="field-label" htmlFor="conf">Confidence: {confidence}/10</label>
      <input id="conf" type="range" min={1} max={10} value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} />
      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn primary" onClick={() => { if (run((s, now) => addDecision(s, { decision, context, options, confidence }, now), "Decision recorded.")) onDone(); }}>
          Save decision
        </button>
        <button className="btn ghost" onClick={onDone}>Cancel</button>
      </div>
    </section>
  );
}

function DecisionCard({ decision: d }: { decision: Decision }) {
  const run = useAction();
  const [note, setNote] = useState(d.outcomeNote);
  return (
    <section className="card">
      <div className="between">
        <strong>{d.decision}</strong>
        <span className={`pill ${d.outcomeNote ? "sage" : ""}`}>{d.outcomeNote ? "Reviewed" : "Awaiting review"}</span>
      </div>
      {d.context && <div className="muted small pre" style={{ marginTop: 6 }}>{d.context}</div>}
      {d.options && <div className="faint small pre" style={{ marginTop: 6 }}>Options: {d.options}</div>}
      <div className="faint tiny" style={{ marginTop: 6 }}>Confidence {d.confidence}/10 · {formatDate(d.date)}</div>
      <hr className="rule" />
      <TextArea label="Outcome review" value={note} onChange={setNote} rows={2}
        placeholder="What actually happened? Bad decision, or a bad outcome despite a good decision?" />
      <button className="btn sm" style={{ marginTop: 8 }} disabled={note === d.outcomeNote}
        onClick={() => run((s, now) => reviewDecision(s, d.id, note, now), "Outcome saved.")}>
        Save outcome
      </button>
    </section>
  );
}
