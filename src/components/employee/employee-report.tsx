"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { useAssessment } from "@/store/assessment-store";
import { useSession } from "@/lib/session";
import { useSelfAppraisals } from "@/lib/self-appraisal";
import { ReportSheet } from "./report-sheet";
import { ReevaluationPanel } from "./reevaluation-panel";
import { AssessmentCard } from "./assessment-card";
import { DiscoveryScanner } from "./discovery-scanner";
import { FactorList } from "./factor-list";
import { ChangePanel } from "./change-panel";
import { Timeline } from "./timeline";
import { EvidenceFeed } from "./evidence-feed";
import { EvidenceDrawer } from "./evidence-drawer";
import { Card } from "@/components/ui";

/**
 * The employee's own view. The sheet is the manager's sheet; the evidence
 * section starts as one card and only unfolds once they press the model
 * verification button — they choose to look at how the AI valued them.
 */
export function EmployeeReport() {
  const { employee, state } = useAssessment();
  const session = useSession();
  const sa = useSelfAppraisals()[employee.id];
  const own = session.status === "in" && session.account.employeeId === employee.id;
  const scanning = state.phase === "discovering";
  const unfolded = state.phase !== "initial";

  if (!own) return null;

  return (
    <div className="space-y-6">
      <Link href="/stats" className="pressable inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[14px] text-ink-muted hover:text-ink">
        <ArrowLeft size={14} weight="bold" /> Back to stats
      </Link>
      {sa ? (
        <>
          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-ink-faint">Your appraisal report</p>
            <h1 className="mt-2 text-[30px] font-semibold leading-none tracking-tight">What the AI saw, and why it graded you {sa.ai?.grade ?? "—"}</h1>
            <p className="mt-3 max-w-[66ch] text-[16px] leading-relaxed text-ink-muted">This is the same sheet {employee.manager} reads. Nothing is verified until your manager decides. If the assessment missed something, ask for a re-evaluation below.</p>
          </div>
          <ReportSheet viewer="employee" />

          {sa.ai && (
            <section aria-labelledby="evidence-heading" className="space-y-3">
              <h2 id="evidence-heading" className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-faint">How the AI valued your work</h2>
              <div className={unfolded ? "grid gap-8 xl:grid-cols-[minmax(0,1fr)_480px]" : ""}>
                <div className="space-y-8">
                  <AssessmentCard />
                  {scanning && <DiscoveryScanner />}
                  {unfolded && !scanning && (
                    <div className="animate-fall space-y-8">
                      <ChangePanel />
                      <FactorList viewer="employee" />
                    </div>
                  )}
                </div>
                {unfolded && !scanning && (
                  <aside className="animate-fall space-y-8" aria-label="Evidence and history">
                    <Timeline />
                    <EvidenceFeed />
                  </aside>
                )}
              </div>
            </section>
          )}

          {sa.ai && <ReevaluationPanel employee={employee} sa={sa} />}
          <EvidenceDrawer />
        </>
      ) : (
        <Card className="p-8">
          <p className="text-[17px] font-semibold">No report yet</p>
          <p className="mt-1 text-[15px] text-ink-muted">Submit your self-appraisal and the AI grade and reasoning will appear here.</p>
        </Card>
      )}
    </div>
  );
}
