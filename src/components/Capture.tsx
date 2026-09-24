import { useEffect, useRef, useState } from "react";
import { useAction, useAppState, useToday } from "../app/context";
import { addManualEvidence, addMemory, addOpportunity } from "../domain/actions";
import { dayLog, saveMorning } from "../domain/daily";
import { EVIDENCE_KINDS, MEMORY_CATEGORIES, type EvidenceKind, type MemoryCategory } from "../domain/types";
import { Icon } from "./Icon";
import { Segmented } from "./ui";

type Target = "plan" | "idea" | "win" | "memory";

// Minimal typing for the Web Speech API (not in TypeScript's DOM lib everywhere).
interface SpeechRec {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}
function speechRecognition(): (new () => SpeechRec) | undefined {
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/**
 * Quick capture: one place to get a thought out of your head, by text or voice.
 * It's also the entry point for future voice-first use ("Venture Forge, here's
 * what I'm doing today…"): today that text lands in the morning plan.
 */
export function CaptureSheet({ onClose }: { onClose: () => void }) {
  const state = useAppState();
  const today = useToday();
  const run = useAction();
  const [target, setTarget] = useState<Target>("plan");
  const [text, setText] = useState("");
  const [kind, setKind] = useState<EvidenceKind>("other");
  const [category, setCategory] = useState<MemoryCategory>("context");
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const Speech = speechRecognition();

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      recRef.current?.stop();
    };
  }, [onClose]);

  function toggleMic() {
    if (!Speech) return;
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new Speech();
    rec.lang = navigator.language || "en-GB";
    rec.interimResults = false;
    rec.continuous = false;
    const base = text;
    rec.onresult = (e) => {
      const said = Array.from(e.results).map((r) => r[0]?.transcript ?? "").join(" ").trim();
      setText(base ? `${base} ${said}` : said);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  function save() {
    const t = text.trim();
    const firstLine = t.split("\n")[0]!.slice(0, 120);
    let ok = false;
    if (target === "plan") {
      const m = dayLog(state, today).morning;
      ok = run(
        (s, now) =>
          saveMorning(s, today, {
            plan: m?.plan ? `${m.plan}\n${t}` : t,
            priorities: m?.priorities ?? [],
            workingOn: m?.workingOn ?? "",
            difficulty: m?.difficulty ?? "",
            focus: m?.focus ?? "",
            projectIds: m?.projectIds ?? [],
          }, now),
        "Added to today's plan.",
      );
    } else if (target === "idea") {
      ok = run((s, now) => addOpportunity(s, { title: firstLine, problem: t.length > firstLine.length ? t : "" }, now), "Captured in the Opportunity Vault.");
    } else if (target === "win") {
      ok = run((s, now) => addManualEvidence(s, { title: firstLine, note: t, kind, skills: [] }, now), "Logged as evidence.");
    } else {
      ok = run((s, now) => addMemory(s, { category, text: t }, now), "Remembered.");
    }
    if (ok) onClose();
  }

  return (
    <div className="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="capture-title">
        <div className="between">
          <h2 id="capture-title">Capture</h2>
          <button className="link-btn" onClick={onClose}>Close</button>
        </div>
        <Segmented<Target>
          label="Capture as"
          value={target}
          onChange={setTarget}
          options={[
            { value: "plan", label: "Today" },
            { value: "idea", label: "Idea" },
            { value: "win", label: "Did it" },
            { value: "memory", label: "Remember" },
          ]}
        />
        <p className="small faint" style={{ margin: "12px 0 8px" }}>
          {target === "plan" && "What you're doing today. Adds to this morning's check-in."}
          {target === "idea" && "Goes to the Opportunity Vault — captured, not committed to."}
          {target === "win" && "Something you actually did. Logged as real-world evidence."}
          {target === "memory" && "Context the mentor and the system should keep in mind."}
        </p>
        <div className="composer">
          <label className="sr-only" htmlFor="capture-text">Text</label>
          <textarea id="capture-text" ref={inputRef} rows={4} value={text} onChange={(e) => setText(e.target.value)}
            placeholder={target === "plan" ? "Here's what I'm doing today…" : target === "idea" ? "The idea, in one line. Details below." : target === "win" ? "What happened, specifically" : "What should be remembered"} />
          {Speech && (
            <button className={`btn sm mic ${listening ? "on" : ""}`} onClick={toggleMic} aria-pressed={listening} aria-label={listening ? "Stop dictation" : "Dictate"} style={{ width: 44, padding: 0 }}>
              <span style={{ width: 20, height: 20, display: "inline-flex" }}><Icon name="mic" /></span>
            </button>
          )}
        </div>
        {target === "win" && (
          <>
            <label className="field-label" htmlFor="cap-kind">Kind</label>
            <select id="cap-kind" value={kind} onChange={(e) => setKind(e.target.value as EvidenceKind)}>
              {Object.entries(EVIDENCE_KINDS).filter(([k]) => k !== "session").map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </>
        )}
        {target === "memory" && (
          <>
            <label className="field-label" htmlFor="cap-cat">Category</label>
            <select id="cap-cat" value={category} onChange={(e) => setCategory(e.target.value as MemoryCategory)}>
              {Object.entries(MEMORY_CATEGORIES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </>
        )}
        <button className="btn primary block" style={{ marginTop: 16 }} disabled={!text.trim()} onClick={save}>Save</button>
      </div>
    </div>
  );
}
