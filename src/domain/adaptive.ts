// The adaptive engine: turns recorded behaviour and today's real context into a
// short, prioritised list of what deserves attention. Every recommendation
// carries its reason, so the adaptation is inspectable rather than magic.
import { DAYS, getDay, skillLabel } from "../content/curriculum";
import { TRACKS, type Track } from "../content/tracks";
import type { RouteName } from "../app/router";
import { collectSignals, type ContextSignal } from "../integrations/signals";
import { skillCapabilities } from "./capability";
import { isClosed, sessionStatus } from "./sessions";
import type { AppState, LocalDate } from "./types";
import { weekStartOf } from "./weekly";
import { addDays } from "./util";

export type RecommendationKind = "checkin" | "evening" | "review" | "relevant" | "apply" | "revisit" | "experiment" | "decision" | "fading";

export interface Recommendation {
  id: string;
  kind: RecommendationKind;
  title: string;
  reason: string;
  route: RouteName;
  param?: string | number;
  priority: number;
}

export interface TrackRelevance {
  track: Track;
  /** The keyword that matched and the signal text it came from. */
  keyword: string;
  signal: ContextSignal;
  hits: number;
}

/** Which tracks today's real context points at, strongest first. */
export function relevantTracks(signals: ContextSignal[]): TrackRelevance[] {
  const out: TrackRelevance[] = [];
  for (const track of TRACKS) {
    let best: TrackRelevance | undefined;
    for (const signal of signals) {
      const lower = ` ${signal.text.toLowerCase()} `;
      for (const kw of track.keywords) {
        const pattern = kw.length <= 3 ? new RegExp(`\\b${kw}\\b`) : null;
        const hit = pattern ? pattern.test(lower) : lower.includes(kw);
        if (!hit) continue;
        const priority = signal.source === "check-in" ? 2 : 1;
        if (best) best.hits += priority;
        else best = { track, keyword: kw, signal, hits: priority };
      }
    }
    if (best) out.push(best);
  }
  return out.sort((a, b) => b.hits - a.hits);
}

/** The best authored session for a track that hasn't been demonstrated yet. */
function sessionForTrack(state: AppState, track: Track): number | undefined {
  const skills = new Set(track.skills);
  return DAYS.find((d) => d.skills.some((s) => skills.has(s)) && sessionStatus(state.sessions[d.day]) !== "demonstrated")?.day;
}

export function recommendations(state: AppState, today: LocalDate, now: Date): Recommendation[] {
  const recs: Recommendation[] = [];
  const log = state.days[today] ?? {};
  const hour = now.getHours();
  const todaySession = state.sessions[state.currentDay];
  const sessionDoneToday = isClosed(sessionStatus(todaySession));

  if (!log.morning && hour < 16) {
    recs.push({ id: "checkin", kind: "checkin", title: "Morning check-in", reason: "Tell Venture Forge what today actually holds so it can focus on what matters.", route: "checkin", param: "morning", priority: 100 });
  }
  if (!log.evening && (hour >= 17 || sessionDoneToday)) {
    recs.push({ id: "evening", kind: "evening", title: "Evening review", reason: "Close the day: what moved, what you avoided, what carries forward.", route: "checkin", param: "evening", priority: 85 });
  }

  const thisWeek = weekStartOf(today);
  const lastReview = [...state.weeklyReviews].sort((a, b) => b.weekStart.localeCompare(a.weekStart))[0];
  const dow = new Date(now).getDay();
  const hasHistory = Object.keys(state.sessions).length > 0 || Object.keys(state.days).length > 1;
  if (hasHistory && lastReview?.weekStart !== thisWeek && (dow === 0 || dow === 5 || dow === 6 || (lastReview && lastReview.weekStart < addDays(thisWeek, -7)))) {
    recs.push({ id: "weekly", kind: "review", title: "Weekly review", reason: "Look back at the week's evidence and set next week's focus.", route: "reviews", priority: 75 });
  }

  // Relevance: what today's real context says matters.
  const signals = collectSignals(state, today);
  for (const rel of relevantTracks(signals).slice(0, 2)) {
    const day = sessionForTrack(state, rel.track);
    recs.push({
      id: `relevant:${rel.track.id}`,
      kind: "relevant",
      title: day ? `${rel.track.name}: Day ${day} — ${getDay(day)!.theme}` : `${rel.track.name} is relevant today`,
      reason: `Because your ${rel.signal.source === "check-in" ? "check-in" : "project"} mentions “${rel.keyword}”.`,
      route: day ? "session" : "skills",
      param: day,
      priority: rel.signal.source === "check-in" ? 70 : 45,
    });
  }

  const caps = [...skillCapabilities(state, today).values()];

  // Execution gap: studied but never applied for real.
  const gap = caps.filter((c) => c.practised >= 2 && c.realWorld === 0).sort((a, b) => b.practised - a.practised)[0];
  if (gap) {
    recs.push({
      id: `apply:${gap.id}`, kind: "apply", title: `Apply ${skillLabel(gap.id)} for real`,
      reason: `Practised in ${gap.practised} sessions but never used in real work. Run an experiment or log a real result.`,
      route: "experiments", priority: 60,
    });
  }

  // Knowledge without application: sessions closed as consumed.
  const consumed = Object.entries(state.sessions)
    .filter(([, r]) => sessionStatus(r) === "consumed" && (r.closedOn ?? today) <= addDays(today, -2))
    .map(([d]) => Number(d))
    .sort((a, b) => a - b)[0];
  if (consumed !== undefined) {
    recs.push({
      id: `revisit:${consumed}`, kind: "revisit", title: `Revisit Day ${consumed} — ${getDay(consumed)?.theme ?? ""}`,
      reason: "You read it but didn't apply it. Do the Apply step now.", route: "session", param: consumed, priority: 55,
    });
  }

  const staleRunning = state.experiments.filter((x) => x.status === "running" && (x.startedAt ?? "").slice(0, 10) <= addDays(today, -7));
  for (const x of staleRunning.slice(0, 1)) {
    recs.push({ id: `experiment:${x.id}`, kind: "experiment", title: `Update “${x.title}”`, reason: "Running for over a week with no conclusion.", route: "experiments", param: x.id, priority: 50 });
  }

  const staleDecisions = state.decisions.filter((d) => !d.outcomeNote && d.date <= addDays(today, -14));
  if (staleDecisions.length) {
    recs.push({
      id: "decisions", kind: "decision", title: `Review ${staleDecisions.length} decision${staleDecisions.length === 1 ? "" : "s"}`,
      reason: "Over two weeks old with no recorded outcome. Reviewing is how judgement improves.", route: "decisions", priority: 40,
    });
  }

  const fading = caps.filter((c) => c.fading).sort((a, b) => b.level - a.level)[0];
  if (fading) {
    recs.push({ id: `fading:${fading.id}`, kind: "fading", title: `${skillLabel(fading.id)} is fading`, reason: `Nothing recorded since ${fading.lastActivity}.`, route: "skills", param: fading.id, priority: 30 });
  }

  return recs.sort((a, b) => b.priority - a.priority);
}
