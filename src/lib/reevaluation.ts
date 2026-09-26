import { assess } from "@/lib/assessment/engine";
import { roleProfiles } from "@/lib/assessment/roles";
import { evidenceFor } from "@/data/evidence";
import type { ContributionCategory, Employee, Evidence, Grade } from "@/lib/types";
import { fullAssessment } from "./appraisal-review";

/**
 * Employee-initiated re-evaluation. Two explicit rules, applied per category:
 *  1. The area must be expected for the role and not yet fully evidenced: nothing on
 *     record, thin evidence, or a concern the new record can put in context.
 *     (Areas already evidenced, or not applicable to the job, cannot be "re-found".)
 *  2. The explanation must point at where the record lives — a connected system —
 *     and carry an identifier or date so the record can be located.
 * When both hold, the record is admitted and the engine re-runs. The grade moves
 * only if the engine says so. No text is ever graded on its own.
 */
export const SYSTEM_WORDS: Record<string, string[]> = {
  Slack: ["slack", "#"],
  "Project tracker": ["jira", "epic-", "ticket", "project tracker", "milestone", "sprint", "board"],
  GitHub: ["github", "pull request", "pr #", "merged", "repo"],
  CRM: ["crm", "salesforce", "hubspot", "deal", "account record", "opportunity"],
  "HR records": ["hr record", "workday", "people & culture", "onboarding record", "training log", "people and culture"],
  Documents: ["confluence", "notion", "google doc", "drive", "shared doc", "wiki", "brief", "deck"],
};
const IDENTIFIER = /(\b\d{1,2}\s(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\b)|(\b(19|20)\d{2}-\d{2}-\d{2}\b)|([A-Z]{2,6}-\d{2,5})|(#\d{2,6})|(\bq[1-4]\b)|(\bh[12]\b)/i;

export interface ReevaluationResult {
  ok: boolean;
  from: Grade;
  to: Grade;
  admitted: Evidence[];
  /** Per-category verdicts, in the order checked. */
  checks: { category: ContributionCategory; ok: boolean; reason: string; system?: string }[];
  reason: string;
}

export function systemsMentioned(text: string): string[] {
  const t = text.toLowerCase();
  return Object.entries(SYSTEM_WORDS).filter(([, ws]) => ws.some((w) => t.includes(w))).map(([s]) => s);
}

export function reevaluate(employee: Employee, categories: ContributionCategory[], statement: string, at = new Date().toISOString()): ReevaluationResult | undefined {
  const base = fullAssessment(employee);
  if (!base) return undefined;
  const profile = roleProfiles[employee.role];
  const systems = systemsMentioned(statement);
  const hasId = IDENTIFIER.test(statement);
  const admitted: Evidence[] = [];
  const checks: ReevaluationResult["checks"] = [];

  for (const category of categories) {
    const f = base.factors.find((x) => x.category === category);
    if (!f || !profile.expected.includes(category)) {
      checks.push({ category, ok: false, reason: "Not an expected area for this role — it does not move the grade." });
      continue;
    }
    if (f.score >= 2) {
      checks.push({ category, ok: false, reason: "Already fully evidenced on record — nothing new to find." });
      continue;
    }
    if (!systems.length || !hasId) {
      checks.push({ category, ok: false, reason: !systems.length ? "No connected system named. Records not found." : "No date or identifier given. Records not found." });
      continue;
    }
    const system = systems[0];
    admitted.push({
      id: `EV-R${String(admitted.length + 1).padStart(2, "0")}`,
      employeeId: employee.id,
      sourceId: "reevaluation",
      category,
      summary: f.status === "concern" ? `Context for the concern on record, located in ${system}` : `Record located in ${system} from the employee's re-evaluation note`,
      detail: statement.slice(0, 240),
      excerpt: statement.slice(0, 160),
      direction: "strengthens",
      impact: 2,
      confidence: "medium",
      discoveredIn: "challenge",
      recordedAt: at,
    });
    checks.push({ category, ok: true, reason: f.status === "concern" ? `Record located in ${system}. Admitted as context; the concern stays on record.` : `Record located in ${system}. Admitted as evidence.`, system });
  }

  if (!admitted.length) {
    return { ok: false, from: base.grade, to: base.grade, admitted, checks, reason: "Records not found. Nothing was admitted and the grade is unchanged." };
  }
  const ev = evidenceFor(employee.id).filter((e) => e.discoveredIn !== "challenge");
  const next = assess(employee, [...ev, ...admitted], {}, at);
  const changed = next.grade !== base.grade;
  return {
    ok: true,
    from: base.grade,
    to: next.grade,
    admitted,
    checks,
    reason: changed
      ? `${admitted.length} record${admitted.length > 1 ? "s" : ""} admitted. The engine re-ran: ${base.grade} to ${next.grade}.`
      : `${admitted.length} record${admitted.length > 1 ? "s" : ""} admitted and on file, but not enough to move the grade from ${base.grade}.`,
  };
}

/** Four sample notes: for each role family, one that meets both rules and one that does not. */
export const REEVAL_SAMPLES = {
  technical: {
    correct: {
      label: "Backed by records",
      text: "The cross-team work is in the project tracker: I led EPIC-412 (payments migration) with the Data team, closed 14 Mar, and the Slack thread in #eng-platform on 3 Apr shows the handover. The PR #2231 in GitHub was merged the same week.",
    },
    incorrect: {
      label: "Not backed",
      text: "I did a lot of work with other teams this half that nobody tracked. I was always helping and people can vouch for me. I think this should count for more than it did.",
    },
  },
  nonTechnical: {
    correct: {
      label: "Backed by records",
      text: "Client work is in the CRM: I handled the Meridian account escalation, opportunity MER-2026, saved the renewal on 22 Apr. The Slack thread in #client-success from 24 Apr has the client's thank-you and the account record shows the renewal.",
    },
    incorrect: {
      label: "Not backed",
      text: "I spent a lot of time supporting clients and being helpful across the company. Everyone knows I go the extra mile. The AI just did not see how much I do.",
    },
  },
} as const;

/** Employer contact for the second-failure message. */
export const MANAGER_EMAIL = (manager: string) => `${manager.toLowerCase().replace(/\s+/g, ".")}@halcyon-digital.example`;
