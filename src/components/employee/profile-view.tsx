"use client";

import Link from "next/link";
import { CheckCircle, SealCheck, Warning } from "@phosphor-icons/react";
import { useAssessment } from "@/store/assessment-store";
import { useSession } from "@/lib/session";
import { useDecisions, useSelfAppraisals } from "@/lib/self-appraisal";
import { QUESTIONS } from "@/data/self-appraisal";
import { COMPANY } from "@/data/employees";
import { roleProfiles } from "@/lib/assessment/roles";
import { Button, Card, GradeBadge, Pill, formatDate } from "@/components/ui";

/**
 * What an employee sees of themselves: who they are on record, and where their
 * appraisal stands. No evidence internals, no AI reasoning. The grade appears
 * only once their manager has decided.
 */
export function ProfileView() {
  const { employee } = useAssessment();
  const session = useSession();
  const account = session.status === "in" ? session.account : undefined;
  const sa = useSelfAppraisals()[employee.id];
  const d = useDecisions()[employee.id];

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-5">
        <span aria-hidden="true" className="grid h-16 w-16 place-items-center rounded-full bg-ink text-[20px] font-semibold text-white">
          {employee.name.split(" ").map((p) => p[0]).join("")}
        </span>
        <div>
          <h1 className="text-[30px] font-semibold leading-tight tracking-tight">{employee.name}</h1>
          <p className="mt-0.5 text-[15px] text-ink-muted">{employee.title} · {employee.department}</p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card className="p-8">
          <h2 className="text-[17px] font-semibold">Profile</h2>
          <dl className="mt-5 grid grid-cols-[160px_1fr] gap-x-6 gap-y-4 text-[15px]">
            <dt className="text-ink-faint">Full name</dt><dd className="font-medium">{employee.name}</dd>
            <dt className="text-ink-faint">Office ID</dt><dd className="font-mono">{account?.officeId ?? "—"}</dd>
            <dt className="text-ink-faint">Title</dt><dd>{employee.title}</dd>
            <dt className="text-ink-faint">Department</dt><dd>{employee.department}</dd>
            <dt className="text-ink-faint">Role family</dt><dd>{roleProfiles[employee.role].label}</dd>
            <dt className="text-ink-faint">Reports to</dt><dd>{employee.manager}</dd>
            <dt className="text-ink-faint">Tenure</dt><dd>{employee.tenureYears} years</dd>
            <dt className="text-ink-faint">Location</dt><dd>{employee.location}</dd>
            <dt className="text-ink-faint">Company</dt><dd>{COMPANY.name}</dd>
            <dt className="text-ink-faint">Appraisal cycle</dt><dd>{COMPANY.cycle} · {COMPANY.cycleWindow}</dd>
          </dl>
        </Card>

        <Card className="p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[17px] font-semibold">Appraisal status</h2>
            {!sa && <Pill tone="moderate">Not submitted</Pill>}
            {sa && !d && <Pill tone="high"><CheckCircle size={12} weight="fill" /> Completed</Pill>}
            {d && (d.outcome === "override" ? <Pill tone="moderate"><Warning size={12} weight="fill" /> Final · manager decision</Pill> : <Pill tone="high"><SealCheck size={12} weight="fill" /> Final · verified</Pill>)}
          </div>

          <ol className="mt-6 space-y-5">
            <Step n={1} done={!!sa} title="Self-appraisal" detail={sa ? `Submitted ${formatDate(sa.submittedAt)} · self-grade ${sa.grade}` : "Nine questions, about ten minutes."} />
            <Step n={2} done={!!d} active={!!sa && !d} title="Manager review" detail={d ? `Decided ${formatDate(d.decidedAt)} by ${d.decidedBy}` : sa ? `With ${employee.manager}. You will see your grade here once it is decided.` : "Starts after you submit."} />
            <Step n={3} done={!!d} title="Your grade" detail={d ? (d.outcome === "override" ? "Set by your manager as the decision of record." : d.outcome === "revised" ? "Verified after a review by your manager." : "Verified by your manager.") : "Shown when the review is complete."} >
              {d && <div className="mt-3"><GradeBadge grade={d.finalGrade} size="lg" label={null} /></div>}
            </Step>
          </ol>

          {!sa && (
            <Link href="/self-appraisal" className="mt-6 block">
              <Button variant="primary" className="w-full justify-center">Start self-appraisal</Button>
            </Link>
          )}
          {sa && (
            <details className="mt-6 border-t border-line pt-4">
              <summary className="cursor-pointer text-[15px] text-ink-muted">Read what you submitted</summary>
              <dl className="mt-3 space-y-3">
                {QUESTIONS.map((q) => (
                  <div key={q.id}>
                    <dt className="text-[13px] font-medium text-ink-muted">{q.label}</dt>
                    <dd className="prose-measure mt-0.5 text-[15px]">{sa.answers[q.id] || <span className="text-ink-faint">—</span>}</dd>
                  </div>
                ))}
              </dl>
            </details>
          )}
        </Card>
      </div>
    </div>
  );
}

function Step({ n, done, active, title, detail, children }: { n: number; done: boolean; active?: boolean; title: string; detail: string; children?: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[28px_1fr] gap-4">
      <span aria-hidden="true" className={`grid h-7 w-7 place-items-center rounded-full text-[12px] font-semibold ${done ? "bg-high text-white" : active ? "border-2 border-ink text-ink" : "border border-line text-ink-faint"}`}>
        {done ? <CheckCircle size={16} weight="fill" /> : n}
      </span>
      <div>
        <p className={`text-[15px] font-medium ${done || active ? "" : "text-ink-faint"}`}>{title}</p>
        <p className="mt-0.5 text-[14px] text-ink-muted">{detail}</p>
        {children}
      </div>
    </li>
  );
}
