import type {
  Assessment,
  Confidence,
  ContributionCategory,
  Employee,
  Evidence,
  Factor,
  Grade,
  Level,
} from "@/lib/types";
import { CATEGORY_LABELS, roleProfiles } from "./roles";

export const LEVEL_THRESHOLDS = { moderate: 35, high: 70 };

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ContributionCategory[];

/** Impact overrides produced by resolved challenges (evidenceId -> new impact). */
export type ImpactAdjustments = Record<string, number>;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function levelFor(score: number): Level {
  if (score >= LEVEL_THRESHOLDS.high) return "High";
  if (score >= LEVEL_THRESHOLDS.moderate) return "Moderate";
  return "Low";
}

/** Letter grade on the same 0–100 contribution index. What people actually read. */
export function gradeFor(score: number): Grade {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B+";
  if (score >= 60) return "B";
  if (score >= 50) return "C+";
  if (score >= 40) return "C";
  return "D";
}

export const GRADE_MEANING: Record<Grade, string> = {
  "A+": "Exceptional, evidenced across every expected area",
  A: "Strong contribution with broad evidence",
  "B+": "Solid contribution, minor gaps",
  B: "Good contribution, some areas unproven or a concern on record",
  "C+": "Partial picture — meets some expectations",
  C: "Limited evidence of contribution",
  D: "Little or no evidence of contribution for this role",
};

function confidenceFor(coverage: number): Confidence {
  if (coverage >= 0.8) return "high";
  if (coverage >= 0.5) return "medium";
  return "low";
}

export function effectiveImpact(ev: Evidence, adjustments: ImpactAdjustments = {}) {
  return ev.id in adjustments ? adjustments[ev.id] : ev.impact;
}

/**
 * Deterministic, role-aware assessment. The level is decided here, never by an LLM.
 * Each factor lists exactly which evidence IDs produced its score.
 */
export function assess(
  employee: Employee,
  evidenceList: Evidence[],
  adjustments: ImpactAdjustments = {},
  computedAt = new Date().toISOString(),
): Assessment {
  const profile = roleProfiles[employee.role];
  const own = evidenceList.filter((e) => e.employeeId === employee.id);

  const factors: Factor[] = CATEGORIES.map((category) => {
    const weight = profile.weights[category];
    const items = own.filter((e) => e.category === category);
    const raw = items.reduce((s, e) => s + effectiveImpact(e, adjustments), 0);
    const score = clamp(raw, -2, 2);
    const evidenceIds = items.map((e) => e.id);
    const expected = profile.expected.includes(category);

    let status: Factor["status"];
    if (weight === 0) status = "not_applicable";
    else if (items.length === 0 || items.every((e) => effectiveImpact(e, adjustments) === 0)) status = expected ? "missing" : "supported";
    else if (score < 0) status = "concern";
    else status = "supported";

    return {
      category,
      label: CATEGORY_LABELS[category],
      weight,
      score,
      evidenceIds,
      status,
      summary: summarise(category, items, score, weight, adjustments),
    };
  });

  const maxRaw = 2 * factors.reduce((s, f) => s + f.weight, 0);
  const rawTotal = factors.reduce((s, f) => s + f.weight * f.score, 0);
  const score = Math.round(clamp((rawTotal / maxRaw) * 100, 0, 100));

  const covered = profile.expected.filter((c) =>
    own.some((e) => e.category === c && effectiveImpact(e, adjustments) !== 0),
  );
  const coverage = covered.length / profile.expected.length;
  const missingAreas = profile.expected.filter((c) => !covered.includes(c));

  return {
    level: levelFor(score),
    grade: gradeFor(score),
    score,
    factors,
    confidence: confidenceFor(coverage),
    coverage,
    missingAreas,
    evidenceIds: own.filter((e) => profile.weights[e.category] > 0).map((e) => e.id),
    ignoredEvidenceIds: own.filter((e) => profile.weights[e.category] === 0).map((e) => e.id),
    computedAt,
  };
}

function summarise(
  category: ContributionCategory,
  items: Evidence[],
  score: number,
  weight: number,
  adjustments: ImpactAdjustments,
): string {
  if (weight === 0) return `Not used to judge this role. ${items.length} item(s) shown for transparency only.`;
  if (items.length === 0) return "No evidence found. This area is not represented in the assessment.";
  const active = items.filter((e) => effectiveImpact(e, adjustments) !== 0);
  if (active.length === 0) return `${items.length} item(s) found, none bearing on contribution.`;
  const mitigated = items.some((e) => e.id in adjustments);
  if (score < 0) return mitigated ? "Concern remains but is partly mitigated by context." : "Evidence indicates a concern in this area.";
  return `${active.length} supporting item(s) contribute ${score > 1 ? "strongly" : "moderately"} to the assessment.`;
}

export interface AssessmentDiff {
  from: Grade;
  to: Grade;
  changed: boolean;
  scoreDelta: number;
  improved: ContributionCategory[];
  worsened: ContributionCategory[];
  unchangedConcerns: ContributionCategory[];
  newlyCovered: ContributionCategory[];
}

export function diff(before: Assessment, after: Assessment): AssessmentDiff {
  const byCat = (a: Assessment) => Object.fromEntries(a.factors.map((f) => [f.category, f]));
  const b = byCat(before);
  const a = byCat(after);
  const improved: ContributionCategory[] = [];
  const worsened: ContributionCategory[] = [];
  const unchangedConcerns: ContributionCategory[] = [];
  for (const c of CATEGORIES) {
    if (a[c].weight === 0) continue;
    const d = a[c].weight * a[c].score - b[c].weight * b[c].score;
    if (d > 0) improved.push(c);
    else if (d < 0) worsened.push(c);
    else if (a[c].status === "concern") unchangedConcerns.push(c);
  }
  return {
    from: before.grade,
    to: after.grade,
    changed: before.grade !== after.grade,
    scoreDelta: after.score - before.score,
    improved,
    worsened,
    unchangedConcerns,
    newlyCovered: before.missingAreas.filter((c) => !after.missingAreas.includes(c)),
  };
}
