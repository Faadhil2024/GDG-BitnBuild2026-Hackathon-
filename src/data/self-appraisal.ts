import type { Grade, RoleKey } from "@/lib/types";

export interface Question {
  id: string;
  label: string;
  hint?: string;
  rows?: number;
}

/** Eight written questions; the ninth (self-grade) is a dropdown rendered by the form. */
export const QUESTIONS: Question[] = [
  { id: "achievements", label: "What were your most significant contributions this cycle?", hint: "Outcomes, not activities. Name the work and what it changed.", rows: 4 },
  { id: "goals", label: "Which of your agreed goals did you meet, and which did you not?", rows: 3 },
  { id: "collaboration", label: "Describe how you worked with other teams or departments.", rows: 3 },
  { id: "challenges", label: "What was the biggest obstacle you faced, and how did you handle it?", rows: 3 },
  { id: "growth", label: "What skills did you develop, and how did you apply them?", rows: 3 },
  { id: "support", label: "How did you support colleagues, customers or the wider business?", rows: 3 },
  { id: "improve", label: "What would you do differently next cycle?", rows: 2 },
  { id: "needs", label: "What support do you need from your manager or the company?", rows: 2 },
];

export const TECHNICAL_ROLES: RoleKey[] = ["engineering", "data", "design"];

export interface Seed {
  label: string;
  answers: Record<string, string>;
  grade: Grade;
}

export const TECHNICAL_SEEDS: Seed[] = [
  {
    label: "Platform reliability focus",
    grade: "B+",
    answers: {
      achievements: "Led the migration of our job scheduler to the new queue service, cutting p95 latency from 1.8s to 420ms and removing a recurring weekend on-call page. Shipped the audit-logging feature requested by Legal ahead of the PDPA deadline.",
      goals: "Met: scheduler migration, audit logging, 80% test coverage on the payments module. Not met: the observability dashboard consolidation slipped to next cycle because the vendor contract was delayed.",
      collaboration: "Paired weekly with Product on discovery spikes and sat in two customer calls to understand the reporting pain points. Worked with Legal to translate PDPA requirements into concrete logging rules.",
      challenges: "The queue migration surfaced a data-ordering bug that only appeared under production load. I wrote a replay harness against anonymised traffic, found the race condition, and documented the fix as a runbook.",
      growth: "Deepened my understanding of distributed tracing and applied it to shorten incident triage. Completed the internal course on secure code review.",
      support: "Mentored one graduate engineer through their first production release and ran the fortnightly code-review clinic.",
      improve: "Flag vendor dependencies earlier in planning so external delays do not silently eat the quarter.",
      needs: "Protected time for the observability work and a clearer escalation path for vendor blockers.",
    },
  },
  {
    label: "Product delivery focus",
    grade: "A",
    answers: {
      achievements: "Delivered the Atlas customer portal end to end: 14 of 15 launch tasks on time, zero Sev-1 incidents in the first 60 days, and the two features most requested by Sales. Reduced build times by 40% through pipeline caching.",
      goals: "All three committed goals were met. I also picked up the accessibility remediation backlog, which was not planned but unblocked the enterprise renewal.",
      collaboration: "Co-owned the launch plan with Product and Marketing, gave Sales a weekly demo, and set up a shared triage channel with Support so bugs reached us within the hour.",
      challenges: "A late design change to the permissions model risked the launch date. I proposed a phased rollout behind a feature flag so we could ship on time and finish the model afterwards.",
      growth: "Learned to run structured launch retros and turned the format into a template the team now uses.",
      support: "Onboarded two new hires as their buddy and wrote the onboarding guide for the portal codebase.",
      improve: "Push back sooner on scope additions that arrive after design freeze.",
      needs: "A second engineer on the portal so I am not the single point of failure.",
    },
  },
  {
    label: "Data and analytics focus",
    grade: "B",
    answers: {
      achievements: "Built the revenue attribution pipeline that Marketing now uses for campaign reporting, and the churn-risk dashboard adopted by Customer Success. Cut the nightly reporting run from 3 hours to 35 minutes.",
      goals: "Met: attribution pipeline, dashboard, run-time target. Partially met: data-quality alerts are live for two of four critical tables.",
      collaboration: "Worked with Marketing to agree attribution rules, with Finance on the pricing analysis, and with Engineering on the event schema changes.",
      challenges: "Conflicting definitions of 'active customer' across teams. I ran a working group to agree one definition and documented it in the metrics catalogue.",
      growth: "Adopted dbt for transformation and introduced testing on models, which caught two silent breakages.",
      support: "Ran three lunch-and-learn sessions on reading dashboards for non-technical teams.",
      improve: "Ship data-quality monitoring before, not after, a pipeline goes live.",
      needs: "Clear ownership of upstream event definitions so schema changes are communicated.",
    },
  },
];

export const NON_TECHNICAL_SEEDS: Seed[] = [
  {
    label: "Revenue and campaigns focus",
    grade: "B+",
    answers: {
      achievements: "Led Campaigns Atlas and Meridian, which together attributed RM550,000 of qualified pipeline — Meridian was the best-performing campaign of the half. Authored four campaign briefs and ran the Atlas launch webinar for 212 live attendees.",
      goals: "Met: pipeline and lead targets, launch support for Atlas. Not met: Campaign Northwind launched three weeks late after the agency missed its creative handoff; the delay was approved by my manager but it still slipped.",
      collaboration: "Marketing owner on the Atlas launch alongside Product and Sales. Produced the sales enablement deck and supported 12 enterprise accounts on renewals.",
      challenges: "The agency delay on Northwind. I escalated early, secured approval for a new date, and re-sequenced the content calendar so no other campaign was affected.",
      growth: "Became proficient in attribution reporting so I can show revenue impact directly rather than activity counts.",
      support: "Onboarding mentor for three new marketing hires; all completed their 90-day plans.",
      improve: "Build slack into agency timelines and report outcomes upward more regularly — my last review noted my work was under-reported.",
      needs: "Earlier visibility of the product roadmap so campaigns can be planned around launches.",
    },
  },
  {
    label: "Client and service focus",
    grade: "A",
    answers: {
      achievements: "Closed RM1.9M against a RM1.5M quota (128%) and renewed 22 of 23 enterprise accounts. Acted as Sales lead on the Atlas launch and brought forecast accuracy within 5% every month.",
      goals: "All quota and renewal goals met. The one churned account left on budget grounds after a leadership change on their side.",
      collaboration: "Worked with Marketing on campaign follow-up and with Product to bring customer requests into the roadmap. Joined Support escalations for my two largest accounts.",
      challenges: "A key account threatened to leave over a missed integration date. I brought Engineering into the conversation directly and agreed a phased delivery that kept the renewal.",
      growth: "Strengthened negotiation on multi-year contracts and completed the enterprise sales methodology course.",
      support: "Ramp coach for two new account executives; both met their first-quarter targets.",
      improve: "Start renewal conversations a quarter earlier for accounts with leadership changes.",
      needs: "A dedicated solutions consultant for enterprise deals.",
    },
  },
  {
    label: "Operations and process focus",
    grade: "B",
    answers: {
      achievements: "Raised on-time fulfilment from 91.2% to 97.8% and reduced cost per order by 11% through the Fulfilment Re-platform, delivering all four milestones on schedule. Delivery complaints fell 34% half-on-half.",
      goals: "Met: on-time and cost targets, re-platform delivery. Not met: the returns-process redesign was deferred to make room for the re-platform.",
      collaboration: "Operations owner on the re-platform with Engineering and Finance. Weekly working sessions with Customer Support to trace complaint causes to process steps.",
      challenges: "Resistance from the warehouse team to the new picking workflow. I ran shadow shifts, adjusted the workflow based on what I saw, and the team now advocates for it.",
      growth: "Learned process-mining tools to find bottlenecks from data rather than anecdote.",
      support: "Trained two coordinators to run the daily operations review in my absence.",
      improve: "Sequence large projects so smaller improvements are not starved of attention.",
      needs: "Budget approval earlier in the cycle for tooling changes.",
    },
  },
];

/** Random pick from the pool matching the role family (technical vs non-technical). */
export function pickSeed(role: RoleKey, avoid?: string): Seed {
  const pool = TECHNICAL_ROLES.includes(role) ? TECHNICAL_SEEDS : NON_TECHNICAL_SEEDS;
  const candidates = pool.filter((s) => s.label !== avoid);
  return candidates[Math.floor(Math.random() * candidates.length)];
}
