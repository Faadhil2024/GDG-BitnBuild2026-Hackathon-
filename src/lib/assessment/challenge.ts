import type { Challenge, ContributionCategory, Evidence } from "@/lib/types";
import { CATEGORY_LABELS } from "./roles";
import type { ImpactAdjustments } from "./engine";

export interface ReviewResult {
  outcome: "updated" | "unchanged";
  resolution: string;
  adjustments: ImpactAdjustments;
  /** Evidence that becomes part of the assessment record as a result. */
  admittedEvidenceIds: string[];
  rejectedEvidenceIds: string[];
}

/**
 * Deterministic review of a challenge. A challenge only changes the assessment
 * when the submitted evidence is (a) about the challenged factor and (b) actually
 * bears on it — either as new impact or as context mitigating an existing item.
 * Irrelevant or off-topic evidence is rejected with a stated reason.
 */
export function reviewChallenge(
  challenge: Pick<Challenge, "category" | "evidenceIds">,
  allEvidence: Evidence[],
  currentAdjustments: ImpactAdjustments,
): ReviewResult {
  const submitted = challenge.evidenceIds
    .map((id) => allEvidence.find((e) => e.id === id))
    .filter((e): e is Evidence => Boolean(e));

  const relevant = submitted.filter(
    (e) => e.category === challenge.category && (e.impact !== 0 || e.mitigates),
  );
  const rejected = submitted.filter((e) => !relevant.includes(e));
  const label = CATEGORY_LABELS[challenge.category];

  if (relevant.length === 0) {
    return {
      outcome: "unchanged",
      resolution:
        submitted.length === 0
          ? `No evidence was attached. The ${label} factor stands as assessed.`
          : `The attached evidence does not bear on ${label} (${rejected
              .map((e) => `${e.id}: ${CATEGORY_LABELS[e.category]}`)
              .join("; ")}). The factor stands as assessed.`,
      adjustments: {},
      admittedEvidenceIds: [],
      rejectedEvidenceIds: rejected.map((e) => e.id),
    };
  }

  const adjustments: ImpactAdjustments = {};
  const notes: string[] = [];
  for (const e of relevant) {
    if (e.mitigates) {
      const target = allEvidence.find((t) => t.id === e.mitigates);
      if (target) {
        const current = e.mitigates in currentAdjustments ? currentAdjustments[e.mitigates] : target.impact;
        const next = Math.trunc(current / 2); // halve severity toward zero — context reduces, does not erase
        adjustments[target.id] = next;
        notes.push(
          `${e.id} provides context for ${target.id}: impact revised from ${current} to ${next}. The slip is still on record; its cause is now recorded as external and approved.`,
        );
      }
    } else {
      notes.push(`${e.id} admitted as ${label} evidence (impact ${e.impact > 0 ? "+" : ""}${e.impact}).`);
    }
  }
  if (rejected.length) notes.push(`Not admitted: ${rejected.map((e) => e.id).join(", ")} — unrelated to ${label}.`);

  return {
    outcome: "updated",
    resolution: notes.join(" "),
    adjustments,
    admittedEvidenceIds: relevant.map((e) => e.id),
    rejectedEvidenceIds: rejected.map((e) => e.id),
  };
}

export const CHALLENGEABLE: ContributionCategory[] = [
  "revenue_impact",
  "campaign_ownership",
  "cross_functional",
  "client_impact",
  "mentoring",
  "delivery_reliability",
];
