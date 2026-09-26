"use client";

import Link from "next/link";
import { useAssessment } from "@/store/assessment-store";
import { useSession } from "@/lib/session";
import { AssessmentCard } from "./assessment-card";
import { FactorList } from "./factor-list";
import { ChangePanel } from "./change-panel";
import { Timeline } from "./timeline";
import { EvidenceDrawer } from "./evidence-drawer";
import { ChallengePanel } from "./challenge-panel";
import { EvidenceFeed } from "./evidence-feed";
import { DiscoveryScanner } from "./discovery-scanner";
import { SelfAppraisalCard } from "./self-appraisal-card";
import { ReportSheet } from "./report-sheet";

export function EmployeeWorkspace() {
  const { employee, state } = useAssessment();
  const session = useSession();
  const employer = session.status === "in" && session.account.role === "employer";
  const scanning = state.phase === "discovering";

  return (
    <div className="space-y-6">
      {employer && (
        <nav aria-label="Breadcrumb" className="text-[13px] text-ink-faint">
          <ol className="flex gap-1.5">
            <li><Link href="/" className="hover:text-ink">Team review</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink-muted">{employee.name}</li>
          </ol>
        </nav>
      )}

      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="grid h-14 w-14 place-items-center rounded-full bg-ink text-[17px] font-semibold text-white">
            {employee.name.split(" ").map((p) => p[0]).join("")}
          </span>
          <div>
            <h1 className="text-[28px] font-semibold leading-tight tracking-tight">{employer ? employee.name : `${employee.name.split(" ")[0]}, your profile`}</h1>
            <p className="mt-0.5 text-[15px] text-ink-muted">{employee.title} · {employee.department}</p>
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-x-8 text-[15px]">
          <div><dt className="text-[13px] text-ink-faint">Reports to</dt><dd>{employee.manager}</dd></div>
          <div><dt className="text-[13px] text-ink-faint">Tenure</dt><dd>{employee.tenureYears} years</dd></div>
          <div><dt className="text-[13px] text-ink-faint">Location</dt><dd>{employee.location}</dd></div>
        </dl>
      </header>

      {employer && (
        <section aria-labelledby="report-heading" className="space-y-3">
          <h2 id="report-heading" className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-faint">Appraisal report</h2>
          <ReportSheet />
        </section>
      )}

      <section aria-labelledby="evidence-heading" className="space-y-3">
        <h2 id="evidence-heading" className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
          {employer ? "Evidence behind the grade" : "Your evidence-based assessment"}
        </h2>
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_520px]">
          <div className="space-y-8">
            <AssessmentCard />
            {!employer && <SelfAppraisalCard />}
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
          <aside className="space-y-8" aria-label="Evidence and history">
            <Timeline />
            <EvidenceFeed />
          </aside>
        </div>
      </section>

      <EvidenceDrawer />
    </div>
  );
}
