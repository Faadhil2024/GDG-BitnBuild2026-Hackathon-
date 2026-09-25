import type { SourceSystem } from "@/lib/types";

export interface ScanStep {
  label: (name: string) => string;
  systems: SourceSystem[];
}

/** The sources walked during evidence discovery, in the order shown to the user. */
export const SCAN_STEPS: ScanStep[] = [
  { label: () => "Reading Slack channels", systems: ["slack"] },
  { label: (n) => `Collecting HR and record files of ${n}`, systems: ["hr", "reviews"] },
  { label: () => "Reading marketing reports and campaign briefs", systems: ["reports", "documents"] },
  { label: () => "Checking CRM account records", systems: ["crm"] },
  { label: () => "Reviewing project tracker and launch workspaces", systems: ["projects", "github"] },
];

export const SCAN_STEP_MS = 1400;
