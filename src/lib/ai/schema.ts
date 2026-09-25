import { z } from "zod";
import type { AssessmentDiff } from "@/lib/assessment/engine";
import type { Assessment, Employee, Evidence, Level } from "@/lib/types";

/** What the model is allowed to return. Nothing else is rendered. */
export const ExplanationSchema = z.object({
  headline: z.string().min(1).max(160),
  summary: z.string().min(1).max(900),
  changes: z
    .array(
      z.object({
        evidenceId: z.string(),
        statement: z.string().min(1).max(240),
      }),
    )
    .max(8),
  unchanged: z.array(z.string().max(240)).max(4),
  caveats: z.array(z.string().max(240)).max(4),
});

export type Explanation = z.infer<typeof ExplanationSchema>;

export interface ExplanationResult extends Explanation {
  provenance: "live" | "fallback";
  model: string;
  /** Present when provenance is fallback: why the live model was not used. */
  fallbackReason?: string;
}

export interface ExplainInput {
  employee: Pick<Employee, "name" | "title" | "department" | "role">;
  before: Pick<Assessment, "level" | "score" | "confidence" | "missingAreas">;
  after: Pick<Assessment, "level" | "score" | "confidence" | "missingAreas">;
  diff: AssessmentDiff;
  /** Evidence that is newly part of the assessment (or newly re-weighted). */
  evidence: Pick<Evidence, "id" | "summary" | "category" | "direction" | "impact" | "confidence" | "mitigates">[];
  context: "enrichment" | "challenge";
  challengeResolution?: string;
}

export const ExplainInputSchema = z.object({
  employee: z.object({ name: z.string(), title: z.string(), department: z.string(), role: z.string() }),
  before: z.object({ level: z.string(), score: z.number(), confidence: z.string(), missingAreas: z.array(z.string()) }),
  after: z.object({ level: z.string(), score: z.number(), confidence: z.string(), missingAreas: z.array(z.string()) }),
  diff: z.object({
    from: z.string(),
    to: z.string(),
    changed: z.boolean(),
    scoreDelta: z.number(),
    improved: z.array(z.string()),
    worsened: z.array(z.string()),
    unchangedConcerns: z.array(z.string()),
    newlyCovered: z.array(z.string()),
  }),
  evidence: z.array(
    z.object({
      id: z.string(),
      summary: z.string(),
      category: z.string(),
      direction: z.string(),
      impact: z.number(),
      confidence: z.string(),
      mitigates: z.string().optional(),
    }),
  ),
  context: z.enum(["enrichment", "challenge"]),
  challengeResolution: z.string().optional(),
});

export type LevelLike = Level;
