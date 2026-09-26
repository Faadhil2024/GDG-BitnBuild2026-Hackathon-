import type { Confidence, ContributionCategory, Direction, Employee, Evidence, RoleKey, Source, SourceSystem } from "@/lib/types";

/**
 * Deterministic synthetic workforce. Everything here is produced from a fixed
 * seed, so the server and the client always agree and every run is identical.
 * Each employee's assessment is computed by the engine from the evidence
 * generated here — no level is ever hardcoded.
 */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = [
  "Aiman", "Nurul", "Wei Jie", "Kavitha", "Hakim", "Siti", "Jason", "Mei Yee", "Ravi", "Farah", "Kenneth", "Amira", "Zhi Hao", "Devi", "Irfan",
  "Adeline", "Syafiq", "Grace", "Harith", "Ling", "Arif", "Shalini", "Brandon", "Nadhirah", "Kai Wen", "Anusha", "Imran", "Jasmine", "Yusof", "Chloe",
  "Danish", "Preethi", "Terence", "Aina", "Wen Xuan", "Kirthana", "Faiz", "Hui Min", "Vignesh", "Balqis", "Ryan", "Sofea", "Jun Hao", "Meera", "Azlan", "Elaine",
];
const LAST = [
  "Abdullah", "Tan", "Krishnan", "Ismail", "Lim", "Nair", "Wong", "Rahman", "Chong", "Subramaniam", "Lee", "Hassan", "Ng", "Pillai", "Yap", "Zainal",
  "Cheah", "Menon", "Ooi", "Kamaruddin", "Goh", "Raj", "Teo", "Mohamed", "Loh", "Sivakumar",
];
const LOCATIONS = ["Kuala Lumpur", "Kuala Lumpur", "Kuala Lumpur", "Penang", "Johor Bahru", "Cyberjaya", "Petaling Jaya"];

interface RoleSpec {
  department: string;
  titles: string[];
  manager: string;
  templates: Template[];
}

interface Template {
  category: ContributionCategory;
  system: SourceSystem;
  source: string;
  ref: string;
  direction: Direction;
  impact: number;
  confidence: Confidence;
  summary: (r: () => number, name: string) => string;
  excerpt: (r: () => number, name: string) => string;
}

const n = (r: () => number, lo: number, hi: number) => Math.floor(lo + r() * (hi - lo + 1));
const rm = (v: number) => `RM ${v.toLocaleString("en-MY")}`;

const shared: Template[] = [
  {
    category: "internal_activity", system: "hr", source: "HR Master Record", ref: "HRIS / employee record", direction: "neutral", impact: 0, confidence: "high",
    summary: () => "Job title and grade on record", excerpt: (r) => `Grade: ${["G3", "G4", "G5", "M1", "M2"][n(r, 0, 4)]} · Standard role description`,
  },
  {
    category: "internal_activity", system: "slack", source: "Team channel activity", ref: "Channel activity summary", direction: "neutral", impact: 0, confidence: "high",
    summary: (r) => `${n(r, 180, 640)} Slack messages in H1, around team median`, excerpt: (r) => `Messages: ${n(r, 180, 640)} · Team median: ${n(r, 300, 420)}`,
  },
  {
    category: "mentoring", system: "hr", source: "L&D Buddy Programme", ref: "L&D / onboarding roster", direction: "strengthens", impact: 1, confidence: "high",
    summary: (r) => `Onboarding mentor for ${n(r, 1, 3)} new hires`, excerpt: (r) => `Buddy assignments: ${n(r, 1, 3)} · 90-day completion: all`,
  },
  {
    category: "internal_activity", system: "hr", source: "Town Hall Attendance", ref: "Events / quarterly town hall", direction: "neutral", impact: 0, confidence: "high",
    summary: () => "Attended quarterly town hall", excerpt: () => "Attendance: present",
  },
];

const miss: Template = {
  category: "delivery_reliability", system: "projects", source: "Project Tracker", ref: "Milestone history", direction: "weakens", impact: -1, confidence: "high",
  summary: (r) => `Milestone slipped ${n(r, 1, 3)} weeks past plan`, excerpt: (r) => `Planned → Actual: +${n(r, 7, 21)} days · Status: Late`,
};
const onTime: Template = {
  category: "delivery_reliability", system: "projects", source: "Project Tracker", ref: "Milestone history", direction: "strengthens", impact: 2, confidence: "high",
  summary: (r) => `${n(r, 8, 9)} of ${n(r, 9, 10)} milestones delivered on time`, excerpt: () => "Milestone history: on schedule",
};
const xfn = (workspace: string): Template => ({
  category: "cross_functional", system: "projects", source: `${workspace} workspace`, ref: "Members & task history", direction: "strengthens", impact: 2, confidence: "high",
  summary: () => `Co-owner of ${workspace} with two other departments`, excerpt: (r) => `Tasks completed: ${n(r, 6, 18)} · Departments: 3`,
});

const roles: Record<RoleKey, RoleSpec> = {
  engineering: {
    department: "Engineering", manager: "Farah Ismail",
    titles: ["Software Engineer", "Software Engineer II", "Senior Software Engineer", "Site Reliability Engineer", "QA Engineer", "Platform Engineer"],
    templates: [
      { category: "technical_output", system: "github", source: "halcyon/core-platform", ref: "Contributor stats, Jan–Jun 2026", direction: "strengthens", impact: 2, confidence: "high",
        summary: (r) => `${n(r, 60, 140)} merged pull requests, ${n(r, 3, 8)} features shipped`, excerpt: (r) => `Merged PRs: ${n(r, 60, 140)} · Reviews given: ${n(r, 80, 200)}` },
      { category: "technical_output", system: "github", source: "halcyon/core-platform", ref: "Contributor stats, Jan–Jun 2026", direction: "strengthens", impact: 1, confidence: "high",
        summary: (r) => `${n(r, 25, 55)} merged pull requests, mostly maintenance`, excerpt: (r) => `Merged PRs: ${n(r, 25, 55)} · Features: ${n(r, 0, 2)}` },
      { category: "delivery_reliability", system: "projects", source: "Incident log", ref: "Ops / incidents", direction: "strengthens", impact: 1, confidence: "high",
        summary: (r) => `Resolved ${n(r, 4, 12)} production incidents as on-call`, excerpt: (r) => `Incidents resolved: ${n(r, 4, 12)} · MTTR: ${n(r, 18, 45)} min` },
      { category: "delivery_reliability", system: "projects", source: "Incident post-mortem", ref: "Ops / incidents", direction: "weakens", impact: -2, confidence: "high",
        summary: (r) => `Caused Sev-1 outage (${n(r, 1, 4)}h) via change merged without staging run`, excerpt: () => "Severity: 1 · Root cause: untested change" },
      xfn("Project Atlas"), onTime, miss,
    ],
  },
  data: {
    department: "Data & Analytics", manager: "Arjun Menon",
    titles: ["Data Analyst", "Data Engineer", "Senior Data Analyst", "Analytics Engineer", "BI Developer"],
    templates: [
      { category: "technical_output", system: "github", source: "halcyon/data-pipelines", ref: "Contributor stats", direction: "strengthens", impact: 2, confidence: "high",
        summary: (r) => `Built ${n(r, 3, 7)} production pipelines feeding ${n(r, 8, 20)} dashboards`, excerpt: (r) => `Pipelines: ${n(r, 3, 7)} · Consumers: ${n(r, 8, 20)}` },
      { category: "revenue_impact", system: "reports", source: "Pricing Analysis Memo", ref: "Finance / pricing 2026", direction: "strengthens", impact: 1, confidence: "medium",
        summary: (r) => `Pricing analysis adopted; est. ${rm(n(r, 80, 260) * 1000)} uplift`, excerpt: () => "Recommendation adopted by Finance" },
      { category: "delivery_reliability", system: "projects", source: "Data SLA report", ref: "Data / SLA", direction: "weakens", impact: -1, confidence: "high",
        summary: (r) => `Daily reporting SLA missed ${n(r, 5, 14)} times in Q2`, excerpt: () => "SLA breaches logged" },
      xfn("Project Meridian"), onTime,
    ],
  },
  product: {
    department: "Product", manager: "Farah Ismail",
    titles: ["Product Manager", "Associate Product Manager", "Senior Product Manager", "Product Analyst"],
    templates: [
      { category: "cross_functional", system: "projects", source: "Launch workspace", ref: "Members & milestones", direction: "strengthens", impact: 2, confidence: "high",
        summary: (r) => `Led launch with Engineering, Marketing and Sales; ${n(r, 3, 5)} teams`, excerpt: () => "Role: launch owner" },
      { category: "client_impact", system: "crm", source: "Customer interview log", ref: "Research / interviews", direction: "strengthens", impact: 1, confidence: "medium",
        summary: (r) => `${n(r, 12, 30)} customer interviews informing roadmap`, excerpt: (r) => `Interviews: ${n(r, 12, 30)}` },
      { category: "delivery_reliability", system: "projects", source: "Roadmap tracker", ref: "Quarterly commitments", direction: "weakens", impact: -1, confidence: "high",
        summary: (r) => `${n(r, 2, 4)} roadmap commitments moved out of quarter`, excerpt: () => "Commitments deferred" },
      onTime,
    ],
  },
  design: {
    department: "Design", manager: "Chloe Ng",
    titles: ["Product Designer", "UX Designer", "Senior Product Designer", "UX Researcher", "Brand Designer"],
    templates: [
      { category: "cross_functional", system: "documents", source: "Design handoff log", ref: "Figma / handoffs", direction: "strengthens", impact: 2, confidence: "high",
        summary: (r) => `${n(r, 6, 14)} features designed and handed off to Engineering`, excerpt: (r) => `Handoffs: ${n(r, 6, 14)}` },
      { category: "client_impact", system: "reports", source: "Usability study", ref: "Research / study", direction: "strengthens", impact: 1, confidence: "medium",
        summary: (r) => `Task success improved ${n(r, 12, 30)}% after redesign`, excerpt: () => "Pre/post usability comparison" },
      { category: "technical_output", system: "github", source: "halcyon/design-system", ref: "Contributor stats", direction: "strengthens", impact: 1, confidence: "high",
        summary: (r) => `${n(r, 8, 24)} design-system components contributed`, excerpt: () => "Component library commits" },
      miss, onTime,
    ],
  },
  marketing: {
    department: "Marketing", manager: "Jonathan Lee",
    titles: ["Marketing Executive", "Content Marketer", "Growth Marketer", "Brand Manager", "Marketing Analyst"],
    templates: [
      { category: "revenue_impact", system: "reports", source: "Campaign attribution report", ref: "Marketing reports", direction: "strengthens", impact: 2, confidence: "high",
        summary: (r) => `Campaign attributed ${rm(n(r, 90, 320) * 1000)} pipeline as lead`, excerpt: () => "Attribution table: campaign lead" },
      { category: "campaign_ownership", system: "documents", source: "Campaign briefs", ref: "Marketing / briefs", direction: "strengthens", impact: 1, confidence: "high",
        summary: (r) => `Authored ${n(r, 2, 5)} campaign briefs`, excerpt: () => "Author of record" },
      { category: "client_impact", system: "crm", source: "Enterprise accounts", ref: "CRM / marketing-support tag", direction: "strengthens", impact: 1, confidence: "medium",
        summary: (r) => `Marketing support on ${n(r, 4, 14)} accounts`, excerpt: () => "Tag: marketing-support" },
      { category: "technical_output", system: "github", source: "halcyon/marketing-site", ref: "Contributor stats", direction: "irrelevant", impact: 0, confidence: "high",
        summary: (r) => `${n(r, 1, 5)} commits to marketing-site copy`, excerpt: () => "Copy edits only" },
      xfn("Product launch"), miss,
    ],
  },
  sales: {
    department: "Sales", manager: "Kevin Ong",
    titles: ["Account Executive", "Account Manager", "Sales Development Rep", "Senior Account Executive", "Solutions Consultant"],
    templates: [
      { category: "revenue_impact", system: "crm", source: "Closed-won report", ref: "CRM / H1 2026", direction: "strengthens", impact: 2, confidence: "high",
        summary: (r) => `${rm(n(r, 9, 24) * 100000)} closed-won, ${n(r, 101, 140)}% of quota`, excerpt: () => "Closed-won H1" },
      { category: "revenue_impact", system: "crm", source: "Closed-won report", ref: "CRM / H1 2026", direction: "weakens", impact: -1, confidence: "high",
        summary: (r) => `${n(r, 58, 84)}% of quota attained`, excerpt: () => "Closed-won H1 below quota" },
      { category: "client_impact", system: "crm", source: "Renewals report", ref: "CRM / renewals", direction: "strengthens", impact: 1, confidence: "high",
        summary: (r) => `${n(r, 88, 98)}% renewal rate across ${n(r, 9, 28)} accounts`, excerpt: () => "Gross renewal rate" },
      { category: "delivery_reliability", system: "reviews", source: "Sales QBR", ref: "QBR notes", direction: "strengthens", impact: 1, confidence: "medium",
        summary: () => "Forecast accuracy within ±5% each month", excerpt: () => "Commit-forecast accuracy" },
      xfn("Project Atlas"),
    ],
  },
  operations: {
    department: "Operations", manager: "Kevin Ong",
    titles: ["Operations Analyst", "Logistics Coordinator", "Operations Lead", "Procurement Specialist", "Facilities Manager"],
    templates: [
      { category: "delivery_reliability", system: "reports", source: "Operations KPI report", ref: "OPS-RPT-2026-H1", direction: "strengthens", impact: 2, confidence: "high",
        summary: (r) => `On-time delivery raised ${n(r, 3, 8)} points; cost per unit down ${n(r, 4, 12)}%`, excerpt: () => "KPI owner" },
      { category: "delivery_reliability", system: "reports", source: "Operations KPI report", ref: "OPS-RPT-2026-H1", direction: "weakens", impact: -1, confidence: "high",
        summary: (r) => `Backlog grew ${n(r, 8, 22)}% in Q2`, excerpt: () => "Backlog trend" },
      { category: "client_impact", system: "reports", source: "Complaints dashboard", ref: "CX / complaints", direction: "strengthens", impact: 1, confidence: "medium",
        summary: (r) => `Delivery complaints down ${n(r, 10, 35)}%`, excerpt: () => "Complaint volume half-on-half" },
      xfn("Fulfilment Re-platform"),
    ],
  },
  finance: {
    department: "Finance", manager: "Nadia Hussain",
    titles: ["Financial Analyst", "Accountant", "Senior Financial Analyst", "FP&A Manager", "Payroll Specialist"],
    templates: [
      { category: "delivery_reliability", system: "reports", source: "Month-end close log", ref: "Finance / close calendar", direction: "strengthens", impact: 2, confidence: "high",
        summary: (r) => `${n(r, 5, 6)} of 6 month-end closes completed within 3 business days`, excerpt: () => "Close calendar" },
      { category: "delivery_reliability", system: "reports", source: "Audit findings", ref: "Audit / H1", direction: "weakens", impact: -1, confidence: "high",
        summary: (r) => `${n(r, 1, 3)} control findings raised in interim audit`, excerpt: () => "Audit findings" },
      { category: "revenue_impact", system: "reports", source: "Cost savings register", ref: "Finance / savings", direction: "strengthens", impact: 1, confidence: "medium",
        summary: (r) => `Identified ${rm(n(r, 40, 180) * 1000)} in vendor savings`, excerpt: () => "Savings register" },
      xfn("Fulfilment Re-platform"),
    ],
  },
  hr: {
    department: "People & Culture", manager: "Vikram Pillai",
    titles: ["HR Business Partner", "Talent Acquisition Specialist", "People Operations Analyst", "L&D Specialist"],
    templates: [
      { category: "mentoring", system: "hr", source: "L&D programme records", ref: "L&D / programmes", direction: "strengthens", impact: 2, confidence: "high",
        summary: (r) => `Ran ${n(r, 3, 8)} training cohorts, ${n(r, 40, 120)} employees`, excerpt: () => "Programme lead" },
      { category: "delivery_reliability", system: "hr", source: "Hiring pipeline", ref: "ATS / time-to-fill", direction: "strengthens", impact: 1, confidence: "high",
        summary: (r) => `Time-to-fill reduced to ${n(r, 24, 38)} days`, excerpt: () => "ATS metrics" },
      { category: "delivery_reliability", system: "hr", source: "Hiring pipeline", ref: "ATS / time-to-fill", direction: "weakens", impact: -1, confidence: "medium",
        summary: (r) => `${n(r, 2, 5)} critical roles open beyond 90 days`, excerpt: () => "Aged requisitions" },
      xfn("Onboarding redesign"),
    ],
  },
  support: {
    department: "Customer Support", manager: "Hafiz Zulkifli",
    titles: ["Support Specialist", "Senior Support Specialist", "Customer Success Manager", "Support Team Lead"],
    templates: [
      { category: "client_impact", system: "crm", source: "Support desk metrics", ref: "Helpdesk / CSAT", direction: "strengthens", impact: 2, confidence: "high",
        summary: (r) => `CSAT ${n(r, 91, 98)}% across ${n(r, 400, 1400)} tickets`, excerpt: () => "CSAT report" },
      { category: "client_impact", system: "crm", source: "Support desk metrics", ref: "Helpdesk / CSAT", direction: "weakens", impact: -1, confidence: "high",
        summary: (r) => `CSAT ${n(r, 72, 84)}%, below team target`, excerpt: () => "CSAT report" },
      { category: "delivery_reliability", system: "crm", source: "SLA report", ref: "Helpdesk / SLA", direction: "strengthens", impact: 1, confidence: "high",
        summary: (r) => `First-response SLA met ${n(r, 94, 99)}% of the time`, excerpt: () => "SLA compliance" },
      xfn("Product launch"),
    ],
  },
  legal: {
    department: "Legal & Compliance", manager: "Mei Ling Chow",
    titles: ["Legal Counsel", "Compliance Analyst", "Contracts Specialist", "Senior Legal Counsel"],
    templates: [
      { category: "delivery_reliability", system: "documents", source: "Contract turnaround log", ref: "Legal / contracts", direction: "strengthens", impact: 2, confidence: "high",
        summary: (r) => `${n(r, 40, 120)} contracts reviewed, median ${n(r, 2, 4)} days turnaround`, excerpt: () => "Turnaround log" },
      { category: "cross_functional", system: "projects", source: "Compliance programme", ref: "Compliance / PDPA", direction: "strengthens", impact: 1, confidence: "high",
        summary: () => "Led PDPA compliance review with Engineering and Product", excerpt: () => "Programme lead" },
      { category: "delivery_reliability", system: "documents", source: "Contract turnaround log", ref: "Legal / contracts", direction: "weakens", impact: -1, confidence: "medium",
        summary: (r) => `${n(r, 3, 9)} contracts exceeded 10-day turnaround`, excerpt: () => "Aged contracts" },
    ],
  },
};

const ROLE_MIX: RoleKey[] = [
  "engineering", "engineering", "engineering", "engineering", "sales", "sales", "sales", "support", "support", "marketing", "marketing",
  "operations", "operations", "product", "design", "finance", "finance", "hr", "data", "data", "legal",
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, "-").replace(/(^-|-$)/g, "");

export const generatedEmployees: Employee[] = [];
export const generatedSources: Source[] = [];
export const generatedEvidence: Evidence[] = [];

const rng = mulberry32(20260925);
const usedNames = new Set<string>();
const usedIds = new Set<string>();

for (let i = 0; i < 94; i++) {
  let name = "";
  do name = `${FIRST[n(rng, 0, FIRST.length - 1)]} ${LAST[n(rng, 0, LAST.length - 1)]}`;
  while (usedNames.has(name));
  usedNames.add(name);

  const role = ROLE_MIX[n(rng, 0, ROLE_MIX.length - 1)];
  const spec = roles[role];
  let id = `emp-${slug(name)}`;
  if (usedIds.has(id)) id = `${id}-${i}`;
  usedIds.add(id);
  const initials = name.split(" ").map((p) => p[0]).join("").toUpperCase();

  generatedEmployees.push({
    id, name, role,
    title: spec.titles[n(rng, 0, spec.titles.length - 1)],
    department: spec.department,
    manager: spec.manager,
    tenureYears: n(rng, 1, 18) / 2,
    location: LOCATIONS[n(rng, 0, LOCATIONS.length - 1)],
  });

  // ~10% have no evidence indexed yet.
  if (rng() < 0.1) continue;

  // Mostly role-specific evidence (what actually measures the job), plus a little generic noise.
  const picked: Template[] = [];
  const positives = spec.templates.filter((t) => t.impact > 0);
  const negatives = spec.templates.filter((t) => t.impact < 0);
  const others = spec.templates.filter((t) => t.impact === 0);
  const posCount = n(rng, 2, Math.min(4, positives.length));
  while (picked.length < posCount) {
    const t = positives[n(rng, 0, positives.length - 1)];
    if (!picked.includes(t)) picked.push(t);
  }
  // Roughly a third carry a genuine concern; a few have role-irrelevant noise.
  if (negatives.length && rng() < 0.35) picked.push(negatives[n(rng, 0, negatives.length - 1)]);
  if (others.length && rng() < 0.3) picked.push(others[n(rng, 0, others.length - 1)]);
  if (rng() < 0.5) picked.push(shared[2]); // mentoring
  const noise = n(rng, 0, 2);
  for (let k = 0; k < noise; k++) {
    const t = shared[[0, 1, 3][n(rng, 0, 2)]];
    if (!picked.includes(t)) picked.push(t);
  }

  picked.forEach((t, k) => {
    const srcId = `src-${slug(name)}-${k + 1}`;
    const month = n(rng, 1, 6);
    const day = n(rng, 1, 28);
    const ts = `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(n(rng, 8, 18)).padStart(2, "0")}:${String(n(rng, 0, 59)).padStart(2, "0")}:00+08:00`;
    generatedSources.push({ id: srcId, system: t.system, name: t.source, ref: t.ref, timestamp: ts });
    const summary = t.summary(rng, name);
    generatedEvidence.push({
      id: `EV-${initials}${String(i).padStart(2, "0")}-${k + 1}`,
      employeeId: id,
      sourceId: srcId,
      category: t.category,
      summary,
      detail: `${t.source} (${t.ref}) records: ${summary}.`,
      excerpt: t.excerpt(rng, name),
      direction: t.direction,
      impact: t.impact,
      confidence: t.confidence,
      discoveredIn: "initial",
      recordedAt: ts,
    });
  });
}
