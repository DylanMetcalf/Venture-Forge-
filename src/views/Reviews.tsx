import { useState } from "react";
import { skillLabel } from "../content/curriculum";
import { useAction, useAppState, useToday } from "../app/context";
import { href } from "../app/router";
import { Empty, Segmented, TextArea, formatDate } from "../components/ui";
import { reviewEntries } from "../domain/selectors";
import { addDays } from "../domain/util";
import { saveWeeklyReview, weekFacts, weekStartOf, type WeekFacts } from "../domain/weekly";
import type { AppState, LocalDate } from "../domain/types";

export function ReviewsView() {
  const state = useAppState();
  const today = useToday();
  const thisWeek = weekStartOf(today);
  const [week, setWeek] = useState<LocalDate>(new Date().getDay() >= 1 && new Date().getDay() <= 3 ? addDays(thisWeek, -7) : thisWeek);
  const past = [...state.weeklyReviews].sort((a, b) => b.weekStart.localeCompare(a.weekStart));
  const sessionReviews = reviewEntries(state);

  return (
    <div className="stack-lg">
      <p className="muted" style={{ margin: 0 }}>
        Once a week: look at what actually happened, name what stalled and what repeated, and set a small number of priorities
        for next week. The facts are gathered for you; the judgement is yours.
      </p>
      <Segmented<LocalDate> label="Week" value={week} onChange={setWeek}
        options={[{ value: addDays(thisWeek, -7), label: "Last week" }, { value: thisWeek, label: "This week" }]} />
      <WeeklyReviewForm key={week} state={state} weekStart={week} />

      {past.length > 0 && (
        <section>
          <h2 className="section-title">Past weekly reviews</h2>
          {past.map((r) => (
            <details key={r.weekStart} className="card" style={{ marginBottom: 10 }}>
              <summary><span>Week of {formatDate(r.weekStart)}</span><span className="chev" aria-hidden="true">⌄</span></summary>
              <div className="small" style={{ marginTop: 10 }}>
                <div className="eyebrow">Focus set</div>
                <ol className="plist">{r.focus.map((f, i) => <li key={i}><span className="n">{i + 1}</span><span>{f}</span></li>)}</ol>
                {r.moved && <p><span className="faint">Moved: </span>{r.moved}</p>}
                {r.stalled && <p><span className="faint">Stalled: </span>{r.stalled}</p>}
                {r.mistakes && <p><span className="faint">Repeated mistakes: </span>{r.mistakes}</p>}
                {r.change && <p><span className="faint">Change: </span>{r.change}</p>}
              </div>
            </details>
          ))}
        </section>
      )}

      {sessionReviews.length > 0 && (
        <section>
          <h2 className="section-title">Curriculum reviews</h2>
          {sessionReviews.map((r) => (
            <a key={r.day} className="item-row" href={href("session", r.day)}>
              <div><div className="item-title">{r.theme}</div><div className="faint tiny">Day {r.day}{r.closedOn && ` · ${formatDate(r.closedOn)}`}</div></div>
              <span className="faint" aria-hidden="true">→</span>
            </a>
          ))}
        </section>
      )}
    </div>
  );
}

function FactList({ title, items, empty }: { title: string; items: string[]; empty?: string }) {
  if (!items.length && !empty) return null;
  return (
    <div>
      <div className="eyebrow" style={{ marginTop: 14 }}>{title}</div>
      {items.length ? <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>{items.map((x, i) => <li key={i}>{x}</li>)}</ul> : <div className="small faint">{empty}</div>}
    </div>
  );
}

function Facts({ f }: { f: WeekFacts }) {
  const demo = f.sessionsClosed.filter((s) => s.demonstrated).length;
  return (
    <section className="card">
      <div className="eyebrow">What the records say</div>
      <dl className="kv">
        <dt>Sessions</dt><dd>{f.sessionsClosed.length} closed, {demo} demonstrated</dd>
        <dt>Evidence</dt><dd>{f.evidence.length} ({f.realWorldEvidence} real-world)</dd>
        <dt>Check-ins</dt><dd>{f.checkIns.mornings} mornings, {f.checkIns.evenings} evenings</dd>
        <dt>Priorities moved</dt><dd>{f.prioritiesMoved.set ? `${f.prioritiesMoved.moved} of ${f.prioritiesMoved.set}` : "—"}</dd>
        <dt>Promises kept</dt><dd>{f.promises.graded ? `${f.promises.kept} of ${f.promises.graded}` : "—"}</dd>
      </dl>
      <FactList title="Built / proven" items={f.evidence.map((e) => e.title)} empty="No evidence this week." />
      <FactList title="Milestones completed" items={f.milestonesDone} />
      <FactList title="Experiments" items={[...f.experimentsStarted.map((x) => `Started: ${x}`), ...f.experimentsConcluded.map((x) => `Concluded: ${x}`)]} />
      <FactList title="Decisions" items={f.decisions} />
      <FactList title="Avoided (in your own words)" items={f.avoided} />
      <FactList title="Stalled projects (no activity)" items={f.stalledProjects} />
      {f.skillsTouched.length > 0 && <div className="faint tiny" style={{ marginTop: 14 }}>Skills with evidence: {f.skillsTouched.map(skillLabel).join(", ")}</div>}
    </section>
  );
}

function WeeklyReviewForm({ state, weekStart }: { state: AppState; weekStart: LocalDate }) {
  const run = useAction();
  const existing = state.weeklyReviews.find((r) => r.weekStart === weekStart);
  const f = weekFacts(state, weekStart);
  const [moved, setMoved] = useState(existing?.moved ?? "");
  const [stalled, setStalled] = useState(existing?.stalled ?? (f.stalledProjects.length ? `${f.stalledProjects.join(", ")} — ` : ""));
  const [mistakes, setMistakes] = useState(existing?.mistakes ?? "");
  const [opportunities, setOpportunities] = useState(existing?.opportunities ?? "");
  const [change, setChange] = useState(existing?.change ?? "");
  const [focus, setFocus] = useState<string[]>([0, 1, 2].map((i) => existing?.focus[i] ?? ""));

  return (
    <div className="stack">
      <h2 className="section-title" style={{ marginBottom: 0 }}>Week of {formatDate(weekStart)} – {formatDate(addDays(weekStart, 6))}</h2>
      <Facts f={f} />
      <TextArea label="What moved forward?" value={moved} onChange={setMoved} rows={2} />
      <TextArea label="What stalled, and why?" value={stalled} onChange={setStalled} rows={2} />
      <TextArea label="What mistakes repeated?" value={mistakes} onChange={setMistakes} rows={2} placeholder="Look at what you avoided above. Is it a pattern?" />
      <TextArea label="What opportunities emerged?" value={opportunities} onChange={setOpportunities} rows={2} />
      <TextArea label="What should change next week?" value={change} onChange={setChange} rows={2} />
      <div>
        <div className="field-label">Next week's focus — at most three</div>
        {focus.map((x, i) => (
          <div className="row" key={i} style={{ marginBottom: 8, flexWrap: "nowrap" }}>
            <span className="serif" style={{ color: "var(--brass)", width: 16 }}>{i + 1}</span>
            <input type="text" aria-label={`Focus ${i + 1}`} value={x} onChange={(e) => setFocus(focus.map((y, j) => (j === i ? e.target.value : y)))}
              placeholder={i === 0 ? "The one thing that must move" : "Optional"} />
          </div>
        ))}
      </div>
      {state.days && Object.keys(state.days).length === 0 && Object.keys(state.sessions).length === 0 ? (
        <Empty>Nothing recorded yet this week — the review gets useful once you've checked in or closed a session.</Empty>
      ) : null}
      <div className="sticky-actions">
        <button className="btn primary block" onClick={() => run((s, now) => saveWeeklyReview(s, weekStart, { moved, stalled, mistakes, opportunities, change, focus }, now), "Weekly review saved. Next week's focus is set.")}>
          {existing ? "Update weekly review" : "Save weekly review"}
        </button>
      </div>
    </div>
  );
}
