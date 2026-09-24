import type { IconName } from "../components/Icon";
import type { RouteName } from "./router";

export interface NavItem {
  r: RouteName;
  label: string;
  desc: string;
}

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  { title: "Today", items: [
    { r: "today", label: "Dashboard", desc: "Where you are and what matters today." },
    { r: "checkin", label: "Check-in", desc: "Morning plan and evening review." },
    { r: "session", label: "Session", desc: "Today's session: learn, think, apply, build, reflect." },
    { r: "mentor", label: "Mentor", desc: "A demanding founder coach that knows your context." },
  ] },
  { title: "Work", items: [
    { r: "projects", label: "Projects", desc: "Real work the learning applies to." },
    { r: "experiments", label: "Experiments", desc: "Operate through evidence, not assumptions." },
    { r: "opportunities", label: "Opportunity Vault", desc: "Ideas captured without chasing them." },
    { r: "decisions", label: "Decisions", desc: "Record decisions; review outcomes later." },
  ] },
  { title: "Growth", items: [
    { r: "skills", label: "Skills & Scorecard", desc: "Capability backed by evidence." },
    { r: "evidence", label: "Evidence", desc: "Everything you've actually proven." },
    { r: "reviews", label: "Reviews", desc: "Weekly review and next week's focus." },
    { r: "roadmap", label: "Curriculum", desc: "The year, the tracks and where you are." },
  ] },
  { title: "Knowledge", items: [
    { r: "memory", label: "Memory", desc: "Goals, lessons, patterns and context the system keeps." },
    { r: "library", label: "Library", desc: "Concepts, explained and applied." },
    { r: "settings", label: "Settings", desc: "Name, theme, mentor, backup and the evolution log." },
  ] },
];

export const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

/** Mobile tab bar. The centre slot is the capture button (rendered separately). */
export const TABS: { r: RouteName; label: string; icon: IconName }[] = [
  { r: "today", label: "Today", icon: "today" },
  { r: "session", label: "Session", icon: "session" },
  { r: "mentor", label: "Mentor", icon: "mentor" },
  { r: "more", label: "More", icon: "more" },
];

export const MORE_ITEMS = ALL_ITEMS.filter((i) => !TABS.some((t) => t.r === i.r));
