import { LAST_AUTHORED_DAY, PHASES, getDay, phaseForDay } from "../content/curriculum";
import { useAppState } from "../app/context";
import { href } from "../app/router";
import { isClosed, sessionStatus } from "../domain/sessions";

export function RoadmapView() {
  const state = useAppState();
  const currentPhase = phaseForDay(state.currentDay).id;

  return (
    <div className="stack">
      <p className="muted small" style={{ margin: 0 }}>
        The whole year, visible from Day 1. Days 1–{LAST_AUTHORED_DAY} are written. The rest are real slots waiting for
        content — not placeholders pretending to be lessons.
      </p>
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
              <a key={d} className={cls} href={href("session", d)} title={label} aria-label={label}>{d}</a>
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
                  <strong className="serif" style={{ fontSize: 17 }}>{p.name}</strong>{" "}
                  <span className="faint small">· Phase {p.id}</span>
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
