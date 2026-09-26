import { useSyncExternalStore } from "react";

/** Light / dark, chosen by the signed-in user. Persisted; applied as a class on <html>. */
export type Theme = "light" | "dark";
const KEY = "skynet.theme";
const listeners = new Set<() => void>();

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const read = (): Theme => (window.localStorage.getItem(KEY) === "dark" ? "dark" : "light");

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, read, () => "light");
}

export function applyTheme(t: Theme) {
  document.documentElement.classList.toggle("dark", t === "dark");
  document.documentElement.style.colorScheme = t;
}

export function setTheme(t: Theme) {
  window.localStorage.setItem(KEY, t);
  applyTheme(t);
  listeners.forEach((cb) => cb());
}
