import { useState } from "react";
import { useAction, useAppState } from "../app/context";
import { Empty, formatDate } from "../components/ui";
import { addMemory, deleteMemory, updateMemory } from "../domain/actions";
import { MEMORY_CATEGORIES, type MemoryCategory, type MemoryItem } from "../domain/types";

export function MemoryView() {
  const state = useAppState();
  const run = useAction();
  const [category, setCategory] = useState<MemoryCategory>("goal");
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<MemoryCategory | "all">("all");
  const term = q.trim().toLowerCase();
  const items = state.memory
    .filter((m) => (filter === "all" || m.category === filter) && (!term || m.text.toLowerCase().includes(term)))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div className="stack">
      <p className="muted" style={{ margin: 0 }}>
        What the system should keep in mind: your goals, context, preferences, lessons and recurring patterns. Structured, not a
        text dump. Pinned items are always given to the mentor.
      </p>
      <form className="card" onSubmit={(e) => { e.preventDefault(); if (run((s, now) => addMemory(s, { category, text }, now), "Remembered.")) setText(""); }}>
        <label className="field-label" htmlFor="mem-cat">Category</label>
        <select id="mem-cat" value={category} onChange={(e) => setCategory(e.target.value as MemoryCategory)}>
          {Object.entries(MEMORY_CATEGORIES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <label className="field-label" htmlFor="mem-text">Remember</label>
        <textarea id="mem-text" rows={2} value={text} onChange={(e) => setText(e.target.value)}
          placeholder={category === "goal" ? "e.g. Become a capable AI software founder within 3 years" : category === "pattern" ? "e.g. I avoid outreach when a build is going well" : ""} />
        <button className="btn primary" type="submit" style={{ marginTop: 12 }} disabled={!text.trim()}>Save</button>
      </form>

      {state.memory.length > 0 && (
        <div className="row" style={{ flexWrap: "nowrap" }}>
          <input type="search" aria-label="Search memory" placeholder="Search memory" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="inline" aria-label="Filter category" value={filter} onChange={(e) => setFilter(e.target.value as MemoryCategory | "all")}>
            <option value="all">All</option>
            {Object.entries(MEMORY_CATEGORIES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
      )}

      {state.memory.length === 0 ? <Empty>Nothing remembered yet. Start with your goals.</Empty> : items.length === 0 ? <Empty>Nothing matches.</Empty> : (
        (Object.keys(MEMORY_CATEGORIES) as MemoryCategory[]).map((cat) => {
          const group = items.filter((m) => m.category === cat);
          if (!group.length) return null;
          return (
            <section key={cat}>
              <h2 className="section-title">{MEMORY_CATEGORIES[cat]}</h2>
              <div className="card" style={{ padding: "6px 18px" }}>{group.map((m) => <MemoryRow key={m.id} m={m} />)}</div>
            </section>
          );
        })
      )}
    </div>
  );
}

function MemoryRow({ m }: { m: MemoryItem }) {
  const run = useAction();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(m.text);
  return (
    <div className="item-row">
      <div style={{ minWidth: 0, flex: 1 }}>
        {editing ? (
          <form onSubmit={(e) => { e.preventDefault(); if (run((s, now) => updateMemory(s, m.id, { text }, now))) setEditing(false); }}>
            <textarea aria-label="Edit memory" rows={2} value={text} onChange={(e) => setText(e.target.value)} />
            <div className="row" style={{ marginTop: 6 }}>
              <button className="btn sm primary" type="submit">Save</button>
              <button className="btn sm ghost" type="button" onClick={() => { setText(m.text); setEditing(false); }}>Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <div className="pre">{m.pinned ? "📌 " : ""}{m.text}</div>
            <div className="faint tiny" style={{ marginTop: 4 }}>{formatDate(m.updatedAt)}</div>
          </>
        )}
      </div>
      {!editing && (
        <div className="row" style={{ gap: 12, flexWrap: "nowrap" }}>
          <button className="link-btn tiny" onClick={() => run((s, now) => updateMemory(s, m.id, { pinned: !m.pinned }, now))}>{m.pinned ? "Unpin" : "Pin"}</button>
          <button className="link-btn tiny" onClick={() => setEditing(true)}>Edit</button>
          <button className="link-btn tiny" style={{ color: "var(--text-3)" }} onClick={() => { if (confirm("Forget this?")) run((s) => deleteMemory(s, m.id)); }}>Delete</button>
        </div>
      )}
    </div>
  );
}
