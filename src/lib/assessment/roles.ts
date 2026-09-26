import type { ContributionCategory, RoleKey, RoleProfile } from "@/lib/types";

export const CATEGORY_LABELS: Record<ContributionCategory, string> = {
  revenue_impact: "Revenue contribution",
  campaign_ownership: "Campaign ownership",
  cross_functional: "Cross-functional work",
  client_impact: "Client impact",
  mentoring: "Mentoring",
  delivery_reliability: "Delivery reliability",
  technical_output: "Technical output",
  internal_activity: "Internal activity",
};

const zero: Record<ContributionCategory, number> = {
  revenue_impact: 0,
  campaign_ownership: 0,
  cross_functional: 0,
  client_impact: 0,
  mentoring: 0,
  delivery_reliability: 0,
  technical_output: 0,
  internal_activity: 0,
};

/**
 * Different roles create value differently. A weight of 0 means the category
 * is not used to judge this role at all (evidence is shown but ignored).
 */
export const roleProfiles: Record<RoleKey, RoleProfile> = {
  marketing: {
    role: "marketing",
    label: "Marketing",
    weights: {
      ...zero,
      revenue_impact: 1,
      campaign_ownership: 1,
      cross_functional: 0.8,
      client_impact: 0.8,
      mentoring: 0.5,
      delivery_reliability: 0.8,
      internal_activity: 0.2,
    },
    expected: ["revenue_impact", "campaign_ownership", "cross_functional", "client_impact", "delivery_reliability"],
  },
  engineering: {
    role: "engineering",
    label: "Engineering",
    weights: {
      ...zero,
      technical_output: 1,
      delivery_reliability: 1,
      cross_functional: 0.6,
      mentoring: 0.5,
      internal_activity: 0.2,
    },
    expected: ["technical_output", "delivery_reliability", "cross_functional"],
  },
  sales: {
    role: "sales",
    label: "Sales",
    weights: {
      ...zero,
      revenue_impact: 1,
      client_impact: 1,
      cross_functional: 0.6,
      delivery_reliability: 0.6,
      mentoring: 0.4,
      internal_activity: 0.2,
    },
    expected: ["revenue_impact", "client_impact", "cross_functional"],
  },
  product: {
    role: "product",
    label: "Product",
    weights: {
      ...zero,
      cross_functional: 1,
      delivery_reliability: 1,
      client_impact: 0.7,
      revenue_impact: 0.6,
      mentoring: 0.4,
      internal_activity: 0.2,
    },
    expected: ["cross_functional", "delivery_reliability", "client_impact"],
  },
  operations: {
    role: "operations",
    label: "Operations",
    weights: {
      ...zero,
      delivery_reliability: 1,
      cross_functional: 0.8,
      client_impact: 0.5,
      mentoring: 0.4,
      internal_activity: 0.2,
    },
    expected: ["delivery_reliability", "cross_functional"],
  },
  finance: {
    role: "finance",
    label: "Finance",
    weights: { ...zero, delivery_reliability: 1, revenue_impact: 0.7, cross_functional: 0.8, client_impact: 0.3, mentoring: 0.4, internal_activity: 0.2 },
    expected: ["delivery_reliability", "revenue_impact", "cross_functional"],
  },
  hr: {
    role: "hr",
    label: "People & Culture",
    weights: { ...zero, mentoring: 1, delivery_reliability: 0.8, cross_functional: 0.8, client_impact: 0.4, internal_activity: 0.3 },
    expected: ["mentoring", "delivery_reliability", "cross_functional"],
  },
  design: {
    role: "design",
    label: "Design",
    weights: { ...zero, cross_functional: 1, delivery_reliability: 0.8, client_impact: 0.7, technical_output: 0.3, mentoring: 0.4, internal_activity: 0.2 },
    expected: ["cross_functional", "delivery_reliability", "client_impact"],
  },
  support: {
    role: "support",
    label: "Customer Support",
    weights: { ...zero, client_impact: 1, delivery_reliability: 0.8, cross_functional: 0.5, mentoring: 0.4, internal_activity: 0.2 },
    expected: ["client_impact", "delivery_reliability"],
  },
  legal: {
    role: "legal",
    label: "Legal & Compliance",
    weights: { ...zero, delivery_reliability: 1, cross_functional: 0.8, client_impact: 0.5, mentoring: 0.3, internal_activity: 0.2 },
    expected: ["delivery_reliability", "cross_functional"],
  },
  data: {
    role: "data",
    label: "Data & Analytics",
    weights: { ...zero, technical_output: 1, cross_functional: 0.8, delivery_reliability: 0.8, revenue_impact: 0.4, mentoring: 0.4, internal_activity: 0.2 },
    expected: ["technical_output", "cross_functional", "delivery_reliability"],
  },
};
