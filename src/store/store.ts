import { DomainError, type AppState } from "../domain/types";
import type { Repository } from "../storage/repository";

export type Action = (state: AppState, now: Date) => AppState;

export interface Store {
  getState(): AppState;
  subscribe(listener: () => void): () => void;
  /** Applies an action and persists. Returns a user-facing error message, or null on success. */
  run(action: Action): string | null;
  /** Replaces all state (backup import). */
  replace(state: AppState): string | null;
  /** Last persistence failure, if the most recent save didn't succeed. */
  saveError(): string | null;
}

export function createStore(repo: Repository, clock: () => Date = () => new Date()): Store {
  let state = repo.load();
  let lastSaveError: string | null = null;
  const listeners = new Set<() => void>();

  function commit(next: AppState): string | null {
    if (next === state) return null;
    state = next;
    try {
      repo.save(state);
      lastSaveError = null;
    } catch (e) {
      console.error("Venture Forge: save failed", e);
      lastSaveError = "Couldn't save to this device — storage may be full or blocked. Export a backup from Settings.";
    }
    listeners.forEach((l) => l());
    return lastSaveError;
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    run(action) {
      let next: AppState;
      try {
        next = action(state, clock());
      } catch (e) {
        if (e instanceof DomainError) return e.message;
        throw e;
      }
      return commit(next);
    },
    replace: (next) => commit(next),
    saveError: () => lastSaveError,
  };
}
