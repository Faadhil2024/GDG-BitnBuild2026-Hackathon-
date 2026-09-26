"use client";

import { useDecisions, useSelfAppraisals } from "@/lib/self-appraisal";
import { SourcePeek, type SourceGroup } from "./source-peek";

/** Live counts for the employer: what is done, what is waiting on them, what has not arrived. */
export function CycleSummary({ total, evidenceCount, groups }: { total: number; evidenceCount: number; groups: SourceGroup[] }) {
  const appraisals = useSelfAppraisals();
  const decisions = useDecisions();
  const submitted = Object.keys(appraisals).length;
  const completed = Object.keys(decisions).length;
  const awaiting = submitted - completed;

  const stats = [
    { k: "Completed", v: completed, s: "Reviewed and verified by you" },
    { k: "Awaiting your review", v: awaiting, s: "Self-appraisal in, AI graded, no decision yet" },
    { k: "Not yet submitted", v: total - submitted, s: "No self-appraisal, so no AI grade" },
    { k: "Evidence items indexed", v: evidenceCount, s: `${groups.length} connected sources`, peek: true },
  ];

  return (
    <dl className="grid grid-cols-2 divide-y divide-line rounded-lg border border-line bg-surface md:grid-cols-4 md:divide-x md:divide-y-0">
      {stats.map((x) => (
        <div key={x.k} className="relative px-6 py-5">
          {x.peek && (
            <div className="absolute right-4 top-4">
              <SourcePeek groups={groups} />
            </div>
          )}
          <dt className="text-[13px] text-ink-faint">{x.k}</dt>
          <dd className="mt-1 text-[32px] font-semibold leading-none tabular-nums">{x.v}</dd>
          <dd className="mt-2 text-[13px] text-ink-muted">{x.s}</dd>
        </div>
      ))}
    </dl>
  );
}
