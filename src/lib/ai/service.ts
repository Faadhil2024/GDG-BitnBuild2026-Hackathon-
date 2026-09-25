import { CATEGORY_LABELS } from "@/lib/assessment/roles";
import type { ContributionCategory } from "@/lib/types";
import { resolveAdapter, withTimeout, type ModelAdapter } from "./adapter";
import { ExplanationSchema, type ExplainInput, type Explanation, type ExplanationResult } from "./schema";

const label = (c: string) => CATEGORY_LABELS[c as ContributionCategory] ?? c;

const SYSTEM_PROMPT = `You write short, plain-language explanations of how an evidence-based employee contribution assessment changed.

Hard rules:
- You are NOT the assessor. The level and scores are already decided by a deterministic engine. Never argue for a different level.
- Only reference evidence by the IDs provided. Never invent evidence, achievements, numbers, people, or sources.
- Every entry in "changes" must cite one provided evidence ID and describe only what that item shows.
- Mention what did NOT change (remaining concerns) honestly.
- Use the role to judge relevance: e.g. engineering metrics are not a measure of a marketing role.
- Note uncertainty where evidence confidence is medium or low.
- This is an assessment aid, not an employment decision. Never recommend hiring, firing, promotion or pay actions.
- Respond with JSON only, matching: {"headline": string, "summary": string, "changes": [{"evidenceId": string, "statement": string}], "unchanged": string[], "caveats": string[]}`;

function buildUserPrompt(input: ExplainInput) {
  const lines = [
    `Employee: ${input.employee.name}, ${input.employee.title} (${input.employee.department}); role profile: ${input.employee.role}.`,
    `Context: ${input.context === "challenge" ? "employee challenge was reviewed" : "additional evidence was discovered and incorporated"}.`,
    `Before: level ${input.before.level}, index ${input.before.score}/100, confidence ${input.before.confidence}, missing areas: ${input.before.missingAreas.map(label).join(", ") || "none"}.`,
    `After: level ${input.after.level}, index ${input.after.score}/100, confidence ${input.after.confidence}, missing areas: ${input.after.missingAreas.map(label).join(", ") || "none"}.`,
    `Improved factors: ${input.diff.improved.map(label).join(", ") || "none"}. Worsened: ${input.diff.worsened.map(label).join(", ") || "none"}. Remaining concerns: ${input.diff.unchangedConcerns.map(label).join(", ") || "none"}.`,
    input.challengeResolution ? `Review resolution: ${input.challengeResolution}` : "",
    "Evidence you may cite (ID | category | direction | impact | confidence | summary):",
    ...input.evidence.map(
      (e) => `${e.id} | ${label(e.category)} | ${e.direction} | ${e.impact} | ${e.confidence} | ${e.summary}${e.mitigates ? ` (context for ${e.mitigates})` : ""}`,
    ),
  ];
  return lines.filter(Boolean).join("\n");
}

/** Deterministic explanation built purely from the structured diff. Always available. */
export function fallbackExplanation(input: ExplainInput): Explanation {
  const { diff, before, after } = input;
  const cited = input.evidence.filter((e) => e.impact !== 0 || e.mitigates).slice(0, 8);
  const headline = diff.changed
    ? `Assessment changed from ${before.level} to ${after.level}`
    : `Assessment unchanged at ${after.level}${diff.scoreDelta !== 0 ? " — factor detail revised" : ""}`;
  const improved = diff.improved.map(label).join(", ");
  const summary =
    input.context === "challenge"
      ? `The challenge was reviewed against the submitted evidence. ${input.challengeResolution ?? ""} The overall level is ${diff.changed ? `now ${after.level}` : `unchanged at ${after.level}`} (index ${before.score} → ${after.score}).`
      : `${cited.length} evidence item(s) were incorporated, covering ${diff.newlyCovered.map(label).join(", ") || "existing areas"}. ${improved ? `This strengthened ${improved}.` : ""} The contribution index moved from ${before.score} to ${after.score}, and confidence in the assessment is now ${after.confidence} because ${after.missingAreas.length === 0 ? "all expected areas for this role have evidence" : `${after.missingAreas.length} expected area(s) still lack evidence`}.`;
  return {
    headline,
    summary: summary.replace(/\s+/g, " ").trim(),
    changes: cited.map((e) => ({
      evidenceId: e.id,
      statement: e.mitigates ? `Provides context for ${e.mitigates}: ${e.summary}.` : `${label(e.category)}: ${e.summary}.`,
    })),
    unchanged: diff.unchangedConcerns.map((c) => `${label(c)} remains a concern.`),
    caveats: [
      ...(cited.some((e) => e.confidence !== "high") ? ["Some cited evidence is medium-confidence attribution (influence rather than ownership)."] : []),
      "This is an assessment aid. Any employment decision requires human review.",
    ],
  };
}

function validate(raw: string, allowedIds: Set<string>): Explanation {
  const parsed = ExplanationSchema.parse(JSON.parse(raw));
  const bad = parsed.changes.filter((c) => !allowedIds.has(c.evidenceId));
  if (bad.length) throw new Error(`Model cited unknown evidence: ${bad.map((b) => b.evidenceId).join(", ")}`);
  return parsed;
}

export async function explainChange(input: ExplainInput, adapter: ModelAdapter | null = resolveAdapter()): Promise<ExplanationResult> {
  if (!adapter) {
    return { ...fallbackExplanation(input), provenance: "fallback", model: "deterministic", fallbackReason: "No AI provider configured" };
  }
  const allowed = new Set(input.evidence.map((e) => e.id));
  const user = buildUserPrompt(input);
  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await withTimeout((signal) => adapter.complete(SYSTEM_PROMPT, user, signal));
      return { ...validate(raw, allowed), provenance: "live", model: adapter.name };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }
  return { ...fallbackExplanation(input), provenance: "fallback", model: "deterministic", fallbackReason: lastError };
}
