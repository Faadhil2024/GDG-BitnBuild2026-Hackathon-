import { useSyncExternalStore } from "react";
import type { Grade } from "@/lib/types";
import type { AiReview, DisagreementVerdict } from "./appraisal-review";

export interface SelfAppraisal {
  employeeId: string;
  answers: Record<string, string>;
  grade: Grade;
  submittedAt: string;
  /** Produced automatically at submission time. Absent only if no evidence is indexed. */
  ai?: AiReview;
}

export interface ReviewRound {
  proposedGrade: Grade;
  reason: string;
  verdict: DisagreementVerdict;
  at: string;
}

export interface Decision {
  employeeId: string;
  outcome: "agreed" | "revised" | "override";
  finalGrade: Grade;
  aiGrade: Grade;
  rounds: ReviewRound[];
  overrideNote?: string;
  decidedAt: string;
  decidedBy: string;
}

function makeStore<T>(key: string) {
  const listeners = new Set<() => void>();
  let cache: { raw: string | null; value: Record<string, T> } = { raw: null, value: {} };
  const EMPTY: Record<string, T> = {};
  const read = (): Record<string, T> => {
    if (typeof window === "undefined") return EMPTY;
    const raw = window.localStorage.getItem(key);
    if (raw === cache.raw) return cache.value;
    try {
      cache = { raw, value: raw ? (JSON.parse(raw) as Record<string, T>) : {} };
    } catch {
      cache = { raw, value: {} };
    }
    return cache.value;
  };
  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    window.addEventListener("storage", cb);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", cb);
    };
  };
  return {
    use: () => useSyncExternalStore(subscribe, read, () => EMPTY),
    save: (id: string, value: T) => {
      window.localStorage.setItem(key, JSON.stringify({ ...read(), [id]: value }));
      listeners.forEach((cb) => cb());
    },
    remove: (id: string) => {
      const next = { ...read() };
      delete next[id];
      window.localStorage.setItem(key, JSON.stringify(next));
      listeners.forEach((cb) => cb());
    },
  };
}

const appraisals = makeStore<SelfAppraisal>("wp.selfAppraisals");
const decisions = makeStore<Decision>("wp.decisions");

export const useSelfAppraisals = appraisals.use;
export const saveSelfAppraisal = (a: SelfAppraisal) => {
  appraisals.save(a.employeeId, a);
  decisions.remove(a.employeeId); // a fresh submission reopens the review
};
export const useDecisions = decisions.use;
export const saveDecision = (d: Decision) => decisions.save(d.employeeId, d);
