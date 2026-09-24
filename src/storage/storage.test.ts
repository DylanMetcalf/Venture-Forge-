import { describe, expect, it } from "vitest";
import { addProject } from "../domain/actions";
import { defaultState } from "../domain/types";
import { createStore } from "../store/store";
import { exportBackup, parseBackup } from "./backup";
import { LEGACY_KEY, LocalStorageRepository, MemoryRepository, STORAGE_KEY } from "./repository";

class FakeStorage {
  data = new Map<string, string>();
  failWrites = false;
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    if (this.failWrites) throw new Error("QuotaExceededError");
    this.data.set(k, v);
  }
}

const NOW = new Date(2026, 8, 24, 12);

describe("LocalStorageRepository", () => {
  it("saves and loads", () => {
    const st = new FakeStorage();
    const repo = new LocalStorageRepository(st);
    const s = addProject(defaultState(), { name: "SiteGuard", why: "", nextAction: "" }, NOW);
    repo.save(s);
    expect(new LocalStorageRepository(st).load()).toEqual(s);
  });

  it("migrates the prototype's key without deleting it", () => {
    const st = new FakeStorage();
    st.data.set(LEGACY_KEY, JSON.stringify({ currentDay: 5, days: {}, theme: "dark" }));
    const s = new LocalStorageRepository(st).load();
    expect(s.currentDay).toBe(5);
    expect(st.data.has(LEGACY_KEY)).toBe(true);
  });

  it("keeps a copy of unreadable data instead of silently losing it", () => {
    const st = new FakeStorage();
    st.data.set(STORAGE_KEY, "{not json");
    const s = new LocalStorageRepository(st).load();
    expect(s).toEqual(defaultState());
    expect([...st.data.keys()].some((k) => k.startsWith(`${STORAGE_KEY}.unreadable.`))).toBe(true);
  });
});

describe("backup", () => {
  it("round-trips through export and import", () => {
    const s = addProject(defaultState(), { name: "Terram", why: "margin", nextAction: "model" }, NOW);
    expect(parseBackup(exportBackup(s, NOW))).toEqual(s);
  });

  it("accepts a raw prototype dump", () => {
    expect(parseBackup(JSON.stringify({ days: {}, currentDay: 2 })).currentDay).toBe(2);
  });

  it("gives a clear error for bad files", () => {
    expect(() => parseBackup("nope")).toThrow(/valid JSON/);
    expect(() => parseBackup("{}")).toThrow(/Not a Venture Forge/);
  });
});

describe("store", () => {
  it("applies actions, persists and notifies", () => {
    const repo = new MemoryRepository();
    const store = createStore(repo, () => NOW);
    let calls = 0;
    store.subscribe(() => calls++);
    expect(store.run((s, now) => addProject(s, { name: "Creator Hub", why: "", nextAction: "" }, now))).toBeNull();
    expect(store.getState().projects).toHaveLength(1);
    expect(repo.load().projects).toHaveLength(1);
    expect(calls).toBe(1);
  });

  it("returns domain errors as messages without changing state", () => {
    const store = createStore(new MemoryRepository(), () => NOW);
    const before = store.getState();
    expect(store.run((s, now) => addProject(s, { name: " ", why: "", nextAction: "" }, now))).toBe("Name the project first.");
    expect(store.getState()).toBe(before);
  });

  it("reports save failures but keeps the change in memory", () => {
    const st = new FakeStorage();
    const store = createStore(new LocalStorageRepository(st), () => NOW);
    st.failWrites = true;
    const err = store.run((s, now) => addProject(s, { name: "Mea Creo", why: "", nextAction: "" }, now));
    expect(err).toMatch(/Couldn't save/);
    expect(store.getState().projects).toHaveLength(1);
    expect(store.saveError()).not.toBeNull();
  });
});
