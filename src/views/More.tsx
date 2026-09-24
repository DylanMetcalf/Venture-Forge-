import { MORE_ITEMS } from "../app/nav";
import { href } from "../app/router";

export function MoreView() {
  return (
    <section className="card">
      {MORE_ITEMS.map((i) => (
        <a key={i.r} className="item-row" href={href(i.r)}>
          <div>
            <div>{i.label}</div>
            <div className="faint small" style={{ marginTop: 2 }}>{i.desc}</div>
          </div>
          <span className="faint" aria-hidden="true">›</span>
        </a>
      ))}
    </section>
  );
}
