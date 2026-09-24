import { getDay, isReviewFormat } from "../content/curriculum";
import { useAppState } from "../app/context";
import { href } from "../app/router";
import { Empty, formatDate } from "../components/ui";
import { reviewEntries } from "../domain/selectors";

export function ReviewsView() {
  const state = useAppState();
  const entries = reviewEntries(state);
  const current = getDay(state.currentDay);

  return (
    <div className="stack">
      {current && isReviewFormat(current.format) && (
        <div className="card small">
          Today (Day {state.currentDay}) is a review day. <a href={href("session")}>Complete it in today's session</a> — it lands here when you close it out.
        </div>
      )}
      {entries.length === 0 ? <Empty>No reviews closed yet. Weekly and monthly reviews land here after you close them out.</Empty> : (
        entries.map((r) => (
          <section className="card" key={r.day}>
            <div className="between">
              <div className="eyebrow">{r.kind === "monthly" ? "Monthly" : "Weekly"} · Day {r.day}{r.closedOn && ` · ${formatDate(r.closedOn)}`}</div>
              <a className="faint tiny" href={href("session", r.day)}>Open</a>
            </div>
            <strong className="serif">{r.theme}</strong>
            {r.body && <div className="small pre" style={{ marginTop: 8 }}>{r.body}</div>}
            {r.learned && <div className="small" style={{ marginTop: 8 }}><span className="faint">Learned: </span>{r.learned}</div>}
            {r.avoided && <div className="small" style={{ marginTop: 4 }}><span className="faint">Avoided: </span>{r.avoided}</div>}
          </section>
        ))
      )}
    </div>
  );
}
