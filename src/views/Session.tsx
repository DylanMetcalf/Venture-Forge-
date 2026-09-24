import { useState, type ReactNode } from "react";
import { FORMATS, PILLARS, getDay, isReviewFormat, phaseForDay, skillLabel, weekForDay } from "../content/curriculum";
import type { CurriculumDay } from "../content/types";
import { useAction, useAppState } from "../app/context";
import { href } from "../app/router";
import { StatusPill, TextArea, formatDate } from "../components/ui";
import {
  MIN_WORK_CHARS,
  closeBlockers,
  closeSession,
  commit,
  goToDay,
  gradeCommitment,
  hasRecordedWork,
  isClosed,
  sessionFor,
  sessionStatus,
  updateSession,
  type SessionPatch,
} from "../domain/sessions";

export function SessionView({ param }: { param?: string }) {
  const state = useAppState();
  const parsed = param ? Number.parseInt(param, 10) : NaN;
  const day = Number.isInteger(parsed) && parsed >= 1 ? parsed : state.currentDay;
  const content = getDay(day);

  if (!content) {
    return (
      <div>
        <header className="page-head">
          <div className="kicker">Day {day}</div>
          <h1>Not written yet</h1>
          <p className="lede">
            The programme is written in careful batches rather than filled with placeholder lessons, so there's no session here
            yet. Use today for real work, and log what you prove.
          </p>
        </header>
        <div className="row">
          <a className="btn primary" href={href("evidence")}>Log evidence</a>
          <a className="btn ghost" href={href("roadmap")}>See the year</a>
        </div>
      </div>
    );
  }
  // Keyed so local form state (e.g. the promise draft) resets when switching days.
  return <SessionBody key={day} day={day} content={content} />;
}

function SessionBody({ day, content }: { day: number; content: CurriculumDay }) {
  const state = useAppState();
  const run = useAction();
  const rec = sessionFor(state, day);
  const status = sessionStatus(state.sessions[day]);
  const closed = isClosed(status);
  const phase = phaseForDay(day);
  const review = isReviewFormat(content.format);
  const nextDay = getDay(day + 1);

  const save = (patch: SessionPatch) => run((s, now) => updateSession(s, day, patch, now));
  const blockers = closeBlockers(rec);
  const demonstrates = hasRecordedWork(rec);

  // Sections are numbered in reading order; skip the ones this day doesn't have.
  let n = 0;
  const num = () => String(++n).padStart(2, "0");

  return (
    <article data-pillar={content.pillar}>
      {day !== state.currentDay && (
        <div className="notice">
          <span className="muted">Viewing Day {day}. You're currently on Day {state.currentDay}.</span>
          <button className="btn sm" onClick={() => run((s) => goToDay(s, day), `Day ${day} is now your current day.`)}>Make Day {day} current</button>
        </div>
      )}

      <header className="session-head">
        <div className="row" style={{ gap: 14 }}>
          <span className="pillar-tag">{PILLARS[content.pillar].name}</span>
          <span className="faint small">Day {day} · {phase.name} · Week {weekForDay(day)}</span>
        </div>
        <h1 className="theme">{content.theme}</h1>
        <div className="row">
          <StatusPill status={status} />
          <span className="pill">{FORMATS[content.format]}</span>
          <span className="pill">~{content.minutes} min</span>
        </div>
        <dl className="brief">
          <div><dt>Objective</dt><dd>{content.capability}</dd></div>
          <div><dt>Done when</dt><dd className="muted">{content.doneWhen}</dd></div>
        </dl>
      </header>

      <Block n={num()} label="Why it matters"><p className="why">{content.why}</p></Block>

      <Block n={num()} label="Commit"><PromiseCard day={day} commitment={rec.commitment} /></Block>

      {content.learn && (
        <Block n={num()} label="Learn">
          <div className="reading">{content.learn.split("\n\n").map((para, i) => <p key={i}>{para}</p>)}</div>
          {content.resource && (
            <div className="resource" style={{ marginTop: 8 }}>
              Go deeper — <strong>{content.resource.title}</strong>
              {content.resource.author && ` by ${content.resource.author}`}
              {content.resource.note && `. ${content.resource.note}`}
            </div>
          )}
        </Block>
      )}

      {content.think && (
        <Block n={num()} label="Think">
          <p className="prompt">{content.think}</p>
          <TextArea label="Your answer" value={rec.responses.think ?? ""} onChange={(v) => save({ responses: { think: v } })} rows={3} />
        </Block>
      )}

      {content.act && (
        <Block n={num()} label={review ? "Review" : "Apply"}>
          <p className="prompt">{content.act}</p>
          <TextArea
            label={review ? "Your review" : "What you did, or your answer"}
            value={rec.responses.act ?? ""}
            onChange={(v) => save({ responses: { act: v } })}
            rows={review ? 9 : 5}
          />
        </Block>
      )}

      <Block n={num()} label="Evidence">
        <p className="prompt">
          {content.build ?? "Optional: note anything tangible you produced — a file, a message sent, a number calculated, a decision made."}
        </p>
        <TextArea label="What you produced" value={rec.responses.build ?? ""} onChange={(v) => save({ responses: { build: v } })}
          hint="Specific enough that future-you could verify it." rows={3} />
      </Block>

      <section className="closeout" aria-labelledby="closeout">
        <div className="eyebrow">{num()} · Evening</div>
        <h2 id="closeout">Close out</h2>

        {rec.commitment && (
          <div style={{ marginTop: 14 }}>
            <div className="field-label">This morning you promised: <span style={{ color: "var(--text)" }}>{rec.commitment}</span></div>
            <div className="row">
              <button className={`btn sm ${rec.commitmentKept === true ? "selected" : ""}`} aria-pressed={rec.commitmentKept === true} onClick={() => run((s) => gradeCommitment(s, day, true))}>Kept</button>
              <button className={`btn sm ${rec.commitmentKept === false ? "selected" : ""}`} aria-pressed={rec.commitmentKept === false} onClick={() => run((s) => gradeCommitment(s, day, false))}>Not kept</button>
            </div>
          </div>
        )}

        <TextArea label="What did you learn?" value={rec.reflection.learned ?? ""} onChange={(v) => save({ reflection: { learned: v } })} rows={3} />
        <TextArea label="What did you avoid?" value={rec.reflection.avoided ?? ""} onChange={(v) => save({ reflection: { avoided: v } })} rows={2} placeholder="Honest answers only. Blank is fine if nothing." />

        {state.projects.length > 0 && (
          <>
            <label className="field-label" htmlFor="applied-to">Applied to a project <span className="faint">(optional)</span></label>
            <select id="applied-to" value={rec.projectId ?? ""} onChange={(e) => save({ projectId: e.target.value || null })}>
              <option value="">None</option>
              {state.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </>
        )}

        <hr className="rule" />
        <p className="small muted">
          {demonstrates ? (
            <>{closed ? "Counts" : "Closes"} as <strong style={{ color: "var(--good)" }}>Demonstrated</strong> — your work becomes evidence for {content.skills.map(skillLabel).join(", ")}.</>
          ) : (
            <>{closed ? "Counts" : "Closes"} as <strong>Consumed</strong>. To demonstrate it, record real work (at least {MIN_WORK_CHARS} characters) under {review ? "Review" : "Apply"} or Evidence.</>
          )}
        </p>

        {closed ? (
          <p className="small faint" style={{ marginTop: 8 }}>Closed{rec.closedOn ? ` on ${formatDate(rec.closedOn)}` : ""}. Edits save automatically and keep your evidence up to date.</p>
        ) : (
          <>
            {blockers.length > 0 && <ul className="blockers">{blockers.map((b) => <li key={b}>{b}</li>)}</ul>}
            <button className="btn primary block" style={{ marginTop: 16 }} disabled={blockers.length > 0}
              onClick={() => run((s, now) => closeSession(s, day, now), `Day ${day} closed.`)}>
              Close out Day {day}
            </button>
          </>
        )}
        {closed && day === state.currentDay && (
          <button className="btn primary block" style={{ marginTop: 14 }} onClick={() => run((s) => goToDay(s, day + 1))}>
            {nextDay ? `On to Day ${day + 1} →` : `Go to Day ${day + 1}`}
          </button>
        )}
      </section>
    </article>
  );
}

function Block({ n, label, children }: { n: string; label: string; children: ReactNode }) {
  return (
    <section className="block">
      <div className="block-label"><span className="n">{n}</span><span className="k">{label}</span></div>
      {children}
    </section>
  );
}

function PromiseCard({ day, commitment }: { day: number; commitment?: string }) {
  const run = useAction();
  const [editing, setEditing] = useState(!commitment);
  const [draft, setDraft] = useState(commitment ?? "");

  if (commitment && !editing) {
    return (
      <div>
        <p className="prompt" style={{ fontFamily: "var(--serif)", fontSize: 19 }}>“{commitment}”</p>
        <div className="row small faint">
          <span>You'll grade this when you close out.</span>
          <button className="link-btn" onClick={() => setEditing(true)}>Edit</button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <p className="prompt">One thing you will definitely do today. Small and checkable beats ambitious.</p>
      <label className="sr-only" htmlFor="promise">Today's promise</label>
      <textarea id="promise" rows={2} value={draft} placeholder="I will…" onChange={(e) => setDraft(e.target.value)} style={{ minHeight: 64 }} />
      <div className="row" style={{ marginTop: 10 }}>
        <button className="btn primary" onClick={() => { if (run((s, now) => commit(s, day, draft, now), "Committed. See you tonight.")) setEditing(false); }}>
          {commitment ? "Update promise" : "Commit to today"}
        </button>
        {commitment && <button className="btn ghost" onClick={() => { setDraft(commitment); setEditing(false); }}>Cancel</button>}
      </div>
    </div>
  );
}
