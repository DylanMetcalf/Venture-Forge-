import type { LocalDate } from "./types";

/** Local calendar date (not UTC), so a late-evening entry lands on the right day. */
export function localDate(d: Date): LocalDate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(date: LocalDate, delta: number): LocalDate {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  return localDate(new Date(y, m - 1, d + delta));
}

export function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function isBlank(s: string | undefined | null): boolean {
  return !s || s.trim() === "";
}
