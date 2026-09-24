import { useEffect, useState } from "react";
import { CaptureSheet } from "../components/Capture";
import { BrandMark, Icon } from "../components/Icon";
import { ALL_ITEMS, MORE_ITEMS, NAV_GROUPS, TABS } from "./nav";
import { useAppState, useStore } from "./context";
import { href, useRoute, type RouteName } from "./router";
import { TodayView } from "../views/Today";
import { SessionView } from "../views/Session";
import { RoadmapView } from "../views/Roadmap";
import { SkillsView } from "../views/Skills";
import { ProjectsView } from "../views/Projects";
import { EvidenceView } from "../views/Evidence";
import { DecisionsView } from "../views/Decisions";
import { CheckInView } from "../views/CheckIn";
import { MentorView } from "../views/Mentor";
import { ExperimentsView } from "../views/Experiments";
import { OpportunitiesView } from "../views/Opportunities";
import { MemoryView } from "../views/Memory";
import { LibraryView } from "../views/Library";
import { ReviewsView } from "../views/Reviews";
import { SettingsView } from "../views/Settings";
import { MoreView } from "../views/More";

/** Views that draw their own header. Every other view gets a standard page title. */
const OWN_HEADER: RouteName[] = ["today", "session", "checkin", "mentor"];
/** Routes whose detail pages (with a param) draw their own header. */
const DETAIL_ROUTES: RouteName[] = ["projects", "experiments", "opportunities"];

function View({ name, param }: { name: RouteName; param?: string }) {
  switch (name) {
    case "today": return <TodayView />;
    case "checkin": return <CheckInView param={param} />;
    case "session": return <SessionView param={param} />;
    case "mentor": return <MentorView />;
    case "projects": return <ProjectsView param={param} />;
    case "experiments": return <ExperimentsView param={param} />;
    case "opportunities": return <OpportunitiesView param={param} />;
    case "decisions": return <DecisionsView />;
    case "skills": return <SkillsView param={param} />;
    case "evidence": return <EvidenceView />;
    case "reviews": return <ReviewsView />;
    case "roadmap": return <RoadmapView />;
    case "memory": return <MemoryView />;
    case "library": return <LibraryView param={param} />;
    case "settings": return <SettingsView />;
    case "more": return <MoreView />;
  }
}

export function App() {
  const state = useAppState();
  const store = useStore();
  const route = useRoute();
  const theme = state.settings.theme;
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    if (theme === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.name, route.param]);

  const title = route.name === "more" ? "More" : ALL_ITEMS.find((i) => i.r === route.name)?.label ?? "";
  useEffect(() => {
    document.title = route.name === "today" ? "Venture Forge" : `${title} · Venture Forge`;
  }, [route.name, title]);

  const tabActive = (r: RouteName) => r === route.name || (r === "more" && MORE_ITEMS.some((m) => m.r === route.name));
  const saveError = store.saveError();

  return (
    <div className="app">
      <nav className="rail" aria-label="Main">
        <a className="brand" href={href("today")}>
          <BrandMark className="brand-mark" />
          <div>
            <div className="brand-name">Venture Forge</div>
            <div className="brand-sub">Day {state.currentDay} of 365</div>
          </div>
        </a>
        <button className="btn sm rail-capture" onClick={() => setCapturing(true)}>
          <span style={{ width: 16, height: 16, display: "inline-flex" }}><Icon name="plus" /></span> Capture
        </button>
        {NAV_GROUPS.map((g) => (
          <div key={g.title}>
            <div className="rail-section">{g.title}</div>
            {g.items.map((i) => (
              <a key={i.r} className="rail-link" href={href(i.r)} aria-current={route.name === i.r ? "page" : undefined}>
                {i.label}
              </a>
            ))}
          </div>
        ))}
        <div className="rail-foot">Capability over completion.</div>
      </nav>

      <div className="main">
        <main className={`content ${route.name === "roadmap" ? "wide" : ""}`} key={`${route.name}/${route.param ?? ""}`}>
          {saveError && <div className="banner" role="alert">{saveError}</div>}
          {!OWN_HEADER.includes(route.name) && !(DETAIL_ROUTES.includes(route.name) && route.param) && (
            <header className="page-head"><h1>{title}</h1></header>
          )}
          <View name={route.name} param={route.param} />
        </main>
      </div>

      <nav className="tabbar" aria-label="Main">
        {TABS.slice(0, 2).map((t) => (
          <a key={t.r} className="tab-item" href={href(t.r)} aria-current={tabActive(t.r) ? "page" : undefined}>
            <Icon name={t.icon} />
            <span>{t.label}</span>
          </a>
        ))}
        <div className="tab-capture">
          <button onClick={() => setCapturing(true)} aria-label="Capture a thought"><Icon name="plus" /></button>
        </div>
        {TABS.slice(2).map((t) => (
          <a key={t.r} className="tab-item" href={href(t.r)} aria-current={tabActive(t.r) ? "page" : undefined}>
            <Icon name={t.icon} />
            <span>{t.label}</span>
          </a>
        ))}
      </nav>
      {capturing && <CaptureSheet onClose={() => setCapturing(false)} />}
    </div>
  );
}
