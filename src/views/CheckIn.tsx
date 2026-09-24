import { useState } from "react";
import { useAction, useAppState, useToday } from "../app/context";
import { navigate } from "../app/router";
import { Segmented, TextArea } from "../components/ui";
import { addManualEvidence } from "../domain/actions";
import { dayLog, eveningQuestions, saveEvening, saveMorning, type EveningInput } from "../domain/daily";
import type { AppState } from "../domain/types";

type Mode = "morning" | "evening";

export function CheckInView({ param }: { param?: string }) {
  const state = useAppState();
  const today = useToday();
  const log = dayLog(state, today);
  const fallback: Mode = log.morning && new Date().getHours() >= 15 ? "evening" : "morning";
  const [mode, setMode] = useState<Mode>(param === "morning" || param === "evening" ? param : fallback);

  return (
    <div>
      <header className="page-head">
        <div className="kicker">{new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</div>
        <h1>{mode === "morning" ? "Morning check-in" : "Evening review"}</h1>
        <p className="lede">
          {mode === "morning"
            ? "What today actually holds. The dashboard, the mentor and your focus adapt to it."
            : "Close the day honestly. The questions change with what actually happened."}
        </p>
      </header>
      <div style={{ marginBottom: 22 }}>
        <Segmented<Mode> label="Check-in" value={mode} onChange={setMode}
          options={[{ value: "morning", label: log.morning ? "Morning ✓" : "Morning" }, { value: "evening", label: log.evening ? "Evening ✓" : "Evening" }]} />
      </div>
      {mode === "morning" ? <MorningForm key="m" state={state} today={today} /> : <EveningForm key="e" state={state} today={today} />}
    </div>
  );
}

function MorningForm({ state, today }: { state: AppState; today: string }) {
  const run = useAction();
  const m = dayLog(state, today).morning;
  const [plan, setPlan] = useState(m?.plan ?? "");
  const [priorities, setPriorities] = useState<string[]>([0, 1, 2].map((i) => m?.priorities[i] ?? ""));
  const [workingOn, setWorkingOn] = useState(m?.workingOn ?? "");
  const [difficulty, setDifficulty] = useState(m?.difficulty ?? "");
  const [focus, setFocus] = useState(m?.focus ?? "");
  const [projectIds, setProjectIds] = useState<string[]>(m?.projectIds ?? []);
  const activeProjects = state.projects.filter((p) => !["Done", "Abandoned"].includes(p.stage));

  function save() {
    if (run((s, now) => saveMorning(s, today, { plan, priorities, workingOn, difficulty, focus, projectIds }, now), "Checked in. Here's your day.")) navigate("today");
  }

  return (
    <div className="stack">
      <TextArea label="What are you doing today?" value={plan} onChange={setPlan} rows={3} placeholder="Here's what I'm doing today…" />
      <div>
        <div className="field-label">Your priorities, in order</div>
        {priorities.map((pr, i) => (
          <div className="row" key={i} style={{ marginBottom: 8, flexWrap: "nowrap" }}>
            <span className="serif" style={{ color: "var(--brass)", width: 16 }}>{i + 1}</span>
            <input type="text" aria-label={`Priority ${i + 1}`} value={pr} placeholder={i === 0 ? "The one that matters most" : "Optional"}
              onChange={(e) => setPriorities(priorities.map((x, j) => (j === i ? e.target.value : x)))} />
          </div>
        ))}
        <div className="hint">Three at most. If everything is a priority, nothing is.</div>
      </div>
      <TextArea label="What are you currently working on?" value={workingOn} onChange={setWorkingOn} rows={2} placeholder="Products, deals, builds, problems in flight" />
      {activeProjects.length > 0 && (
        <div>
          <div className="field-label">Projects in play today</div>
          <div className="chips">
            {activeProjects.map((p) => {
              const on = projectIds.includes(p.id);
              return (
                <button key={p.id} type="button" className={`pill chip-btn ${on ? "brass" : ""}`} aria-pressed={on}
                  onClick={() => setProjectIds(on ? projectIds.filter((x) => x !== p.id) : [...projectIds, p.id])}>
                  {on ? "✓ " : ""}{p.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <TextArea label="What's currently difficult?" value={difficulty} onChange={setDifficulty} rows={2} placeholder="Be specific — this is what the system will help with" />
      <TextArea label="What should Venture Forge help you improve today?" value={focus} onChange={setFocus} rows={2} placeholder="e.g. getting prospects to reply, pricing, staying focused" />
      <div className="sticky-actions">
        <button className="btn primary block" onClick={save}>{dayLog(state, today).morning ? "Update check-in" : "Start the day"}</button>
      </div>
    </div>
  );
}

function EveningForm({ state, today }: { state: AppState; today: string }) {
  const run = useAction();
  const log = dayLog(state, today);
  const e = log.evening;
  const questions = eveningQuestions(state, today);
  const priorities = log.morning?.priorities ?? [];
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const [k, v] of Object.entries(e ?? {})) if (typeof v === "string") init[k] = v;
    for (const [id, note] of Object.entries(e?.experimentNotes ?? {})) init[`experiment:${id}`] = note;
    return init;
  });
  const [moved, setMoved] = useState<boolean[]>(priorities.map((_, i) => e?.prioritiesMoved?.[i] ?? false));
  const [logBuilt, setLogBuilt] = useState(true);
  const set = (k: string, v: string) => setAnswers({ ...answers, [k]: v });

  function save() {
    const input: EveningInput = { experimentNotes: {} };
    for (const q of questions) {
      if (q.key === "prioritiesMoved") input.prioritiesMoved = moved;
      else if (q.key.startsWith("experiment:")) {
        const v = answers[q.key]?.trim();
        if (v) input.experimentNotes![q.key.slice("experiment:".length)] = v;
      } else (input as Record<string, unknown>)[q.key] = answers[q.key] ?? "";
    }
    if (!Object.keys(input.experimentNotes!).length) delete input.experimentNotes;
    const built = answers.built?.trim();
    const ok = run((s, now) => {
      let next = saveEvening(s, today, input, now);
      if (built && logBuilt && !e?.built) {
        next = addManualEvidence(next, { title: built.split("\n")[0]!.slice(0, 120), note: built, kind: "other", skills: [] }, now);
      }
      return next;
    }, "Day closed.");
    if (ok) navigate("today");
  }

  return (
    <div className="stack">
      {questions.map((q) => {
        if (q.key === "prioritiesMoved") {
          return (
            <div key={q.key}>
              <div className="field-label">{q.prompt}</div>
              {priorities.map((pr, i) => (
                <label key={i} className={`check ${moved[i] ? "done" : ""}`}>
                  <input type="checkbox" checked={moved[i] ?? false} onChange={(ev) => setMoved(moved.map((m, j) => (j === i ? ev.target.checked : m)))} />
                  <span>{pr}</span>
                </label>
              ))}
            </div>
          );
        }
        return (
          <div key={q.key}>
            <TextArea label={q.prompt} value={answers[q.key] ?? ""} onChange={(v) => set(q.key, v)} rows={2} />
            {q.because && <div className="q-because">Asked because: {q.because.toLowerCase()}</div>}
            {q.key === "built" && answers.built?.trim() && !e?.built && (
              <label className="check small">
                <input type="checkbox" checked={logBuilt} onChange={(ev) => setLogBuilt(ev.target.checked)} />
                <span>Also log this as evidence</span>
              </label>
            )}
          </div>
        );
      })}
      <div className="sticky-actions">
        <button className="btn primary block" onClick={save}>{e ? "Update review" : "Close the day"}</button>
      </div>
    </div>
  );
}
