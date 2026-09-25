import type { Source, SourceSystem } from "@/lib/types";

export const SYSTEM_LABELS: Record<SourceSystem, string> = {
  slack: "Slack",
  projects: "Project Tracker",
  reports: "Marketing Reports",
  crm: "CRM",
  documents: "Documents",
  reviews: "Performance Reviews",
  hr: "HR Records",
  github: "GitHub",
};

export const sources: Source[] = [
  { id: "src-hr-001", system: "hr", name: "HR Master Record", ref: "HRIS / Employee 10482", timestamp: "2026-01-05T09:00:00+08:00" },
  { id: "src-mkt-platform", system: "projects", name: "Campaign Activity Log", ref: "MarketingOps / H1-2026 activity export", timestamp: "2026-06-28T17:30:00+08:00" },
  { id: "src-github-mktsite", system: "github", name: "halcyon/marketing-site", ref: "Contributor stats, Jan–Jun 2026", timestamp: "2026-06-30T00:00:00+08:00" },
  { id: "src-slack-marketing", system: "slack", name: "#marketing", ref: "Channel activity summary", timestamp: "2026-06-30T00:00:00+08:00" },
  { id: "src-proj-northwind", system: "projects", name: "Campaign Northwind", ref: "Project NW-2026 / milestone history", timestamp: "2026-03-14T11:20:00+08:00" },
  { id: "src-review-h2-2025", system: "reviews", name: "Performance Review H2 2025", ref: "Review cycle 2025-H2 / S. Lim", timestamp: "2025-12-18T15:00:00+08:00" },

  { id: "src-report-04", system: "reports", name: "Marketing Report #04 — Campaign Atlas", ref: "MKT-RPT-2026-04, p.3 attribution table", timestamp: "2026-04-02T10:15:00+08:00" },
  { id: "src-report-07", system: "reports", name: "Marketing Report #07 — Campaign Meridian", ref: "MKT-RPT-2026-07, p.2 summary", timestamp: "2026-06-05T09:40:00+08:00" },
  { id: "src-crm-accounts", system: "crm", name: "Enterprise Accounts", ref: "CRM / renewals Q1–Q2 2026, tag: marketing-support", timestamp: "2026-06-20T14:05:00+08:00" },
  { id: "src-proj-atlas", system: "projects", name: "Project Atlas Launch Workspace", ref: "Project AT-2026 / members & task history", timestamp: "2026-03-28T18:00:00+08:00" },
  { id: "src-slack-product-launch", system: "slack", name: "#product-launch", ref: "Message permalink p1711629600", timestamp: "2026-03-28T17:40:00+08:00" },
  { id: "src-ld-log", system: "hr", name: "Learning & Development — Buddy Programme", ref: "L&D / onboarding buddy roster 2026", timestamp: "2026-05-12T09:00:00+08:00" },
  { id: "src-townhall", system: "hr", name: "Company Town Hall Attendance", ref: "Events / 2026-Q2 town hall", timestamp: "2026-04-15T16:00:00+08:00" },
  { id: "src-docs-briefs", system: "documents", name: "Campaign Briefs (Shared Drive)", ref: "Marketing / Briefs / 2026", timestamp: "2026-05-30T12:00:00+08:00" },
  { id: "src-jira-analytics", system: "projects", name: "Web Analytics Backlog", ref: "WEB-1187", timestamp: "2026-02-11T10:00:00+08:00" },

  { id: "src-slack-marketing-ops", system: "slack", name: "#marketing-ops", ref: "Message permalink p1708923000", timestamp: "2026-02-26T11:50:00+08:00" },
];

export function getSource(id: string) {
  return sources.find((s) => s.id === id);
}
