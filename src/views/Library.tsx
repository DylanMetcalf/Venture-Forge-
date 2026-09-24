import { useState } from "react";
import { LIBRARY } from "../content/library";
import { href } from "../app/router";
import { Empty } from "../components/ui";

const BY_ID = new Map(LIBRARY.map((e) => [e.id, e]));

export function LibraryView({ param }: { param?: string }) {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const items = LIBRARY.filter(
    (c) => !term || [c.term, c.short, c.medium].some((t) => t.toLowerCase().includes(term)),
  );

  return (
    <div className="stack">
      <label className="sr-only" htmlFor="lib-search">Search concepts</label>
      <input id="lib-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search concepts — try “margin” or “CAC”" />
      {items.length === 0 ? <Empty>Nothing matches. The library grows as more of the curriculum is written.</Empty> : (
        items.map((c) => (
          <details key={c.id} id={`lib-${c.id}`} className="card" open={param === c.id}>
            <summary><strong className="serif" style={{ fontSize: 17 }}>{c.term}</strong><span className="chev" aria-hidden="true">⌄</span></summary>
            <div className="muted small" style={{ marginTop: 8 }}>{c.short}</div>
            <div className="lib-body small">
              <h4>Explanation</h4><div>{c.medium}</div>
              <h4>Business application</h4><div>{c.application}</div>
              <h4>Common mistakes</h4><div>{c.mistakes}</div>
              {c.related.some((r) => BY_ID.has(r)) && (
                <>
                  <h4>Related</h4>
                  <div className="row">
                    {c.related.filter((r) => BY_ID.has(r)).map((r) => <a key={r} className="pill" href={href("library", r)}>{BY_ID.get(r)!.term}</a>)}
                  </div>
                </>
              )}
            </div>
          </details>
        ))
      )}
    </div>
  );
}
