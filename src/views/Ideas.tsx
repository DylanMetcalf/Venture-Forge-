import { useState } from "react";
import { useAction, useAppState } from "../app/context";
import { Empty, TextArea, TextInput, formatDate } from "../components/ui";
import { addIdea, setIdeaStage } from "../domain/actions";
import { IDEA_STAGES, type IdeaStage } from "../domain/types";

export function IdeasView() {
  const state = useAppState();
  const run = useAction();
  const [name, setName] = useState("");
  const [problem, setProblem] = useState("");

  return (
    <div className="stack">
      <section className="card">
        <div className="eyebrow">Capture an idea</div>
        <div className="muted small" style={{ marginBottom: 6 }}>Capturing it is not committing to it. Most ideas should sit here for a while.</div>
        <TextInput label="Idea" value={name} onChange={setName} placeholder="e.g. Subscription meat box for weekend visitors" />
        <TextArea label="Problem it solves, for whom" value={problem} onChange={setProblem} rows={2} />
        <button className="btn primary" style={{ marginTop: 12 }}
          onClick={() => { if (run((s, now) => addIdea(s, { name, problem }, now), "Added to the vault.")) { setName(""); setProblem(""); } }}>
          Add to vault
        </button>
      </section>
      {state.ideas.length === 0 ? <Empty>The vault's empty. Good — ideas should be rare enough to be worth capturing.</Empty> : (
        [...state.ideas].reverse().map((i) => (
          <section className="card" key={i.id}>
            <div className="between">
              <strong>{i.name}</strong>
              <select className="inline" aria-label={`Stage for ${i.name}`} value={i.stage}
                onChange={(e) => run((s) => setIdeaStage(s, i.id, e.target.value as IdeaStage))}>
                {IDEA_STAGES.map((st) => <option key={st}>{st}</option>)}
              </select>
            </div>
            {i.problem && <div className="muted small pre" style={{ marginTop: 6 }}>{i.problem}</div>}
            <div className="faint tiny" style={{ marginTop: 6 }}>{formatDate(i.date)}</div>
          </section>
        ))
      )}
    </div>
  );
}
