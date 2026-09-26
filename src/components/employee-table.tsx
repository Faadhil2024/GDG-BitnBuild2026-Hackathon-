"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GradeBadge, Pill, formatDate } from "@/components/ui";
import { useSelfAppraisals } from "@/lib/self-appraisal";
import { GRADES, type Confidence, type Grade } from "@/lib/types";

export interface EmployeeRow {
  id: string;
  name: string;
  title: string;
  department: string;
  grade?: Grade;
  confidence?: Confidence;
  missing: number;
  count: number;
}

export function EmployeeTable({ rows }: { rows: EmployeeRow[] }) {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All");
  const [grade, setGrade] = useState("All");
  const appraisals = useSelfAppraisals();
  const depts = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.department))).sort()], [rows]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (dept === "All" || r.department === dept) &&
        (grade === "All" || (grade === "Unassessed" ? !r.grade : r.grade === grade)) &&
        (!s || r.name.toLowerCase().includes(s) || r.title.toLowerCase().includes(s) || r.department.toLowerCase().includes(s)),
    );
  }, [rows, q, dept, grade]);

  const select = "rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm";

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 px-6 py-4">
        <h2 className="text-base font-semibold">Employees</h2>
        <span className="text-xs text-ink-faint" role="status" aria-live="polite">
          {filtered.length} of {rows.length}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="tbl-q">Filter employees</label>
          <input id="tbl-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name, title, department" className={`${select} w-64`} autoComplete="off" />
          <label className="sr-only" htmlFor="tbl-dept">Department</label>
          <select id="tbl-dept" value={dept} onChange={(e) => setDept(e.target.value)} className={select}>
            {depts.map((d) => <option key={d}>{d}</option>)}
          </select>
          <label className="sr-only" htmlFor="tbl-grade">Grade</label>
          <select id="tbl-grade" value={grade} onChange={(e) => setGrade(e.target.value)} className={select}>
            {["All", ...GRADES, "Unassessed"].map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
      </div>
      <table className="w-full text-sm">
        <caption className="sr-only">Employees in the appraisal cycle with grade and status</caption>
        <thead className="border-y border-line bg-canvas text-left text-xs text-ink-faint">
          <tr>
            <th scope="col" className="px-6 py-2.5 font-medium">Employee</th>
            <th scope="col" className="px-6 py-2.5 font-medium">Department</th>
            <th scope="col" className="px-6 py-2.5 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => {
            const sa = appraisals[r.id];
            return (
              <tr key={r.id} className="row-link border-t border-line first:border-t-0">
                <th scope="row" className="whitespace-nowrap px-6 py-3.5 text-left">
                  <Link href={`/employees/${r.id}`} className="pressable inline-block font-medium text-accent underline-offset-2 hover:underline">
                    {r.name}
                  </Link>
                  <span className="block text-xs font-normal text-ink-faint">{r.title}</span>
                </th>
                <td className="whitespace-nowrap px-6 py-3.5 text-ink-muted">{r.department}</td>
                <td className="px-6 py-3.5">
                  <div className="flex flex-wrap items-center gap-3">
                    {r.grade ? <GradeBadge grade={r.grade} size="sm" label={null} /> : <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-dashed border-line px-2 text-xs text-ink-faint">—</span>}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {!r.grade ? (
                        <Pill tone="neutral">Awaiting evidence</Pill>
                      ) : r.missing > 0 || r.confidence === "low" ? (
                        <Pill tone="moderate">Requires review · {r.confidence} confidence</Pill>
                      ) : (
                        <Pill tone="high">Assessed · {r.confidence} confidence</Pill>
                      )}
                      {sa && (
                        <Pill tone="accent">
                          Appraisal submitted · {formatDate(sa.submittedAt)} · self-grade {sa.grade}
                        </Pill>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={3} className="px-6 py-10 text-center text-sm text-ink-faint">
                No employees match these filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
