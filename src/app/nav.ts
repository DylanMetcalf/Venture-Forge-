import type { IconName } from "../components/Icon";
import type { RouteName } from "./router";

export interface NavItem {
  r: RouteName;
  label: string;
  desc: string;
}

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  { title: "Train", items: [
    { r: "today", label: "Today", desc: "What you're doing today." },
    { r: "session", label: "Session", desc: "Today's session, start to close." },
    { r: "roadmap", label: "Roadmap", desc: "The whole year, and where you are in it." },
    { r: "skills", label: "Skills", desc: "Capability backed by evidence." },
  ] },
  { title: "Record", items: [
    { r: "evidence", label: "Evidence", desc: "Everything you've actually proven." },
    { r: "reviews", label: "Reviews", desc: "Every weekly and monthly review you've closed." },
    { r: "decisions", label: "Decision Journal", desc: "Record real decisions; review outcomes later." },
    { r: "ideas", label: "Idea Vault", desc: "Capture ideas without committing to them." },
    { r: "projects", label: "Projects", desc: "Things you're building that sessions can feed into." },
  ] },
  { title: "Reference", items: [
    { r: "library", label: "Knowledge Library", desc: "Concepts, explained and applied." },
    { r: "freedom", label: "Freedom Index", desc: "A self-rated check on what the work is for." },
    { r: "settings", label: "Settings & Data", desc: "Your name, theme, backup and restore." },
  ] },
];

export const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export const TABS: { r: RouteName; label: string; icon: IconName }[] = [
  { r: "today", label: "Today", icon: "today" },
  { r: "session", label: "Session", icon: "session" },
  { r: "roadmap", label: "Roadmap", icon: "roadmap" },
  { r: "skills", label: "Skills", icon: "skills" },
  { r: "more", label: "More", icon: "more" },
];

export const MORE_ITEMS = ALL_ITEMS.filter((i) => !TABS.some((t) => t.r === i.r));
