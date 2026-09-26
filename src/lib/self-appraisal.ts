import { useSyncExternalStore } from "react";
import type { Grade } from "@/lib/types";

export interface SelfAppraisal {
  employeeId: string;
  answers: Record<string, string>;
  grade: Grade;
  submittedAt: string;
}

const KEY = "wp.selfAppraisals";
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: Record<string, SelfAppraisal> } = { raw: null, value: {} };

function read(): Record<string, SelfAppraisal> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(KEY);
  if (raw === cache.raw) return cache.value;
  try {
    cache = { raw, value: raw ? (JSON.parse(raw) as Record<string, SelfAppraisal>) : {} };
  } catch {
    cache = { raw, value: {} };
  }
  return cache.value;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

const EMPTY: Record<string, SelfAppraisal> = {};

export function useSelfAppraisals() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function saveSelfAppraisal(a: SelfAppraisal) {
  const next = { ...read(), [a.employeeId]: a };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((cb) => cb());
}
