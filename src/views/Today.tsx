import { FORMATS, LAST_AUTHORED_DAY, PILLARS, getDay, isReviewFormat, phaseForDay, weekForDay } from "../content/curriculum";
import type { PillarId } from "../content/types";
import { href } from "../app/router";
import { useAction, useAppState, useToday } from "../app/context";
import { pillarStats, progressSummary } from "../domain/selectors";
import { goToDay, hasRecordedWork, isClosed, sessionFor, sessionStatus } from "../domain/sessions";
import { addDays, isBlank } from "../domain/util";

const TRAINED_PILLARS: PillarId[] = ["mind", "business", "build", "influence", "judgement"];
const SHORT: Record<PillarId, string> = { mind: "Mind", business: "Biz", build: "Build", influence: "People", judgement: "Judge", field: "Field" };

function greeting(hour: number): string {
  if (hour < 5) return "Late night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function TodayView() {
  const state = useAppState();
  const run = useAction();
  const today = useToday();
  const d = state.currentDay;
  const content = getDay(d);
  const phase = phaseForDay(d);
  const rec = sessionFor(state, d);
  const status = sessionStatus(state.sessions[d]);
  const p = progressSummary(state, today);
  const now = new Date();
  const name = state.settings.name;

  const steps = [
    { label: "Commit", done: !isBlank(rec.commitment) },
    { label: "Do the work", done: hasRecordedWork(rec) },
    { label: "Close out", done: isClosed(status) },
  ];
  const nowIndex = steps.findIndex((s) => !s.done);
  const cta = status === "not_started" ? "Begin today's session" : isClosed(status) ? "Review session" : "Continue session";

  const weekStart = (weekForDay(d) - 1) * 7 + 1;
  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart + i);
  const stats = pillarStats(state);
  const maxPillar = Math.max(1, ...TRAINED_PILLARS.map((pl) => stats[pl].demonstrated));
  const staleDecisions = state.decisions.filter((dec) => !dec.outcomeNote && dec.date <= addDays(today, -14));
  const phaseDay = d - phase.range[0] + 1;
  const phaseLen = phase.range[1] - phase.range[0] + 1;

  return (
    <div className="stack-lg">
      <header>
        <h1 className="greeting">{greeting(now.getHours())}{name ? `, ${name}` : ""}.</h1>
        <div className="dateline">
          {now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })} · Day {d} of 365 · {phase.name}
        </div>
      </header>

      <nav className="week" aria-label={`Week ${weekForDay(d)}`}>
        {weekDays.map((day) => {
          const c = getDay(day);
          const st = sessionStatus(state.sessions[day]);
          const cls = ["week-day", c ? (isClosed(st) ? "closed" : st) : "unwritten", day === d ? "current" : ""].join(" ");
          const label = c ? `Day ${day}, ${PILLARS[c.pillar].name}: ${c.theme}` : `Day ${day}, not yet written`;
          const inner = (
            <>
              <span>{c ? (isReviewFormat(c.format) ? "Review" : SHORT[c.pillar]) : "—"}</span>
              <span className="num">{day}</span>
              <span className="dot" />
            </>
          );
          return c ? (
            <a key={day} className={cls} data-pillar={c.pillar} href={href("session", day)} aria-label={label} aria-current={day === d ? "step" : undefined}>{inner}</a>
          ) : (
            <span key={day} className={cls} data-pillar="field" aria-label={label}>{inner}</span>
          );
        })}
      </nav>

      {content ? (
        <section className="today-card" data-pillar={content.pillar} aria-labelledby="today-theme">
          <div className="meta">
            <span className="pillar-tag">{PILLARS[content.pillar].name}</span>
            <span>{FORMATS[content.format]}</span>
            <span>~{content.minutes} min</span>
          </div>
          <h2 className="theme" id="today-theme">{content.theme}</h2>
          <p className="objective">{content.capability}</p>
          <div className="done-when"><strong>Done when</strong>{content.doneWhen}</div>

          <ol className="ritual" aria-label="Today's ritual">
            {steps.map((s, i) => (
              <li key={s.label} className={`ritual-step ${s.done ? "done" : i === nowIndex ? "now" : ""}`}>
                <span className="tick" aria-hidden="true">✓</span>
                <span>{s.label}<span className="sr-only">{s.done ? " — done" : ""}</span></span>
              </li>
            ))}
          </ol>

          <div className="row">
            <a className="btn primary" href={href("session")}>{cta}</a>
            {isClosed(status) && (
              <button className="btn ghost" onClick={() => run((s) => goToDay(s, d + 1))}>
                {getDay(d + 1) ? `On to Day ${d + 1} →` : `Go to Day ${d + 1}`}
              </button>
            )}
          </div>
        </section>
      ) : (
        <section className="today-card">
          <div className="meta"><span className="pillar-tag" data-pillar="field">Nothing scheduled</span></div>
          <h2 className="theme">Day {d} isn't written yet.</h2>
          <p className="objective muted">
            Days 1–{LAST_AUTHORED_DAY} are ready. The rest are written in careful batches rather than filled with filler, so there's no
            session today. Use the time for real work — then log what you prove.
          </p>
          <div className="row" style={{ marginTop: 18 }}>
            <a className="btn primary" href={href("evidence")}>Log evidence</a>
            <a className="btn ghost" href={href("roadmap")}>See the year</a>
          </div>
        </section>
      )}

      <section className="momentum" aria-label="Momentum">
        <div><div className="n">{p.streak}</div><div className="l">day streak</div></div>
        <div><div className="n">{p.demonstrated}</div><div className="l">demonstrated</div></div>
        <div>
          <div className="n">{p.commitmentsGraded ? `${Math.round((p.commitmentsKept / p.commitmentsGraded) * 100)}%` : "—"}</div>
          <div className="l">promises kept</div>
        </div>
      </section>

      <section aria-labelledby="balance-title">
        <div className="between">
          <h2 className="section-title" id="balance-title">Balance</h2>
          <span className="faint tiny">sessions demonstrated</span>
        </div>
        {TRAINED_PILLARS.map((pl) => (
          <div className="balance-row" key={pl} data-pillar={pl}>
            <span className="pillar-tag" style={{ letterSpacing: ".04em" }}>{PILLARS[pl].name}</span>
            <div className="bar" aria-hidden="true"><div style={{ width: `${(stats[pl].demonstrated / maxPillar) * 100}%` }} /></div>
            <span className="count">{stats[pl].demonstrated}</span>
          </div>
        ))}
      </section>

      {staleDecisions.length > 0 && (
        <a className="notice" href={href("decisions")} style={{ textDecoration: "none" }}>
          <span>
            {staleDecisions.length === 1 ? "One decision is" : `${staleDecisions.length} decisions are`} over two weeks old with no recorded outcome.
          </span>
          <span className="link-btn">Review →</span>
        </a>
      )}

      <section>
        <div className="between">
          <h2 className="section-title">{phase.name}</h2>
          <span className="faint tiny">Phase {phase.id} of 7 · day {Math.min(phaseDay, phaseLen)} of {phaseLen}</span>
        </div>
        <p className="muted small">{phase.focus}</p>
        <div className="progress" aria-hidden="true"><div style={{ width: `${(Math.min(phaseDay, phaseLen) / phaseLen) * 100}%` }} /></div>
      </section>
    </div>
  );
}
