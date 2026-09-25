import type { Evidence } from "@/lib/types";

const S = "emp-sarah-lim";

/**
 * All facts the system is allowed to know about Sarah.
 * The AI layer may only reference evidence IDs that exist in this list.
 */
export const evidence: Evidence[] = [
  // ─── INITIAL: what a naive, title-driven assessment sees ───────────────
  {
    id: "EV-001",
    employeeId: S,
    sourceId: "src-hr-001",
    category: "internal_activity",
    summary: "Job title on record: Marketing Executive (Grade M2)",
    detail:
      "HR master record lists Sarah as Marketing Executive, Grade M2, reporting to Jonathan Lee. No responsibilities beyond the standard grade description are recorded.",
    excerpt: "Title: Marketing Executive · Grade: M2 · Reports to: J. Lee · Start: 2022-11-14",
    direction: "neutral",
    impact: 0,
    confidence: "high",
    discoveredIn: "initial",
    recordedAt: "2026-01-05T09:00:00+08:00",
  },
  {
    id: "EV-002",
    employeeId: S,
    sourceId: "src-mkt-platform",
    category: "campaign_ownership",
    summary: "3 campaigns logged under Sarah's name in H1 activity export",
    detail:
      "The campaign activity log counts 3 campaigns with Sarah as an assigned contributor. The export records activity only; it contains no outcome, revenue or ownership data.",
    excerpt: "S. Lim — campaigns touched: 3 · emails sent: 41 · assets uploaded: 67",
    metrics: [{ label: "Campaigns (activity count)", value: "3" }],
    direction: "strengthens",
    impact: 1,
    confidence: "medium",
    discoveredIn: "initial",
    recordedAt: "2026-06-28T17:30:00+08:00",
  },
  {
    id: "EV-003",
    employeeId: S,
    sourceId: "src-github-mktsite",
    category: "technical_output",
    summary: "2 commits to marketing-site repository in 6 months",
    detail:
      "GitHub contributor stats show 2 commits (copy edits to landing-page text). Engineering output is not a meaningful measure of contribution for a marketing role.",
    excerpt: "sarah.lim — 2 commits · +14 −9 lines · files: content/landing.md",
    metrics: [{ label: "Commits", value: "2" }],
    direction: "irrelevant",
    impact: 0,
    confidence: "high",
    discoveredIn: "initial",
    recordedAt: "2026-06-30T00:00:00+08:00",
  },
  {
    id: "EV-004",
    employeeId: S,
    sourceId: "src-slack-marketing",
    category: "internal_activity",
    summary: "Moderate Slack message volume in #marketing (412 messages)",
    detail:
      "Channel activity summary shows 412 messages in H1, around the team median. Message volume says nothing about the substance of the work.",
    excerpt: "#marketing · S. Lim · 412 messages · team median 398",
    metrics: [{ label: "Messages", value: "412" }],
    direction: "neutral",
    impact: 0,
    confidence: "high",
    discoveredIn: "initial",
    recordedAt: "2026-06-30T00:00:00+08:00",
  },
  {
    id: "EV-005",
    employeeId: S,
    sourceId: "src-proj-northwind",
    category: "delivery_reliability",
    summary: "Campaign Northwind launch slipped 3 weeks past planned date",
    detail:
      "Project tracker shows the Northwind launch milestone moved from 21 Feb to 14 Mar 2026. Sarah is listed as milestone owner. The tracker records the slip but not its cause.",
    excerpt: "Milestone: Launch · Planned 2026-02-21 → Actual 2026-03-14 · Owner: S. Lim · Status: Late",
    metrics: [{ label: "Delay", value: "21 days" }],
    direction: "weakens",
    impact: -2,
    confidence: "high",
    discoveredIn: "initial",
    recordedAt: "2026-03-14T11:20:00+08:00",
  },
  {
    id: "EV-006",
    employeeId: S,
    sourceId: "src-review-h2-2025",
    category: "internal_activity",
    summary: "H2 2025 review: 'Meets expectations'",
    detail:
      "Previous cycle review rates Sarah as Meets Expectations, with a manager note that she should 'make outcomes more visible to leadership'.",
    excerpt: "Overall: Meets Expectations. Note: outcomes of campaign work are under-reported upward.",
    direction: "neutral",
    impact: 0,
    confidence: "medium",
    discoveredIn: "initial",
    recordedAt: "2025-12-18T15:00:00+08:00",
  },

  // ─── ENRICHMENT: what the system finds when it actually looks ──────────
  {
    id: "EV-101",
    employeeId: S,
    sourceId: "src-report-04",
    category: "revenue_impact",
    summary: "Campaign Atlas attributed RM240,000 pipeline — Sarah listed as campaign lead",
    detail:
      "Marketing Report #04 attributes RM240,000 of qualified pipeline to Campaign Atlas and names Sarah Lim as campaign lead in the attribution table.",
    excerpt: "Campaign Atlas · Lead: Sarah Lim · Attributed pipeline: RM 240,000 · MQLs: 186",
    metrics: [
      { label: "Attributed pipeline", value: "RM 240,000" },
      { label: "Role", value: "Campaign lead" },
    ],
    direction: "strengthens",
    impact: 2,
    confidence: "high",
    discoveredIn: "enrichment",
    recordedAt: "2026-04-02T10:15:00+08:00",
  },
  {
    id: "EV-102",
    employeeId: S,
    sourceId: "src-report-07",
    category: "revenue_impact",
    summary: "Campaign Meridian attributed RM310,000 pipeline — Sarah listed as campaign lead",
    detail:
      "Marketing Report #07 attributes RM310,000 of qualified pipeline to Campaign Meridian, the highest-performing campaign of the half. Sarah Lim is named as lead.",
    excerpt: "Campaign Meridian · Lead: Sarah Lim · Attributed pipeline: RM 310,000 · Best-performing H1 campaign",
    metrics: [
      { label: "Attributed pipeline", value: "RM 310,000" },
      { label: "Role", value: "Campaign lead" },
    ],
    direction: "strengthens",
    impact: 2,
    confidence: "high",
    discoveredIn: "enrichment",
    recordedAt: "2026-06-05T09:40:00+08:00",
  },
  {
    id: "EV-103",
    employeeId: S,
    sourceId: "src-crm-accounts",
    category: "client_impact",
    summary: "12 enterprise accounts tagged 'marketing support: S. Lim'; RM250,000 in renewals influenced",
    detail:
      "CRM renewal records for Q1–Q2 tag Sarah as marketing support on 12 enterprise accounts totalling RM250,000 in renewals. Attribution is influence, not ownership — sales owns the accounts.",
    excerpt: "Tag: marketing-support = S. Lim · Accounts: 12 · Renewal value: RM 250,000 · Owner: Sales (P. Nair)",
    metrics: [
      { label: "Accounts supported", value: "12" },
      { label: "Renewals influenced", value: "RM 250,000" },
    ],
    direction: "strengthens",
    impact: 2,
    confidence: "medium",
    discoveredIn: "enrichment",
    recordedAt: "2026-06-20T14:05:00+08:00",
  },
  {
    id: "EV-104",
    employeeId: S,
    sourceId: "src-proj-atlas",
    category: "cross_functional",
    summary: "Marketing owner on Project Atlas launch alongside Product and Sales leads",
    detail:
      "The Project Atlas launch workspace lists Sarah as marketing owner with Marcus Tan (Product) and Priya Nair (Sales). She completed 14 of 15 assigned launch tasks on time.",
    excerpt: "Members: M. Tan (Product, owner) · P. Nair (Sales) · S. Lim (Marketing, owner) · Tasks: 14/15 done",
    metrics: [
      { label: "Departments", value: "Marketing, Product, Sales" },
      { label: "Launch tasks completed", value: "14 / 15" },
    ],
    direction: "strengthens",
    impact: 2,
    confidence: "high",
    discoveredIn: "enrichment",
    recordedAt: "2026-03-28T18:00:00+08:00",
  },
  {
    id: "EV-105",
    employeeId: S,
    sourceId: "src-slack-product-launch",
    category: "cross_functional",
    summary: "Product Manager credits Sarah for Atlas launch messaging and customer webinar",
    detail:
      "Marcus Tan (Product Manager) posted in #product-launch thanking Sarah for owning launch messaging and running the customer webinar (212 attendees).",
    excerpt:
      "@marcus.tan: Huge thanks to @sarah.lim — launch messaging, the webinar (212 live), and the sales enablement deck were all hers. Atlas wouldn't have landed without marketing.",
    direction: "strengthens",
    impact: 1,
    confidence: "medium",
    discoveredIn: "enrichment",
    recordedAt: "2026-03-28T17:40:00+08:00",
  },
  {
    id: "EV-106",
    employeeId: S,
    sourceId: "src-ld-log",
    category: "mentoring",
    summary: "Onboarding buddy / mentor for 3 new marketing hires",
    detail:
      "The L&D buddy roster assigns Sarah as onboarding mentor for three hires (Jan, Mar, May 2026). All three completed their 90-day plans.",
    excerpt: "Buddy: S. Lim → A. Chong (Jan), R. Krishnan (Mar), N. Hafiz (May) · 90-day completion: 3/3",
    metrics: [{ label: "Mentees", value: "3" }],
    direction: "strengthens",
    impact: 1,
    confidence: "high",
    discoveredIn: "enrichment",
    recordedAt: "2026-05-12T09:00:00+08:00",
  },
  {
    id: "EV-107",
    employeeId: S,
    sourceId: "src-townhall",
    category: "internal_activity",
    summary: "Attended Q2 company town hall",
    detail: "Attendance record only. Attending an all-hands meeting is not evidence of contribution in either direction.",
    excerpt: "Q2 Town Hall · 2026-04-15 · Attendees: 214 · S. Lim: present",
    direction: "neutral",
    impact: 0,
    confidence: "high",
    discoveredIn: "enrichment",
    recordedAt: "2026-04-15T16:00:00+08:00",
  },
  {
    id: "EV-108",
    employeeId: S,
    sourceId: "src-docs-briefs",
    category: "campaign_ownership",
    summary: "Authored 4 campaign briefs: Atlas, Meridian, Northwind, Harbor",
    detail:
      "The shared drive holds four H1 campaign briefs with Sarah as author and approver-of-record for creative. This is ownership evidence — the activity export only counted 3 campaigns 'touched'.",
    excerpt: "Briefs/2026 · Atlas-brief.docx · Meridian-brief.docx · Northwind-brief.docx · Harbor-brief.docx · Author: Sarah Lim",
    metrics: [{ label: "Campaigns owned", value: "4" }],
    direction: "strengthens",
    impact: 2,
    confidence: "high",
    discoveredIn: "enrichment",
    recordedAt: "2026-05-30T12:00:00+08:00",
  },
  {
    id: "EV-109",
    employeeId: S,
    sourceId: "src-jira-analytics",
    category: "technical_output",
    summary: "Requested an analytics tag fix (WEB-1187)",
    detail:
      "Sarah filed a ticket asking Engineering to fix a broken UTM tag. This is routine and is engineering-adjacent activity — it is not weighed for a marketing role.",
    excerpt: "WEB-1187 · Reporter: S. Lim · 'UTM source not captured on /atlas landing page' · Resolved by D. Wong",
    direction: "irrelevant",
    impact: 0,
    confidence: "high",
    discoveredIn: "enrichment",
    recordedAt: "2026-02-11T10:00:00+08:00",
  },

  // ─── CHALLENGE: evidence the employee can submit ───────────────────────
  {
    id: "EV-201",
    employeeId: S,
    sourceId: "src-slack-marketing-ops",
    category: "delivery_reliability",
    summary: "Manager approved Northwind delay due to vendor creative slip",
    detail:
      "In #marketing-ops, Jonathan Lee (Marketing Manager) approved pushing the Northwind launch to 14 March after the external creative agency missed its delivery. The delay was externally caused and approved, though the launch still slipped.",
    excerpt:
      "@jonathan.lee: Confirmed — Northwind launch moves to 14 Mar. Agency missed creative handoff, not on us. Approved on my side, I'll update the tracker owner note.",
    direction: "neutral",
    impact: 0,
    confidence: "high",
    discoveredIn: "challenge",
    recordedAt: "2026-02-26T11:50:00+08:00",
    mitigates: "EV-005",
  },
];

export function getEvidence(id: string) {
  return evidence.find((e) => e.id === id);
}

export function evidenceFor(employeeId: string) {
  return evidence.filter((e) => e.employeeId === employeeId);
}
