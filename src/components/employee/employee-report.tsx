"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { useAssessment } from "@/store/assessment-store";
import { useSession } from "@/lib/session";
import { useSelfAppraisals } from "@/lib/self-appraisal";
import { ReportSheet } from "./report-sheet";
import { ReevaluationPanel } from "./reevaluation-panel";
import { Card } from "@/components/ui";

export function EmployeeReport() {
  const { employee } = useAssessment();
  const session = useSession();
  const sa = useSelfAppraisals()[employee.id];
  const own = session.status === "in" && session.account.employeeId === employee.id;

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
          {sa.ai && <ReevaluationPanel employee={employee} sa={sa} />}
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
