import { useId } from "react";
import { skillLabel } from "../content/curriculum";
import { TRACKS } from "../content/tracks";
import type { SkillId } from "../content/types";
import type { Project } from "../domain/types";

/** Pick skills grouped by track; selected skills show as removable chips. */
export function SkillPicker({ value, onChange, label = "Skills" }: { value: SkillId[]; onChange: (v: SkillId[]) => void; label?: string }) {
  const id = useId();
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <select id={id} value="" onChange={(e) => e.target.value && onChange([...value, e.target.value])}>
        <option value="">Add a skill…</option>
        {TRACKS.map((t) => (
          <optgroup key={t.id} label={t.name}>
            {t.skills.filter((s) => !value.includes(s)).map((s) => <option key={s} value={s}>{skillLabel(s)}</option>)}
          </optgroup>
        ))}
      </select>
      {value.length > 0 && (
        <div className="chips" style={{ marginTop: 8 }}>
          {value.map((s) => (
            <button key={s} type="button" className="pill chip-btn" aria-label={`Remove ${skillLabel(s)}`} onClick={() => onChange(value.filter((x) => x !== s))}>
              {skillLabel(s)} ×
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectSelect({ projects, value, onChange, label = "Project", noneLabel = "None" }: { projects: Project[]; value: string; onChange: (v: string) => void; label?: string; noneLabel?: string }) {
  const id = useId();
  if (projects.length === 0) return null;
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{noneLabel}</option>
        {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
    </div>
  );
}
