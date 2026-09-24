import { FORMATS, LAST_AUTHORED_DAY, getDay, phaseForDay, weekForDay } from "../content/curriculum";
import { href } from "../app/router";
import { useAction, useAppState, useToday } from "../app/context";
import { StatusPill } from "../components/ui";
import { progressSummary } from "../domain/selectors";
import { goToDay, sessionStatus } from "../domain/sessions";
import { addDays } from "../domain/util";

export function TodayView() {
  const state = useAppState();
  const run = useAction();
  const today = useToday();
  const d = state.currentDay;
  const content = getDay(d);
  const phase = phaseForDay(d);
  const rec = state.sessions[d];
  const status = sessionStatus(rec);
  const p = progressSummary(state, today);

  const cta = status === "not_started" ? "Start today's session" : status === "in_progress" ? "Continue session" : "Review today's session";
  const nextDay = getDay(d + 1);
  const activeProjects = state.projects.filter((pr) => !["Parked", "Abandoned", "Live"].includes(pr.stage) && pr.nextAction);
  const staleDecisions = state.decisions.filter((dec) => !dec.outcomeNote && dec.date <= addDays(today, -14));

  return (
    <div className="stack">
      {content ? (
        <section className="hero" aria-labelledby="today-theme">
          <div className="phase">{phase.name} · Phase {phase.id} of 7 · Week {weekForDay(d)}</div>
          <div className="daynum">Day {d}</div>
          <h2 className="theme" id="today-theme">{content.theme}</h2>
          <div className="row">
            <StatusPill status={status} />
            <span className="pill">{FORMATS[content.format]}</span>
            <span className="pill">~{content.minutes} min</span>
          </div>
          <div className="brief">
            <div>
              <div className="k">Objective</div>
              <div>{content.capability}</div>
            </div>
            <div>
              <div className="k">Done when</div>
              <div className="muted">{content.doneWhen}</div>
            </div>
          </div>
          <div className="row">
            <a className="btn primary" href={href("session")}>{cta}</a>
            {(status === "consumed" || status === "demonstrated") && (
              <button className="btn" onClick={() => run((s) => goToDay(s, d + 1))}>
                {nextDay ? `Continue to Day ${d + 1} →` : `Go to Day ${d + 1}`}
              </button>
            )}
          </div>
        </section>
      ) : (
        <section className="hero">
          <div className="phase">{phase.name} · Phase {phase.id} of 7</div>
          <div className="daynum">Day {d}</div>
          <p className="muted" style={{ marginTop: 10 }}>
            There's no curriculum session today. Days 1–{LAST_AUTHORED_DAY} are written; Day {LAST_AUTHORED_DAY + 1} onward
            hasn't been written yet, and won't be filled with placeholder content.
          </p>
          <p className="muted">
            {activeProjects.length || staleDecisions.length
              ? "The most useful thing today is real work on the projects and decisions below."
              : "If there's nothing meaningful to do, that's fine: go and do real work, then log what you prove as evidence."}
          </p>
          <div className="row">
            <a className="btn" href={href("evidence")}>Log evidence</a>
            <a className="btn ghost" href={href("roadmap")}>See the year</a>
          </div>
        </section>
      )}

      {rec?.commitment && (
        <section className="card">
          <div className="eyebrow">Today's promise</div>
          <div>{rec.commitment}</div>
          <div style={{ marginTop: 8 }}>
            {rec.commitmentKept === undefined ? (
              <span className="faint small">Graded when you close out the session.</span>
            ) : (
              <span className={`pill ${rec.commitmentKept ? "sage" : "clay"}`}>{rec.commitmentKept ? "Kept" : "Not kept"}</span>
            )}
          </div>
        </section>
      )}

      <section className="stats" aria-label="Progress">
        <div className="stat"><div className="n">{p.demonstrated}</div><div className="l">days demonstrated</div></div>
        <div className="stat"><div className="n">{p.consumed}</div><div className="l">days consumed only</div></div>
        <div className="stat"><div className="n">{p.streak}</div><div className="l">day streak</div></div>
        <div className="stat">
          <div className="n">{p.commitmentsGraded ? `${p.commitmentsKept}/${p.commitmentsGraded}` : "—"}</div>
          <div className="l">promises kept</div>
        </div>
      </section>

      {activeProjects.length > 0 && (
        <section className="card">
          <div className="between"><div className="eyebrow">Project next actions</div><a className="faint tiny" href={href("projects")}>All projects</a></div>
          {activeProjects.slice(0, 4).map((pr) => (
            <div className="item-row" key={pr.id}>
              <div>
                <div>{pr.nextAction}</div>
                <div className="faint tiny">{pr.name} · {pr.stage}</div>
              </div>
            </div>
          ))}
        </section>
      )}

      {staleDecisions.length > 0 && (
        <section className="card">
          <div className="eyebrow">Decisions waiting on an outcome review</div>
          <p className="muted small">
            {staleDecisions.length === 1 ? "One decision is" : `${staleDecisions.length} decisions are`} more than two weeks old with no
            recorded outcome. Reviewing them is how judgement improves.
          </p>
          <a className="btn sm" href={href("decisions")}>Review decisions</a>
        </section>
      )}

      <section className="card">
        <div className="eyebrow">This phase — {phase.name}</div>
        <div className="muted small">{phase.focus}</div>
      </section>

      <a className="card" href={href("freedom")} style={{ display: "block", textDecoration: "none" }}>
        <div className="eyebrow">Freedom Index</div>
        <div className="row">
          <div className="serif" style={{ fontSize: 26 }}>{p.freedomComposite}</div>
          <div className="muted small" style={{ flex: 1, minWidth: 180 }}>Self-rated. More capability, ownership and time — not just more busy.</div>
        </div>
      </a>
    </div>
  );
}
