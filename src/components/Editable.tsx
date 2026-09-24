import { useEffect, useId, useState } from "react";

/**
 * A text field that edits locally and commits on blur, so long-form records
 * (retrospectives, experiment write-ups) don't write to storage on every key.
 */
export function EditableText({ label, value, onSave, rows = 2, placeholder, multiline = true, hint }: {
  label: string;
  value: string;
  onSave: (v: string) => void;
  rows?: number;
  placeholder?: string;
  multiline?: boolean;
  hint?: string;
}) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const commit = () => { if (draft !== value) onSave(draft); };
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea id={id} rows={rows} value={draft} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)} onBlur={commit} />
      ) : (
        <input id={id} type="text" value={draft} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)} onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
      )}
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}
