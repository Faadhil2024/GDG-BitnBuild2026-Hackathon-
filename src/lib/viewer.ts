import { useSyncExternalStore } from "react";
import { VIEWERS } from "@/data/employees";

/** Who is looking at the screen. Cosmetic in this prototype — it changes the point of view, not data access. */
const KEY = "wp.viewer";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

const DEFAULT = VIEWERS.find((v) => v.name === "Employee")?.name ?? VIEWERS[0].name;
const read = () => window.localStorage.getItem(KEY) ?? DEFAULT;

export function useViewer() {
  const name = useSyncExternalStore(subscribe, read, () => DEFAULT);
  const viewer = VIEWERS.find((v) => v.name === name) ?? VIEWERS[0];
  return { viewer, isEmployer: viewer.name !== "Employee" };
}

export function setViewer(name: string) {
  window.localStorage.setItem(KEY, name);
  listeners.forEach((cb) => cb());
}
