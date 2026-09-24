import { useRef } from "react";
import { usePersistent, useAction, useAppState, useStore, useToast } from "../app/context";
import { setTheme } from "../domain/actions";
import type { Theme } from "../domain/types";
import { backupFilename, exportBackup, parseBackup } from "../storage/backup";

const THEMES: { value: Theme; label: string }[] = [
  { value: "system", label: "Match device" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

export function SettingsView() {
  const state = useAppState();
  const store = useStore();
  const run = useAction();
  const toast = useToast();
  const persistent = usePersistent();
  const fileInput = useRef<HTMLInputElement>(null);

  function download() {
    const now = new Date();
    const blob = new Blob([exportBackup(state, now)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = backupFilename(now);
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Backup downloaded.");
  }

  async function restore(file: File) {
    try {
      const next = parseBackup(await file.text());
      const closed = Object.values(next.sessions).filter((s) => s.closedAt).length;
      const ok = confirm(
        `Replace everything on this device with this backup?\n\nBackup contains ${closed} closed session(s), ${next.evidence.length} evidence item(s) and ${next.projects.length} project(s).\n\nExport a backup of your current data first if you might want it back.`,
      );
      if (!ok) return;
      const err = store.replace(next);
      toast(err ?? "Backup restored.", err ? "error" : "info");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't read that file.", "error");
    }
  }

  return (
    <div className="stack">
      <section className="card">
        <div className="eyebrow">Appearance</div>
        <div className="row" role="radiogroup" aria-label="Theme">
          {THEMES.map((t) => (
            <button key={t.value} role="radio" aria-checked={state.settings.theme === t.value}
              className={`btn sm ${state.settings.theme === t.value ? "selected" : ""}`}
              onClick={() => run((s) => setTheme(s, t.value))}>
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="eyebrow">Your data</div>
        {persistent ? (
          <p className="small muted">
            Everything is stored <strong>only in this browser, on this device</strong>. There's no account and no sync yet, so
            clearing site data or switching devices loses it. Export a backup regularly — weekly, after your review, is a good habit.
          </p>
        ) : (
          <p className="small" style={{ color: "var(--clay)" }}>
            This browser is blocking storage (private browsing?). Nothing will survive closing this tab — export a backup before you leave.
          </p>
        )}
        <div className="row">
          <button className="btn primary" onClick={download}>Export backup</button>
          <button className="btn" onClick={() => fileInput.current?.click()}>Restore from backup…</button>
          <input ref={fileInput} type="file" accept="application/json,.json" hidden
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void restore(f); }} />
        </div>
        <div className="hint">Restore also accepts data exported from the original prototype.</div>
      </section>
    </div>
  );
}
