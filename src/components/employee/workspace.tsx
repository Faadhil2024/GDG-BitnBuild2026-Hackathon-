"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import { useAssessment } from "@/store/assessment-store";
import { useSession } from "@/lib/session";
import { useSelfAppraisals } from "@/lib/self-appraisal";
import { markVisited } from "@/lib/updates";
import { AssessmentCard } from "./assessment-card";
import { FactorList } from "./factor-list";
import { ChangePanel } from "./change-panel";
import { Timeline } from "./timeline";
import { EvidenceDrawer } from "./evidence-drawer";
import { ChallengePanel } from "./challenge-panel";
import { EvidenceFeed } from "./evidence-feed";
import { DiscoveryScanner } from "./discovery-scanner";
import { ReportSheet } from "./report-sheet";
import { ProfileView } from "./profile-view";

export function EmployeeWorkspace() {
  const { employee, state } = useAssessment();
  const session = useSession();
  const employer = session.status === "in" && session.account.role === "employer";
  const submitted = !!useSelfAppraisals()[employee.id];
  const scanning = state.phase === "discovering";

  // Opening the report acknowledges its changes — the "new" marker on the table clears.
  useEffect(() => {
    if (employer) markVisited(`report:${employee.id}`);
  }, [employer, employee.id]);

  if (!employer) return <ProfileView />;

  return (
    <div className="space-y-6">
      <Link href="/" className="pressable inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[14px] text-ink-muted hover:text-ink">
        <ArrowLeft size={14} weight="bold" /> Back to employees
      </Link>

      <ReportSheet />

      {submitted && (
        <section aria-labelledby="evidence-heading" className="space-y-3">
          <h2 id="evidence-heading" className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-faint">Evidence behind the grade</h2>
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_520px]">
            <div className="space-y-8">
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
            <aside className="space-y-8" aria-label="Evidence and history">
              <Timeline />
              <EvidenceFeed />
            </aside>
          </div>
        </section>
      )}

      <EvidenceDrawer />
    </div>
  );
}
