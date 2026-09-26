"use client";

import { useSession } from "@/lib/session";
import { useDecisions, useSelfAppraisals } from "@/lib/self-appraisal";
import { PROTOCOLS, protocolLabel } from "@/data/rubric";
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
        <div className="grid grid-cols-7 items-end gap-5 border-b border-l border-line pl-3" style={{ height: 240 }} role="img" aria-label={`Bar chart, ${unit} per grade: ${counts.map((c) => `${c.g} ${c.n}`).join(", ")}.`}>
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
            <div key={g} className="flex flex-col items-center gap-1.5 text-center">
              <GradeBadge grade={g} size="sm" label={null} />
              <span className="text-[12px] leading-tight text-ink-faint">{protocolLabel(g)}</span>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 text-[13px] text-ink-faint">Each bar counts {unit}. Grades read as how many of the six assessment protocols were met.</figcaption>
    </figure>
  );
}

function Rubric() {
  return (
    <Card className="p-8">
      <h2 className="text-[17px] font-semibold">What the assessment is based on</h2>
      <p className="mt-1 max-w-[70ch] text-[14px] text-ink-muted">Six protocols, checked against indexed records only. This is the rubric, not a score.</p>
      <ol className="mt-5 grid gap-x-10 gap-y-4 md:grid-cols-2">
        {PROTOCOLS.map((p, i) => (
          <li key={p.id} className="grid grid-cols-[28px_1fr] gap-3">
            <span aria-hidden="true" className="font-mono text-[13px] text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <p className="text-[15px] font-medium">{p.title}</p>
              <p className="mt-0.5 text-[14px] text-ink-muted">{p.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function StatsView({ rows }: { rows: StatRow[] }) {
  const session = useSession();
  const appraisals = useSelfAppraisals();
  const decisions = useDecisions();
  if (session.status !== "in") return null;
  const a = session.account;

  if (a.role === "employer") {
    const graded = rows.filter((r) => appraisals[r.id] && r.grade);
    const counts = GRADES.map((g) => ({ g, n: graded.filter((r) => r.grade === g).length }));
    const completed = Object.keys(decisions).length;
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-[30px] font-semibold tracking-tight">Grade distribution</h1>
          <p className="mt-1.5 max-w-[70ch] text-[15px] text-ink-muted">
            {graded.length} of {rows.length} employees have submitted and been AI-graded; {completed} of those are completed. Employees who have not submitted have no AI grade and are not counted.
          </p>
        </div>
        <dl className="grid grid-cols-2 divide-x divide-line rounded-lg border border-line bg-surface md:grid-cols-4">
          {[
            { k: "A band", v: graded.filter((r) => r.grade!.startsWith("A")).length, s: "5–6 protocols met" },
            { k: "B band", v: graded.filter((r) => r.grade!.startsWith("B")).length, s: "3–4 protocols met" },
            { k: "C band", v: graded.filter((r) => r.grade!.startsWith("C")).length, s: "1–2 protocols met" },
            { k: "D", v: graded.filter((r) => r.grade === "D").length, s: "No protocol met on record" },
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
        <Rubric />
      </div>
    );
  }

  // Employee: only final, manager-decided grades are visible — theirs included.
  const me = rows.find((r) => r.id === a.employeeId);
  const myDecision = a.employeeId ? decisions[a.employeeId] : undefined;
  const deptFinal = rows.filter((r) => r.department === me?.department && decisions[r.id]).map((r) => decisions[r.id].finalGrade);
  const counts = GRADES.map((g) => ({ g, n: deptFinal.filter((x) => x === g).length }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[30px] font-semibold tracking-tight">Where you stand</h1>
        <p className="mt-1.5 max-w-[70ch] text-[15px] text-ink-muted">
          Final grades in {me?.department}, as decided by managers this cycle. Your own grade appears once your manager has completed your review.
        </p>
      </div>

      <dl className="grid grid-cols-1 divide-y divide-line rounded-lg border border-line bg-surface md:grid-cols-2 md:divide-x md:divide-y-0">
        <div className="px-6 py-5">
          <dt className="text-[13px] text-ink-faint">Your grade</dt>
          <dd className="mt-2">{myDecision ? <GradeBadge grade={myDecision.finalGrade} size="md" label={null} /> : <span className="text-[17px] font-medium text-ink-faint">Pending manager review</span>}</dd>
          <dd className="mt-2 text-[13px] text-ink-muted">
            {myDecision ? `${protocolLabel(myDecision.finalGrade)} met · decided by ${myDecision.decidedBy}` : appraisals[a.employeeId ?? ""] ? "Self-appraisal submitted · with your manager" : "Submit your self-appraisal to start the review"}
          </dd>
        </div>
        <div className="px-6 py-5">
          <dt className="text-[13px] text-ink-faint">Completed in {me?.department}</dt>
          <dd className="mt-1 text-[32px] font-semibold leading-none tabular-nums">{deptFinal.length}<span className="text-[15px] font-normal text-ink-faint"> / {rows.filter((r) => r.department === me?.department).length}</span></dd>
          <dd className="mt-2 text-[13px] text-ink-muted">Colleagues whose reviews are final; the chart below counts only these</dd>
        </div>
      </dl>

      <Card className="p-8">
        <h2 className="text-[17px] font-semibold">{me?.department}: colleagues by final grade</h2>
        <p className="mt-1 text-[14px] text-ink-muted">{myDecision ? "Your band is outlined; the others are faded." : "Your band will be outlined here once your grade is final."}</p>
        <div className="mt-6"><GradeBars counts={counts} highlight={myDecision?.finalGrade} unit="colleagues" /></div>
      </Card>

      <Rubric />
    </div>
  );
}
