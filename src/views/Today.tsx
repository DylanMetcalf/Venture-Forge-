import { FORMATS, PILLARS, getDay, isReviewFormat, phaseForDay, weekForDay } from "../content/curriculum";
import type { PillarId } from "../content/types";
import { href } from "../app/router";
import { useAction, useAppState, useToday } from "../app/context";
import { recommendations } from "../domain/adaptive";
import { dayLog } from "../domain/daily";
import { progressSummary } from "../domain/selectors";
import { goToDay, hasRecordedWork, isClosed, sessionFor, sessionStatus } from "../domain/sessions";
import { EVIDENCE_KINDS } from "../domain/types";
import { isBlank } from "../domain/util";
import { currentFocus } from "../domain/weekly";
import { formatDate } from "../components/ui";

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
  const now = new Date();
  const d = state.currentDay;
  const content = getDay(d);
  const phase = phaseForDay(d);
  const rec = sessionFor(state, d);
  const status = sessionStatus(state.sessions[d]);
  const p = progressSummary(state, today);
  const log = dayLog(state, today);
  const morning = log.morning;
  const focus = currentFocus(state, today);
  const recs = recommendations(state, today, now).filter((r) => !(r.kind === "checkin" && !morning)).slice(0, 4);

  const steps = [
    { label: "Commit", done: !isBlank(rec.commitment) },
    { label: "Do the work", done: hasRecordedWork(rec) },
    { label: "Close out", done: isClosed(status) },
  ];
  const nowIndex = steps.findIndex((s) => !s.done);
  const cta = status === "not_started" ? "Begin session" : isClosed(status) ? "Review session" : "Continue session";
  const weekStart = (weekForDay(d) - 1) * 7 + 1;

  const running = state.experiments.filter((x) => x.status === "running").slice(0, 2);
  const activeProjects = state.projects.filter((pr) => !["Parked", "Done", "Abandoned"].includes(pr.stage)).slice(0, 3);
  const recentEvidence = [...state.evidence].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0, 3);

  return (
    <div className="stack-lg">
      <header>
        <h1 className="greeting">{greeting(now.getHours())}{state.settings.name ? `, ${state.settings.name}` : ""}.</h1>
        <div className="dateline">
          {now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })} · Day {d} of 365 · {phase.name}
        </div>
      </header>

      {/* 1 — What matters today */}
      {!morning ? (
        <a className="notice" href={href("checkin", "morning")} style={{ textDecoration: "none", padding: "18px 20px" }}>
          <span>
            <strong className="serif" style={{ fontSize: 18, display: "block", marginBottom: 2 }}>Morning check-in</strong>
            <span className="muted">Two minutes: what today holds, your priorities, what's hard. Everything else adapts to it.</span>
          </span>
          <span className="btn primary sm">Check in</span>
        </a>
      ) : (
        <section aria-labelledby="today-priorities">
          <div className="between">
            <h2 className="section-title" id="today-priorities">Today's priorities</h2>
            <a className="faint tiny" href={href("checkin", "morning")}>Edit check-in</a>
          </div>
          {morning.priorities.length ? (
            <ol className="plist">
              {morning.priorities.map((pr, i) => (
                <li key={i}>
                  <span className="n">{i + 1}</span>
                  <span style={log.evening?.prioritiesMoved?.[i] ? { textDecoration: "line-through", color: "var(--text-3)" } : undefined}>{pr}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="muted pre">{morning.plan}</p>
          )}
          {morning.difficulty && <p className="small faint" style={{ marginTop: 6 }}>Hard right now: {morning.difficulty}</p>}
          {log.evening && (
            <p className="small" style={{ marginTop: 8, color: "var(--good)" }}>
              ✓ Day closed{log.evening.changeTomorrow ? ` · Tomorrow: ${log.evening.changeTomorrow}` : ""}
            </p>
          )}
        </section>
      )}

      {/* 2 — What I'm learning */}
      {content ? (
        <section className="today-card" data-pillar={content.pillar} aria-labelledby="today-theme">
          <div className="meta">
            <span className="pillar-tag">{PILLARS[content.pillar].name}</span>
            <span>Day {d} · {FORMATS[content.format]}</span>
            <span>~{content.minutes} min</span>
          </div>
          <h2 className="theme" id="today-theme">{content.theme}</h2>
          <p className="objective">{content.capability}</p>
          <div className="done-when"><strong>Done when</strong>{content.doneWhen}</div>
          <ol className="ritual" aria-label="Session progress">
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
          <div className="meta"><span className="pillar-tag" data-pillar="field">No session today</span></div>
          <h2 className="theme">Day {d} isn't written yet.</h2>
          <p className="objective muted">Use the time for real work on your projects and experiments — then log what you prove.</p>
        </section>
      )}

      {/* 3 — Focus: what the system thinks deserves attention, with reasons */}
      {recs.length > 0 && (
        <section aria-labelledby="focus-title">
          <h2 className="section-title" id="focus-title">Focus</h2>
          <div className="recs">
            {recs.map((r) => (
              <a key={r.id} className="rec" data-kind={r.kind} href={href(r.route, r.param)}>
                <span className="mark" aria-hidden="true" />
                <span>
                  <div className="t">{r.title}</div>
                  <div className="r">{r.reason}</div>
                </span>
                <span className="go" aria-hidden="true">→</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {focus && (
        <section>
          <div className="between">
            <h2 className="section-title">This week's focus</h2>
            <a className="faint tiny" href={href("reviews")}>From your weekly review</a>
          </div>
          <ol className="plist">
            {focus.focus.map((f, i) => <li key={i}><span className="n">{i + 1}</span><span>{f}</span></li>)}
          </ol>
        </section>
      )}

      {/* 4 — What I'm building */}
      {(running.length > 0 || activeProjects.length > 0) && (
        <section aria-labelledby="building-title">
          <div className="between">
            <h2 className="section-title" id="building-title">Building</h2>
            <a className="faint tiny" href={href("projects")}>All projects</a>
          </div>
          <div className="card" style={{ padding: "6px 18px" }}>
            {running.map((x) => (
              <a key={x.id} className="item-row" href={href("experiments", x.id)}>
                <div>
                  <div className="item-title"><span className="status-dot running" />Experiment: {x.title}</div>
                  <div className="faint tiny" style={{ marginTop: 3 }}>{x.measure ? `Measuring: ${x.measure}` : "Running"}</div>
                </div>
              </a>
            ))}
            {activeProjects.map((pr) => {
              const next = pr.nextAction || pr.milestones.find((m) => !m.done)?.title;
              return (
                <a key={pr.id} className="item-row" href={href("projects", pr.id)}>
                  <div>
                    <div className="item-title"><span className={`status-dot ${pr.stage}`} />{pr.name}</div>
                    <div className="faint tiny" style={{ marginTop: 3 }}>{next ? `Next: ${next}` : "No next action set — what's the next physical step?"}</div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* 5 — Momentum and evidence */}
      <section className="momentum" aria-label="Momentum">
        <div><div className="n">{p.streak}</div><div className="l">day streak</div></div>
        <div><div className="n">{p.demonstrated}</div><div className="l">sessions demonstrated</div></div>
        <div><div className="n">{state.evidence.filter((e) => e.source.kind !== "session").length}</div><div className="l">real-world evidence</div></div>
      </section>

      {recentEvidence.length > 0 && (
        <section>
          <div className="between">
            <h2 className="section-title">Recent evidence</h2>
            <a className="faint tiny" href={href("evidence")}>All evidence</a>
          </div>
          {recentEvidence.map((e) => (
            <div className="item-row" key={e.id}>
              <div style={{ minWidth: 0 }}>
                <div>{e.title}</div>
                <div className="faint tiny" style={{ marginTop: 3 }}>{formatDate(e.date)} · {EVIDENCE_KINDS[e.kind]}</div>
              </div>
            </div>
          ))}
        </section>
      )}

      <nav className="week" aria-label={`Programme week ${weekForDay(d)}`}>
        {Array.from({ length: 7 }, (_, i) => weekStart + i).map((day) => {
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
    </div>
  );
}
