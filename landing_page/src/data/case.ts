export type EvidenceItem = {
  id: string;
  title: string;
  source: string;
  detail: string;
  impact: number; // score points added
  category: string;
  verified: boolean;
  icon: string;
};

export type InitialSignal = {
  id: string;
  label: string;
  value: string;
  status: 'negative' | 'neutral' | 'weak';
  note: string;
};

export const employee = {
  name: "Sarah Lim",
  role: "Marketing Executive",
  team: "Growth · APAC",
  tenure: "2y 4m",
  id: "EMP-0417",
  avatarInitials: "SL",
  manager: "Daniel Ong",
  managerRole: "Head of Marketing",
  cycle: "H1 2026 Appraisal",
};

export const initialSignals: InitialSignal[] = [
  {
    id: "sig-activity",
    label: "Activity counts",
    value: "412 events",
    status: "neutral",
    note: "Below team median (518). No context on activity type.",
  },
  {
    id: "sig-github",
    label: "GitHub commits",
    value: "3 commits",
    status: "weak",
    note: "Irrelevant signal for a Marketing role — weighted anyway.",
  },
  {
    id: "sig-slack",
    label: "Slack volume",
    value: "Low",
    status: "negative",
    note: "Message count only. Ignores client calls, workshops, in-person work.",
  },
  {
    id: "sig-deadline",
    label: "Missed deadline",
    value: "1 incident",
    status: "negative",
    note: "Campaign asset delay · Mar 14. No mitigating context captured.",
  },
];

export const missedEvidence: EvidenceItem[] = [
  {
    id: "ev-revenue",
    title: "RM800k influenced campaign revenue",
    source: "Salesforce · Attribution report",
    detail:
      "Owned nurture sequence + partner co-marketing that sourced RM800k in influenced pipeline, closed in Q1. CRM opportunity contact roles confirm ownership.",
    impact: 8,
    category: "Revenue impact",
    verified: true,
    icon: "revenue",
  },
  {
    id: "ev-launch",
    title: "Ownership of cross-functional launches",
    source: "Asana · Launch retros",
    detail:
      "DRI for 2 major launches (PayLite v3, Raya campaign) across Product, Design & Sales. 14 stakeholders coordinated; retro notes cite 'single point of ownership'.",
    impact: 6,
    category: "Ownership",
    verified: true,
    icon: "launch",
  },
  {
    id: "ev-client",
    title: "Client support & relationship work",
    source: "Zendesk · Gong calls",
    detail:
      "47 high-CSAT client touchpoints + 11 recorded calls. Saved 2 at-risk accounts (RM120k ARR) via direct intervention. Invisible to Slack-count metrics.",
    impact: 5,
    category: "Client trust",
    verified: true,
    icon: "client",
  },
  {
    id: "ev-mentor",
    title: "Mentoring & team support",
    source: "Lattice · Peer feedback",
    detail:
      "Onboarded 3 new hires; 9 peer kudos citing mentorship. Ran weekly copy clinic. Zero signal in commit/activity counts.",
    impact: 4,
    category: "Citizenship",
    verified: true,
    icon: "mentor",
  },
  {
    id: "ev-collab",
    title: "Off-channel collaboration",
    source: "Calendar · Miro · Docs",
    detail:
      "38 workshops & working sessions, 22 shared docs with major contributions. Collaboration happened outside measured channels.",
    impact: 3,
    category: "Collaboration",
    verified: false,
    icon: "collab",
  },
];

export const initialScore = 32;

export function bandFor(score: number): { label: string; color: string; bg: string; blurb: string } {
  if (score < 40)
    return {
      label: "Low",
      color: "text-[#b23a2e]",
      bg: "bg-[#b23a2e]/[0.07] border-[#b23a2e]/40",
      blurb: "Does not meet contribution bar",
    };
  if (score < 65)
    return {
      label: "Moderate",
      color: "text-[#9a6b1c]",
      bg: "bg-[#9a6b1c]/[0.07] border-[#9a6b1c]/40",
      blurb: "Meets bar with growth areas",
    };
  if (score < 85)
    return {
      label: "High",
      color: "text-[#3c6b4a]",
      bg: "bg-[#3c6b4a]/[0.07] border-[#3c6b4a]/40",
      blurb: "Strong, sustained contribution",
    };
  return {
    label: "Exceptional",
    color: "text-[#1b3a5c]",
    bg: "bg-[#1b3a5c]/[0.07] border-[#1b3a5c]/40",
    blurb: "Role-model scope & impact",
  };
}

export type AuditEvent = {
  id: string;
  time: string;
  actor: "AI Appraiser" | "Evidence Engine" | "Sarah Lim" | "Daniel Ong" | "System";
  action: string;
  detail: string;
  kind: "ai" | "evidence" | "employee" | "manager" | "system";
};
