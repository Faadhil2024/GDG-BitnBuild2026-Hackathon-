import { useSyncExternalStore } from "react";

/**
 * Persistent change log — the answer to "interfaces that change silently."
 * Every state change lands here with a timestamp, a priority and the employee
 * it concerns, so anyone (sighted or not) can review what happened after the
 * fact. Toast notifications expire; this record does not.
 */
export interface Update {
  id: number;
  at: string;
  text: string;
  /** assertive = decision-critical; polite = routine progress */
  priority: "polite" | "assertive";
  /** Employee the change is about, for per-row "new" markers. */
  scope?: string;
}

const KEY = "skynet.updates";
const VISITED = "skynet.visited";
const CAP = 60;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((cb) => cb());
let nextId = 1;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function logUpdate(text: string, priority: Update["priority"] = "polite", scope?: string) {
  if (typeof window === "undefined") return;
  const list = readJson<Update[]>(KEY, []);
  list.unshift({ id: nextId++, at: new Date().toISOString(), text, priority, scope });
  window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, CAP)));
  emit();
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
};

// getSnapshot must return a stable reference per raw value, so we memoize by it.
function memo<T>(key: string, fallback: T) {
  let raw: string | null = "__unset__";
  let value = fallback;
  return () => {
    const next = window.localStorage.getItem(key);
    if (next !== raw) {
      raw = next;
      try {
        value = next ? (JSON.parse(next) as T) : fallback;
      } catch {
        value = fallback;
      }
    }
    return value;
  };
}
const updatesSnap = memo<Update[]>(KEY, []);
const visitedSnap = memo<Record<string, string>>(VISITED, {});

export function useUpdates(): Update[] {
  return useSyncExternalStore(subscribe, updatesSnap, () => []);
}
export function useVisited(): Record<string, string> {
  return useSyncExternalStore(subscribe, visitedSnap, () => ({}));
}

export function markVisited(key: string) {
  const v = readJson<Record<string, string>>(VISITED, {});
  v[key] = new Date().toISOString();
  window.localStorage.setItem(VISITED, JSON.stringify(v));
  emit();
}

/** True when a logged change concerns this employee and postdates their last-opened report. */
export function hasUnseenFor(employeeId: string, visited: Record<string, string>, updates: Update[]): boolean {
  const since = visited[`report:${employeeId}`] ?? "";
  return updates.some((u) => u.scope === employeeId && u.at > since);
}
