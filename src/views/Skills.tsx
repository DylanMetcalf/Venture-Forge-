import { useState } from "react";
import { skillLabel } from "../content/curriculum";
import { TRACKS } from "../content/tracks";
import type { SkillId } from "../content/types";
import { useAction, useAppState, useToday } from "../app/context";
import { href } from "../app/router";
import { TextArea, formatDate } from "../components/ui";
import { rateConfidence } from "../domain/actions";
import { CAPABILITY_LEVELS, nextStepFor, relatedSkills, scorecard, skillCapabilities, type SkillCapability } from "../domain/capability";
import { CONFIDENCE_LEVELS, EVIDENCE_KINDS } from "../domain/types";

const STATUS_TEXT = { none: "No evidence", attention: "Needs attention", emerging: "Emerging", developing: "Developing", strong: "Strong" } as const;

export function SkillsView({ param }: { param?: string }) {
  const state = useAppState();
  const today = useToday();
  const caps = skillCapabilities(state, today);
  const card = scorecard(state, today);
  const [selected, setSelected] = useState<SkillId | undefined>(param && caps.has(param) ? param : undefined);
  const withRecord = [...caps.values()].filter((c) => c.level > 0).length;

  return (
    <div className="stack-lg">
      <p className="muted" style={{ margin: 0 }}>
        Capability is measured by evidence, not by lessons completed. Levels come from what you've recorded — real-world
        results count most — and there's no single score.
      </p>

      <section aria-labelledby="scorecard-title">
        <h2 className="section-title" id="scorecard-title">Founder scorecard</h2>
        <div className="score-grid">
          {card.map((c) => (
            <div key={c.id} className="score" data-status={c.status}>
              <div className="lab"><span>{c.label}</span><span className="st">{STATUS_TEXT[c.status]}</span></div>
              <div className="f">{c.facts}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="map-title">
        <div className="between">
          <h2 className="section-title" id="map-title">Capability map</h2>
          <span className="faint tiny">{withRecord} of {caps.size} skills with a record</span>
        </div>
        <div className="legend-levels" style={{ marginBottom: 14 }}>
          {CAPABILITY_LEVELS.slice(1).map((l, i) => <span key={l}>{"▮".repeat(i + 1)} {l}</span>)}
          <span>dashed = fading</span>
        </div>
        {selected && caps.get(selected) && <SkillDetail c={caps.get(selected)!} onSelect={setSelected} />}
        <div className="card">
          {TRACKS.map((t) => {
            const levels = t.skills.map((s) => caps.get(s)!.level);
            const started = levels.filter((l) => l > 0).length;
            return (
              <div key={t.id} className="cap-track" data-pillar={t.pillar}>
                <div className="head">
                  <span className="pillar-tag" style={{ letterSpacing: ".04em" }}>{t.name}</span>
                  <span className="faint tiny">{started}/{t.skills.length}</span>
                </div>
                <div className="cap-skills">
                  {t.skills.map((s) => {
                    const c = caps.get(s)!;
                    return (
                      <button key={s} className={`cap-skill l${c.level} ${c.fading ? "fading" : ""}`} aria-pressed={selected === s}
                        aria-label={`${skillLabel(s)}: ${CAPABILITY_LEVELS[c.level]}`} onClick={() => setSelected(selected === s ? undefined : s)}>
                        <span className="pips" aria-hidden="true">{[1, 2, 3, 4, 5].map((i) => <i key={i} className={c.level >= i ? "on" : ""} />)}</span>
                        {skillLabel(s)}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SkillDetail({ c, onSelect }: { c: SkillCapability; onSelect: (s: SkillId) => void }) {
  const state = useAppState();
  const run = useAction();
  const [confidence, setConfidence] = useState(c.confidence);
  const [note, setNote] = useState("");
  const evidence = state.evidence.filter((e) => e.skills.includes(c.id)).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="card" data-pillar={c.track.pillar} style={{ marginBottom: 14, borderColor: "var(--line)" }}>
      <div className="between">
        <span className="pillar-tag">{c.track.name}</span>
        <button className="link-btn tiny" onClick={() => onSelect(c.id)}>Close</button>
      </div>
      <h3 className="serif" style={{ fontSize: 24, margin: "8px 0 2px" }}>{skillLabel(c.id)}</h3>
      <div className="muted">{CAPABILITY_LEVELS[c.level]}{c.fading ? " · fading" : ""}</div>
      <dl className="kv" style={{ marginTop: 14 }}>
        <dt>Evidence</dt><dd>{c.evidence} ({c.realWorld} real-world)</dd>
        <dt>Practised in sessions</dt><dd>{c.practised}</dd>
        <dt>Last activity</dt><dd>{c.lastActivity ? formatDate(c.lastActivity) : "—"}</dd>
        <dt>Your confidence</dt><dd>{CONFIDENCE_LEVELS[c.confidence]}</dd>
      </dl>
      <p className="small" style={{ marginTop: 14 }}><strong>Next:</strong> {nextStepFor(c)}</p>
      {evidence.length > 0 && (
        <>
          <div className="eyebrow" style={{ marginTop: 14 }}>Recent evidence</div>
          <ul className="small muted" style={{ margin: 0, paddingLeft: 18 }}>
            {evidence.slice(0, 5).map((e) => <li key={e.id}>{e.title} <span className="faint">· {EVIDENCE_KINDS[e.kind]} · {formatDate(e.date)}</span></li>)}
          </ul>
        </>
      )}
      <div className="eyebrow" style={{ marginTop: 14 }}>Related</div>
      <div className="chips">
        {relatedSkills(c).map((s) => <button key={s} className="pill chip-btn" onClick={() => onSelect(s)}>{skillLabel(s)}</button>)}
      </div>
      <hr className="rule" />
      <label className="field-label" htmlFor={`conf-${c.id}`}>Self-rated confidence (shown beside the evidence, never instead of it)</label>
      <select id={`conf-${c.id}`} value={confidence} onChange={(e) => setConfidence(Number(e.target.value))}>
        {CONFIDENCE_LEVELS.map((l, i) => <option key={l} value={i}>{l}</option>)}
      </select>
      {confidence > c.confidence && <TextArea label="What can you point to?" value={note} onChange={setNote} rows={2} />}
      <button className="btn sm" style={{ marginTop: 10 }} disabled={confidence === c.confidence}
        onClick={() => { if (run((s, now) => rateConfidence(s, c.id, confidence, note, now), "Saved.")) setNote(""); }}>Save confidence</button>
      <div className="hint"><a href={href("evidence")}>Log evidence</a> to move the level itself.</div>
    </div>
  );
}
