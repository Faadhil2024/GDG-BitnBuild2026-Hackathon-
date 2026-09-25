"use client";

import Link from "next/link";
import { useAssessment } from "@/store/assessment-store";
import { Pill } from "@/components/ui";
import { AssessmentCard } from "./assessment-card";
import { FactorList } from "./factor-list";
import { ChangePanel } from "./change-panel";
import { Timeline } from "./timeline";
import { EvidenceDrawer } from "./evidence-drawer";
import { ChallengePanel } from "./challenge-panel";
import { EvidenceFeed } from "./evidence-feed";

export function EmployeeWorkspace() {
  const { employee, state } = useAssessment();

  return (
    <div className="space-y-5">
      <nav aria-label="Breadcrumb" className="text-xs text-ink-faint">
        <ol className="flex gap-1.5">
          <li>
            <Link href="/" className="hover:text-ink">
              Appraisal cycle
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink-muted">
            {employee.name}
          </li>
        </ol>
      </nav>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{employee.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {employee.title} · {employee.department} · reports to {employee.manager} · {employee.tenureYears} yrs · {employee.location}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Pill tone="accent">Simulated data</Pill>
          <Pill tone="neutral">Phase: {state.phase}</Pill>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <AssessmentCard />
          <ChallengePanel />
          <ChangePanel />
          <FactorList />
        </div>
        <aside className="space-y-5" aria-label="Evidence and history">
          <Timeline />
          <EvidenceFeed />
        </aside>
      </div>

      <EvidenceDrawer />
    </div>
  );
}
