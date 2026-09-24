import { useState } from "react";
import { MAX_SKILL_LEVEL, SKILL_CATEGORIES, SKILL_LEVELS, skillLabel } from "../content/curriculum";
import type { SkillId } from "../content/types";
import { useAction, useAppState } from "../app/context";
import { Empty, TextArea, formatDate } from "../components/ui";
import { assessSkill } from "../domain/actions";
import { skillStats, type SkillStats } from "../domain/selectors";

export function SkillsView() {
  const state = useAppState();
  const stats = skillStats(state);
  const [open, setOpen] = useState<SkillId | null>(null);
  const active = [...stats.values()]
    .filter((s) => s.evidence > 0 || s.practised > 0 || s.level > 0)
    .sort((a, b) => b.evidence - a.evidence || b.practised - a.practised || b.level - a.level);

  const row = (s: SkillStats) => (
    <div key={s.id}>
      <button className="skill-row" aria-expanded={open === s.id} onClick={() => setOpen(open === s.id ? null : s.id)}>
        <span>{skillLabel(s.id)}</span>
        <span className="row" style={{ gap: 10 }}>
          <span className="faint tiny">{SKILL_LEVELS[s.level]}</span>
          <span className="skill-bar" aria-hidden="true"><div style={{ width: `${(s.level / MAX_SKILL_LEVEL) * 100}%` }} /></span>
        </span>
        <span className="meta">
          <span>{s.practised} session{s.practised === 1 ? "" : "s"} practised</span>
          <span>{s.evidence} evidence</span>
        </span>
      </button>
      {open === s.id && <AssessPanel key={s.id} stats={s} onDone={() => setOpen(null)} />}
    </div>
  );

  return (
    <div className="stack">
      <p className="muted small" style={{ margin: 0 }}>
        Levels are self-rated, but they sit next to what you've actually done: sessions practised and evidence recorded.
        Raising a level asks what you can point to.
      </p>

      <section className="card">
        <div className="eyebrow">Skills in play</div>
        {active.length ? active.map(row) : <Empty>Nothing yet. Skills appear here as you close sessions and record evidence.</Empty>}
      </section>

      {Object.entries(SKILL_CATEGORIES).map(([cat, ids]) => (
        <details key={cat} className="card">
          <summary>
            <span>{cat}</span>
            <span className="faint tiny">{ids.filter((id) => (stats.get(id)?.evidence ?? 0) > 0).length}/{ids.length} with evidence</span>
          </summary>
          <div style={{ marginTop: 8 }}>{ids.map((id) => row(stats.get(id)!))}</div>
        </details>
      ))}
    </div>
  );
}

function AssessPanel({ stats, onDone }: { stats: SkillStats; onDone: () => void }) {
  const state = useAppState();
  const run = useAction();
  const [level, setLevel] = useState(stats.level);
  const [note, setNote] = useState("");
  const evidence = state.evidence.filter((e) => e.skills.includes(stats.id));
  const history = state.skills[stats.id]?.history ?? [];
  const raising = level > stats.level;

  return (
    <div className="card" style={{ margin: "4px 0 12px", background: "var(--panel2)" }}>
      <label className="field-label" htmlFor={`lvl-${stats.id}`}>Your honest level</label>
      <select id={`lvl-${stats.id}`} value={level} onChange={(e) => setLevel(Number(e.target.value))}>
        {SKILL_LEVELS.map((l, i) => <option key={l} value={i}>{i} · {l}</option>)}
      </select>
      {raising && (
        <TextArea label="What can you point to that justifies this?" value={note} onChange={setNote} rows={2}
          placeholder={evidence[0] ? `e.g. ${evidence[0].title}` : "A specific thing you did, not a feeling."} />
      )}
      <div className="row" style={{ marginTop: 10 }}>
        <button className="btn sm primary" disabled={level === stats.level}
          onClick={() => { if (run((s, now) => assessSkill(s, stats.id, level, note, now), "Assessment saved.")) onDone(); }}>
          Save assessment
        </button>
      </div>

      <div className="eyebrow" style={{ marginTop: 16 }}>Evidence ({evidence.length})</div>
      {evidence.length ? (
        <ul className="small muted" style={{ margin: 0, paddingLeft: 18 }}>
          {evidence.slice(-5).reverse().map((e) => <li key={e.id}>{e.title} <span className="faint">· {formatDate(e.date)}</span></li>)}
        </ul>
      ) : <div className="faint small">None yet.</div>}

      {history.length > 0 && (
        <>
          <div className="eyebrow" style={{ marginTop: 16 }}>Assessment history</div>
          <ul className="small muted" style={{ margin: 0, paddingLeft: 18 }}>
            {[...history].reverse().map((h, i) => (
              <li key={i}>{SKILL_LEVELS[h.level]}{h.at && <span className="faint"> · {formatDate(h.at)}</span>}{h.note && ` — ${h.note}`}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
