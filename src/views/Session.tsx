import { useState } from "react";
import { FORMATS, getDay, isReviewFormat, phaseForDay, skillLabel, weekForDay } from "../content/curriculum";
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
      <div className="card stack-sm">
        <div className="eyebrow">Day {day}</div>
        <p className="muted">
          Day {day} hasn't been written yet. The programme is authored in careful batches rather than filled with placeholder
          lessons, so there's no session here today.
        </p>
        <div className="row">
          <a className="btn" href={href("today")}>Back to Today</a>
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

  return (
    <div>
      {day !== state.currentDay && (
        <div className="card small row" style={{ marginBottom: 18, justifyContent: "space-between" }}>
          <span className="muted">You're viewing Day {day}. Your current day is Day {state.currentDay}.</span>
          <button className="btn sm" onClick={() => run((s) => goToDay(s, day), `Day ${day} is now your current day.`)}>
            Make Day {day} current
          </button>
        </div>
      )}

      <header className="session-head">
        <div className="eyebrow">{phase.name} · Week {weekForDay(day)} · {FORMATS[content.format]}</div>
        <h2 className="title">Day {day} — {content.theme}</h2>
        <div className="row" style={{ marginTop: 10 }}>
          <StatusPill status={status} />
          <span className="pill">~{content.minutes} min</span>
          {content.skills.map((s) => <a key={s} className="pill" href={href("skills")}>{skillLabel(s)}</a>)}
        </div>
      </header>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="eyebrow">Objective</div>
        <div>{content.capability}</div>
        <div className="eyebrow" style={{ marginTop: 12 }}>Done when</div>
        <div className="muted">{content.doneWhen}</div>
      </div>

      <Block label="Why it matters"><p className="prompt muted">{content.why}</p></Block>

      <PromiseCard day={day} commitment={rec.commitment} />

      {content.learn && (
        <Block label="Learn">
          <div className="reading">{content.learn.split("\n\n").map((para, i) => <p key={i}>{para}</p>)}</div>
        </Block>
      )}

      {content.resource && (
        <Block label="Resource">
          <div className="muted small">
            {content.resource.type === "book" ? "Book" : content.resource.type} — <strong>{content.resource.title}</strong>
            {content.resource.author && ` by ${content.resource.author}`}
            {content.resource.note && `. ${content.resource.note}`}
          </div>
        </Block>
      )}

      {content.think && (
        <Block label="Think">
          <p className="prompt">{content.think}</p>
          <TextArea label="Your answer" value={rec.responses.think ?? ""} onChange={(v) => save({ responses: { think: v } })} />
        </Block>
      )}

      {content.act && (
        <Block label={review ? "Review" : "Apply"}>
          <p className="prompt">{content.act}</p>
          <TextArea
            label={review ? "Your review" : "What you did, or your answer"}
            value={rec.responses.act ?? ""}
            onChange={(v) => save({ responses: { act: v } })}
            rows={review ? 8 : 4}
          />
        </Block>
      )}

      <Block label="Build / Evidence">
        <p className="prompt">
          {content.build ?? "Optional: note anything tangible you produced — a file, a message sent, a number calculated, a decision made."}
        </p>
        <TextArea
          label="What you produced"
          value={rec.responses.build ?? ""}
          onChange={(v) => save({ responses: { build: v } })}
          hint="Be specific enough that future-you could verify it."
        />
      </Block>

      <section className="card" style={{ marginTop: 30 }} aria-labelledby="closeout">
        <h3 className="eyebrow" id="closeout" style={{ fontFamily: "var(--font-sans)" }}>Close out · Evening</h3>

        {rec.commitment && (
          <div style={{ marginBottom: 6 }}>
            <div className="field-label">This morning's promise: <span style={{ color: "var(--text)" }}>{rec.commitment}</span></div>
            <div className="row">
              <button className={`btn sm ${rec.commitmentKept === true ? "selected" : ""}`} aria-pressed={rec.commitmentKept === true} onClick={() => run((s) => gradeCommitment(s, day, true))}>Kept</button>
              <button className={`btn sm ${rec.commitmentKept === false ? "selected" : ""}`} aria-pressed={rec.commitmentKept === false} onClick={() => run((s) => gradeCommitment(s, day, false))}>Not kept</button>
            </div>
          </div>
        )}

        <TextArea label="What did you learn?" value={rec.reflection.learned ?? ""} onChange={(v) => save({ reflection: { learned: v } })} rows={3} />
        <TextArea label="What did you avoid?" value={rec.reflection.avoided ?? ""} onChange={(v) => save({ reflection: { avoided: v } })} rows={2} placeholder="Honest answers only. Blank is fine if nothing." />

        <label className="field-label" htmlFor="applied-to">Applied to a real project</label>
        {state.projects.length > 0 ? (
          <select id="applied-to" value={rec.projectId ?? ""} onChange={(e) => save({ projectId: e.target.value || null })}>
            <option value="">Not applied to a specific project</option>
            {state.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        ) : (
          <div className="hint" style={{ marginTop: 0 }}>
            <a href={href("projects")}>Add your ventures as projects</a> to link sessions and evidence to real work.
          </div>
        )}

        <hr className="rule" />
        <p className="small muted" style={{ marginBottom: 12 }}>
          {demonstrates ? (
            <>{closed ? "Counts" : "Closes"} as <strong style={{ color: "var(--sage)" }}>Demonstrated</strong> — your Apply/Build work becomes evidence for {content.skills.map(skillLabel).join(", ")}.</>
          ) : (
            <>{closed ? "Counts" : "Closes"} as <strong>Consumed</strong>. To demonstrate it, record real work (at least {MIN_WORK_CHARS} characters) under Apply or Build.</>
          )}
        </p>
        {closed ? (
          <p className="small faint">Closed{rec.closedOn ? ` on ${formatDate(rec.closedOn)}` : ""}. Edits save automatically and keep your evidence up to date.</p>
        ) : (
          <>
            {blockers.length > 0 && <ul className="blockers">{blockers.map((b) => <li key={b}>{b}</li>)}</ul>}
            <button
              className="btn primary block"
              style={{ marginTop: 12 }}
              disabled={blockers.length > 0}
              onClick={() => run((s, now) => closeSession(s, day, now), `Day ${day} closed.`)}
            >
              Close out Day {day}
            </button>
          </>
        )}
        {closed && day === state.currentDay && (
          <button className="btn primary block" style={{ marginTop: 10 }} onClick={() => run((s) => goToDay(s, day + 1))}>
            {nextDay ? `Continue to Day ${day + 1} →` : `Go to Day ${day + 1}`}
          </button>
        )}
      </section>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="block">
      <div className="k">{label}</div>
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
      <section className="card" style={{ marginTop: 26 }}>
        <div className="between">
          <div className="eyebrow">Today's promise · Morning</div>
          <button className="link-btn tiny" onClick={() => setEditing(true)}>Edit</button>
        </div>
        <div>{commitment}</div>
        <div className="hint">You'll grade this when you close out.</div>
      </section>
    );
  }
  return (
    <section className="card" style={{ marginTop: 26 }}>
      <label className="eyebrow" htmlFor="promise" style={{ display: "block" }}>Today's promise · Morning</label>
      <div className="muted small" style={{ marginBottom: 8 }}>One thing you will definitely do today. Small and checkable beats ambitious.</div>
      <textarea id="promise" rows={2} value={draft} placeholder="I will…" onChange={(e) => setDraft(e.target.value)} />
      <div className="row" style={{ marginTop: 10 }}>
        <button className="btn primary" onClick={() => { if (run((s, now) => commit(s, day, draft, now), "Committed. See you tonight.")) setEditing(false); }}>
          {commitment ? "Update promise" : "Commit to today"}
        </button>
        {commitment && <button className="btn ghost" onClick={() => { setDraft(commitment); setEditing(false); }}>Cancel</button>}
      </div>
    </section>
  );
}
