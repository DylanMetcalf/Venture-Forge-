import { normalizeState } from "../domain/migrate";
import type { AppState } from "../domain/types";

export const BACKUP_FORMAT = "venture-forge-backup";

export function exportBackup(state: AppState, now: Date): string {
  return JSON.stringify({ format: BACKUP_FORMAT, exportedAt: now.toISOString(), state }, null, 2);
}

/**
 * Accepts a backup file from exportBackup, a bare v2 state, or a raw
 * prototype (v1) localStorage dump. Throws a user-facing Error otherwise.
 */
export function parseBackup(text: string): AppState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  const wrapped = typeof parsed === "object" && parsed !== null && (parsed as { format?: unknown }).format === BACKUP_FORMAT;
  return normalizeState(wrapped ? (parsed as { state: unknown }).state : parsed);
}

export function backupFilename(now: Date): string {
  return `venture-forge-backup-${now.toISOString().slice(0, 10)}.json`;
}
