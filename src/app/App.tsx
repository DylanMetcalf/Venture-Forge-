import { useEffect } from "react";
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
import { IdeasView } from "../views/Ideas";
import { LibraryView } from "../views/Library";
import { ReviewsView } from "../views/Reviews";
import { FreedomView } from "../views/Freedom";
import { SettingsView } from "../views/Settings";
import { MoreView } from "../views/More";

/** Views that draw their own header. Every other view gets a standard page title. */
const OWN_HEADER: RouteName[] = ["today", "session"];

function View({ name, param }: { name: RouteName; param?: string }) {
  switch (name) {
    case "today": return <TodayView />;
    case "session": return <SessionView param={param} />;
    case "roadmap": return <RoadmapView />;
    case "skills": return <SkillsView />;
    case "projects": return <ProjectsView />;
    case "evidence": return <EvidenceView />;
    case "decisions": return <DecisionsView />;
    case "ideas": return <IdeasView />;
    case "library": return <LibraryView param={param} />;
    case "reviews": return <ReviewsView />;
    case "freedom": return <FreedomView />;
    case "settings": return <SettingsView />;
    case "more": return <MoreView />;
  }
}

export function App() {
  const state = useAppState();
  const store = useStore();
  const route = useRoute();
  const theme = state.settings.theme;

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
          {!OWN_HEADER.includes(route.name) && (
            <header className="page-head"><h1>{title}</h1></header>
          )}
          <View name={route.name} param={route.param} />
        </main>
      </div>

      <nav className="tabbar" aria-label="Main">
        {TABS.map((t) => (
          <a key={t.r} className="tab-item" href={href(t.r)} aria-current={tabActive(t.r) ? "page" : undefined}>
            <Icon name={t.icon} />
            <span>{t.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
