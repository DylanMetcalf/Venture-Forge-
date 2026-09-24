import { useState } from "react";
import { DAYS, LAST_AUTHORED_DAY, PHASES, PILLARS, getDay, phaseForDay } from "../content/curriculum";
import { TRACKS } from "../content/tracks";
import { Segmented } from "../components/ui";
import { skillCapabilities } from "../domain/capability";
import { useAppState, useToday } from "../app/context";
import { href } from "../app/router";
import { isClosed, sessionStatus } from "../domain/sessions";

export function RoadmapView() {
  const [tab, setTab] = useState<"year" | "tracks">("year");
  return (
    <div className="stack">
      <Segmented label="Curriculum view" value={tab} onChange={setTab} options={[{ value: "year", label: "The year" }, { value: "tracks", label: "Tracks" }]} />
      {tab === "year" ? <YearView /> : <TracksView />}
    </div>
  );
}

function TracksView() {
  const state = useAppState();
  const today = useToday();
  const caps = skillCapabilities(state, today);
  return (
    <div className="stack">
      <p className="muted" style={{ margin: 0 }}>
        Twelve interconnected capability tracks. Sessions interleave them day by day; each module's progress comes from the
        evidence recorded against its skills, and modules are revisited rather than ticked off.
      </p>
      {TRACKS.map((t) => (
        <details key={t.id} className="card" data-pillar={t.pillar}>
          <summary>
            <span>
              <span className="pillar-tag" style={{ letterSpacing: ".04em" }}>{PILLARS[t.pillar].name}</span>
              <h3 className="serif" style={{ fontSize: 19, margin: "6px 0 2px" }}>{t.name}</h3>
              <span className="muted small">{t.summary}</span>
            </span>
            <span className="chev" aria-hidden="true">⌄</span>
          </summary>
          <div style={{ marginTop: 12 }}>
            {t.modules.map((mod) => {
              const lv = mod.skills.map((s) => caps.get(s)?.level ?? 0);
              const withEvidence = mod.skills.filter((s) => (caps.get(s)?.evidence ?? 0) > 0).length;
              const sessions = DAYS.filter((d) => d.skills.some((s) => mod.skills.includes(s))).map((d) => d.day);
              const state = Math.min(...lv) >= 2 ? "Functional" : withEvidence > 0 ? `Evidence in ${withEvidence}/${mod.skills.length} skills` : lv.some((l) => l > 0) ? "Practised" : "Not started";
              return (
                <div key={mod.id} className="module-row">
                  <div>
                    <div>{mod.title}</div>
                    <div className="lvl">{mod.level}</div>
                    {sessions.length > 0 && (
                      <div className="faint tiny" style={{ marginTop: 3 }}>
                        Sessions: {sessions.map((d) => <a key={d} href={href("session", d)} style={{ marginRight: 6 }}>{d}</a>)}
                      </div>
                    )}
                  </div>
                  <div className={`state ${withEvidence ? "on" : ""}`}>{state}</div>
                </div>
              );
            })}
          </div>
        </details>
      ))}
    </div>
  );
}

function YearView() {
  const state = useAppState();
  const currentPhase = phaseForDay(state.currentDay).id;

  return (
    <div className="stack">
      <p className="muted" style={{ margin: 0 }}>
        The whole year, visible from Day 1. Days 1–{LAST_AUTHORED_DAY} are written; each dot shows the day's pillar. The rest
        are real slots waiting for content — not placeholders pretending to be lessons.
      </p>
      <div className="legend" aria-label="Pillars">
        {(["mind", "business", "build", "influence", "judgement", "field"] as const).map((pl) => (
          <span key={pl} className="pillar-tag" data-pillar={pl} style={{ letterSpacing: ".04em" }}>{PILLARS[pl].name}</span>
        ))}
      </div>
      <div className="legend" aria-label="Legend">
        <span><i className="demonstrated" /> Demonstrated</span>
        <span><i className="consumed" /> Consumed</span>
        <span><i className="in_progress" /> In progress</span>
        <span><i className="current" /> Current day</span>
        <span><i className="unwritten" /> Not yet written</span>
      </div>

      {PHASES.map((p) => {
        const [start, end] = p.range;
        const total = end - start + 1;
        let authored = 0;
        let closed = 0;
        const chips = [];
        for (let d = start; d <= end; d++) {
          const status = sessionStatus(state.sessions[d]);
          const written = !!getDay(d);
          if (written) authored++;
          if (isClosed(status)) closed++;
          const cls = ["day-chip", written ? status : "unwritten", d === state.currentDay ? "current" : ""].join(" ");
          const label = `Day ${d}${written ? ` — ${getDay(d)!.theme}` : " (not yet written)"}, ${status.replace("_", " ")}`;
          chips.push(
            written ? (
              <a key={d} className={cls} data-pillar={getDay(d)!.pillar} href={href("session", d)} title={label} aria-label={label}>{d}</a>
            ) : (
              <span key={d} className={cls} title={label} aria-label={label}>{d}</span>
            ),
          );
        }
        return (
          <details key={p.id} className="card phase-card" open={p.id === currentPhase}>
            <summary>
              <div className="between">
                <div>
                  <div className="eyebrow" style={{ marginBottom: 4 }}>Phase {p.id}</div>
                  <h3>{p.name}</h3>
                </div>
                <span className="pill">Days {start}–{end}</span>
              </div>
              <div className="muted small" style={{ marginTop: 6 }}>{p.focus}</div>
              <div className="faint tiny" style={{ marginTop: 8 }}>
                {authored === 0 ? "Not yet written" : `${authored} of ${total} days written · ${closed} closed`}
              </div>
              {closed > 0 && <div className="progress" aria-hidden="true"><div style={{ width: `${(closed / total) * 100}%` }} /></div>}
            </summary>
            <div className="day-grid">{chips}</div>
          </details>
        );
      })}
    </div>
  );
}
