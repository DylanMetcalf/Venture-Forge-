import { useId, type ReactNode } from "react";
import type { SessionStatus } from "../domain/types";

const STATUS_LABEL: Record<SessionStatus, [string, string]> = {
  not_started: ["Not started", ""],
  in_progress: ["In progress", "brass"],
  consumed: ["Consumed", "sage"],
  demonstrated: ["Demonstrated", "sage"],
};

export function StatusPill({ status }: { status: SessionStatus }) {
  const [label, tone] = STATUS_LABEL[status];
  return <span className={`pill ${tone}`}>{status === "demonstrated" ? "✓ " : ""}{label}</span>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}

interface TextAreaProps {
  label: ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: ReactNode;
  rows?: number;
}
export function TextArea({ label, value, onChange, placeholder, hint, rows }: TextAreaProps) {
  const id = useId();
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <textarea id={id} value={value} placeholder={placeholder} rows={rows} onChange={(e) => onChange(e.target.value)} />
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

interface TextInputProps {
  label: ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}
export function TextInput({ label, value, onChange, placeholder }: TextInputProps) {
  const id = useId();
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <input id={id} type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

interface SelectProps<T extends string> {
  label: ReactNode;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}
export function Select<T extends string>({ label, value, options, onChange }: SelectProps<T>) {
  const id = useId();
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function formatDate(d: string | undefined): string {
  if (!d) return "";
  const [y, m, day] = d.slice(0, 10).split("-").map(Number) as [number, number, number];
  return new Date(y, m - 1, day).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

// ---- v3 shared components ----

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="segmented" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={value === o.value} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return <a className="back" href={href}>← {children}</a>;
}
