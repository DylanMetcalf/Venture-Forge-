import { useEffect, useMemo, useRef, useState } from "react";
import { createAnthropicProvider } from "../ai/anthropic";
import { MENTOR_PERSONA, buildMentorContext } from "../ai/context";
import { MentorError } from "../ai/types";
import { useAction, useAppState, useToday } from "../app/context";
import { href } from "../app/router";
import { appendMentorMessages, clearMentor } from "../domain/actions";
import { secrets } from "../storage/secrets";

/** How many past messages are sent with each request. */
const CONTEXT_TURNS = 30;

const QUICK_PROMPTS = [
  { label: "Challenge my plan today", text: "Look at my check-in and priorities for today. What's weak about this plan, and what would you change?" },
  { label: "Review my work", text: "Review my most recent evidence and session work. Be honest about the quality and tell me what a stronger version would look like." },
  { label: "Suggest an experiment", text: "Based on what I'm working on and what's difficult, propose one experiment I can run this week: hypothesis, test, measure." },
  { label: "What am I avoiding?", text: "From my records, what patterns do you see — what am I avoiding or repeating? Ask me questions if you need to." },
  { label: "Explain a concept", text: "Explain the concept behind today's session in the context of my actual work, then give me a question to check I understood." },
];

export function MentorView() {
  const state = useAppState();
  const today = useToday();
  const run = useAction();
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(() => !!secrets.getAnthropicKey());
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const provider = useMemo(() => createAnthropicProvider(() => secrets.getAnthropicKey()), []);
  const context = useMemo(() => buildMentorContext(state, today), [state, today]);
  const messages = state.mentor.messages;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, streaming]);
  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => {
    const onFocus = () => setHasKey(!!secrets.getAnthropicKey());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  async function send(text: string) {
    const content = text.trim();
    if (!content || streaming !== null) return;
    setError(null);
    setDraft("");
    run((s, now) => appendMentorMessages(s, [{ role: "user", content }], now));
    const history = [...messages, { role: "user" as const, content }].slice(-CONTEXT_TURNS).map(({ role, content: c }) => ({ role, content: c }));
    const controller = new AbortController();
    abortRef.current = controller;
    setStreaming("");
    try {
      let acc = "";
      const reply = await provider.send(
        { system: { persona: MENTOR_PERSONA, context }, messages: history, model: state.settings.mentorModel, signal: controller.signal },
        (delta) => {
          acc += delta;
          setStreaming(acc);
        },
      );
      run((s, now) => appendMentorMessages(s, [{ role: "assistant", content: reply.text || acc }], now));
      if (reply.stopReason === "max_tokens") setError("The reply was cut off at the length limit.");
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setError(e instanceof MentorError ? e.message : "Something went wrong talking to the mentor.");
    } finally {
      setStreaming(null);
      abortRef.current = null;
    }
  }

  return (
    <div>
      <header className="page-head">
        <div className="kicker">Founder coach</div>
        <h1>Mentor</h1>
        <p className="lede">Demanding, honest, and grounded in your actual records. It won't praise ordinary work.</p>
      </header>

      {!hasKey ? (
        <section className="card stack-sm">
          <div className="eyebrow">Set up</div>
          <p>
            The mentor runs on Claude using your own Anthropic API key, called directly from this device. The key is stored only
            on this device, separately from your data, and is never included in backups.
          </p>
          <p className="small muted">Get a key at console.anthropic.com → API Keys, then add it in Settings.</p>
          <div><a className="btn primary" href={href("settings")}>Add API key in Settings</a></div>
        </section>
      ) : (
        <>
          {messages.length === 0 && streaming === null && (
            <section className="stack-sm" style={{ marginBottom: 22 }}>
              <div className="eyebrow">Start with</div>
              <div className="prompts">
                {QUICK_PROMPTS.map((q) => <button key={q.label} onClick={() => void send(q.text)}>{q.label}</button>)}
              </div>
            </section>
          )}

          <div className="chat" aria-live="polite">
            {messages.map((m, i) => <div key={i} className={`msg ${m.role}`}>{m.content}</div>)}
            {streaming !== null && (
              <div className="msg assistant">{streaming || <span className="typing">Thinking…</span>}</div>
            )}
            <div ref={endRef} />
          </div>
          {error && <div className="banner" role="alert" style={{ marginTop: 14 }}>{error}</div>}

          <div className="sticky-actions" style={{ marginTop: 18 }}>
            {messages.length > 0 && streaming === null && (
              <div className="prompts" style={{ marginBottom: 10 }}>
                {QUICK_PROMPTS.slice(0, 3).map((q) => <button key={q.label} onClick={() => void send(q.text)}>{q.label}</button>)}
              </div>
            )}
            <form className="composer" onSubmit={(e) => { e.preventDefault(); void send(draft); }}>
              <label className="sr-only" htmlFor="mentor-input">Message</label>
              <textarea id="mentor-input" rows={2} value={draft} placeholder="Ask, report, or think out loud…"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void send(draft); } }} />
              {streaming !== null ? (
                <button type="button" className="btn" onClick={() => abortRef.current?.abort()}>Stop</button>
              ) : (
                <button type="submit" className="btn primary" disabled={!draft.trim()}>Send</button>
              )}
            </form>
          </div>

          <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
            <details>
              <summary className="faint tiny" style={{ cursor: "pointer" }}>What the mentor knows</summary>
              <pre className="small muted" style={{ whiteSpace: "pre-wrap", marginTop: 10, fontFamily: "var(--sans)" }}>{context}</pre>
            </details>
            {messages.length > 0 && streaming === null && (
              <button className="link-btn tiny" style={{ color: "var(--text-3)" }}
                onClick={() => { if (confirm("Start a new conversation? The current one will be cleared.")) run((s) => clearMentor(s)); }}>
                New conversation
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
