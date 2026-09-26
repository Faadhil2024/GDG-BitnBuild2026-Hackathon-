import { useSyncExternalStore } from "react";
import type { Grade } from "@/lib/types";
import type { AiReview, DisagreementVerdict } from "./appraisal-review";
import { SEEDED_APPRAISALS, SEEDED_DECISIONS } from "@/data/seeded-appraisals";

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

/** Local overrides layered over the seeded mid-cycle state. A tombstone (null) hides a seeded entry. */
function makeStore<T>(key: string, seeded: Record<string, T>) {
  const listeners = new Set<() => void>();
  let cache: { raw: string | null; value: Record<string, T> } = { raw: null, value: seeded };
  const readLocal = (): Record<string, T | null> => {
    const raw = window.localStorage.getItem(key);
    try {
      return raw ? (JSON.parse(raw) as Record<string, T | null>) : {};
    } catch {
      return {};
    }
  };
  const read = (): Record<string, T> => {
    if (typeof window === "undefined") return seeded;
    const raw = window.localStorage.getItem(key);
    if (raw === cache.raw) return cache.value;
    const merged: Record<string, T> = { ...seeded };
    for (const [id, v] of Object.entries(readLocal())) {
      if (v === null) delete merged[id];
      else merged[id] = v;
    }
    cache = { raw, value: merged };
    return cache.value;
  };
  const write = (next: Record<string, T | null>) => {
    window.localStorage.setItem(key, JSON.stringify(next));
    listeners.forEach((cb) => cb());
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
    use: () => useSyncExternalStore(subscribe, read, () => seeded),
    save: (id: string, value: T) => write({ ...readLocal(), [id]: value }),
    remove: (id: string) => write({ ...readLocal(), [id]: null }),
  };
}

const appraisals = makeStore<SelfAppraisal>("skynet.selfAppraisals", SEEDED_APPRAISALS);
const decisions = makeStore<Decision>("skynet.decisions", SEEDED_DECISIONS);

export const useSelfAppraisals = appraisals.use;
export const saveSelfAppraisal = (a: SelfAppraisal) => {
  appraisals.save(a.employeeId, a);
  decisions.remove(a.employeeId); // a fresh submission reopens the review
};
export const useDecisions = decisions.use;
export const saveDecision = (d: Decision) => decisions.save(d.employeeId, d);
