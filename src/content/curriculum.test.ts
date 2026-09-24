import { describe, expect, it } from "vitest";
import { ALL_SKILLS, DAYS, FORMATS, LAST_AUTHORED_DAY, PHASES, PILLARS, PROGRAM_LENGTH, phaseForDay } from "./curriculum";
import { LIBRARY } from "./library";

describe("curriculum integrity", () => {
  it("authored days are contiguous from Day 1", () => {
    DAYS.forEach((d, i) => expect(d.day).toBe(i + 1));
    expect(LAST_AUTHORED_DAY).toBe(DAYS.length);
  });

  it("every day uses a known format, pillar and skills", () => {
    const known = new Set(ALL_SKILLS);
    for (const d of DAYS) {
      expect(PILLARS[d.pillar], `Day ${d.day} pillar`).toBeDefined();
      expect(FORMATS[d.format], `Day ${d.day} format`).toBeDefined();
      expect(d.skills.length, `Day ${d.day} skills`).toBeGreaterThan(0);
      for (const s of d.skills) expect(known.has(s), `Day ${d.day} skill "${s}"`).toBe(true);
    }
  });

  it("every day has an objective, a time estimate, completion criteria and something to do", () => {
    for (const d of DAYS) {
      expect(d.theme.trim(), `Day ${d.day} theme`).not.toBe("");
      expect(d.capability.trim(), `Day ${d.day} capability`).not.toBe("");
      expect(d.doneWhen.trim(), `Day ${d.day} doneWhen`).not.toBe("");
      expect(d.minutes, `Day ${d.day} minutes`).toBeGreaterThan(0);
      expect(d.act ?? d.build, `Day ${d.day} needs an act or build`).toBeTruthy();
    }
  });

  it("skill ids are unique across categories", () => {
    expect(new Set(ALL_SKILLS).size).toBe(ALL_SKILLS.length);
  });

  it("phases cover the whole programme without gaps or overlaps", () => {
    let expected = 1;
    for (const p of PHASES) {
      expect(p.range[0]).toBe(expected);
      expected = p.range[1] + 1;
    }
    expect(expected - 1).toBe(PROGRAM_LENGTH);
    expect(phaseForDay(1).id).toBe(1);
    expect(phaseForDay(53).id).toBe(2);
    expect(phaseForDay(365).id).toBe(7);
  });

  it("library ids are unique and related links resolve", () => {
    const ids = LIBRARY.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const e of LIBRARY) for (const r of e.related) expect(ids, `${e.id} → ${r}`).toContain(r);
  });

  it("each full week trains every pillar and ends in a review", () => {
    for (let w = 0; w < Math.floor(DAYS.length / 7); w++) {
      const week = DAYS.slice(w * 7, w * 7 + 7);
      const pillars = new Set(week.map((d) => d.pillar));
      for (const p of ["mind", "business", "build", "influence", "judgement"] as const) expect(pillars.has(p), `week ${w + 1} ${p}`).toBe(true);
      expect(week[6]!.format).toBe("weekly_review");
    }
  });
});
