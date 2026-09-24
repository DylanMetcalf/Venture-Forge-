import { normalizeState } from "../domain/migrate";
import { defaultState, type AppState } from "../domain/types";

/**
 * Persistence boundary. The UI and domain never touch storage directly.
 *
 * The app is local-first: this synchronous repository is the on-device copy.
 * A future server sync (see docs/ROADMAP.md) should sit behind this interface
 * and reconcile in the background, so daily use keeps working offline.
 */
export interface Repository {
  load(): AppState;
  /** Throws if the write fails (quota, blocked storage). */
  save(state: AppState): void;
}

export const STORAGE_KEY = "ventureForge.state.v2";
/** The prototype's key. Read once for migration; never written or deleted. */
export const LEGACY_KEY = "foundersUniversity.v1";

export class LocalStorageRepository implements Repository {
  constructor(private readonly storage: Pick<Storage, "getItem" | "setItem">) {}

  load(): AppState {
    const raw = this.read(STORAGE_KEY) ?? this.read(LEGACY_KEY);
    if (raw === null) return defaultState();
    try {
      return normalizeState(JSON.parse(raw));
    } catch (e) {
      // Don't overwrite what we couldn't read: keep a copy before starting fresh.
      console.error("Venture Forge: stored state unreadable; starting fresh", e);
      try {
        this.storage.setItem(`${STORAGE_KEY}.unreadable.${Date.now()}`, raw);
      } catch {
        /* storage full or blocked; nothing more we can do */
      }
      return defaultState();
    }
  }

  save(state: AppState): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  private read(key: string): string | null {
    try {
      return this.storage.getItem(key);
    } catch {
      return null;
    }
  }
}

/** Used when browser storage is unavailable (private mode, blocked). Data lasts for the tab only. */
export class MemoryRepository implements Repository {
  constructor(private state: AppState = defaultState()) {}
  load(): AppState {
    return structuredClone(this.state);
  }
  save(state: AppState): void {
    this.state = structuredClone(state);
  }
}
