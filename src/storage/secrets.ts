// Secrets live under their own storage key: never in AppState, never in backups.
const KEY = "ventureForge.secret.anthropicKey";

export const secrets = {
  getAnthropicKey(): string | null {
    try {
      return window.localStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  setAnthropicKey(value: string | null): void {
    try {
      if (value && value.trim()) window.localStorage.setItem(KEY, value.trim());
      else window.localStorage.removeItem(KEY);
    } catch {
      /* storage blocked; the key simply won't persist */
    }
  },
};
