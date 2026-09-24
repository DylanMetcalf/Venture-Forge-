import { useState } from "react";
import { useAction, useAppState, useStore } from "../app/context";
import { href, navigate } from "../app/router";
import { EditableText } from "../components/Editable";
import { BackLink, Empty, TextInput, formatDate } from "../components/ui";
import { addOpportunity, deleteOpportunity, updateOpportunity, type OpportunityPatch } from "../domain/actions";
import { addProject } from "../domain/projects";
import { OPPORTUNITY_STATUSES, type Opportunity, type OpportunityStatus } from "../domain/types";

const FIELDS: [keyof OpportunityPatch, string, string][] = [
  ["problem", "Problem", "What painful, specific problem exists?"],
  ["customer", "Target customer", "Who, exactly, has it?"],
  ["solution", "Proposed solution", ""],
  ["market", "Market", "How many of them, and how do you reach them?"],
  ["alternatives", "Existing alternatives", "What do they do today — including nothing?"],
  ["model", "Business model", "Who pays, how much, how often?"],
  ["evidence", "Evidence so far", "What have you actually observed, not assumed?"],
  ["risks", "Risks", ""],
  ["unknowns", "Unknowns", "What would have to be true?"],
  ["validation", "Validation required", "The cheapest test that could kill this idea"],
];

export function OpportunitiesView({ param }: { param?: string }) {
  const state = useAppState();
  if (param) {
    const o = state.opportunities.find((x) => x.id === param);
    return o ? <OpportunityDetail o={o} /> : <Empty>That opportunity doesn't exist. <a href={href("opportunities")}>The vault</a></Empty>;
  }
  return <OpportunityList />;
}

function OpportunityList() {
  const state = useAppState();
  const store = useStore();
  const run = useAction();
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<OpportunityStatus | "open">("open");
  const open = (o: Opportunity) => !["Rejected", "Paused", "Commercialised"].includes(o.status);
  const items = state.opportunities.filter((o) => (filter === "open" ? open(o) : o.status === filter)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div className="stack">
      <p className="muted" style={{ margin: 0 }}>
        Capture ideas without chasing them. An opportunity earns a project only after evidence — most should stay here, or be rejected.
      </p>
      <form className="card" onSubmit={(e) => {
        e.preventDefault();
        if (run((s, now) => addOpportunity(s, { title }, now))) navigate("opportunities", store.getState().opportunities.at(-1)!.id);
      }}>
        <TextInput label="Capture an opportunity" value={title} onChange={setTitle} placeholder="e.g. AI receptionist for private clinics" />
        <button className="btn primary" style={{ marginTop: 12 }} type="submit" disabled={!title.trim()}>Capture</button>
      </form>
      {state.opportunities.length > 0 && (
        <div className="row">
          <select className="inline" aria-label="Filter" value={filter} onChange={(e) => setFilter(e.target.value as OpportunityStatus | "open")}>
            <option value="open">Open</option>
            {OPPORTUNITY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="faint tiny">{items.length} shown</span>
        </div>
      )}
      {state.opportunities.length === 0 ? <Empty>The vault's empty. Good — capture ideas here the moment they appear, then leave them alone.</Empty> : items.length === 0 ? <Empty>Nothing in this view.</Empty> : (
        <div className="card" style={{ padding: "6px 18px" }}>
          {items.map((o) => (
            <a key={o.id} className="item-row" href={href("opportunities", o.id)}>
              <div style={{ minWidth: 0 }}>
                <div className="item-title"><span className={`status-dot ${o.status}`} />{o.title}</div>
                <div className="faint tiny" style={{ marginTop: 3 }}>{o.status} · updated {formatDate(o.updatedAt)}{o.customer ? ` · ${o.customer}` : ""}</div>
              </div>
              <span className="faint" aria-hidden="true">→</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function OpportunityDetail({ o }: { o: Opportunity }) {
  const store = useStore();
  const run = useAction();
  const save = (patch: OpportunityPatch) => run((s, now) => updateOpportunity(s, o.id, patch, now));
  const filled = FIELDS.filter(([k]) => (o[k] as string)?.trim()).length;

  return (
    <div className="stack-lg">
      <div>
        <BackLink href={href("opportunities")}>Opportunity Vault</BackLink>
        <div className="between">
          <span className="faint tiny">{filled} of {FIELDS.length} fields · captured {formatDate(o.createdAt)}</span>
          <select className="inline" aria-label="Status" value={o.status} onChange={(e) => save({ status: e.target.value as OpportunityStatus })}>
            {OPPORTUNITY_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <EditableText label="Opportunity" value={o.title} onSave={(v) => save({ title: v })} multiline={false} />
      </div>
      <section className="stack">
        {FIELDS.map(([k, label, ph]) => (
          <EditableText key={k} label={label} value={o[k] as string} onSave={(v) => save({ [k]: v })} placeholder={ph} />
        ))}
      </section>
      <div className="row">
        {o.status === "Validated" && (
          <button className="btn primary" onClick={() => {
            if (run((s, now) => addProject(updateOpportunity(s, o.id, { status: "Building" }, now), { name: o.title, objective: o.solution, why: o.problem }, now), "Project created from this opportunity.")) {
              navigate("projects", store.getState().projects.at(-1)!.id);
            }
          }}>Turn into a project</button>
        )}
        <button className="link-btn tiny" style={{ color: "var(--text-3)" }} onClick={() => {
          if (confirm(`Delete “${o.title}”? Consider marking it Rejected instead, so you remember why.`)) { run((s) => deleteOpportunity(s, o.id)); navigate("opportunities"); }
        }}>Delete</button>
      </div>
      {o.status !== "Validated" && o.status !== "Building" && (
        <p className="faint small">It can become a project once it's marked Validated — that's deliberate.</p>
      )}
    </div>
  );
}
