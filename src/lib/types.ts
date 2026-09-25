export type RoleKey = "marketing" | "engineering" | "sales" | "product" | "operations";

export type SourceSystem =
  | "slack"
  | "projects"
  | "reports"
  | "crm"
  | "documents"
  | "reviews"
  | "hr"
  | "github";

export type ContributionCategory =
  | "revenue_impact"
  | "campaign_ownership"
  | "cross_functional"
  | "client_impact"
  | "mentoring"
  | "delivery_reliability"
  | "technical_output"
  | "internal_activity";

export type Direction = "strengthens" | "weakens" | "neutral" | "irrelevant";
export type Confidence = "high" | "medium" | "low";
export type DiscoveryStage = "initial" | "enrichment" | "challenge";
export type Level = "Low" | "Moderate" | "High";

export interface Employee {
  id: string;
  name: string;
  title: string;
  department: string;
  role: RoleKey;
  manager: string;
  tenureYears: number;
  location: string;
}

export interface Source {
  id: string;
  system: SourceSystem;
  name: string;
  ref: string;
  timestamp: string;
}

export interface Evidence {
  id: string;
  employeeId: string;
  sourceId: string;
  category: ContributionCategory;
  summary: string;
  detail: string;
  excerpt: string;
  metrics?: { label: string; value: string }[];
  direction: Direction;
  /** -2..+2 raw impact before role weighting */
  impact: number;
  confidence: Confidence;
  discoveredIn: DiscoveryStage;
  recordedAt: string;
  /** If set, this evidence provides context that mitigates another evidence item. */
  mitigates?: string;
}

export interface RoleProfile {
  role: RoleKey;
  label: string;
  weights: Record<ContributionCategory, number>;
  expected: ContributionCategory[];
}

export interface Factor {
  category: ContributionCategory;
  label: string;
  weight: number;
  score: number;
  evidenceIds: string[];
  status: "supported" | "concern" | "missing" | "not_applicable";
  summary: string;
}

export interface Assessment {
  level: Level;
  score: number;
  factors: Factor[];
  confidence: Confidence;
  coverage: number;
  missingAreas: ContributionCategory[];
  evidenceIds: string[];
  ignoredEvidenceIds: string[];
  computedAt: string;
}

export type EventType =
  | "loaded"
  | "evidence_added"
  | "assessment_changed"
  | "assessment_unchanged"
  | "challenge_opened"
  | "assessment_frozen"
  | "challenge_resolved"
  | "reclassified";

export interface AssessmentEvent {
  id: string;
  at: string;
  type: EventType;
  title: string;
  description: string;
  from?: Level;
  to?: Level;
  evidenceIds: string[];
}

export interface Challenge {
  id: string;
  category: ContributionCategory;
  statement: string;
  evidenceIds: string[];
  status: "submitted" | "under_review" | "resolved";
  outcome?: "updated" | "unchanged";
  resolution?: string;
}
