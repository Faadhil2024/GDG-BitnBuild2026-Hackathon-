import { employees } from "./employees";
import { FRESH_EMPLOYEE_IDS } from "./accounts";
import { NON_TECHNICAL_SEEDS, TECHNICAL_ROLES, TECHNICAL_SEEDS } from "./self-appraisal";
import { fullAssessment, reviewSelfAppraisal } from "@/lib/appraisal-review";
import type { Decision, SelfAppraisal } from "@/lib/self-appraisal";
import { GRADES } from "@/lib/types";

/**
 * The cycle is mid-way: about half the workforce has already submitted, and
 * their manager has decided on roughly half of those. Deterministic, so the
 * employer view is identical on every load. The four demo accounts are left
 * untouched so the live flow can be shown from scratch.
 */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SEEDED_APPRAISALS: Record<string, SelfAppraisal> = {};
export const SEEDED_DECISIONS: Record<string, Decision> = {};

const r = rng(77_2026);
for (const e of employees) {
  if (FRESH_EMPLOYEE_IDS.includes(e.id)) continue;
  const a = fullAssessment(e);
  if (!a || r() > 0.55) continue;

  const pool = TECHNICAL_ROLES.includes(e.role) ? TECHNICAL_SEEDS : NON_TECHNICAL_SEEDS;
  const seed = pool[Math.floor(r() * pool.length)];
  const shift = r() < 0.5 ? 0 : r() < 0.7 ? -1 : 1; // most rate themselves a step generous
  const selfGrade = GRADES[Math.max(0, Math.min(GRADES.length - 1, GRADES.indexOf(a.grade) + shift))];
  const day = 1 + Math.floor(r() * 20);
  const submittedAt = `2026-09-${String(day).padStart(2, "0")}T${String(9 + Math.floor(r() * 8)).padStart(2, "0")}:${String(Math.floor(r() * 60)).padStart(2, "0")}:00+08:00`;

  SEEDED_APPRAISALS[e.id] = {
    employeeId: e.id,
    answers: seed.answers,
    grade: selfGrade,
    submittedAt,
    ai: reviewSelfAppraisal(e, seed.answers, selfGrade, submittedAt),
  };

  if (r() < 0.5) {
    const decidedAt = `2026-09-${String(Math.min(28, day + 1 + Math.floor(r() * 5))).padStart(2, "0")}T10:30:00+08:00`;
    SEEDED_DECISIONS[e.id] = { employeeId: e.id, outcome: "agreed", finalGrade: a.grade, aiGrade: a.grade, rounds: [], decidedAt, decidedBy: e.manager };
  }
}
