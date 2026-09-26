"use client";

import Link from "next/link";
import { CheckCircle } from "@phosphor-icons/react";
import { useAssessment } from "@/store/assessment-store";
import { useSelfAppraisals } from "@/lib/self-appraisal";
import { QUESTIONS } from "@/data/self-appraisal";
import { Card, GradeBadge, Pill, formatDate } from "@/components/ui";

/** Employee-side status of their own self-appraisal. No AI grade or reasoning is shown here. */
export function SelfAppraisalCard() {
  const { employee } = useAssessment();
  const sa = useSelfAppraisals()[employee.id];

  return (
    <Card aria-labelledby="sa-card-heading" className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="sa-card-heading" className="text-[17px] font-semibold">Self-appraisal</h2>
        {sa ? (
          <Pill tone="high"><CheckCircle size={12} weight="fill" /> Completed · {formatDate(sa.submittedAt)}</Pill>
        ) : (
          <Pill tone="moderate">Not submitted</Pill>
        )}
      </div>
      {sa ? (
        <>
          <p className="mt-2 text-[15px] text-ink-muted">Your account of the cycle is with your manager. Your self-grade:</p>
          <div className="mt-3"><GradeBadge grade={sa.grade} size="md" label="self-grade" /></div>
          <details className="mt-4">
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
        </>
      ) : (
        <p className="mt-2 text-[15px] text-ink-muted">
          Nine questions, about ten minutes.{" "}
          <Link href="/self-appraisal" className="text-accent underline-offset-2 hover:underline">Start your self-appraisal</Link>.
        </p>
      )}
    </Card>
  );
}
