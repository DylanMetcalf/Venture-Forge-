// Evidence-based capability: skill levels, the skill map and the founder
// scorecard. Nothing here is a points system — every level is derived from
// recorded evidence, and every status carries the facts that produced it.
import { ALL_SKILLS, getDay } from "../content/curriculum";
import { TRACKS, type Track } from "../content/tracks";
import type { SkillId } from "../content/types";
import { isClosed, sessionStatus } from "./sessions";
import { isRealWorld, type AppState, type LocalDate } from "./types";
import { addDays } from "./util";

export const CAPABILITY_LEVELS = ["Not started", "Developing", "Functional", "Competent", "Advanced", "Highly capable"] as const;
export type CapabilityLevel = (typeof CAPABILITY_LEVELS)[number];

/**
 * The rule, stated plainly so it can be argued with:
 *   Developing      — practised in a session, or any evidence
 *   Functional      — 3+ evidence items
 *   Competent       — 6+ evidence, 2+ from real-world work (not sessions)
 *   Advanced        — 12+ evidence, 4+ real-world
 *   Highly capable  — 20+ evidence, 8+ real-world
 * Real-world evidence is weighted because doing it for real is the point.
 */
export function levelFor(evidence: number, realWorld: number, practised: number): number {
  if (evidence >= 20 && realWorld >= 8) return 5;
  if (evidence >= 12 && realWorld >= 4) return 4;
  if (evidence >= 6 && realWorld >= 2) return 3;
  if (evidence >= 3) return 2;
  if (evidence >= 1 || practised >= 1) return 1;
  return 0;
}

export const FADING_AFTER_DAYS = 30;

export interface SkillCapability {
  id: SkillId;
  track: Track;
  level: number;
  evidence: number;
  realWorld: number;
  practised: number;
  lastActivity?: LocalDate;
  /** Level ≥ Functional but nothing recorded for a while. */
  fading: boolean;
  /** Self-rated confidence (0 = not rated). */
  confidence: number;
}

export function skillCapabilities(state: AppState, today: LocalDate): Map<SkillId, SkillCapability> {
  const out = new Map<SkillId, SkillCapability>();
  for (const t of TRACKS) {
    for (const id of t.skills) {
      out.set(id, { id, track: t, level: 0, evidence: 0, realWorld: 0, practised: 0, fading: false, confidence: state.skills[id]?.level ?? 0 });
    }
  }
  const touch = (c: SkillCapability, date?: LocalDate) => {
    if (date && (!c.lastActivity || date > c.lastActivity)) c.lastActivity = date;
  };
  for (const [day, rec] of Object.entries(state.sessions)) {
    if (!isClosed(sessionStatus(rec))) continue;
    for (const s of getDay(Number(day))?.skills ?? []) {
      const c = out.get(s);
      if (c) { c.practised++; touch(c, rec.closedOn); }
    }
  }
  for (const e of state.evidence) {
    for (const s of e.skills) {
      const c = out.get(s);
      if (!c) continue;
      c.evidence++;
      if (isRealWorld(e)) c.realWorld++;
      touch(c, e.date);
    }
  }
  const cutoff = addDays(today, -FADING_AFTER_DAYS);
  for (const c of out.values()) {
    c.level = levelFor(c.evidence, c.realWorld, c.practised);
    c.fading = c.level >= 2 && !!c.lastActivity && c.lastActivity < cutoff;
  }
  return out;
}

/** What to do next for one skill — honest, specific, based on its record. */
export function nextStepFor(c: SkillCapability): string {
  if (c.level === 0) return "Not started. It's covered as the curriculum reaches it — or start now by applying it to real work and logging evidence.";
  if (c.fading) return `Nothing recorded since ${c.lastActivity}. Use it this week before it fades.`;
  if (c.realWorld === 0) return "You've only practised this in sessions. Apply it to a real situation and log the result.";
  if (c.level === 1) return "Build a record: two more pieces of evidence make it Functional.";
  if (c.level === 2) return "Competent needs repetition in real work: at least two real-world results and six pieces of evidence overall.";
  if (c.level === 3) return "Push the difficulty: take on a harder, higher-stakes use of this skill.";
  return "Teach or systemise it: write the process so someone else could do it.";
}

export function relatedSkills(c: SkillCapability): SkillId[] {
  return c.track.skills.filter((s) => s !== c.id);
}

// ─── Founder scorecard ────────────────────────────────────────────────

export type ScoreStatus = "none" | "attention" | "emerging" | "developing" | "strong";

export interface ScoreCategory {
  id: string;
  label: string;
  status: ScoreStatus;
  /** The facts behind the status, in plain words. */
  facts: string;
}

const SCORE_TRACKS: { id: string; label: string; tracks: string[] }[] = [
  { id: "sales", label: "Sales", tracks: ["sales", "communication"] },
  { id: "product", label: "Product", tracks: ["product"] },
  { id: "systems", label: "Systems", tracks: ["business"] },
  { id: "leadership", label: "Leadership", tracks: ["leadership"] },
  { id: "finance", label: "Financial understanding", tracks: ["finance"] },
  { id: "strategy", label: "Strategic thinking", tracks: ["strategy", "decisions"] },
  { id: "technical", label: "Technical capability", tracks: ["software", "ai"] },
];

function evidenceStatus(total: number, recent: number): ScoreStatus {
  if (total === 0) return "none";
  if (recent === 0) return "attention";
  if (total >= 8) return "strong";
  if (total >= 3) return "developing";
  return "emerging";
}

export function scorecard(state: AppState, today: LocalDate): ScoreCategory[] {
  const since14 = addDays(today, -13);
  const since30 = addDays(today, -29);
  const out: ScoreCategory[] = [];

  // Learning: sessions closed recently.
  const closed = Object.values(state.sessions).filter((r) => isClosed(sessionStatus(r)));
  const closed14 = closed.filter((r) => (r.closedOn ?? "") >= since14);
  out.push({
    id: "learning", label: "Learning",
    status: closed.length === 0 ? "none" : closed14.length === 0 ? "attention" : closed14.length >= 8 ? "strong" : closed14.length >= 4 ? "developing" : "emerging",
    facts: `${closed14.length} session${closed14.length === 1 ? "" : "s"} closed in the last 14 days.`,
  });

  // Execution: turning learning into demonstrated work, and keeping promises.
  const demo14 = closed14.filter((r) => sessionStatus(r) === "demonstrated").length;
  const graded = closed14.filter((r) => r.commitmentKept !== undefined);
  const kept = graded.filter((r) => r.commitmentKept).length;
  const execRatio = closed14.length ? demo14 / closed14.length : 0;
  out.push({
    id: "execution", label: "Execution",
    status: closed14.length === 0 ? (closed.length ? "attention" : "none") : execRatio >= 0.8 ? "strong" : execRatio >= 0.5 ? "developing" : "attention",
    facts: `${demo14} of ${closed14.length} recent sessions demonstrated${graded.length ? `; ${kept}/${graded.length} promises kept` : ""}.`,
  });

  // Consistency: distinct active days in the last 14.
  const active = new Set<string>();
  for (const r of closed) if ((r.closedOn ?? "") >= since14) active.add(r.closedOn!);
  for (const [date, l] of Object.entries(state.days)) if (date >= since14 && (l.morning || l.evening)) active.add(date);
  out.push({
    id: "consistency", label: "Consistency",
    status: active.size === 0 ? (closed.length || Object.keys(state.days).length ? "attention" : "none") : active.size >= 10 ? "strong" : active.size >= 5 ? "developing" : "emerging",
    facts: `Active on ${active.size} of the last 14 days.`,
  });

  for (const cat of SCORE_TRACKS) {
    const trackSkills = new Set(TRACKS.filter((t) => cat.tracks.includes(t.id)).flatMap((t) => t.skills));
    const ev = state.evidence.filter((e) => e.skills.some((s) => trackSkills.has(s)));
    const recent = ev.filter((e) => e.date >= since30);
    const real = ev.filter(isRealWorld).length;
    out.push({
      id: cat.id, label: cat.label, status: evidenceStatus(ev.length, recent.length),
      facts: ev.length ? `${ev.length} evidence (${real} real-world), ${recent.length} in the last 30 days.` : "No evidence yet.",
    });
  }
  return out;
}

/** Skill ids known to the taxonomy (re-exported for views that validate input). */
export const SKILL_IDS = ALL_SKILLS;
