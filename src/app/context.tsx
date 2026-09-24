import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { AppState } from "../domain/types";
import { localDate } from "../domain/util";
import type { Action, Store } from "../store/store";

type ToastKind = "info" | "error";
interface Ctx {
  store: Store;
  /** False when browser storage is unavailable and data lasts for this tab only. */
  persistent: boolean;
  toast: (msg: string, kind?: ToastKind) => void;
}
const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ store, persistent, children }: { store: Store; persistent: boolean; children: ReactNode }) {
  const [toastState, setToast] = useState<{ msg: string; kind: ToastKind } | null>(null);
  const timer = useRef<number>(undefined);
  const toast = useCallback((msg: string, kind: ToastKind = "info") => {
    setToast({ msg, kind });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), kind === "error" ? 4000 : 2400);
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <AppContext.Provider value={{ store, persistent, toast }}>
      {children}
      <div role="status" aria-live="polite">
        {toastState && <div className={`toast ${toastState.kind === "error" ? "error" : ""}`}>{toastState.msg}</div>}
      </div>
    </AppContext.Provider>
  );
}

function useCtx(): Ctx {
  const c = useContext(AppContext);
  if (!c) throw new Error("AppProvider missing");
  return c;
}

export function useAppState(): AppState {
  const { store } = useCtx();
  return useSyncExternalStore(store.subscribe, store.getState);
}

/**
 * Returns a function that applies an action; errors are shown as a toast.
 * Resolves to true on success.
 */
export function useAction() {
  const { store, toast } = useCtx();
  return useCallback(
    (action: Action, success?: string): boolean => {
      const err = store.run(action);
      if (err) toast(err, "error");
      else if (success) toast(success);
      return err === null;
    },
    [store, toast],
  );
}

export function useToast() {
  return useCtx().toast;
}
export function useStore() {
  return useCtx().store;
}
export function usePersistent() {
  return useCtx().persistent;
}

/** Today's local date, refreshed when the tab regains focus (e.g. after midnight). */
export function useToday(): string {
  const [today, setToday] = useState(() => localDate(new Date()));
  useEffect(() => {
    const refresh = () => setToday(localDate(new Date()));
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  return today;
}
