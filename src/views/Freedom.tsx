import { useEffect, useState } from "react";
import { useAction, useAppState } from "../app/context";
import { formatDate } from "../components/ui";
import { setFreedom } from "../domain/actions";
import { freedomComposite } from "../domain/selectors";
import type { FreedomKey } from "../domain/types";

const ROWS: [FreedomKey, string, string][] = [
  ["financial", "Financial freedom", "Recurring income, reserves, low dependency on the next invoice."],
  ["time", "Time freedom", "Founder hours vs recoverable hours you're actually reclaiming."],
  ["business", "Business freedom", "How much runs without you having to touch it."],
  ["skill", "Skill freedom", "Sales, finance, tech, leadership, strategy — real ability, not theory."],
  ["decision", "Decision freedom", "Confidence solving unfamiliar problems without leaning on others."],
];

export function FreedomView() {
  const state = useAppState();
  return (
    <div className="stack">
      <p className="muted small" style={{ margin: 0 }}>
        Not a measurement — a personal management framework. Rate honestly; it isn't graded and it doesn't affect anything else.
      </p>
      <section className="card">
        {ROWS.map(([key, label, desc]) => <FreedomSlider key={key} k={key} label={label} desc={desc} value={state.freedom[key]} />)}
      </section>
      <section className="card" style={{ textAlign: "center" }}>
        <div className="eyebrow">Composite</div>
        <div className="serif" style={{ fontSize: 34 }}>{freedomComposite(state)}</div>
        {state.freedom.updatedAt && <div className="faint tiny">Last updated {formatDate(state.freedom.updatedAt)}</div>}
      </section>
    </div>
  );
}

/** Local value while dragging; persisted when the drag settles (the prototype re-rendered mid-drag). */
function FreedomSlider({ k, label, desc, value }: { k: FreedomKey; label: string; desc: string; value: number }) {
  const run = useAction();
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  useEffect(() => {
    if (local === value) return;
    const t = window.setTimeout(() => run((s, now) => setFreedom(s, k, local, now)), 350);
    return () => window.clearTimeout(t);
  }, [local, value, k, run]);

  return (
    <div className="f-row">
      <div className="between small">
        <label htmlFor={`fr-${k}`}>{label}</label>
        <span className="faint">{local}</span>
      </div>
      <input id={`fr-${k}`} type="range" min={0} max={100} value={local} onChange={(e) => setLocal(Number(e.target.value))} />
      <div className="faint tiny">{desc}</div>
    </div>
  );
}
