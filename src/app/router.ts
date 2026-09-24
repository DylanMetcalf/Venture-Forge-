import { useSyncExternalStore } from "react";

export const ROUTES = [
  "today", "session", "roadmap", "skills",
  "projects", "evidence", "decisions", "ideas",
  "library", "reviews", "freedom", "settings", "more",
] as const;
export type RouteName = (typeof ROUTES)[number];

export interface Route {
  name: RouteName;
  /** Optional path parameter, e.g. the day in #/session/12 or entry id in #/library/cash-flow. */
  param?: string;
}

export function parseHash(hash: string): Route {
  const [name, param] = hash.replace(/^#\/?/, "").split("/");
  if (ROUTES.includes(name as RouteName)) return { name: name as RouteName, param: param ? decodeURIComponent(param) : undefined };
  return { name: "today" };
}

export function href(name: RouteName, param?: string | number): string {
  return `#/${name}${param !== undefined ? `/${encodeURIComponent(String(param))}` : ""}`;
}

export function navigate(name: RouteName, param?: string | number) {
  location.hash = href(name, param);
}

const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => location.hash);
  return parseHash(hash);
}
