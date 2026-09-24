// What the mentor knows: a compact, factual summary of the founder's real state.
// Pure and deterministic, so it's testable and can be shown to the user verbatim.
import { getDay, phaseForDay, skillLabel } from "../content/curriculum";
import { skillCapabilities, scorecard, CAPABILITY_LEVELS } from "../domain/capability";
import { MEMORY_CATEGORIES, type AppState, type LocalDate } from "../domain/types";
import { sessionStatus } from "../domain/sessions";
import { currentFocus } from "../domain/weekly";

export const MENTOR_PERSONA = `You are the founder coach inside Venture Forge, a private founder-development system. Your job is to make this founder more capable — not more informed, busier or more comfortable.

How you work:
- Be demanding but constructive. Intellectually honest. Never flatter; don't praise ordinary work. If something is weak, say so plainly and say why.
- Ask sharp questions before giving answers when the founder would learn more by reasoning it out.
- Challenge assumptions. Separate what they know (evidence) from what they believe.
- Connect theory to their actual situation, using the context below. Reference their real projects, experiments and records by name.
- Prefer concrete next actions, experiments with a clear hypothesis and measure, and evidence they can record.
- Notice recurring patterns (repeated avoidance, stalled projects, learning without applying) and name them.
- Keep replies tight: short paragraphs or brief lists. No motivational filler, no generic advice that could apply to anyone.
- If you don't know something about their situation, ask rather than invent.`;

const clip = (s: string, n = 220) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export function buildMentorContext(state: AppState, today: LocalDate): string {
  const lines: string[] = [];
  const name = state.settings.name || "the founder";
  lines.push(`# Current context for ${name} (today is ${today})`);

  const d = state.currentDay;
  const content = getDay(d);
  lines.push(`\n## Programme\nDay ${d} of 365, phase: ${phaseForDay(d).name}.${content ? ` Today's session: "${content.theme}" — objective: ${content.capability} (status: ${sessionStatus(state.sessions[d]).replace("_", " ")}).` : " No session is written for today."}`);

  const m = state.days[today]?.morning;
  if (m) {
    lines.push("\n## This morning's check-in");
    if (m.plan) lines.push(`- Plan: ${clip(m.plan)}`);
    if (m.priorities.length) lines.push(`- Priorities: ${m.priorities.map((p, i) => `${i + 1}. ${p}`).join("; ")}`);
    if (m.workingOn) lines.push(`- Working on: ${clip(m.workingOn)}`);
    if (m.difficulty) lines.push(`- Difficult right now: ${clip(m.difficulty)}`);
    if (m.focus) lines.push(`- Wants help improving: ${clip(m.focus)}`);
  }

  const focus = currentFocus(state, today);
  if (focus) lines.push(`\n## This week's focus (from the weekly review)\n${focus.focus.map((f) => `- ${f}`).join("\n")}`);

  const projects = state.projects.filter((p) => !["Done", "Abandoned"].includes(p.stage));
  if (projects.length) {
    lines.push("\n## Projects");
    for (const p of projects.slice(0, 8)) {
      const open = p.milestones.filter((x) => !x.done).map((x) => x.title).slice(0, 3);
      lines.push(`- ${p.name} [${p.stage}]${p.objective ? ` — objective: ${clip(p.objective, 140)}` : ""}${p.nextAction ? `; next action: ${clip(p.nextAction, 120)}` : ""}${open.length ? `; open milestones: ${open.join(", ")}` : ""}${p.problems ? `; problems: ${clip(p.problems, 140)}` : ""}`);
    }
  }

  const experiments = state.experiments.filter((x) => x.status !== "concluded").concat(state.experiments.filter((x) => x.status === "concluded").slice(-3));
  if (experiments.length) {
    lines.push("\n## Experiments");
    for (const x of experiments.slice(0, 8)) {
      lines.push(`- ${x.title} [${x.status}${x.outcome ? `, ${x.outcome}` : ""}]${x.hypothesis ? ` — hypothesis: ${clip(x.hypothesis, 140)}` : ""}${x.result ? `; result: ${clip(x.result, 140)}` : ""}`);
    }
  }

  const evidence = [...state.evidence].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  if (evidence.length) {
    lines.push("\n## Recent evidence");
    for (const e of evidence) lines.push(`- ${e.date}: ${e.title}${e.note ? ` — ${clip(e.note, 140)}` : ""}`);
  }

  const card = scorecard(state, today);
  const attention = card.filter((c) => c.status === "attention" || c.status === "none").map((c) => `${c.label} (${c.facts})`);
  const strong = card.filter((c) => c.status === "strong" || c.status === "developing").map((c) => c.label);
  lines.push(`\n## Scorecard\n- Needs attention: ${attention.length ? attention.join("; ") : "nothing flagged"}\n- Developing or strong: ${strong.length ? strong.join(", ") : "none yet"}`);

  const caps = [...skillCapabilities(state, today).values()].filter((c) => c.level > 0).sort((a, b) => b.level - a.level || b.evidence - a.evidence);
  if (caps.length) {
    lines.push(`\n## Skills with a record\n${caps.slice(0, 12).map((c) => `- ${skillLabel(c.id)}: ${CAPABILITY_LEVELS[c.level]} (${c.evidence} evidence, ${c.realWorld} real-world)${c.fading ? " — fading" : ""}`).join("\n")}`);
  }

  const avoided = Object.entries(state.days).sort(([a], [b]) => b.localeCompare(a)).slice(0, 7).map(([, l]) => l.evening?.avoided).filter(Boolean);
  if (avoided.length) lines.push(`\n## Recently avoided (from evening reviews)\n${avoided.map((a) => `- ${clip(a!, 140)}`).join("\n")}`);

  const memory = [...state.memory].sort((a, b) => Number(b.pinned) - Number(a.pinned)).slice(0, 20);
  if (memory.length) {
    lines.push("\n## Founder memory");
    for (const cat of Object.keys(MEMORY_CATEGORIES) as (keyof typeof MEMORY_CATEGORIES)[]) {
      const items = memory.filter((x) => x.category === cat);
      if (items.length) lines.push(`${MEMORY_CATEGORIES[cat]}:\n${items.map((x) => `- ${clip(x.text)}`).join("\n")}`);
    }
  }
  return lines.join("\n");
}
