"use client";

import Link from "next/link";
import { useAssessment } from "@/store/assessment-store";
import { AssessmentCard } from "./assessment-card";
import { FactorList } from "./factor-list";
import { ChangePanel } from "./change-panel";
import { Timeline } from "./timeline";
import { EvidenceDrawer } from "./evidence-drawer";
import { ChallengePanel } from "./challenge-panel";
import { EvidenceFeed } from "./evidence-feed";
import { DiscoveryScanner } from "./discovery-scanner";

export function EmployeeWorkspace() {
  const { employee, state } = useAssessment();
  const scanning = state.phase === "discovering";

  return (
    <div className="space-y-6">
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

      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-full bg-ink text-base font-semibold text-white">
            {employee.name.split(" ").map((p) => p[0]).join("")}
          </span>
          <div>
            <h1 className="text-[26px] font-semibold leading-tight tracking-tight">{employee.name}</h1>
            <p className="mt-0.5 text-sm text-ink-muted">
              {employee.title} · {employee.department}
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-x-8 text-sm">
          <div>
            <dt className="text-xs text-ink-faint">Reports to</dt>
            <dd>{employee.manager}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint">Tenure</dt>
            <dd>{employee.tenureYears} years</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint">Location</dt>
            <dd>{employee.location}</dd>
          </div>
        </dl>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <AssessmentCard />
          {scanning ? (
            <DiscoveryScanner />
          ) : (
            <>
              <ChallengePanel />
              <ChangePanel />
              <FactorList />
            </>
          )}
        </div>
        <aside className="space-y-6" aria-label="Evidence and history">
          <Timeline />
          <EvidenceFeed />
        </aside>
      </div>

      <EvidenceDrawer />
    </div>
  );
}
