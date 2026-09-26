"use client";

import { useSession } from "@/lib/session";
import { useDecisions, useSelfAppraisals } from "@/lib/self-appraisal";
import { GRADE_MEANING } from "@/lib/assessment/engine";
import { Card, GradeBadge, gradeTone } from "@/components/ui";
import { GRADES, type Grade } from "@/lib/types";

export interface StatRow {
  id: string;
  name: string;
  department: string;
  grade?: Grade;
  score?: number;
}

function GradeBars({ counts, highlight, unit }: { counts: { g: Grade; n: number }[]; highlight?: Grade; unit: string }) {
  const max = Math.max(...counts.map((c) => c.n), 1);
  return (
    <figure>
      <div className="grid grid-cols-[auto_1fr] gap-x-4">
        <div className="flex flex-col justify-between py-1 text-right font-mono text-[12px] tabular-nums text-ink-faint" style={{ height: 240 }} aria-hidden="true">
          <span>{max}</span>
          <span>{Math.round(max / 2)}</span>
          <span>0</span>
        </div>
        <div
          className="grid grid-cols-7 items-end gap-5 border-b border-l border-line pl-3"
          style={{ height: 240 }}
          role="img"
          aria-label={`Bar chart, ${unit} per grade: ${counts.map((c) => `${c.g} ${c.n}`).join(", ")}.`}
        >
          {counts.map(({ g, n }) => (
            <div key={g} className="flex h-full flex-col items-center justify-end gap-2">
              <span className="font-mono text-[14px] font-medium tabular-nums">{n}</span>
              <div
                className={`bar-fill w-full max-w-20 rounded-t-md ${gradeTone(g).split(" ")[0]} ${highlight && highlight !== g ? "opacity-35" : ""} ${highlight === g ? "ring-2 ring-ink ring-offset-2" : ""}`}
                style={{ height: `${Math.max((n / max) * 100, n ? 3 : 0)}%` }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-[auto_1fr] gap-x-4">
        <span className="w-[2ch]" aria-hidden="true" />
        <div className="grid grid-cols-7 gap-5 pl-3">
          {counts.map(({ g }) => (
            <div key={g} className="flex flex-col items-center gap-1 text-center">
              <GradeBadge grade={g} size="sm" label={null} />
              <span className="hidden text-[12px] leading-tight text-ink-faint lg:block">{GRADE_MEANING[g]}</span>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 text-[13px] text-ink-faint">Vertical axis: number of {unit}. Horizontal axis: grade band, best to weakest.</figcaption>
    </figure>
  );
}

export function StatsView({ rows }: { rows: StatRow[] }) {
  const session = useSession();
  const appraisals = useSelfAppraisals();
  const decisions = useDecisions();
  if (session.status !== "in") return null;
  const a = session.account;

  if (a.role === "employer") {
    // Only people who have submitted carry an AI grade.
    const graded = rows.filter((r) => appraisals[r.id] && r.grade);
    const counts = GRADES.map((g) => ({ g, n: graded.filter((r) => r.grade === g).length }));
    const completed = Object.keys(decisions).length;
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-[30px] font-semibold tracking-tight">Grade distribution</h1>
          <p className="mt-1.5 max-w-[70ch] text-[15px] text-ink-muted">
            {graded.length} of {rows.length} employees have submitted and been AI-graded; {completed} of those are completed. Employees who have not submitted have no AI grade and are not counted here.
          </p>
        </div>
        <dl className="grid grid-cols-2 divide-x divide-line rounded-lg border border-line bg-surface md:grid-cols-4">
          {[
            { k: "A band", v: graded.filter((r) => r.grade!.startsWith("A")).length, s: "A+ and A" },
            { k: "B band", v: graded.filter((r) => r.grade!.startsWith("B")).length, s: "B+ and B" },
            { k: "C band", v: graded.filter((r) => r.grade!.startsWith("C")).length, s: "C+ and C" },
            { k: "D", v: graded.filter((r) => r.grade === "D").length, s: "Little or no evidence" },
          ].map((x) => (
            <div key={x.k} className="px-6 py-5">
              <dt className="text-[13px] text-ink-faint">{x.k}</dt>
              <dd className="mt-1 text-[32px] font-semibold leading-none tabular-nums">{x.v}</dd>
              <dd className="mt-2 text-[13px] text-ink-muted">{x.s}</dd>
            </div>
          ))}
        </dl>
        <Card className="p-8">
          <h2 className="text-[17px] font-semibold">Employees by AI grade</h2>
          <div className="mt-6"><GradeBars counts={counts} unit="employees" /></div>
        </Card>
      </div>
    );
  }

  // Employee: where they stand, with every number explained.
  const me = rows.find((r) => r.id === a.employeeId);
  const dept = rows.filter((r) => r.department === me?.department && r.grade);
  const company = rows.filter((r) => r.grade);
  const counts = GRADES.map((g) => ({ g, n: dept.filter((r) => r.grade === g).length }));
  const rank = (pool: StatRow[]) => (me?.score === undefined ? undefined : pool.filter((r) => (r.score ?? -1) > me.score!).length + 1);
  const deptRank = rank(dept);
  const companyRank = rank(company);
  const sameBand = me?.grade ? dept.filter((r) => r.grade === me.grade).length : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[30px] font-semibold tracking-tight">Where you stand</h1>
        <p className="mt-1.5 max-w-[70ch] text-[15px] text-ink-muted">
          Your evidence-based grade compared with colleagues in {me?.department}. Every bar is a count of people; nothing here is a score you were given by a person.
        </p>
      </div>

      <dl className="grid grid-cols-2 divide-x divide-line rounded-lg border border-line bg-surface md:grid-cols-4">
        <div className="px-6 py-5">
          <dt className="text-[13px] text-ink-faint">Your grade</dt>
          <dd className="mt-2">{me?.grade ? <GradeBadge grade={me.grade} size="md" label={null} /> : <span className="text-ink-faint">Not yet graded</span>}</dd>
          <dd className="mt-2 text-[13px] text-ink-muted">{me?.grade ? GRADE_MEANING[me.grade] : "No evidence indexed"}</dd>
        </div>
        <div className="px-6 py-5">
          <dt className="text-[13px] text-ink-faint">In {me?.department}</dt>
          <dd className="mt-1 text-[32px] font-semibold leading-none tabular-nums">{deptRank ?? "—"}<span className="text-[15px] font-normal text-ink-faint"> / {dept.length}</span></dd>
          <dd className="mt-2 text-[13px] text-ink-muted">Your position by contribution index among graded colleagues</dd>
        </div>
        <div className="px-6 py-5">
          <dt className="text-[13px] text-ink-faint">Company-wide</dt>
          <dd className="mt-1 text-[32px] font-semibold leading-none tabular-nums">{companyRank ?? "—"}<span className="text-[15px] font-normal text-ink-faint"> / {company.length}</span></dd>
          <dd className="mt-2 text-[13px] text-ink-muted">Among all graded employees</dd>
        </div>
        <div className="px-6 py-5">
          <dt className="text-[13px] text-ink-faint">Same grade as you</dt>
          <dd className="mt-1 text-[32px] font-semibold leading-none tabular-nums">{sameBand}</dd>
          <dd className="mt-2 text-[13px] text-ink-muted">Colleagues in {me?.department} on {me?.grade ?? "—"}</dd>
        </div>
      </dl>

      <Card className="p-8">
        <h2 className="text-[17px] font-semibold">{me?.department}: colleagues by grade</h2>
        <p className="mt-1 text-[14px] text-ink-muted">Your band is outlined; the others are faded so the comparison is obvious.</p>
        <div className="mt-6"><GradeBars counts={counts} highlight={me?.grade} unit="colleagues" /></div>
      </Card>
    </div>
  );
}
