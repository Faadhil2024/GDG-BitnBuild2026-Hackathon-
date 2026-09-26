import { assess, gradeFor } from "@/lib/assessment/engine";
import { CATEGORY_LABELS, roleProfiles } from "@/lib/assessment/roles";
import { evidenceFor } from "@/data/evidence";
import { GRADES, type Assessment, type ContributionCategory, type Employee, type Grade } from "@/lib/types";

/** Grade the engine reaches from everything indexed for this person (challenge-only items excluded). */
export function fullAssessment(employee: Employee): Assessment | undefined {
  const ev = evidenceFor(employee.id).filter((e) => e.discoveredIn !== "challenge");
  return ev.length ? assess(employee, ev) : undefined;
}

export const gradeIndex = (g: Grade) => GRADES.indexOf(g); // 0 = A+, 6 = D
export const gradeDistance = (a: Grade, b: Grade) => Math.abs(gradeIndex(a) - gradeIndex(b));

/** Words that signal a self-appraisal is talking about a contribution area. */
const CLAIM_WORDS: Record<ContributionCategory, string[]> = {
  revenue_impact: ["revenue", "pipeline", "closed", "quota", "savings", "rm"],
  campaign_ownership: ["campaign", "brief", "launch webinar"],
  cross_functional: ["with product", "with sales", "with engineering", "with marketing", "with finance", "with legal", "cross", "other teams", "departments", "co-owned", "alongside"],
  client_impact: ["customer", "client", "account", "renewal", "csat", "complaint"],
  mentoring: ["mentor", "onboard", "buddy", "coach", "trained", "clinic"],
  delivery_reliability: ["on time", "on schedule", "milestone", "deadline", "slipped", "late", "delay", "incident", "outage", "sla"],
  technical_output: ["pull request", "shipped", "pipeline", "migration", "deployed", "commits", "components", "feature"],
  internal_activity: [],
};

export interface AiReview {
  grade: Grade;
  score: number;
  confidence: Assessment["confidence"];
  selfGrade: Grade;
  gap: number; // self minus AI, in grade steps; positive = self-rated higher
  supported: ContributionCategory[]; // claimed and evidenced
  unsupported: ContributionCategory[]; // claimed, no evidence indexed
  unclaimed: ContributionCategory[]; // evidenced, not mentioned by the employee
  concerns: ContributionCategory[]; // evidence shows a concern
  summary: string;
  provenance: "deterministic";
  reviewedAt: string;
}

/**
 * The AI review runs the moment a self-appraisal is submitted. The grade comes
 * from the evidence engine; the narrative compares what the employee claims
 * against what is indexed. It never invents evidence.
 */
export function reviewSelfAppraisal(employee: Employee, answers: Record<string, string>, selfGrade: Grade, reviewedAt = new Date().toISOString()): AiReview | undefined {
  const a = fullAssessment(employee);
  if (!a) return undefined;
  const text = Object.values(answers).join(" ").toLowerCase();
  const profile = roleProfiles[employee.role];
  const weighted = a.factors.filter((f) => f.weight > 0);

  const claimed = new Set<ContributionCategory>();
  for (const f of weighted) if (CLAIM_WORDS[f.category].some((w) => text.includes(w))) claimed.add(f.category);

  const evidenced = new Set(weighted.filter((f) => f.status === "supported" && f.evidenceIds.length).map((f) => f.category));
  const concerns = weighted.filter((f) => f.status === "concern").map((f) => f.category);

  const supported = [...claimed].filter((c) => evidenced.has(c));
  const unsupported = [...claimed].filter((c) => !evidenced.has(c) && profile.expected.includes(c));
  const unclaimed = [...evidenced].filter((c) => !claimed.has(c));

  const gap = gradeIndex(a.grade) - gradeIndex(selfGrade); // positive = self higher than AI
  const L = (cs: ContributionCategory[]) => cs.map((c) => CATEGORY_LABELS[c].toLowerCase()).join(", ");
  const parts = [
    gap === 0
      ? `Self-grade ${selfGrade} matches the evidence-based grade ${a.grade}.`
      : gap > 0
        ? `Self-grade ${selfGrade} is ${gap} step${gap > 1 ? "s" : ""} above the evidence-based grade ${a.grade}.`
        : `Self-grade ${selfGrade} is ${-gap} step${gap < -1 ? "s" : ""} below the evidence-based grade ${a.grade} — the employee under-reports.`,
    supported.length ? `Claims about ${L(supported)} are backed by indexed evidence.` : "",
    unsupported.length ? `Claims about ${L(unsupported)} have no indexed evidence yet — worth asking for a source.` : "",
    unclaimed.length ? `Evidence exists for ${L(unclaimed)} that the employee did not mention.` : "",
    concerns.length ? `Evidence records a concern in ${L(concerns)}.` : "",
    a.missingAreas.length ? `The evidence picture is incomplete: nothing indexed for ${L(a.missingAreas)}.` : "",
  ].filter(Boolean);

  return {
    grade: a.grade,
    score: a.score,
    confidence: a.confidence,
    selfGrade,
    gap,
    supported,
    unsupported,
    unclaimed,
    concerns,
    summary: parts.join(" "),
    provenance: "deterministic",
    reviewedAt,
  };
}

/** Per-question reasoning shown to the employer beside each answer. Evidence-bound: cites IDs or says nothing is indexed. */
export interface QuestionReasoning {
  questionId: string;
  claimed: ContributionCategory[];
  backed: { category: ContributionCategory; evidenceIds: string[] }[];
  unbacked: ContributionCategory[];
  contradicted: { category: ContributionCategory; evidenceIds: string[] }[];
  note: string;
}

export function reasonPerQuestion(employee: Employee, answers: Record<string, string>): QuestionReasoning[] {
  const a = fullAssessment(employee);
  const ev = evidenceFor(employee.id).filter((e) => e.discoveredIn !== "challenge");
  const byCat = (c: ContributionCategory) => ev.filter((e) => e.category === c);
  return Object.entries(answers).map(([questionId, text]) => {
    const t = text.toLowerCase();
    const claimed = (Object.keys(CLAIM_WORDS) as ContributionCategory[]).filter((c) => CLAIM_WORDS[c].some((w) => w && t.includes(w)));
    const backed = claimed
      .map((c) => ({ category: c, evidenceIds: byCat(c).filter((e) => e.direction === "strengthens").map((e) => e.id) }))
      .filter((x) => x.evidenceIds.length);
    const contradicted = claimed
      .map((c) => ({ category: c, evidenceIds: byCat(c).filter((e) => e.direction === "weakens" && !e.mitigates).map((e) => e.id) }))
      .filter((x) => x.evidenceIds.length);
    const unbacked = claimed.filter((c) => !backed.some((b) => b.category === c) && !contradicted.some((b) => b.category === c) && c !== "internal_activity");
    const L = (c: ContributionCategory) => CATEGORY_LABELS[c].toLowerCase();
    const parts: string[] = [];
    if (!text.trim()) parts.push("No answer given.");
    else if (!claimed.length) parts.push("This answer is context, not a contribution claim — it does not move the grade either way.");
    for (const b of backed) parts.push(`The ${L(b.category)} claim is supported by ${b.evidenceIds.join(", ")}.`);
    for (const c of contradicted) parts.push(`On ${L(c.category)}, the record also shows a concern (${c.evidenceIds.join(", ")}), which the answer does not address.`);
    if (unbacked.length) parts.push(`Nothing indexed yet for ${unbacked.map(L).join(", ")} — the claim stands on the employee's word alone and did not raise the grade.`);
    if (a && claimed.some((c) => a.missingAreas.includes(c))) parts.push("This is one of the areas the evidence picture is missing for this role.");
    return { questionId, claimed, backed, unbacked, contradicted, note: parts.join(" ") };
  });
}

export interface DisagreementInput {
  proposedGrade: Grade;
  reason: string;
  factor?: ContributionCategory;
}

export interface DisagreementVerdict {
  accepted: boolean;
  reason: string;
  citedEvidenceIds: string[];
}

/**
 * The gate an employer must pass to move the grade. Explainable rules, applied
 * in order. The employer is told exactly which rule failed.
 *   1. The proposed grade must be within one step of the evidence grade.
 *   2. The reason must cite at least one evidence ID that exists for this employee.
 *   3. The reason must be more than a sentence fragment (>= 40 characters).
 */
export function evaluateDisagreement(employee: Employee, aiGrade: Grade, input: DisagreementInput): DisagreementVerdict {
  const ids = evidenceFor(employee.id).map((e) => e.id);
  const cited = Array.from(new Set((input.reason.match(/EV-[A-Z0-9]+-?\d*/gi) ?? []).map((s) => s.toUpperCase()))).filter((id) => ids.includes(id));
  const dist = gradeDistance(aiGrade, input.proposedGrade);

  if (dist === 0) return { accepted: false, reason: `The proposed grade is the same as the evidence grade (${aiGrade}). Propose a different grade or agree.`, citedEvidenceIds: cited };
  if (dist > 1)
    return {
      accepted: false,
      reason: `${input.proposedGrade} is ${dist} steps from the evidence grade ${aiGrade}. The review moves at most one step per round unless new evidence is indexed. Try ${GRADES[gradeIndex(aiGrade) + (gradeIndex(input.proposedGrade) > gradeIndex(aiGrade) ? 1 : -1)]}.`,
      citedEvidenceIds: cited,
    };
  if (cited.length === 0)
    return {
      accepted: false,
      reason: `No evidence cited. Reference a specific record for ${employee.name} by its ID (for example ${ids.slice(0, 2).join(" or ") || "an indexed item"}) so the change is traceable.`,
      citedEvidenceIds: cited,
    };
  if (input.reason.trim().length < 40)
    return { accepted: false, reason: "The reason is too short to stand as a review note. Say what the cited evidence shows and why it changes the grade.", citedEvidenceIds: cited };

  return {
    accepted: true,
    reason: `Accepted. Grade revised to ${input.proposedGrade} on the basis of ${cited.join(", ")}. The review note is recorded with the assessment.`,
    citedEvidenceIds: cited,
  };
}

export { gradeFor };
