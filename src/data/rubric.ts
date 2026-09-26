import type { Grade } from "@/lib/types";

/**
 * The six protocols every assessment is checked against. Shown to employees
 * as the rubric — what is looked at — never as their score against it.
 */
export const PROTOCOLS = [
  { id: "delivery", title: "Delivery against commitments", detail: "Milestones, deadlines and SLAs met as agreed, with slips explained on record." },
  { id: "outcomes", title: "Measurable business outcomes", detail: "Revenue, cost, client or service results that can be traced to the person's work." },
  { id: "role_output", title: "Role-specific output", detail: "The core work of the job: shipped code, campaigns, closes, analyses, designs, contracts." },
  { id: "cross_functional", title: "Cross-functional contribution", detail: "Work done with or for other departments, visible in shared project records." },
  { id: "people", title: "Supporting others", detail: "Mentoring, onboarding, coaching or training recorded by People & Culture." },
  { id: "concerns", title: "No unresolved concerns", detail: "Incidents, audit findings or misses on record are addressed, not outstanding." },
] as const;

/** Grade bands read as protocols met: A+ meets all six, D meets none. */
export const PROTOCOLS_MET: Record<Grade, number> = { "A+": 6, A: 5, "B+": 4, B: 3, "C+": 2, C: 1, D: 0 };

export const protocolLabel = (g: Grade) => `${PROTOCOLS_MET[g]} of ${PROTOCOLS.length} protocols`;
